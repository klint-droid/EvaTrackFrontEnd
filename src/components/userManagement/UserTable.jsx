import React from "react";
import { Phone, Edit3, Trash2, MoreHorizontal, AlertCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../../ui/Table";
import { Select } from "../../ui/Select";
import { StatusBadge } from "../ui/StatusBadge";

const UserRowSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
                    <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded w-14" />
                </div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-24" /></td>
        <td className="px-6 py-4 text-center"><div className="mx-auto h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" /></td>
        <td className="px-6 py-4"><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-36" /></td>
        <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-2">
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
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
    getRoleLabel,
    selectedUsers = [],
    setSelectedUsers
}) {
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.map(u => u.user_id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (e, id) => {
        if (e.target.checked) {
            setSelectedUsers(prev => [...prev, id]);
        } else {
            setSelectedUsers(prev => prev.filter(uid => uid !== id));
        }
    };

    return (
        <>
            {/* ── DESKTOP TABLE VIEW (md+) ── */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="border-none hover:bg-transparent dark:hover:bg-transparent">
                            <TableHead className="w-12">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 w-4 h-4 cursor-pointer"
                                    checked={users.length > 0 && selectedUsers.length === users.length}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead sortable>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Station Assignment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan="6" className="px-6 py-16 text-center">
                                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={28} />
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No personnel found</p>
                                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                                </TableCell>
                            </TableRow>
                        ) : users.map((user) => (
                            <TableRow key={user.user_id} className="group" isSelected={selectedUsers.includes(user.user_id)}>
                                <TableCell>
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 w-4 h-4 cursor-pointer"
                                        checked={selectedUsers.includes(user.user_id)}
                                        onChange={(e) => handleSelectUser(e, user.user_id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {user.profile_photo_url ? (
                                            <img src={user.profile_photo_url} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-bold flex-shrink-0">
                                                {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">
                                                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || "—")}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">ID-{user.user_id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                        <Phone size={14} className="text-slate-400" />
                                        {formatPhone(user.contact_number)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge 
                                        label={getRoleLabel(user.role)}
                                        color={
                                            user.role === 'super_admin' ? 'red' : 
                                            user.role === 'evac_admin' ? 'blue' : 'green'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    {user.role === "evac_personnel" ? (
                                        <div className="flex flex-col gap-1 min-w-[180px]">
                                            <Select
                                                value={user.assigned_center_id || ""}
                                                disabled={assigningUserId === user.user_id || !canAssign(user)}
                                                onChange={(e) => {
                                                    if (e.target.value === user.assigned_center_id) return;
                                                    triggerAssignCenter(user.user_id, e.target.value);
                                                }}
                                                options={[
                                                    { label: "Unassigned", value: "" },
                                                    ...centers.map(c => ({ label: c.name, value: c.evacuation_center_id }))
                                                ]}
                                            />

                                            {assigningUserId === user.user_id && (
                                                <span className="text-xs text-blue-500 font-medium animate-pulse px-1">
                                                    Updating...
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 font-medium">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {canEdit(user) && (
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                title="Edit user"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        )}
                                        {canDelete(user) && (
                                            <button 
                                                onClick={() => triggerDeleteUser(user.user_id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Delete user"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <button className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 rounded-lg transition-all">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* ── MOBILE CARD VIEW (below md) ── */}
            <div className="md:hidden">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-32" />
                                        <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded w-16" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-10 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-2" size={28} />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No personnel found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="p-3 sm:p-4 space-y-3">
                        {users.map((user) => (
                            <div key={user.user_id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 transition-all space-y-3">
                                {/* Top row: Avatar + Name + Role Badge */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {user.profile_photo_url ? (
                                            <img src={user.profile_photo_url} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-semibold flex-shrink-0">
                                                {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight truncate">
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
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Phone size={11} className="text-slate-300" />
                                    {formatPhone(user.contact_number)}
                                </div>

                                {/* Station Assignment (personnel only) */}
                                {user.role === "evac_personnel" && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Station</label>
                                        <Select
                                            className="w-full"
                                            value={user.assigned_center_id || ""}
                                            disabled={assigningUserId === user.user_id || !canAssign(user)}
                                            onChange={(e) => {
                                                if (e.target.value === user.assigned_center_id) return;
                                                triggerAssignCenter(user.user_id, e.target.value);
                                            }}
                                            options={[
                                                { label: "Unassigned", value: "" },
                                                ...centers.map(c => ({ label: c.name, value: c.evacuation_center_id }))
                                            ]}
                                        />
                                        {assigningUserId === user.user_id && (
                                            <span className="text-xs text-blue-500 font-medium animate-pulse">Updating...</span>
                                        )}
                                    </div>
                                )}

                                {/* Actions row */}
                                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
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


        </>
    );
}
