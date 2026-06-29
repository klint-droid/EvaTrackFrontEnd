import React from "react";
import { createPortal } from "react-dom";
import { UserCheck, X, AlertCircle, MapPin, CheckCircle2, Loader2 } from "lucide-react";

export default function AdmissionModal({
    assignmentModal,
    closeAdmissionModal,
    modalError,
    scannedData,
    getActiveEvacuation,
    selectedMembers,
    setSelectedMembers,
    calculateAge,
    memberCount,
    setMemberCount,
    selectedUnitId,
    setSelectedUnitId,
    units,
    loading,
    handleConfirmAdmission
}) {
    if (!assignmentModal) return null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
                onClick={closeAdmissionModal}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col text-left">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 leading-tight">
                                Finalize Admission
                            </h2>
                            <p className="text-xs text-slate-505">
                                Review household details and assign accommodation.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={closeAdmissionModal}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                    {modalError && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100 animate-in zoom-in-95 duration-200">
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-red-600 leading-snug">{modalError}</p>
                        </div>
                    )}

                    {/* HOUSEHOLD SUMMARY */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            Household Summary
                        </h4>
                        
                        <div className="bg-slate-50/50 border border-slate-205 border-l-[4px] border-l-blue-600 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Household Head
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                    {scannedData?.household?.household_name ||
                                        scannedData?.household?.head_name ||
                                        "Selected household"}
                                </p>
                            </div>

                            <div className="space-y-0.5 sm:text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest sm:text-right">
                                    Household ID
                                </p>
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[11px] font-mono font-medium">
                                    {scannedData?.household?.household_id}
                                </span>
                            </div>

                            <div className="col-span-1 sm:col-span-2 space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Current Address
                                </p>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span>
                                        {scannedData?.household?.address?.full_address || "No address specified"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ARRIVING MEMBERS */}
                    {scannedData?.household?.members && scannedData.household.members.length > 0 ? (
                        (() => {
                            const eligibleMembers = scannedData.household.members.filter(m => !getActiveEvacuation(m));
                            const allEligibleSelected = eligibleMembers.length > 0 && selectedMembers.length === eligibleMembers.length;
                            return (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Arriving Members
                                        </h4>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-605 font-semibold cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allEligibleSelected}
                                                disabled={eligibleMembers.length === 0}
                                                onChange={() => {
                                                    if (allEligibleSelected) {
                                                        setSelectedMembers([]);
                                                    } else {
                                                        setSelectedMembers(eligibleMembers.map(m => m.member_id));
                                                    }
                                                }}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 disabled:opacity-50"
                                            />
                                            <span>Select All</span>
                                        </label>
                                    </div>

                                    {/* Members List Table */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white text-[10px] font-black uppercase tracking-wider">
                                            <span className="w-1/2">Name</span>
                                            <span className="w-1/4 text-center">Age</span>
                                            <span className="w-1/4 text-right">Gender</span>
                                        </div>

                                        <div className="divide-y divide-slate-100 bg-white max-h-[180px] overflow-y-auto">
                                            {scannedData.household.members.map((member) => {
                                                const isChecked = selectedMembers.includes(member.member_id);
                                                const activeEvac = getActiveEvacuation(member);
                                                const isDisabled = !!activeEvac;

                                                return (
                                                    <div 
                                                        key={member.member_id}
                                                        onClick={() => {
                                                            if (isDisabled) return;
                                                            if (isChecked) {
                                                                setSelectedMembers(selectedMembers.filter(id => id !== member.member_id));
                                                            } else {
                                                                setSelectedMembers([...selectedMembers, member.member_id]);
                                                            }
                                                        }}
                                                        className={`px-4 py-3 flex items-center justify-between transition-colors ${
                                                            isDisabled ? "bg-rose-50/30 opacity-75 cursor-not-allowed" : "hover:bg-slate-50/50 cursor-pointer"
                                                        }`}
                                                    >
                                                        {/* Left Checkbox & Name info */}
                                                        <div className="w-1/2 flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                disabled={isDisabled}
                                                                readOnly
                                                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 disabled:opacity-50 pointer-events-none"
                                                            />
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-700 leading-tight">
                                                                    {member.first_name} {member.last_name}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                                                    {member.relationshipDetail?.relationship_name || member.relationship?.relationship_label || member.relationship?.label || "Family Member"}
                                                                </p>
                                                                {activeEvac && (
                                                                    <div className="text-[9px] text-rose-600 font-black uppercase mt-1 flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                        Evacuated to: {activeEvac.evacuation_record?.center?.name || activeEvac.evacuation_record?.center?.center_name || activeEvac.evacuationRecord?.center?.name || activeEvac.evacuationRecord?.center?.center_name || activeEvac.evacuation_record?.center_id || activeEvac.evacuationRecord?.center_id || 'Unknown Center'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Age */}
                                                        <div className="w-1/4 text-center text-xs font-medium text-slate-605">
                                                            {calculateAge(member.birth_date)}
                                                        </div>

                                                        {/* GenderBadge */}
                                                        <div className="w-1/4 flex justify-end">
                                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-[10px]">
                                                                {member.gender?.gender_label || member.gender?.label || "—"}
                                                            </span>
                                                        </div>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                Number of Members
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 4"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                value={memberCount}
                                onChange={(e) => setMemberCount(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 font-medium px-1 leading-snug">
                                This household does not have members pre-registered. Specify the count to log details properly.
                            </p>
                        </div>
                    )}

                    {/* ACCOMMODATION ASSIGNMENT */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            Accommodation Assignment
                        </h4>

                        <div className="relative border border-slate-202 rounded-xl px-3 py-2.5 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-slate-450 uppercase tracking-widest">
                                Select Unit
                            </label>
                            <select
                                value={selectedUnitId}
                                onChange={(e) => setSelectedUnitId(e.target.value)}
                                className="w-full bg-white text-xs font-semibold text-slate-705 outline-none border-none py-1 cursor-pointer"
                            >
                                <option value="">Choose available unit...</option>
                                {units.map((unit) => {
                                    const available = unit.max_capacity - (unit.current_occupancy || 0);
                                    const isFull = available <= 0;
                                    
                                    // Check if selected members size is larger than available capacity
                                    const selectedCount = scannedData?.household?.members?.length > 0 
                                        ? selectedMembers.length 
                                        : Number(memberCount) || 1;
                                    
                                    const notEnoughSpace = selectedCount > available;

                                    let statusLabel = `${available} slots left`;
                                    if (isFull) {
                                        statusLabel = "Full";
                                    } else if (notEnoughSpace) {
                                        statusLabel = `Not enough space - ${available} left`;
                                    }

                                    return (
                                        <option 
                                            key={unit.unit_id} 
                                            value={unit.unit_id} 
                                            disabled={isFull || notEnoughSpace}
                                            className="py-1"
                                        >
                                            {unit.name} ({statusLabel})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={closeAdmissionModal}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={loading || (scannedData?.household?.members?.length > 0 ? selectedMembers.length === 0 : !memberCount)}
                        onClick={handleConfirmAdmission}
                        className={`px-5 py-2.5 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                            loading || (scannedData?.household?.members?.length > 0 ? selectedMembers.length === 0 : !memberCount)
                                ? "bg-emerald-300 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/10"
                        }`}
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        Confirm Admission
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
