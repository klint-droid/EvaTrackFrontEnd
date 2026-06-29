import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

import { getUsers } from "../api/users/getUsers";
import { createUser } from "../api/users/createUser";
import { updateUser } from "../api/users/updateUser";
import { deleteUser as deleteUserAPI } from "../api/users/deleteUser";
import { assignCenter } from "../api/users/assignCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { isAdmin, isSuperAdmin } from "../utils/roles";
import AlertConfirmModal from "../components/AlertConfirmModal";

import UserStats from "../components/userManagement/UserStats";
import UserFilters from "../components/userManagement/UserFilters";
import UserTable from "../components/userManagement/UserTable";
import UserModal from "../components/userManagement/UserModal";

const UserManagement = () => {
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

  return (
    <div className="min-h-screen font-sans text-left">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-left">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage system access and station assignments</p>
        </div>

        {(isSuperAdminUser || isAdminUser) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200"
          >
            <UserPlus size={16} />
            <span>Add Personnel</span>
          </button>
        )}
      </div>

      <UserStats 
        totalUsers={totalUsers}
        adminCount={adminCount}
        personnelCount={personnelCount}
        assignedCount={assignedCount}
      />

      {/* ─── Table Container ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        <UserFilters 
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          fetchUsers={fetchUsers}
          isSuperAdminUser={isSuperAdminUser}
        />

        <UserTable 
          users={users}
          loading={loading}
          centers={centers}
          pagination={pagination}
          fetchUsers={fetchUsers}
          canEdit={canEdit}
          canDelete={canDelete}
          canAssign={canAssign}
          setEditingUser={setEditingUser}
          triggerDeleteUser={triggerDeleteUser}
          triggerAssignCenter={triggerAssignCenter}
          assigningUserId={assigningUserId}
          formatPhone={formatPhone}
          getRoleBadge={getRoleBadge}
          getRoleLabel={getRoleLabel}
        />
      </div>

      <UserModal 
        isOpen={showCreateModal}
        isEditMode={false}
        onClose={() => setShowCreateModal(false)}
        formData={newUser}
        setFormData={setNewUser}
        roleOptions={roleOptions}
        isSuperAdminUser={isSuperAdminUser}
        centers={centers}
        onConfirm={triggerCreateUser}
      />

      <UserModal 
        isOpen={!!editingUser}
        isEditMode={true}
        onClose={() => setEditingUser(null)}
        formData={editingUser || {}}
        setFormData={setEditingUser}
        roleOptions={roleOptions}
        isSuperAdminUser={isSuperAdminUser}
        centers={centers}
        onConfirm={triggerUpdateUser}
      />

      {/* ─── Delete Confirmation ─── */}
      <AlertConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Delete Personnel Account"
        message="Are you sure you want to delete this personnel account? This action is permanent and will immediately terminate their system access and shelter credentials."
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteConfirmState.isLoading}
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteConfirmState({ isOpen: false, userId: null, isLoading: false })}
      />

      {/* ─── Create Confirmation ─── */}
      <AlertConfirmModal
        isOpen={createConfirmState.isOpen}
        title="Register Personnel"
        message={`Are you sure you want to register ${newUser.first_name} ${newUser.last_name} as ${getRoleLabel(newUser.role)}?`}
        confirmText="Register"
        cancelText="Cancel"
        type="success"
        isLoading={createConfirmState.isLoading}
        onConfirm={handleCreateUser}
        onClose={() => setCreateConfirmState({ isOpen: false, isLoading: false })}
      />

      {/* ─── Update Confirmation ─── */}
      <AlertConfirmModal
        isOpen={updateConfirmState.isOpen}
        title="Apply Changes"
        message={`Are you sure you want to apply these changes to ${editingUser?.first_name} ${editingUser?.last_name}?`}
        confirmText="Apply Changes"
        cancelText="Cancel"
        type="info"
        isLoading={updateConfirmState.isLoading}
        onConfirm={handleUpdateUser}
        onClose={() => setUpdateConfirmState({ isOpen: false, isLoading: false })}
      />

      {/* ─── Assign Center Confirmation ─── */}
      <AlertConfirmModal
        isOpen={assignConfirmState.isOpen}
        title="Assign Station"
        message={`Are you sure you want to change the station assignment for this personnel?`}
        confirmText="Confirm Assignment"
        cancelText="Cancel"
        type="info"
        isLoading={assignConfirmState.isLoading}
        onConfirm={handleAssignCenter}
        onClose={() => setAssignConfirmState({ isOpen: false, userId: null, centerId: null, isLoading: false })}
      />
    </div>
  );
};

export default UserManagement;
