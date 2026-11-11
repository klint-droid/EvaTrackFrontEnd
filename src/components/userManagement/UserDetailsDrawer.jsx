import React, { useState, useEffect } from "react";
import {
  X, User, Phone, Mail, MapPin, Shield, Hash,
  Building2, Edit3, Trash2, CheckCircle2, Loader2, Clock, Sparkles
} from "lucide-react";

/* ── Small labelled field (matches Issue Reports ViewDetailsModal) ── */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {Icon && <Icon size={11} />} {label}
      </span>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}

const getRoleBadgeStyle = (role) => {
  switch (role) {
    case "super_admin":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/40";
    case "evac_admin":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40";
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40";
  }
};

export default function UserDetailsDrawer({
  user,
  centers = [],
  onClose,
  canEdit,
  canDelete,
  canAssign,
  onEdit,
  onDelete,
  triggerAssignCenter,
  assigningUserId,
  assignConfirmOpen,
  getRoleLabel,
  formatPhone,
}) {
  const [localCenterId, setLocalCenterId] = useState("");

  // Keep local select in sync when the user prop changes or when the confirm modal closes
  useEffect(() => {
    if (user && !assignConfirmOpen) {
      setLocalCenterId(String(user.assigned_center_id ?? ""));
    }
  }, [user, assignConfirmOpen]);

  if (!user) return null;

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.name || "—";

  const initials = (user.first_name || user.name || "?").charAt(0).toUpperCase();

  const isAssigning = assigningUserId === user.user_id;

  const assignedCenter = centers.find(
    (c) => String(c.evacuation_center_id) === String(user.assigned_center_id)
  );

  const allowEdit = Boolean(canEdit && canEdit(user));
  const allowDelete = Boolean(canDelete && canDelete(user));
  const allowAssign = Boolean(canAssign && canAssign(user));

  return (
    <>
      {/* Mobile-only translucent backdrop */}
      <div
        className="fixed inset-0 top-14 bg-black/20 dark:bg-black/40 z-30 md:hidden transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Jira-Style Inline Right Detail Panel (matches Issue Reports ViewDetailsModal) */}
      <aside className="fixed inset-x-0 top-14 bottom-0 z-40 md:sticky md:top-0 md:inset-auto md:h-[calc(100vh-3.5rem)] w-full md:w-[350px] xl:w-[400px] shrink-0 bg-white dark:bg-[#0f1623] border-l border-slate-200 dark:border-[#1e2a3d] shadow-xl md:shadow-none flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">

        {/* ── Drawer Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold min-w-0">
            <User size={14} className="text-blue-500 flex-shrink-0" />
            <span>Personnel</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500 truncate">
              / ID-{user.user_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors cursor-pointer"
              title="Close panel"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Title / Profile Header Section */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#1e2a3d]">
            <div className="flex items-start gap-3">
              {user.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={displayName}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-base font-black text-white shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600">
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border ${getRoleBadgeStyle(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>

                  {user.role === "evac_personnel" && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border ${
                        assignedCenter
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40"
                      }`}
                    >
                      {assignedCenter ? "Station Assigned" : "Unassigned"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail Fields ── */}
          <div className="px-5 py-4 space-y-5">

            {/* Quick facts 2x2 grid (matches Issue Reports ViewDetailsModal) */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Personnel ID" icon={Hash}>
                <span className="font-mono text-xs">ID-{user.user_id || "—"}</span>
              </Field>
              <Field label="Role" icon={Shield}>
                <span className="capitalize font-bold">{getRoleLabel(user.role)}</span>
              </Field>
              <Field label="First Name" icon={User}>
                <span>{user.first_name || "—"}</span>
              </Field>
              <Field label="Last Name" icon={User}>
                <span>{user.last_name || "—"}</span>
              </Field>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Contact Details */}
            <Field label="Contact Number" icon={Phone}>
              <span>{formatPhone(user.contact_number)}</span>
            </Field>

            <Field label="Official Email" icon={Mail}>
              <span className="text-xs font-mono break-all">
                {user.email || "—"}
              </span>
            </Field>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Station Assignment */}
            <div className="space-y-2.5">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <MapPin size={11} /> Evacuation Center Assignment
              </span>

              {user.role === "evac_personnel" ? (
                <div className="space-y-2.5">
                  {/* Current Station Info Box */}
                  <div className="bg-slate-50 dark:bg-[#1e2a3d] border border-slate-100 dark:border-[#263047] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2
                        size={14}
                        className={assignedCenter ? "text-blue-500 flex-shrink-0" : "text-slate-400 flex-shrink-0"}
                      />
                      <span className={`text-xs font-semibold truncate ${assignedCenter ? "text-slate-800 dark:text-slate-100" : "italic text-slate-400"}`}>
                        {assignedCenter ? assignedCenter.name : "No evacuation center assigned"}
                      </span>
                    </div>
                    {assignedCenter && (
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Station Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Change Station Assignment
                    </label>
                    <select
                      value={localCenterId}
                      disabled={isAssigning || !allowAssign}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        if (newVal === String(user.assigned_center_id ?? "")) return;
                        setLocalCenterId(newVal);
                        triggerAssignCenter(user.user_id, newVal);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">Unassigned</option>
                      {centers.map((c) => (
                        <option key={c.evacuation_center_id} value={String(c.evacuation_center_id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isAssigning && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold">
                      <Loader2 size={12} className="animate-spin" />
                      Updating assignment…
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-[#1e2a3d] border border-slate-100 dark:border-[#263047] rounded-lg px-4 py-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {user.role === "super_admin"
                    ? "Super Admins have global oversight across all evacuation centers."
                    : "Admin accounts manage system-wide operations and do not require a single station assignment."}
                </div>
              )}
            </div>

            {/* Status Overview / Timeline (matches Issue Reports ViewDetailsModal) */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock size={11} /> Account Status
              </span>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Account Registered & Active",
                    sub: `ID-${user.user_id}`,
                    active: true,
                  },
                  {
                    label: `Role: ${getRoleLabel(user.role)}`,
                    sub: user.contact_number ? formatPhone(user.contact_number) : user.email || null,
                    active: true,
                  },
                  ...(user.role === "evac_personnel"
                    ? [
                        {
                          label: assignedCenter
                            ? `Assigned to ${assignedCenter.name}`
                            : "Awaiting Station Assignment",
                          sub: assignedCenter ? "Active station deployment" : "Select a center above to assign",
                          active: Boolean(assignedCenter),
                        },
                      ]
                    : []),
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${
                        step.active ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          step.active
                            ? "text-slate-800 dark:text-slate-100"
                            : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.sub && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{step.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Drawer Footer Actions ── */}
        {(allowEdit || allowDelete) && (
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Quick Actions
            </p>
            <div className="flex gap-2 flex-wrap">
              {allowEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(user)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                >
                  <Edit3 size={12} /> Edit Personnel
                </button>
              )}
              {allowDelete && (
                <button
                  type="button"
                  onClick={() => { onClose(); onDelete(user.user_id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
