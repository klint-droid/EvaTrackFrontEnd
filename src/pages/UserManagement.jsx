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
  Loader2
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
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
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

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getUsers(page);
      setUsers(res.data.data);
      setPagination(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCenters = async () => {
    try {
      const res = await getCenters();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setCenters(list);
    } catch (err) {
      console.error(err);
      setCenters([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    loadCenters();
  }, []);

  const handleCreateUser = async () => {
    try {
      const res = await createUser(newUser);

      const createdUser = res.data.user;
      if(pagination.current_page === 1) {
        setUsers((prev) => [createdUser, ...prev]);
      }
      setShowCreateModal(false);
      setNewUser({ name: "", password: "", role: "evac_personnel", contact_number: "" });
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
        name: editingUser.name,
        role: editingUser.role
      });

      const updatedUser = res.data.user;

      setUsers((prev) =>
        prev.map(u => u.user_id === updatedUser.user_id ? updatedUser : u)
      );

      setEditingUser(null);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUserAPI(id);

      setUsers((prev) => prev.filter(u => u.user_id !== id));

    } catch (err) {
      alert(err.response?.data?.message || "Delete Failed");
    }
  };

  const handleAssignCenter = async (userId, centerId) => {
    setAssigningUserId(userId);
    
    try{
      const res = await assignCenter(userId, centerId || null);

      const updatedUser = res.data.data;

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
    <div className="space-y-6 animate-in fade-in duration-500">
      
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
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-300" size={32} />
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.user_id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:bg-white transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user.name}</p>
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
                          onClick={() => handleDeleteUser(user.user_id)}
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
        
        {/* ⚡️ PAGINATION FOOTER */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
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
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
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
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                <input
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
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
    </div>
  );
};

export default UserManagement;