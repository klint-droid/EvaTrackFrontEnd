import React from "react";
import { XCircle, Building, Loader2, CheckCircle, DoorOpen } from "lucide-react";

export default function CheckInModal({
    checkInModal,
    setCheckInModal,
    isPersonnelUser,
    personnelEvacuation,
    statusUpdatingMemberId,
    handleMemberStatusChange,
    allActiveEvacuations
}) {
    if (!checkInModal.open || !checkInModal.member) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Building size={18} className="text-blue-600" />
                        Check-In Member
                    </h3>
                    <button
                        onClick={() => setCheckInModal({ open: false, member: null })}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        You are about to check in <strong>{checkInModal.member.first_name} {checkInModal.member.last_name}</strong>.
                    </p>
                    
                    {isPersonnelUser ? (
                        <div>
                            <p className="text-sm text-slate-600 mb-6">
                                Please confirm you want to check them in to your assigned center:
                                <br/>
                                <strong className="text-slate-800">{personnelEvacuation?.center?.name || 'Your Assigned Center'}</strong>
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setCheckInModal({ open: false, member: null })}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={statusUpdatingMemberId === checkInModal.member.member_id}
                                    onClick={() => {
                                        handleMemberStatusChange(checkInModal.member.member_id, 'evacuated', personnelEvacuation?.evacuation_id);
                                        setCheckInModal({ open: false, member: null });
                                    }}
                                    className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {(statusUpdatingMemberId === checkInModal.member.member_id) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                    Confirm Check-In
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-slate-600 mb-3">Select the evacuation center to check them into:</p>
                            <div className="space-y-2 mb-6">
                                {allActiveEvacuations.map(evac => (
                                    <button
                                        key={evac.evacuation_id}
                                        onClick={() => {
                                            handleMemberStatusChange(checkInModal.member.member_id, 'evacuated', evac.evacuation_id);
                                            setCheckInModal({ open: false, member: null });
                                        }}
                                        disabled={statusUpdatingMemberId === checkInModal.member.member_id}
                                        className="w-full text-left px-4 py-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-between group"
                                    >
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                                            {evac.center?.name || 'Center'}
                                        </span>
                                        <DoorOpen size={16} className="text-slate-400 group-hover:text-blue-500" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setCheckInModal({ open: false, member: null })}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
