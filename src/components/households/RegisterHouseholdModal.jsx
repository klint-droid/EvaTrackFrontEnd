import React, { useState, useEffect } from "react";
import { 
    UserPlus, Plus, Trash2, Users, MapPin, Phone, 
    ShieldCheck, Loader2, HeartPulse, Baby
} from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { createHousehold } from "../../api/evacuationRecords/createHousehold";
import { getLookups } from "../../api/lookups/getLookups";

export default function RegisterHouseholdModal({
    isOpen,
    onClose,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form fields
    const [householdName, setHouseholdName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");

    // Address fields
    const [street, setStreet] = useState("");
    const [purok, setPurok] = useState("");
    const [barangay, setBarangay] = useState("Mambaling");
    const [city, setCity] = useState("Cebu City");

    // Members list
    const [members, setMembers] = useState([
        {
            id: "head-1",
            first_name: "",
            middle_name: "",
            last_name: "",
            birth_date: "",
            gender_id: "1",
            relationship_id: "1", // Head
            civil_status_id: "2", // Married
            is_household_head: true,
            is_pwd: false,
            is_pregnant: false,
        }
    ]);

    // Lookups
    const [lookups, setLookups] = useState({
        genders: [
            { gender_id: 1, gender_label: "Male" },
            { gender_id: 2, gender_label: "Female" },
        ],
        relationships: [
            { relationship_id: 1, relationship_label: "Head of Household" },
            { relationship_id: 2, relationship_label: "Spouse" },
            { relationship_id: 3, relationship_label: "Child" },
            { relationship_id: 4, relationship_label: "Parent" },
            { relationship_id: 5, relationship_label: "Sibling" },
            { relationship_id: 6, relationship_label: "Other" },
        ],
        civil_statuses: [
            { civil_status_id: 1, status_label: "Single" },
            { civil_status_id: 2, status_label: "Married" },
            { civil_status_id: 3, status_label: "Widowed" },
            { civil_status_id: 4, status_label: "Separated" },
        ]
    });

    useEffect(() => {
        if (!isOpen) return;
        getLookups()
            .then((res) => {
                if (res) {
                    setLookups(prev => ({
                        genders: res.genders?.length ? res.genders : prev.genders,
                        relationships: res.relationships?.length ? res.relationships : prev.relationships,
                        civil_statuses: (res.civil_statuses || res.civil_status)?.length 
                            ? (res.civil_statuses || res.civil_status) 
                            : prev.civil_statuses,
                    }));
                }
            })
            .catch(() => {});
    }, [isOpen]);

    const handleAddMember = () => {
        setMembers(prev => [
            ...prev,
            {
                id: `member-${Date.now()}`,
                first_name: "",
                middle_name: "",
                last_name: householdName ? householdName.replace(/\s+family$/i, "").trim() : "",
                birth_date: "",
                gender_id: "1",
                relationship_id: "3", // Child by default
                civil_status_id: "1", // Single
                is_household_head: false,
                is_pwd: false,
                is_pregnant: false,
            }
        ]);
    };

    const handleRemoveMember = (id) => {
        if (members.length <= 1) return;
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const handleUpdateMember = (id, field, value) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const resetForm = () => {
        setHouseholdName("");
        setContactNumber("");
        setEmergencyContact("");
        setStreet("");
        setPurok("");
        setBarangay("Mambaling");
        setCity("Cebu City");
        setMembers([
            {
                id: "head-1",
                first_name: "",
                middle_name: "",
                last_name: "",
                birth_date: "",
                gender_id: "1",
                relationship_id: "1",
                civil_status_id: "2",
                is_household_head: true,
                is_pwd: false,
                is_pregnant: false,
            }
        ]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError(null);

        const trimmedName = householdName.trim();
        if (!trimmedName) {
            setError("Household / Family name is required.");
            return;
        }

        // Validate members if any are partially filled
        const validMembers = [];
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            const hasData = m.first_name || m.last_name || m.birth_date;
            if (hasData) {
                if (!m.first_name?.trim() || !m.last_name?.trim()) {
                    setError(`Please provide first and last name for family member #${i + 1}.`);
                    return;
                }
                if (!m.birth_date) {
                    setError(`Please provide birth date for family member #${i + 1} (${m.first_name} ${m.last_name}).`);
                    return;
                }
                validMembers.push({
                    first_name: m.first_name.trim(),
                    middle_name: m.middle_name?.trim() || null,
                    last_name: m.last_name.trim(),
                    birth_date: m.birth_date,
                    gender_id: Number(m.gender_id) || 1,
                    relationship_id: Number(m.relationship_id) || (m.is_household_head ? 1 : 3),
                    civil_status_id: Number(m.civil_status_id) || 1,
                    is_household_head: m.is_household_head ? 1 : 0,
                    can_report_for_household: m.is_household_head ? 1 : 0,
                    is_pwd: m.is_pwd ? 1 : 0,
                    is_pregnant: m.is_pregnant ? 1 : 0,
                });
            }
        }

        setLoading(true);

        try {
            const payload = {
                household_name: trimmedName,
                contact_number: contactNumber.trim() || null,
                emergency_contact: emergencyContact.trim() || null,
                street: street.trim() || null,
                purok: purok.trim() || null,
                barangay: barangay.trim() || null,
                city: city.trim() || null,
                full_address: [street, purok, barangay, city].filter(Boolean).join(", "),
                members: validMembers.length > 0 ? validMembers : undefined,
            };

            const res = await createHousehold(payload);
            const createdData = res?.data || res;
            resetForm();
            onSuccess?.(createdData);
            onClose();
        } catch (err) {
            console.error("Failed to register new household:", err);
            const msg = err.response?.data?.message || err.message || "Failed to register household. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!loading) {
                    resetForm();
                    onClose();
                }
            }}
            title={
                <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-600" />
                    <span>Register New Household</span>
                </div>
            }
            className="sm:max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5 text-left max-h-[75vh] overflow-y-auto pr-1">
                {error && (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                        {error}
                    </div>
                )}

                {/* 1. Household Basic Information */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <Users size={12} className="text-blue-500" />
                        <span>Basic Household Information</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                Family / Household Name <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g. Santos Family"
                                value={householdName}
                                onChange={(e) => setHouseholdName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                <Phone size={12} className="text-slate-400" />
                                <span>Primary Contact Number</span>
                            </label>
                            <Input
                                placeholder="e.g. 09171234567"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                <ShieldCheck size={12} className="text-slate-400" />
                                <span>Emergency Contact Number</span>
                            </label>
                            <Input
                                placeholder="e.g. 09189876543"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Residence / Address */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <MapPin size={12} className="text-emerald-500" />
                        <span>Residence & Address</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Street / House No.</label>
                            <Input
                                placeholder="e.g. 104 Katipunan St."
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Sitio / Purok</label>
                            <Input
                                placeholder="e.g. Sitio Alaska, Purok 2"
                                value={purok}
                                onChange={(e) => setPurok(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Barangay</label>
                            <Input
                                value={barangay}
                                onChange={(e) => setBarangay(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">City / Municipality</label>
                            <Input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Family Members */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Users size={12} className="text-indigo-500" />
                            <span>Family Members ({members.length})</span>
                        </p>
                        <button
                            type="button"
                            onClick={handleAddMember}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                            <Plus size={13} />
                            <span>Add Member</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {members.map((m, idx) => (
                            <div 
                                key={m.id}
                                className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                            {m.is_household_head ? "Head of Household" : `Family Member #${idx + 1}`}
                                        </span>
                                    </div>
                                    {members.length > 1 && !m.is_household_head && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(m.id)}
                                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                                            title="Remove member"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                                        <Input
                                            placeholder="First Name"
                                            value={m.first_name}
                                            onChange={(e) => handleUpdateMember(m.id, "first_name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Middle Name</label>
                                        <Input
                                            placeholder="Middle Name (Optional)"
                                            value={m.middle_name}
                                            onChange={(e) => handleUpdateMember(m.id, "middle_name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                                        <Input
                                            placeholder="Last Name"
                                            value={m.last_name}
                                            onChange={(e) => handleUpdateMember(m.id, "last_name", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Date</label>
                                        <Input
                                            type="date"
                                            value={m.birth_date}
                                            onChange={(e) => handleUpdateMember(m.id, "birth_date", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                                        <Select
                                            value={m.gender_id}
                                            onChange={(e) => handleUpdateMember(m.id, "gender_id", e.target.value)}
                                        >
                                            {lookups.genders.map(g => (
                                                <option key={g.gender_id} value={g.gender_id}>{g.gender_label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Relationship</label>
                                        <Select
                                            value={m.relationship_id}
                                            onChange={(e) => handleUpdateMember(m.id, "relationship_id", e.target.value)}
                                            disabled={m.is_household_head}
                                        >
                                            {lookups.relationships.map(r => (
                                                <option key={r.relationship_id} value={r.relationship_id}>{r.relationship_label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={m.is_pwd}
                                            onChange={(e) => handleUpdateMember(m.id, "is_pwd", e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <HeartPulse size={12} className="text-rose-500" />
                                        <span>PWD</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={m.is_pregnant}
                                            onChange={(e) => handleUpdateMember(m.id, "is_pregnant", e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Baby size={12} className="text-amber-500" />
                                        <span>Pregnant</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => {
                            if (!loading) {
                                resetForm();
                                onClose();
                            }
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Registering...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={14} />
                                <span>Register Household</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
