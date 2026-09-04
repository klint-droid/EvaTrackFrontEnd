import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, User, Phone, Mail, MapPin, Shield, Hash,
  Building2, Edit3, Trash2, CheckCircle2, Loader2,
} from "lucide-react";
import { StatusBadge } from "../../ui/Table";
import { Select } from "../../ui/Select";

/* ── Small labelled field ── */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {Icon && <Icon size={11} />}
        {label}
      </span>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}

/* ── Role color map ── */
const roleColor = (role) =>
  role === "super_admin" ? "red" : role === "evac_admin" ? "blue" : "green";

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
  getRoleLabel,
  formatPhone,
}) {
  const [localCenterId, setLocalCenterId] = useState("");

  // Keep local select in sync when the user prop changes
  useEffect(() => {
    if (user) {
      setLocalCenterId(String(user.assigned_center_id ?? ""));
    }
  }, [user]);

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

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9998] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-white dark:bg-[#0f1623] border-l border-slate-200 dark:border-[#1e2a3d] shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <User size={14} className="text-blue-500" />
            <span>Personnel</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500">
              / ID-{user.user_id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Hero section */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#1e2a3d]">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              {user.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={displayName}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-black text-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {displayName}
                </h2>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                  ID-{user.user_id}
                </p>
                <div className="mt-2">
                  <StatusBadge
                    label={getRoleLabel(user.role)}
                    color={roleColor(user.role)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail Fields ── */}
          <div className="px-5 py-5 space-y-5">

            {/* Personal info */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" icon={User}>
                {user.first_name || "—"}
              </Field>
              <Field label="Last Name" icon={User}>
                {user.last_name || "—"}
              </Field>
            </div>

            <Field label="Email" icon={Mail}>
              <span className="text-xs font-mono break-all">
                {user.email || "—"}
              </span>
            </Field>

            <Field label="Contact Number" icon={Phone}>
              {formatPhone(user.contact_number)}
            </Field>

            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            <Field label="Role" icon={Shield}>
              <StatusBadge
                label={getRoleLabel(user.role)}
                color={roleColor(user.role)}
              />
            </Field>

            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Station Assignment */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <Building2 size={11} />
                Station Assignment
              </span>

              {user.role === "evac_personnel" ? (
                <div className="space-y-2">
                  <Select
                    value={localCenterId}
                    disabled={isAssigning || !(canAssign && canAssign(user))}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      if (newVal === String(user.assigned_center_id ?? "")) return;
                      setLocalCenterId(newVal);
                      triggerAssignCenter(user.user_id, newVal);
                    }}
                    options={[
                      { label: "Unassigned", value: "" },
                      ...centers.map((c) => ({
                        label: c.name,
                        value: String(c.evacuation_center_id),
                      })),
                    ]}
                  />
                  {isAssigning && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold">
                      <Loader2 size={12} className="animate-spin" />
                      Updating assignment…
                    </div>
                  )}
                  {!isAssigning && assignedCenter && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={12} />
                      Assigned to {assignedCenter.name}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                  Not applicable for this role
                </p>
              )}
            </div>

          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">
            Actions
          </p>
          <div className="flex gap-2">
            {canEdit && canEdit(user) && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(user); }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all shadow-sm shadow-blue-500/20"
              >
                <Edit3 size={13} />
                Edit Personnel
              </button>
            )}
            {canDelete && canDelete(user) && (
              <button
                type="button"
                onClick={() => { onClose(); onDelete(user.user_id); }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
          </div>
        </div>

      </div>
    </>,
    document.body
  );
}
