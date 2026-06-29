import { useState, useEffect } from "react";
import { getUsers } from "../api/users/getUsers";
import { createUser } from "../api/users/createUser";
import { updateUser } from "../api/users/updateUser";
import { deleteUser as deleteUserAPI } from "../api/users/deleteUser";
import { assignCenter } from "../api/users/assignCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { isAdmin, isSuperAdmin } from "../utils/roles";

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [pagination, setPagination] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, userId: null, isLoading: false });
  const [createConfirmState, setCreateConfirmState] = useState({ isOpen: false, isLoading: false });
  const [updateConfirmState, setUpdateConfirmState] = useState({ isOpen: false, isLoading: false });
  const [assignConfirmState, setAssignConfirmState] = useState({ isOpen: false, userId: null, centerId: null, isLoading: false });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [newUser, setNewUser] = useState({
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

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdminUser = isAdmin();
  const isSuperAdminUser = isSuperAdmin();

  const canEdit = (targetUser) => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role !== "super_admin";
    return false;
  };

  const canDelete = (targetUser) => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role === "evac_personnel";
    return false;
  };

  const canAssign = (targetUser) => {
    if(targetUser.role !== "evac_personnel") return false;
    if(isSuperAdminUser) return true;
    if(isAdminUser) return true;
    return false;
  };

  const fetchUsers = async (page = 1, searchQuery = search, role = roleFilter) => {
    try {
      setLoading(true);
      const res = await getUsers(page, searchQuery, role);
      setUsers(res.data);
      setPagination(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCenters = async () => {
    try {
      const res = await getCenters();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setCenters(list);
    } catch (err) {
      console.error(err);
      setCenters([]);
    }
  };

  useEffect(() => {
    fetchUsers(1, search, roleFilter);
    loadCenters();
  }, [roleFilter]);

  const triggerCreateUser = () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields.");
      return;
    }
    setCreateConfirmState({ isOpen: true, isLoading: false });
  };

  const handleCreateUser = async () => {
    try {
      setCreateConfirmState(prev => ({ ...prev, isLoading: true }));
      const payload = {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        contact_number: newUser.contact_number,
      };
      const res = await createUser(payload);

      let createdUser = res.user;

      if (newUser.assigned_center_id && newUser.role !== "super_admin") {
        const assignRes = await assignCenter(createdUser.user_id, newUser.assigned_center_id);
        createdUser = assignRes.data;
      }

      if(pagination.current_page === 1) {
        setUsers((prev) => [createdUser, ...prev]);
      }
      setShowCreateModal(false);
      setNewUser({ first_name: "", last_name: "", email: "", password: "", role: "evac_personnel", contact_number: "", assigned_center_id: "" });
      setCreateConfirmState({ isOpen: false, isLoading: false });
    } catch (err) {
      alert(err.response?.data?.message || "Create Failed");
      setCreateConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const triggerUpdateUser = () => {
    if (editingUser.user_id === currentUser.user_id && editingUser.role !== currentUser.role) {
      alert("You cannot change your own role");
      return;
    }
    if (!editingUser.first_name || !editingUser.last_name || !editingUser.email) {
      alert("Please fill in all required fields.");
      return;
    }
    setUpdateConfirmState({ isOpen: true, isLoading: false });
  };

  const handleUpdateUser = async () => {
    try {
      setUpdateConfirmState(prev => ({ ...prev, isLoading: true }));
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

      setUsers((prev) =>
        prev.map(u => u.user_id === updatedUser.user_id ? updatedUser : u)
      );

      setEditingUser(null);
      setUpdateConfirmState({ isOpen: false, isLoading: false });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update Failed");
      setUpdateConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const triggerDeleteUser = (id) => {
    setDeleteConfirmState({ isOpen: true, userId: id, isLoading: false });
  };

  const handleDeleteUser = async () => {
    const id = deleteConfirmState.userId;
    if (!id) return;

    try {
      setDeleteConfirmState((prev) => ({ ...prev, isLoading: true }));
      await deleteUserAPI(id);
      setUsers((prev) => prev.filter(u => u.user_id !== id));
      setDeleteConfirmState({ isOpen: false, userId: null, isLoading: false });
    } catch (err) {
      alert(err.response?.data?.message || "Delete Failed");
      setDeleteConfirmState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const triggerAssignCenter = (userId, centerId) => {
    setAssignConfirmState({ isOpen: true, userId, centerId, isLoading: false });
  };

  const handleAssignCenter = async () => {
    const { userId, centerId } = assignConfirmState;
    if (!userId) return;
    setAssignConfirmState(prev => ({ ...prev, isLoading: true }));
    setAssigningUserId(userId);
    
    try{
      const res = await assignCenter(userId, centerId || null);
      const updatedUser = res.data;
      setUsers(prev => prev.map(
          u => u.user_id === userId ? updatedUser : u
        )
      );
      setAssignConfirmState({ isOpen: false, userId: null, centerId: null, isLoading: false });
    } catch (err){
      alert(err.response?.data?.message || "Assign failed");
      setAssignConfirmState(prev => ({ ...prev, isLoading: false }));
    } finally {
      setAssigningUserId(null);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-violet-50 text-violet-600 border-violet-200",
      evac_admin: "bg-blue-50 text-blue-600 border-blue-200",
      evac_personnel: "bg-red-100 text-red-600 border-red-200",
    };
    return styles[role] || styles.evac_personnel;
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: "Super Admin",
      evac_admin: "Admin",
      evac_personnel: "Personnel",
    };
    return labels[role] || role.replace('_', ' ');
  };

  const formatPhone = (num) => {
    if (!num) return "—";
    return num.replace(/^0/, "+63");
  };

  // Compute stat card metrics
  const totalUsers = pagination.total || users.length;
  const personnelCount = users.filter(u => u.role === "evac_personnel").length;
  const adminCount = users.filter(u => u.role === "evac_admin" || u.role === "super_admin").length;
  const assignedCount = users.filter(u => u.role === "evac_personnel" && u.assigned_center_id).length;

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
