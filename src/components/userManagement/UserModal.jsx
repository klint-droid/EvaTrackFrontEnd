import React from "react";
import { createPortal } from "react-dom";
import { X, Check, Phone, Mail, Shield, Users, MapPin, Lock, Hash } from "lucide-react";

export default function UserModal({
  isOpen,
  isEditMode,
  onClose,
  formData,
  setFormData,
  roleOptions = [],
  isSuperAdminUser,
  centers = [],
  onConfirm,
}) {
  if (!isOpen) return null;

  const availableRoles = roleOptions.filter(
    (r) => isSuperAdminUser || r.value !== "super_admin"
  );

  const selectedRoleObj = availableRoles.find((r) => r.value === formData.role);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-[#1e2a3d] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-left font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e2a3d]">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {isEditMode ? "Update Personnel" : "Register New Personnel"}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isEditMode
                ? "Modify official credentials and operational roles"
                : "Assign official credentials and operational roles"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Role Toggle (matches RequestModal Type Toggle) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
              <Shield size={11} /> Operational Role
            </label>
            <div className="flex bg-slate-100 dark:bg-[#1e2a3d] p-1 rounded-lg gap-1">
              {availableRoles.map((role) => {
                const isSelected = formData.role === role.value;
                const shortLabel =
                  role.value === "super_admin"
                    ? "Super Admin"
                    : role.value === "evac_admin"
                    ? "Admin"
                    : "Personnel";
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-md transition-all ${
                      isSelected
                        ? "bg-white dark:bg-[#0f1623] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-[#263047]"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <Users size={13} />
                    <span className="truncate">{shortLabel}</span>
                  </button>
                );
              })}
            </div>
            {selectedRoleObj?.desc && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 px-0.5">
                {selectedRoleObj.desc}
              </p>
            )}
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name || ""}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Maria"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name || ""}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Santos"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Contact Number & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Phone size={11} /> Contact Number
              </label>
              <input
                type="text"
                value={formData.contact_number || ""}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="+63 900 000 0000"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Mail size={11} /> Official Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="personnel@evatrack.gov"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className={`grid grid-cols-1 ${!isEditMode ? "sm:grid-cols-2" : ""} gap-3`}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <Hash size={11} /> {isEditMode ? "User ID" : "User ID (Auto)"}
              </label>
              <input
                type="text"
                disabled
                value={isEditMode ? `ID-${formData.user_id}` : "Auto-generated"}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-slate-100 dark:bg-[#141b29] border border-slate-200 dark:border-[#263047] text-slate-400 dark:text-slate-500 cursor-not-allowed"
              />
            </div>

            {!isEditMode && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                  <Lock size={11} /> Temporary Password
                </label>
                <input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            )}
          </div>

          {/* Assigned Evacuation Center */}
          {formData.role !== "super_admin" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <MapPin size={11} /> Evacuation Center
              </label>
              <select
                value={formData.assigned_center_id || ""}
                onChange={(e) => setFormData({ ...formData, assigned_center_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Unassigned (Select Center...)</option>
                {centers.map((c) => (
                  <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1e2a3d] hover:bg-slate-200 dark:hover:bg-[#263047] rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
          >
            <Check size={13} />
            <span>{isEditMode ? "Save Changes" : "Create User Account"}</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
