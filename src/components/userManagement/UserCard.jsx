import React from "react";
import { Phone, MapPin } from "lucide-react";
import { StatusBadge } from "../../ui/Table";
import JiraActionMenu from "../ui/JiraActionMenu";

export default function UserCard({
  user,
  centers = [],
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  getRoleLabel,
  formatPhone,
}) {
  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.name || "—";

  const initials = (user.first_name || user.name || "?").charAt(0).toUpperCase();

  const assignedCenter = centers.find(
    (c) => String(c.evacuation_center_id) === String(user.assigned_center_id)
  );

  const roleColor =
    user.role === "super_admin"
      ? "red"
      : user.role === "evac_admin"
      ? "blue"
      : "green";

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
      onClick={onView}
    >
      {/* ── Top row: avatar + name + action menu ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black text-white shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600">
              {initials}
            </div>
          )}

          {/* Name + ID */}
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
              {displayName}
            </p>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
              ID-{user.user_id}
            </p>
          </div>
        </div>

        {/* Prevent card click from bubbling through action menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <JiraActionMenu
            onView={onView}
            onEdit={canEdit && canEdit(user) ? onEdit : undefined}
            onDelete={canDelete && canDelete(user) ? onDelete : undefined}
            canDelete={canDelete && canDelete(user)}
          />
        </div>
      </div>

      {/* ── Role badge ── */}
      <div>
        <StatusBadge label={getRoleLabel(user.role)} color={roleColor} />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* ── Contact + Center ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Phone size={12} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
          <span className="truncate">{formatPhone(user.contact_number)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MapPin size={12} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
          {assignedCenter ? (
            <span className="truncate font-medium text-slate-600 dark:text-slate-300">
              {assignedCenter.name}
            </span>
          ) : (
            <span className="italic text-slate-300 dark:text-slate-600">
              {user.role === "evac_personnel" ? "Unassigned" : "—"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
