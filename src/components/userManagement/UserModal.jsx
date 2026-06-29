import React from "react";
import { createPortal } from "react-dom";
import { X, Check, Phone } from "lucide-react";

export default function UserModal({
    isOpen,
    isEditMode,
    onClose,
    formData,
    setFormData,
    roleOptions,
    isSuperAdminUser,
    centers,
    onConfirm
}) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9990] p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm fixed transition-opacity duration-300 animate-in fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 my-auto transform scale-100 transition-all duration-300 animate-in zoom-in-95">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200/60">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEditMode ? "Update Personnel" : "Register New Personnel"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isEditMode ? "Modify official credentials and operational roles." : "Assign official credentials and operational roles."}
                    </p>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X size={20}/></button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">First Name</label>
                                <input
                                    placeholder="e.g. Maria"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    value={formData.first_name || ""}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Last Name</label>
                                <input
                                    placeholder="e.g. Santos"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    value={formData.last_name || ""}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Contact Number</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={16} /></div>
                                    <input
                                        placeholder="+63 900 000 0000"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        value={formData.contact_number || ""}
                                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Official Email</label>
                                <input
                                    type="email"
                                    placeholder="personnel@evatrack.gov"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                    value={formData.email || ""}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Credentials */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Account Credentials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">User ID {isEditMode ? "" : "(Auto-generated)"}</label>
                                <input
                                    disabled
                                    placeholder="Auto-generated"
                                    value={isEditMode ? `ID-${formData.user_id}` : ""}
                                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                                />
                            </div>
                            {!isEditMode && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Temporary Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        value={formData.password || ""}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Access Control */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Access Control</h3>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-600">Role Selection</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {roleOptions.filter(r => isSuperAdminUser || r.value !== "super_admin").map((role) => {
                                    const isSelected = formData.role === role.value;
                                    return (
                                        <div
                                            key={role.value}
                                            onClick={() => setFormData({ ...formData, role: role.value })}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? "border-blue-500 bg-white shadow-[0_0_0_1px_rgba(59,130,246,1)]"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-slate-800">{role.label}</span>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {formData.role !== "super_admin" && (
                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-semibold text-slate-600">Assigned Evacuation Center</label>
                                <select
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    value={formData.assigned_center_id || ""}
                                    onChange={(e) => setFormData({ ...formData, assigned_center_id: e.target.value })}
                                >
                                    <option value="">Select a center...</option>
                                    {centers.map((c) => (
                                        <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all active:scale-95">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Check size={16} />
                        {isEditMode ? "Save Changes" : "Create User Account"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
