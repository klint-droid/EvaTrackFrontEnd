import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getUsers } from "../api/users/getUsers";
import { createUser } from "../api/users/createUser";
import { updateUser } from "../api/users/updateUser";
import { deleteUser as deleteUserAPI } from "../api/users/deleteUser";
import { assignCenter } from "../api/users/assignCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { useUserStore } from "../store/useUserStore";
import { useAlert } from "../context/AlertContext";

interface UserFormState {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: string;
  contact_number: string;
  assigned_center_id: string;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  // Normalize assigned_center_id to string so <Select> option values match
  const normalizeUser = (u: any) => ({
    ...u,
    assigned_center_id: u?.assigned_center_id != null ? String(u.assigned_center_id) : null,
  });

  const [page, setPage] = useState<number>(1);
  const [search, setSearchState] = useState<string>("");
  const [roleFilter, setRoleFilterState] = useState<string>("");

  const setSearch = (s: string | ((prev: string) => string)) => {
    setPage(1);
    setSearchState(s);
  };

  const setRoleFilter = (r: string | ((prev: string) => string)) => {
    setPage(1);
    setRoleFilterState(r);
  };

  const [editingUser, setEditingUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [assigningUserId, setAssigningUserId] = useState<string | number | null>(null);

  const [deleteConfirmState, setDeleteConfirmState] = useState<{ isOpen: boolean; userId: any; isLoading: boolean }>({ isOpen: false, userId: null, isLoading: false });
  const [createConfirmState, setCreateConfirmState] = useState<{ isOpen: boolean; isLoading: boolean }>({ isOpen: false, isLoading: false });
  const [updateConfirmState, setUpdateConfirmState] = useState<{ isOpen: boolean; isLoading: boolean }>({ isOpen: false, isLoading: false });
  const [assignConfirmState, setAssignConfirmState] = useState<{ isOpen: boolean; userId: any; centerId: any; isLoading: boolean }>({ isOpen: false, userId: null, centerId: null, isLoading: false });

  const [newUser, setNewUser] = useState<UserFormState>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "evac_personnel",
    contact_number: "",
    assigned_center_id: "",
  });

  const roleOptions = [
    { value: "super_admin", label: "Super Admin", desc: "Full system access across all centers and modules." },
    { value: "evac_admin", label: "Evacuation Admin", desc: "Manage operations for specific assigned centers." },
    { value: "evac_personnel", label: "Evacuation Personnel", desc: "Intake and logging duties at assigned centers." }
  ];

  const currentUser = useUserStore(state => state.user);
  const isAdminUser: boolean = currentUser?.role === "evac_admin";
  const isSuperAdminUser: boolean = currentUser?.role === "super_admin";

  const canEdit = (targetUser: any): boolean => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role !== "super_admin";
    return false;
  };

  const canDelete = (targetUser: any): boolean => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role === "evac_personnel";
    return false;
  };

  const canAssign = (targetUser: any): boolean => {
    if(targetUser.role !== "evac_personnel") return false;
    if(isSuperAdminUser) return true;
    if(isAdminUser) return true;
    return false;
  };

  // 1. Centers Query (Cached)
  const { data: centers = [] } = useQuery<any[]>({
    queryKey: ['centers'],
    queryFn: async () => {
      const res: any = await getCenters();
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Users Paginated & Filtered Query
  const {
    data: usersResponse = { data: [] } as any,
    isLoading: loading,
  } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: async () => {
      const res = await getUsers(page, search, roleFilter);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const pagination = usersResponse;
  const users = (usersResponse.data || []).map(normalizeUser);

  const fetchUsers = (newPage: number = 1, searchQuery: string = search, role: string = roleFilter) => {
    setPage(newPage);
    if (searchQuery !== search) setSearchState(searchQuery);
    if (role !== roleFilter) setRoleFilterState(role);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const loadCenters = () => {
    return queryClient.invalidateQueries({ queryKey: ['centers'] });
  };

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await createUser(payload);
      let createdUser = res.user;
      if (newUser.assigned_center_id && newUser.role !== "super_admin") {
        const assignRes = await assignCenter(createdUser.user_id, newUser.assigned_center_id);
        createdUser = assignRes.data;
      }
      return createdUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      setNewUser({ first_name: "", last_name: "", email: "", password: "", role: "evac_personnel", contact_number: "", assigned_center_id: "" });
      setCreateConfirmState({ isOpen: false, isLoading: false });
    },
    onError: (err: any) => {
      showAlert(err.response?.data?.message || "Create Failed", "Error", "danger");
      setCreateConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  });

  const triggerCreateUser = () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
      showAlert("Please fill in all required fields.", "Validation Error", "danger");
      return;
    }
    setCreateConfirmState({ isOpen: true, isLoading: false });
  };

  const handleCreateUser = async () => {
    setCreateConfirmState(prev => ({ ...prev, isLoading: true }));
    const payload: any = {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      contact_number: newUser.contact_number,
    };
    await createUserMutation.mutateAsync(payload);
  };

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: async () => {
      const res = await updateUser(editingUser.user_id, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
        role: editingUser.role,
        contact_number: editingUser.contact_number
      });

      let updatedUser = res.user;
      const prevCenterId = updatedUser.assigned_center_id || "";
      const newCenterId = editingUser.assigned_center_id || "";

      if (editingUser.role !== "super_admin") {
        if (newCenterId !== prevCenterId) {
          const assignRes = await assignCenter(editingUser.user_id, newCenterId || null);
          updatedUser = assignRes.data;
        }
      } else {
        if (prevCenterId) {
          const assignRes = await assignCenter(editingUser.user_id, null);
          updatedUser = assignRes.data;
        }
      }
      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setUpdateConfirmState({ isOpen: false, isLoading: false });
    },
    onError: (err: any) => {
      console.error(err);
      showAlert(err.response?.data?.message || "Update Failed", "Error", "danger");
      setUpdateConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  });

  const triggerUpdateUser = () => {
    if (editingUser.user_id === currentUser?.user_id && editingUser.role !== currentUser?.role) {
      showAlert("You cannot change your own role", "Validation Error", "warning");
      return;
    }
    if (!editingUser.first_name || !editingUser.last_name || !editingUser.email) {
      showAlert("Please fill in all required fields.", "Validation Error", "danger");
      return;
    }
    setUpdateConfirmState({ isOpen: true, isLoading: false });
  };

  const handleUpdateUser = async () => {
    setUpdateConfirmState(prev => ({ ...prev, isLoading: true }));
    await updateUserMutation.mutateAsync();
  };

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await deleteUserAPI(String(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteConfirmState({ isOpen: false, userId: null, isLoading: false });
    },
    onError: (err: any) => {
      showAlert(err.response?.data?.message || "Delete Failed", "Error", "danger");
      setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  });

  const triggerDeleteUser = (id: string | number) => {
    setDeleteConfirmState({ isOpen: true, userId: id, isLoading: false });
  };

  const handleDeleteUser = async () => {
    const id = deleteConfirmState.userId;
    if (!id) return;
    setDeleteConfirmState((prev) => ({ ...prev, isLoading: true }));
    await deleteUserMutation.mutateAsync(id);
  };

  // Assign Center Mutation
  const assignCenterMutation = useMutation({
    mutationFn: async ({ userId, centerId }: { userId: string | number, centerId: any }) => {
      return await assignCenter(String(userId), (centerId !== "" && centerId !== null && centerId !== undefined) ? centerId : null);
    },
    onMutate: ({ userId }) => {
      setAssigningUserId(userId);
    },
    onSettled: () => {
      setAssigningUserId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setAssignConfirmState({ isOpen: false, userId: null, centerId: null, isLoading: false });
    },
    onError: (err: any) => {
      showAlert(err.response?.data?.message || "Assign failed", "Error", "danger");
      setAssignConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  });

  const triggerAssignCenter = (userId: string | number, centerId: string | number) => {
    setAssignConfirmState({ isOpen: true, userId, centerId, isLoading: false });
  };

  const handleAssignCenter = async () => {
    const { userId, centerId } = assignConfirmState;
    if (!userId) return;
    setAssignConfirmState(prev => ({ ...prev, isLoading: true }));
    await assignCenterMutation.mutateAsync({ userId, centerId });
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: "bg-violet-50 text-violet-600 border-violet-200",
      evac_admin: "bg-blue-50 text-blue-600 border-blue-200",
      evac_personnel: "bg-red-100 text-red-600 border-red-200",
    };
    return styles[role] || styles.evac_personnel;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      evac_admin: "Admin",
      evac_personnel: "Personnel",
    };
    return labels[role] || role.replace('_', ' ');
  };

  const formatPhone = (num: string) => {
    if (!num) return "—";
    return num.replace(/^0/, "+63");
  };

  const totalUsers = pagination.total || users.length;
  const personnelCount = users.filter((u: any) => u.role === "evac_personnel").length;
  const adminCount = users.filter((u: any) => u.role === "evac_admin" || u.role === "super_admin").length;
  const assignedCount = users.filter((u: any) => u.role === "evac_personnel" && u.assigned_center_id).length;

  return {
    users,
    centers,
    pagination,
    editingUser, setEditingUser,
    showCreateModal, setShowCreateModal,
    assigningUserId,
    loading,
    
    deleteConfirmState, setDeleteConfirmState,
    createConfirmState, setCreateConfirmState,
    updateConfirmState, setUpdateConfirmState,
    assignConfirmState, setAssignConfirmState,

    search, setSearch,
    roleFilter, setRoleFilter,
    
    newUser, setNewUser,
    roleOptions,
    
    isAdminUser, isSuperAdminUser,
    
    canEdit, canDelete, canAssign,
    
    fetchUsers, loadCenters,
    triggerCreateUser, handleCreateUser,
    triggerUpdateUser, handleUpdateUser,
    triggerDeleteUser, handleDeleteUser,
    triggerAssignCenter, handleAssignCenter,
    
    getRoleBadge, getRoleLabel, formatPhone,
    
    totalUsers, personnelCount, adminCount, assignedCount
  };
};
