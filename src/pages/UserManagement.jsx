import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  User, 
  UserPlus, 
  Edit3, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  AlertCircle,
  Users,
  ShieldCheck,
  UserCheck,
  Phone,
  Check
} from "lucide-react";

import { getUsers } from "../api/users/getUsers";
import { createUser } from "../api/users/createUser";
import { updateUser } from "../api/users/updateUser";
import { deleteUser as deleteUserAPI } from "../api/users/deleteUser";
import { assignCenter } from "../api/users/assignCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { isAdmin, isSuperAdmin } from "../utils/roles";
import AlertConfirmModal from "../components/AlertConfirmModal";

const UserRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-100 rounded w-28" />
          <div className="h-2.5 bg-slate-50 rounded w-14" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
    <td className="px-6 py-4 text-center"><div className="mx-auto h-5 bg-slate-100 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-lg w-36" /></td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <div className="w-8 h-8 bg-slate-50 rounded-lg" />
        <div className="w-8 h-8 bg-slate-50 rounded-lg" />
      </div>
    </td>
  </tr>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [pagination, setPagination] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, userId: null, isLoading: false });

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

  const handleCreateUser = async () => {
    try {
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
    } catch (err) {
      alert(err.response?.data?.message || "Create Failed");
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (
        editingUser.user_id === currentUser.user_id &&
        editingUser.role !== currentUser.role
      ) {
        alert("You cannot change your own role");
        return;
      }

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

    } catch (err) {
      console.error(err);
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

  const handleAssignCenter = async (userId, centerId) => {
    setAssigningUserId(userId);
    
    try{
      const res = await assignCenter(userId, centerId || null);

      const updatedUser = res.data;

      setUsers(prev => prev.map(
          u => u.user_id === userId ? updatedUser : u
        )
      );
    } catch (err){
      alert(err.response?.data?.message || "Assign failed");
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

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 font-medium">Total Users</span>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalUsers}</p>
            <p className="text-xs text-slate-400 font-medium">Authorized accounts</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 font-medium">Administrators</span>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{adminCount}</p>
            <p className="text-xs text-slate-400 font-medium">Admin & super admin</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Personnel */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 font-medium">Personnel</span>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{personnelCount}</p>
            <p className="text-xs text-slate-400 font-medium">Field responders</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Assigned Personnel */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 font-medium">Assigned</span>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{assignedCount}</p>
            <p className="text-xs text-slate-400 font-medium">Deployed to shelters</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Table Container ─── */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        {/* Table Header with Search & Filters */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">Personnel Directory</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchUsers(1, search, roleFilter);
                }}
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all w-full sm:w-52"
              />
              <button 
                onClick={() => fetchUsers(1, search, roleFilter)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
              >
                <Search size={14} />
              </button>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">All Roles</option>
              <option value="evac_personnel">Personnel</option>
              <option value="evac_admin">Admin</option>
              {isSuperAdminUser && <option value="super_admin">Super Admin</option>}
            </select>
          </div>
        </div>

        {/* ── DESKTOP TABLE VIEW (md+) ── */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Station Assignment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={28} />
                    <p className="text-sm font-medium text-slate-600">No personnel found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.user_id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-semibold flex-shrink-0">
                        {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || "—")}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">ID-{user.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={12} className="text-slate-300" />
                      {formatPhone(user.contact_number)}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {user.role === "evac_personnel" ? (
                      <div className="flex flex-col gap-1 min-w-[180px]">
                        <select
                          className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 disabled:opacity-50 transition-all cursor-pointer"
                          value={user.assigned_center_id || ""}
                          disabled={assigningUserId === user.user_id || !canAssign(user)}
                          onChange={(e) => {
                            if (e.target.value === user.assigned_center_id) return;
                            handleAssignCenter(user.user_id, e.target.value);
                          }}
                        >
                          <option value="">Unassigned</option>
                          {centers.map((c) => (
                            <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        {assigningUserId === user.user_id && (
                          <span className="text-xs text-blue-500 font-medium animate-pulse px-1">
                            Updating...
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 font-medium">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit(user) && (
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit user"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}
                      {canDelete(user) && (
                        <button 
                          onClick={() => triggerDeleteUser(user.user_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <div className="group-hover:hidden text-slate-300">
                        <MoreHorizontal size={16} className="ml-auto" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARD VIEW (below md) ── */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-100 rounded w-32" />
                      <div className="h-2.5 bg-slate-50 rounded w-16" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-100 rounded w-20" />
                    <div className="h-5 bg-slate-100 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <AlertCircle className="mx-auto text-slate-300 mb-2" size={28} />
              <p className="text-sm font-medium text-slate-600">No personnel found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3">
              {users.map((user) => (
                <div key={user.user_id} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all space-y-3">
                  {/* Top row: Avatar + Name + Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-semibold flex-shrink-0">
                        {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-tight truncate">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || "—")}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">ID-{user.user_id}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border flex-shrink-0 ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={11} className="text-slate-300" />
                    {formatPhone(user.contact_number)}
                  </div>

                  {/* Station Assignment (personnel only) */}
                  {user.role === "evac_personnel" && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Station</label>
                      <select
                        className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 disabled:opacity-50 transition-all cursor-pointer"
                        value={user.assigned_center_id || ""}
                        disabled={assigningUserId === user.user_id || !canAssign(user)}
                        onChange={(e) => {
                          if (e.target.value === user.assigned_center_id) return;
                          handleAssignCenter(user.user_id, e.target.value);
                        }}
                      >
                        <option value="">Unassigned</option>
                        {centers.map((c) => (
                          <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {assigningUserId === user.user_id && (
                        <span className="text-xs text-blue-500 font-medium animate-pulse">Updating...</span>
                      )}
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                    {canEdit(user) && (
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    {canDelete(user) && (
                      <button 
                        onClick={() => triggerDeleteUser(user.user_id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* ─── Pagination Footer ─── */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Page {pagination.current_page || 1} of {pagination.last_page || 1}
          </p>
          <div className="flex gap-1.5">
            <button 
              disabled={!pagination.prev_page_url}
              onClick={() => fetchUsers(pagination.current_page - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <ChevronLeft size={15} />
            </button>
            <button 
              disabled={!pagination.next_page_url}
              onClick={() => fetchUsers(pagination.current_page + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CREATE MODAL ─── */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-auto">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-900">Register New Personnel</h2>
              <p className="text-sm text-slate-500 mt-1">Assign official credentials and operational roles.</p>
              <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X size={20}/></button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">First Name</label>
                    <input
                      placeholder="e.g. Maria"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Last Name</label>
                    <input
                      placeholder="e.g. Santos"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Contact Number</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={14} /></div>
                      <input
                        placeholder="+63 900 000 0000"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                        value={newUser.contact_number}
                        onChange={(e) => setNewUser({ ...newUser, contact_number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Official Email</label>
                    <input
                      type="email"
                      placeholder="personnel@evatrack.gov"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Account Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">User ID (Auto-generated)</label>
                    <input
                      disabled
                      placeholder="Auto-generated"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Temporary Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Access Control</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Role Selection</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roleOptions.filter(r => isSuperAdminUser || r.value !== "super_admin").map((role) => {
                      const isSelected = newUser.role === role.value;
                      return (
                        <div
                          key={role.value}
                          onClick={() => setNewUser({ ...newUser, role: role.value })}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-white shadow-[0_0_0_1px_rgba(59,130,246,1)]"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-slate-800">{role.label}</span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {newUser.role !== "super_admin" && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-600">Assigned Evacuation Center</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                      value={newUser.assigned_center_id || ""}
                      onChange={(e) => setNewUser({ ...newUser, assigned_center_id: e.target.value })}
                    >
                      <option value="">Select a center...</option>
                      {centers.map((c) => (
                        <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={handleCreateUser} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all">Create User Account</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── EDIT MODAL ─── */}
      {editingUser && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-auto">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-900">Update Personnel</h2>
              <p className="text-sm text-slate-500 mt-1">Modify official credentials and operational roles.</p>
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X size={20}/></button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">First Name</label>
                    <input
                      placeholder="e.g. Maria"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={editingUser.first_name || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Last Name</label>
                    <input
                      placeholder="e.g. Santos"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={editingUser.last_name || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Contact Number</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={14} /></div>
                      <input
                        placeholder="+63 900 000 0000"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                        value={editingUser.contact_number || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, contact_number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Official Email</label>
                    <input
                      type="email"
                      placeholder="personnel@evatrack.gov"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                      value={editingUser.email || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Account Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">User ID</label>
                    <input
                      disabled
                      value={`ID-${editingUser.user_id}`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Access Control</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Role Selection</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roleOptions.filter(r => isSuperAdminUser || r.value !== "super_admin").map((role) => {
                      const isSelected = editingUser.role === role.value;
                      return (
                        <div
                          key={role.value}
                          onClick={() => setEditingUser({ ...editingUser, role: role.value })}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-white shadow-[0_0_0_1px_rgba(59,130,246,1)]"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-slate-800">{role.label}</span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {editingUser.role !== "super_admin" && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-600">Assigned Evacuation Center</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                      value={editingUser.assigned_center_id || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, assigned_center_id: e.target.value })}
                    >
                      <option value="">Select a center...</option>
                      {centers.map((c) => (
                        <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={handleUpdateUser} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all">Save Changes</button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
    </div>
  );
};

export default UserManagement;
