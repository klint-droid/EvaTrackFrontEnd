import React from "react";
import { Phone, Edit3, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

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

export default function UserTable({
    users,
    loading,
    centers,
    pagination,
    fetchUsers,
    canEdit,
    canDelete,
    canAssign,
    setEditingUser,
    triggerDeleteUser,
    triggerAssignCenter,
    assigningUserId,
    formatPhone,
    getRoleBadge,
    getRoleLabel
}) {
    return (
        <>
            {/* ── DESKTOP TABLE VIEW (md+) ── */}
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900">
                            <th className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">Station Assignment</th>
                            <th className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                            <tr key={user.user_id} className="hover:bg-slate-50/20 transition-colors group">
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
                                                    triggerAssignCenter(user.user_id, e.target.value);
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
                                                triggerAssignCenter(user.user_id, e.target.value);
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
        </>
    );
}
