import React from "react";
import { Search, Plus, Building, Lock, AlertCircle, Shield, DoorOpen, CheckCircle, MapPin, Edit3, Trash2, XCircle, Loader2 } from "lucide-react";

export default function EvacueeList({
    household,
    isEvacuated,
    isPersonnelUser,
    isSuperAdminUser,
    isAdminUser,
    memberSearch,
    setMemberSearch,
    canEdit,
    openAdd,
    allActiveEvacuations,
    activeEvacTab,
    setActiveEvacTab,
    unverifiedMembers,
    isMyCenter,
    getTabMembers,
    activeTabEvacuation,
    filteredMembers,
    memberEvacMap,
    canModifyMember,
    povCenterId,
    statusUpdatingMemberId,
    setCheckInModal,
    personnelEvacuation,
    handleMemberStatusChange,
    openEdit,
    canDelete,
    handleDelete,
    allEvacuatedMemberIds
}) {

    const renderMemberRow = (member, showStatus = false, context = null) => {
        const memberEvac = memberEvacMap[member.member_id];
        const isMemberEvacuated = !!memberEvac;
        const isStatusUpdating = statusUpdatingMemberId === member.member_id;
        const canModify = canModifyMember(member.member_id);
        
        const effectivePovCenterId = (isSuperAdminUser || isAdminUser) ? activeEvacTab : povCenterId;
        const memberAtMyCenter = memberEvac && String(memberEvac.center_id) === String(effectivePovCenterId);

        return (
            <tr key={member.member_id} className="hover:bg-slate-50/30 group">
                <td className="px-6 py-3 text-sm font-medium text-slate-700">
                    {[member.first_name, member.middle_name, member.last_name]
                        .filter(Boolean)
                        .join(' ')}
                </td>

                <td className="px-6 py-3 text-sm text-slate-500">
                    {(() => {
                        if (!member.birth_date) return '—';
                        const birth = new Date(member.birth_date);
                        if (isNaN(birth.getTime())) return '—';
                        const today = new Date();
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                            age--;
                        }
                        return `${age} yrs old`;
                    })()}
                </td>

                <td className="px-6 py-3 text-sm text-slate-500">
                    {member.gender?.label || '—'}
                </td>

                <td className="px-6 py-3 text-sm text-slate-500">
                    {member.relationship?.label || '—'}
                </td>

                <td className="px-6 py-3 text-sm text-slate-500">
                    {member.civil_status?.label || '—'}
                </td>

                <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                        {member.vulnerable_groups?.length
                            ? member.vulnerable_groups.map(v => (
                                <span
                                    key={v.id}
                                    className="px-2 py-0.5 text-[9px] font-black rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                                >
                                    {v.label}
                                </span>
                            ))
                            : <span className="text-slate-400 text-xs">—</span>
                        }
                    </div>
                </td>

                {showStatus && (
                    <>
                        <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {memberEvac?.verified_at 
                                ? new Date(memberEvac.verified_at).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                  })
                                : '—'}
                        </td>
                        <td className="px-6 py-3">
                            {(() => {
                            if (!isMemberEvacuated) {
                                const canCheckIn = canModify && (
                                    (isPersonnelUser && personnelEvacuation?.evacuation_id) || 
                                    (!isPersonnelUser && allActiveEvacuations.length > 0)
                                );

                                if (!canCheckIn) {
                                    return (
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black rounded-lg border bg-red-50 text-red-600 border-red-100">
                                            Not Verified
                                        </span>
                                    );
                                }

                                return (
                                    <button
                                        disabled={isStatusUpdating}
                                        onClick={() => setCheckInModal({ open: true, member })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black rounded-lg border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 transition-colors"
                                        title="Click to check-in this member"
                                    >
                                        Not Verified (Check-In)
                                    </button>
                                );
                            }

                            if (memberAtMyCenter) {
                                if (canModify) {
                                    return (
                                        <select
                                            value="evacuated"
                                            disabled={isStatusUpdating}
                                            onChange={e => handleMemberStatusChange(member.member_id, e.target.value, memberEvac.evacuation_id)}
                                            className="px-3 py-1.5 text-[10px] font-black rounded-lg border outline-none bg-green-50 text-green-600 border-green-100 cursor-pointer"
                                        >
                                            <option value="evacuated">Evacuated Here</option>
                                            <option value="not_verified">Check-Out</option>
                                        </select>
                                    );
                                }
                                return (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black rounded-lg border bg-green-50 text-green-600 border-green-100">
                                        <CheckCircle size={10} />
                                        Evacuated Here
                                    </span>
                                );
                            }

                            return (
                                <div className="relative group/tooltip inline-block">
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-black rounded-lg border bg-amber-50 text-amber-700 border-amber-100 cursor-help">
                                        <MapPin size={10} className="text-amber-500" />
                                        {memberEvac.center_name}
                                    </span>

                                    <div className="absolute z-10 hidden group-hover/tooltip:block bg-slate-900 text-white text-[10px] rounded-lg p-2.5 shadow-lg w-52 -top-24 left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-slate-900">
                                        <p className="font-bold border-b border-slate-700 pb-1 mb-1.5 flex items-center gap-1">
                                            <Lock size={9} /> Verified at Another Center
                                        </p>
                                        <p><strong>Center:</strong> {memberEvac.center_name}</p>
                                        <p><strong>Verified:</strong> {memberEvac.verified_at ? new Date(memberEvac.verified_at).toLocaleDateString() : '—'}</p>
                                        {isPersonnelUser && (
                                            <p className="mt-1.5 text-amber-300 text-[9px]">
                                                Only personnel at {memberEvac.center_name} can modify this member.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                        </td>
                    </>
                )}

                <td className="px-6 py-3">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canModify && canEdit && (
                            <button
                                disabled={!member.member_id?.startsWith('HM-')}
                                onClick={() => openEdit(member)}
                                className={`p-1.5 rounded-lg transition-all ${member.member_id?.startsWith('HM-') ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed opacity-50'}`}
                                title={member.member_id?.startsWith('HM-') ? "Edit Member" : "Official record: Cannot edit this member"}
                            >
                                <Edit3 size={14} />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                disabled={!member.member_id?.startsWith('HM-')}
                                onClick={() => handleDelete(member.member_id)}
                                className={`p-1.5 rounded-lg transition-all ${member.member_id?.startsWith('HM-') ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed opacity-50'}`}
                                title={member.member_id?.startsWith('HM-') ? "Delete Member" : "Official record: Cannot delete this member"}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    const renderMembersTable = (members, showStatus = false, context = null) => {
        if (!members.length) {
            return (
                <div className="py-8 text-center text-slate-400 text-sm">
                    {memberSearch ? 'No members matching your search.' : 'No members in this group.'}
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            {[
                                'Name',
                                'Age',
                                'Gender',
                                'Relation',
                                'Civil Status',
                                'Vulnerable Groups',
                                ...(showStatus ? ['Verified At', 'Status'] : []),
                                ''
                            ].map(h => (
                                <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                        {members.map(member => renderMemberRow(member, showStatus, context))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Members ({household.members?.length || 0})
                    </p>
                    {isEvacuated && (
                        <p className="text-xs text-slate-400 mt-1">
                            {isPersonnelUser
                                ? `You can manage members verified at your center. Other centers' members are read-only.`
                                : 'Mark each household member as Evacuated or Not Verified for this evacuation record.'
                            }
                        </p>
                    )}
                </div>

                {/* Member Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={memberSearch}
                        onChange={e => setMemberSearch(e.target.value)}
                        placeholder="Search members..."
                        className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all w-44"
                    />
                </div>

                {canEdit && (
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex-shrink-0"
                    >
                        <Plus size={13} /> Add Member
                    </button>
                )}
            </div>

            {/* Evacuation Center Tabs */}
            {isEvacuated && allActiveEvacuations.length > 0 && (
                <div className="border-b border-slate-100 bg-slate-50/30">
                    <nav className="flex px-5 gap-1 overflow-x-auto" aria-label="Evacuation center tabs">
                        {allActiveEvacuations.map(evac => {
                            const cId = evac.center_id || evac.center?.evacuation_center_id;
                            const cName = evac.center?.name || 'Unknown Center';
                            const memberCount = (evac.evacuated_members || evac.evacuatedMembers || []).length;
                            const isActive = String(activeEvacTab) === String(cId);
                            const isMine = isMyCenter(cId);

                            return (
                                <button
                                    key={cId}
                                    onClick={() => setActiveEvacTab(cId)}
                                    className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? 'border-blue-600 text-blue-600 bg-white'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <Building size={13} />
                                    <span>{cName}</span>
                                    <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-full ${
                                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {memberCount}
                                    </span>
                                    {isMine && isPersonnelUser && (
                                        <span className="px-1.5 py-0.5 text-[8px] font-black rounded-full bg-green-100 text-green-700 uppercase tracking-wider">
                                            Your Center
                                        </span>
                                    )}
                                    {!isMine && isPersonnelUser && (
                                        <Lock size={10} className="text-slate-400" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Unverified tab */}
                        {unverifiedMembers.length > 0 && (
                            <button
                                onClick={() => setActiveEvacTab('unverified')}
                                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                                    activeEvacTab === 'unverified'
                                        ? 'border-amber-500 text-amber-600 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <AlertCircle size={13} />
                                <span>Unverified</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-full ${
                                    activeEvacTab === 'unverified' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {unverifiedMembers.length}
                                </span>
                            </button>
                        )}
                    </nav>
                </div>
            )}

            {/* Tab Content */}
            {isEvacuated && activeEvacTab ? (
                <div>
                    {activeEvacTab === 'unverified' ? (
                        <>
                            {/* Info banner for unverified */}
                            <div className="mx-5 mt-4 mb-2 flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
                                <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                                <p className="text-[11px]">
                                    These members have not been verified at any evacuation center yet.
                                    {isPersonnelUser && ' You can check them in to your assigned center.'}
                                </p>
                            </div>
                            {renderMembersTable(unverifiedMembers, true)}
                        </>
                    ) : (
                        <>
                            {/* Info banner for other center's tab */}
                            {isPersonnelUser && !isMyCenter(activeEvacTab) && (
                                <div className="mx-5 mt-4 mb-2 flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                                    <Shield className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                                    <p className="text-[11px]">
                                        <strong>Read-only view.</strong> These members were verified by personnel at <strong>{activeTabEvacuation?.center?.name}</strong>. Only personnel assigned there can modify them.
                                    </p>
                                </div>
                            )}
                            {renderMembersTable(
                                getTabMembers(activeEvacTab),
                                true,
                                activeTabEvacuation
                            )}
                        </>
                    )}
                </div>
            ) : (
                // Not evacuated — show all members without status column
                renderMembersTable(filteredMembers, false)
            )}
        </div>
    );
}
