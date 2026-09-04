import React, { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import UserCard from "./UserCard";

/* ── Skeleton card shown while loading ── */
const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
        <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded w-14" />
      </div>
    </div>
    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
    <div className="border-t border-slate-100 dark:border-slate-800" />
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32" />
      <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-40" />
    </div>
  </div>
);

export default function UserCardGrid({
  users = [],
  loading,
  centers = [],
  canEdit,
  canDelete,
  canAssign,
  onView,
  setEditingUser,
  triggerDeleteUser,
  triggerAssignCenter,
  assigningUserId,
  formatPhone,
  getRoleLabel,
}) {
  const [columnFilters, setColumnFilters] = useState({ name: "", role: "" });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.first_name || ""} ${u.last_name || ""} ${u.name || ""}`.toLowerCase();
      const role = String(u.role || "").toLowerCase();
      if (columnFilters.name && !fullName.includes(columnFilters.name.toLowerCase())) return false;
      if (columnFilters.role && role !== columnFilters.role.toLowerCase()) return false;
      return true;
    });
  }, [users, columnFilters]);

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="text-slate-300 dark:text-slate-700" size={32} />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          No personnel found
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredUsers.map((user) => (
        <UserCard
          key={user.user_id}
          user={user}
          centers={centers}
          canEdit={canEdit}
          canDelete={canDelete}
          canAssign={canAssign}
          onView={() => onView(user)}
          onEdit={() => setEditingUser(user)}
          onDelete={() => triggerDeleteUser(user.user_id)}
          getRoleLabel={getRoleLabel}
          formatPhone={formatPhone}
        />
      ))}
    </div>
  );
}
