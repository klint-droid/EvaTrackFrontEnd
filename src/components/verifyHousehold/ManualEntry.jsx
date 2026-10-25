import React from "react";
import { 
    UserPlus, Plus, Loader2, Info, Users, Phone, UserCheck, 
    Trash2, HeartPulse, Baby, Calendar, ShieldCheck
} from "lucide-react";

export default function ManualEntry({
    headName,
    setHeadName,
    householdName,
    setHouseholdName,
    contactNumber,
    setContactNumber,
    walkInMembers = [],
    addWalkInMember,
    removeWalkInMember,
    updateWalkInMember,
    lookups,
    calculateAge,
    handleCreate,
    loading
}) {
    const relationships = lookups?.relationships || [];
    const genders = lookups?.genders || [];
    const civilStatuses = lookups?.civil_statuses || lookups?.civil_status || [];

    // Helper to calculate age and category
    const getAgeInfo = (birthDate) => {
        if (!birthDate) return null;
        const age = calculateAge ? calculateAge(birthDate) : null;
        if (age === null || age === "—" || isNaN(age)) return null;
        return {
            age,
            isSenior: age >= 60,
            isChild: age < 18
        };
    };

    return (
        <div className="p-5 sm:p-8 space-y-6 text-left">
            {/* Informative Walk-In Alert Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
                <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="font-bold text-blue-950 dark:text-blue-100">
                        Emergency Walk-In Family Intake & Admission
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                        Register arriving walk-in families on the spot. Add each arriving family member below — the total count is calculated automatically and every added member will be created and marked as <strong>Evacuated</strong> upon intake.
                    </p>
                </div>
            </div>

            {/* Household Basic Details Section */}
            <div className="bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                    <UserPlus size={16} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Household Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Household / Family Name */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCheck size={13} className="text-slate-400" />
                            <span>Family / Household Name</span>
                        </label>
                        <input
                            value={householdName}
                            onChange={(e) => setHouseholdName(e.target.value)}
                            placeholder={walkInMembers[0]?.last_name ? `${walkInMembers[0].last_name} Household` : "e.g. Dela Cruz Household"}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-400">Family identifier for evacuation logs and relief goods</p>
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />
                            <span>Contact Number (Optional)</span>
                        </label>
                        <input
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="e.g. 09171234567"
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-400">For SMS alerts, relief notifications, and status verification</p>
                    </div>
                </div>
            </div>

            {/* Arriving Members Intake Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <Users size={16} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                                    Arriving Family Members
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    {walkInMembers.length} {walkInMembers.length === 1 ? "Member" : "Members"} (Auto-counted)
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Add every family member present. Each individual will be registered and marked as evacuated.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Member Cards List */}
                <div className="space-y-4">
                    {walkInMembers.map((member, idx) => {
                        const ageInfo = getAgeInfo(member.birth_date);
                        const isHead = member.is_household_head || idx === 0;

                        return (
                            <div 
                                key={member.id || idx}
                                className={`rounded-xl border p-4 sm:p-5 transition-all space-y-4 ${
                                    isHead 
                                        ? "bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/40 shadow-xs" 
                                        : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 shadow-xs"
                                }`}
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${
                                            isHead 
                                                ? "bg-blue-600 text-white" 
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        }`}>
                                            {isHead ? "Head of Household" : `Family Member #${idx + 1}`}
                                        </span>

                                        {ageInfo && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                <span>Age: {ageInfo.age} yrs</span>
                                                {ageInfo.isSenior && <span className="text-amber-600 font-bold">(Senior)</span>}
                                                {ageInfo.isChild && <span className="text-blue-600 font-bold">(Child)</span>}
                                            </span>
                                        )}
                                    </div>

                                    {!isHead && (
                                        <button
                                            type="button"
                                            onClick={() => removeWalkInMember(member.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                            title="Remove this member"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* Form Fields Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* First Name */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            First Name <strong className="text-rose-500">*</strong>
                                        </label>
                                        <input
                                            value={member.first_name || ""}
                                            onChange={(e) => {
                                                updateWalkInMember(member.id, "first_name", e.target.value);
                                                if (isHead) {
                                                    setHeadName(`${e.target.value} ${member.last_name || ""}`.trim());
                                                }
                                            }}
                                            placeholder="e.g. Juan"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                                        />
                                    </div>

                                    {/* Middle Name */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Middle Name
                                        </label>
                                        <input
                                            value={member.middle_name || ""}
                                            onChange={(e) => updateWalkInMember(member.id, "middle_name", e.target.value)}
                                            placeholder="Optional"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Last Name <strong className="text-rose-500">*</strong>
                                        </label>
                                        <input
                                            value={member.last_name || ""}
                                            onChange={(e) => {
                                                updateWalkInMember(member.id, "last_name", e.target.value);
                                                if (isHead) {
                                                    setHeadName(`${member.first_name || ""} ${e.target.value}`.trim());
                                                }
                                            }}
                                            placeholder="e.g. Dela Cruz"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                                        />
                                    </div>

                                    {/* Birth Date */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                            <Calendar size={11} className="text-slate-400" />
                                            <span>Birth Date <strong className="text-rose-500">*</strong></span>
                                        </label>
                                        <input
                                            type="date"
                                            value={member.birth_date || ""}
                                            onChange={(e) => updateWalkInMember(member.id, "birth_date", e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Gender <strong className="text-rose-500">*</strong>
                                        </label>
                                        <select
                                            value={member.gender_id || ""}
                                            onChange={(e) => updateWalkInMember(member.id, "gender_id", e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                                        >
                                            <option value="">Select Gender</option>
                                            {genders.length > 0 ? (
                                                genders.map((g) => (
                                                    <option key={g.id} value={g.id}>
                                                        {g.label}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="1">Male</option>
                                                    <option value="2">Female</option>
                                                    <option value="3">Other</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {/* Relationship to Head */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Relationship to Head <strong className="text-rose-500">*</strong>
                                        </label>
                                        {isHead ? (
                                            <div className="px-3 py-2 bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-800 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                                <ShieldCheck size={14} className="text-blue-500" />
                                                <span>Head of Household</span>
                                            </div>
                                        ) : (
                                            <select
                                                value={member.relationship_id || ""}
                                                onChange={(e) => updateWalkInMember(member.id, "relationship_id", e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                                            >
                                                <option value="">Select Relationship</option>
                                                {relationships
                                                    .filter(r => r.id !== 1 && !r.is_head)
                                                    .map((r) => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.label}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Vulnerability & Special Needs Checkboxes */}
                                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Vulnerabilities:
                                    </span>

                                    {/* PWD Checkbox */}
                                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 font-medium select-none">
                                        <input
                                            type="checkbox"
                                            checked={!!member.is_pwd}
                                            onChange={(e) => updateWalkInMember(member.id, "is_pwd", e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>PWD</span>
                                    </label>

                                    {/* Pregnant Checkbox (relevant for females / all) */}
                                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 font-medium select-none">
                                        <input
                                            type="checkbox"
                                            checked={!!member.is_pregnant}
                                            onChange={(e) => updateWalkInMember(member.id, "is_pregnant", e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Pregnant</span>
                                    </label>

                                    {/* Automated badges */}
                                    {ageInfo?.isSenior && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                            Elderly / Senior (Auto from age)
                                        </span>
                                    )}
                                    {ageInfo?.isChild && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                            Child / Minor (Auto from age)
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Member Button at the Bottom for natural flow */}
                <button
                    type="button"
                    onClick={addWalkInMember}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl bg-slate-50/60 hover:bg-blue-50/50 dark:bg-slate-900/40 dark:hover:bg-blue-950/20 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group active:scale-[0.99]"
                >
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-400 text-slate-600 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400 transition-colors">
                        <Plus size={14} />
                    </div>
                    <span>+ Add Another Family Member</span>
                </button>
            </div>

            {/* Bottom Actions Section */}
            <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
                        <span>Total Arriving Members:</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black">
                            {walkInMembers.length}
                        </span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        All {walkInMembers.length} member(s) will be created and directly admitted with <strong>Evacuated</strong> status.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={walkInMembers.length === 0 || loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={15} />
                    ) : (
                        <>
                            <Plus size={15} />
                            <span>Create & Admit Household ({walkInMembers.length})</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
