import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  User, 
  UserPlus, 
  MapPin, 
  Edit3, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  Search,
  AlertCircle
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
    {/* Name & ID */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-slate-200 rounded w-28" />
          <div className="h-2.5 bg-slate-100 rounded w-16" />
        </div>
      </div>
    </td>
    {/* Contact */}
    <td className="px-6 py-4">
      <div className="h-4 bg-slate-100 rounded w-24" />
    </td>
    {/* System Role */}
    <td className="px-6 py-4 text-center">
      <div className="mx-auto h-6 bg-slate-100 rounded-full w-20" />
    </td>
    {/* Station Assignment */}
    <td className="px-6 py-4">
      <div className="h-8 bg-slate-100 rounded-lg w-36" />
    </td>
    {/* Actions */}
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
        <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
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

  // Custom alert confirm modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, userId: null, isLoading: false });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    password: "",
    role: "evac_personnel",
    contact_number: "",
  });

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
      const res = await createUser(newUser);

      const createdUser = res.user;
      if(pagination.current_page === 1) {
        setUsers((prev) => [createdUser, ...prev]);
      }
      setShowCreateModal(false);
      setNewUser({ first_name: "", last_name: "", password: "", role: "evac_personnel", contact_number: "" });
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
        role: editingUser.role
      });

      const updatedUser = res.user;

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
      super_admin: "bg-purple-50 text-purple-600 border-purple-100",
      evac_admin: "bg-blue-50 text-blue-600 border-blue-100",
      evac_personnel: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return styles[role] || styles.evac_personnel;
  };

  const formatPhone = (num) => {
  if (!num) return "—";
  return num.replace(/^0/, "+63");
};

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      
      {/* ⚡️ HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personnel Directory</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Manage System Access and Station Assignments</p>
        </div>

        {(isSuperAdminUser || isAdminUser) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            <span>Add Personnel</span>
          </button>
        )}
      </div>

      {/* ⚡️ TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20">
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <User size={18} className="text-blue-500" />
              Personnel Directory Log
            </h2>
            <p className="text-xs text-slate-400 mt-1 hidden sm:block">Manage system logins, access control and shelter stations.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchUsers(1, search, roleFilter);
                }}
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full sm:w-48"
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
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">All Roles</option>
              <option value="evac_personnel">Personnel</option>
              <option value="evac_admin">Admin</option>
            </select>
          </div>
        </div>

        {/* ── DESKTOP TABLE VIEW (md and up) ── */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Identifier</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">System Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Assignment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-bold">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-sm font-bold text-slate-700">No personnel found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.user_id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:bg-white transition-colors">
                        {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || "—")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ID: {user.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {formatPhone(user.contact_number)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === "evac_personnel" ? (
                      <div className="flex flex-col gap-1.5 min-w-[180px]">
                        <select
                          className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
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
                          <span className="text-[9px] font-black text-blue-500 uppercase animate-pulse px-1">
                            Updating...
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        ---
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit(user) && (
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      {canDelete(user) && (
                        <button 
                          onClick={() => triggerDeleteUser(user.user_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
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
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-2.5 bg-slate-100 rounded w-16" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-100 rounded-full w-20" />
                    <div className="h-5 bg-slate-100 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700">No personnel found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3">
              {users.map((user) => (
                <div key={user.user_id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all space-y-3">
                  {/* Top row: Avatar + Name + Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm flex-shrink-0">
                        {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || "—")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ID: {user.user_id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border flex-shrink-0 ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Info row: Contact */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span>📞 {formatPhone(user.contact_number)}</span>
                  </div>

                  {/* Station Assignment (only for personnel) */}
                  {user.role === "evac_personnel" && (
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Station</label>
                      <select
                        className="w-full text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
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
                        <span className="text-[9px] font-black text-blue-500 uppercase animate-pulse">Updating...</span>
                      )}
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {canEdit(user) && (
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    {canDelete(user) && (
                      <button 
                        onClick={() => triggerDeleteUser(user.user_id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* ⚡️ PAGINATION FOOTER */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {pagination.current_page || 1} of {pagination.last_page || 1}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={!pagination.prev_page_url}
              onClick={() => fetchUsers(pagination.current_page - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={!pagination.next_page_url}
              onClick={() => fetchUsers(pagination.current_page + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ⚡️ CREATE MODAL (React Portal) */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
          <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[320px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600" /> New User
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                  <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                  <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div><div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={newUser.contact_number}
                  onChange={(e) => setNewUser({ ...newUser, contact_number: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Authorization</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="evac_personnel">Personnel</option>
                  <option value="evac_admin">Admin</option>
                  {isSuperAdminUser && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
              <button onClick={handleCreateUser} className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all">Register</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ⚡️ EDIT MODAL (React Portal) */}
      {editingUser && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
          <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[320px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 tracking-tight">Modify Personnel</h2>
              <button onClick={() => setEditingUser(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                  <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                    value={editingUser.first_name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                  <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                    value={editingUser.last_name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={editingUser.contact_number}
                  onChange={(e) => setEditingUser({ ...editingUser, contact_number: e.target.value })}
                />
              </div> 
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Access Level</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="evac_personnel">Personnel</option>
                  <option value="evac_admin">Admin</option>
                  {isSuperAdminUser && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
              <button onClick={handleUpdateUser} className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider active:scale-95 transition-all">Save Changes</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ⚡️ CUSTOM ALERT CONFIRMATION DIALOG (No default browser dialogs) */}
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