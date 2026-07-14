import React from "react";
import { Check, Phone } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";

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

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={
                <div>
                    {isEditMode ? "Update Personnel" : "Register New Personnel"}
                    <span className="block text-xs font-normal text-slate-500 mt-1">
                        {isEditMode ? "Modify official credentials and operational roles." : "Assign official credentials and operational roles."}
                    </span>
                </div>
            }
            className="!max-w-3xl w-full"
        >
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="e.g. Maria"
                                value={formData.first_name || ""}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                            <Input
                                label="Last Name"
                                placeholder="e.g. Santos"
                                value={formData.last_name || ""}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />
                            <Input
                                label="Contact Number"
                                placeholder="+63 900 000 0000"
                                value={formData.contact_number || ""}
                                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                icon={Phone}
                            />
                            <Input
                                label="Official Email"
                                type="email"
                                placeholder="personnel@evatrack.gov"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Account Credentials */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Account Credentials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label={`User ID ${isEditMode ? "" : "(Auto-generated)"}`}
                                disabled
                                placeholder="Auto-generated"
                                value={isEditMode ? `ID-${formData.user_id}` : ""}
                                inputClassName="bg-slate-100 cursor-not-allowed"
                            />
                            {!isEditMode && (
                                <Input
                                    label="Temporary Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password || ""}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
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
                            <Select
                                label="Assigned Evacuation Center"
                                value={formData.assigned_center_id || ""}
                                onChange={(e) => setFormData({ ...formData, assigned_center_id: e.target.value })}
                                options={[
                                    { label: "Select a center...", value: "" },
                                    ...centers.map((c) => ({ label: c.name, value: c.evacuation_center_id }))
                                ]}
                            />
                        )}
                    </div>
                </div>
                
                <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all active:scale-95">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Check size={16} />
                        {isEditMode ? "Save Changes" : "Create User Account"}
                    </button>
                </div>
        </Modal>
    );
}
