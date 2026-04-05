import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MapPin, 
  Edit3, 
  Trash2, 
  X, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

import { getUsers } from "../api/users/getUsers";
import { createUser } from "../api/users/createUser";
import { updateUser } from "../api/users/updateUser";
import { deleteUser as deleteUserAPI } from "../api/users/deleteUser";
import { assignCenter } from "../api/users/assignCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { isAdmin, isSuperAdmin } from "../utils/roles";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [pagination, setPagination] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdminUser = isAdmin();
  const isSuperAdminUser = isSuperAdmin();

  // 🔥 PERMISSIONS (Preserved)
  const canEdit = (targetUser) => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role !== "super_admin";
    return false;
  };

  const canDelete = (targetUser) => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role === "user";
    return false;
  };

  const canAssign = (targetUser) => {
    if (isSuperAdminUser) return true;
    if (isAdminUser) return targetUser.role !== "super_admin";
    return false;
  };

  const fetchUsers = async (page = 1) => {
    try {
      const res = await getUsers(page);
      setUsers(res.data.data);
      setPagination(res.data);
    } catch (err) { console.error(err); }
  };

  const loadCenters = async () => {
    try {
      const res = await getCenters();
      setCenters(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUsers();
    loadCenters();
  }, []);

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ name: "", email: "", password: "", role: "user" });
      fetchUsers(pagination.current_page || 1);
    } catch (err) { alert(err.response?.data?.message || "Create Failed"); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserAPI(id);
      fetchUsers(pagination.current_page);
    } catch (err) { alert(err.response?.data?.message || "Delete Failed"); }
  };

  const handleUpdateUser = async () => {
    try {
      if (editingUser.user_id === currentUser.user_id && editingUser.role !== currentUser.role) {
        alert("You cannot change your own role");
        return;
      }
      await updateUser(editingUser.user_id, editingUser);
      setEditingUser(null);
      fetchUsers(pagination.current_page);
    } catch (err) { console.error(err); }
  };

  const handleAssignCenter = async (userId, centerId) => {
    setAssigningUserId(userId);
    try {
      await assignCenter(userId, centerId || null);
      fetchUsers(pagination.current_page);
    } catch (err) { alert(err.response?.data?.message || "Assign failed"); }
    finally { setAssigningUserId(null); }
  };

  // UI Helpers
  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-purple-50 text-purple-600 border-purple-100",
      admin: "bg-blue-50 text-blue-600 border-blue-100",
      user: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return styles[role] || styles.user;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ⚡️ HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">System Access & Role Control</p>
        </div>

        {isSuperAdminUser && (
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
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Center</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-xs font-semibold">{user.assigned_center_name || "Unassigned"}</span>
                      </div>
                      <select
                        className="text-[11px] font-bold bg-slate-100 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        value={user.assigned_evacuation_center_id || ""}
                        disabled={assigningUserId === user.user_id || !canAssign(user)}
                        onChange={(e) => handleAssignCenter(user.user_id, e.target.value)}
                      >
                        <option value="">Change Center</option>
                        {centers.map((center) => (
                          <option key={center.evacuation_center_id} value={center.evacuation_center_id}>
                            {center.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
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
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* ⚡️ PAGINATION FOOTER */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Page {pagination.current_page} of {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={!pagination.prev_page_url}
              onClick={() => fetchUsers(pagination.current_page - 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={!pagination.next_page_url}
              onClick={() => fetchUsers(pagination.current_page + 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ⚡️ EDIT MODAL (Portal) */}
      {editingUser && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
          <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800 tracking-tight">Edit Personnel</h2>
              <button onClick={() => setEditingUser(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Level</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {isSuperAdminUser && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancel</button>
              <button onClick={handleUpdateUser} className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider">Save Changes</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ⚡️ CREATE MODAL (Portal) */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
          <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" /> Register Personnel
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={18}/></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <input
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <input
                  placeholder="name@evatrack.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Password</label>
                <input
                  placeholder="••••••••"
                  type="password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              {/* 🔥 ADDED ROLE SELECTION */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Role</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User (Field Personnel)</option>
                  <option value="admin">Admin (Brgy Officer)</option>
                  {isSuperAdminUser && (
                    <option value="super_admin">Super Admin (System Owner)</option>
                  )}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateUser} 
                className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-wider"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserManagement;