import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Users,
    Phone,
    MapPin,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Building,
    DoorOpen,
    Loader2,
    Plus,
    Edit3,
    Trash2,
    AlertCircle,
    Search,
    Shield,
    Lock,
} from 'lucide-react';

import { getHousehold } from '../api/households/getHousehold';
import { addMember } from '../api/households/addMember';
import { updateMember } from '../api/households/updateMember';
import { deleteMember } from '../api/households/deleteMember';
import { getEvacuationRecord } from '../api/evacuationRecords/getEvacuationRecord';
import { updateMemberEvacuationStatus } from '../api/evacuationRecords/updateMemberEvacuationStatus';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';
import MemberModal from '../components/households/MemberModal';

export default function HouseholdDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const evacuationIdFromUrl = searchParams.get('evacuation_id');
    const centerIdFromUrl = searchParams.get('center_id');

    const [household, setHousehold] = useState(null);
    const [evacuationContext, setEvacuationContext] = useState(null);
    const [loading, setLoading] = useState(true);
    const [memberModal, setMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [statusUpdatingMemberId, setStatusUpdatingMemberId] = useState(null);
    const [activeEvacTab, setActiveEvacTab] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [checkInModal, setCheckInModal] = useState({ open: false, member: null });

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isSuperAdminUser = isSuperAdmin();
    const isAdminUser = isAdmin();
    const isPersonnelUser = isPersonnel();

    // The personnel's OWN assigned center — this is the key to fixing the POV
    const assignedCenterId = currentUser?.assigned_center?.id || currentUser?.assigned_center_id;

    // For backwards compatibility with URL-based navigation
    const targetCenterId = centerIdFromUrl ||
                           evacuationContext?.center_id ||
                           evacuationContext?.center?.evacuation_center_id ||
                           household?.current_evacuation?.center_id ||
                           household?.current_evacuation?.center?.evacuation_center_id ||
                           household?.currentEvacuation?.center_id ||
                           household?.currentEvacuation?.center?.evacuation_center_id;

    // Use assignedCenterId for personnel POV, targetCenterId for admin/fallback
    const povCenterId = isPersonnelUser ? assignedCenterId : targetCenterId;

    const isHouseholdManageable = isSuperAdminUser || isAdminUser ||
        (isPersonnelUser && (!targetCenterId || String(targetCenterId) === String(assignedCenterId)));

    const canEdit = isHouseholdManageable;
    const canDelete = isSuperAdminUser || isAdminUser;
    const isEvacuationContext = !!evacuationIdFromUrl;

    // ─── Fetchers ─────────────────────────────────────────────────────

    const fetchHousehold = async () => {
        try {
            const res = await getHousehold(id);
            setHousehold(res.data || res);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvacuationContext = async () => {
        if (!evacuationIdFromUrl) return;
        try {
            const res = await getEvacuationRecord(evacuationIdFromUrl);
            setEvacuationContext(res.data || res);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to load evacuation record.');
        }
    };

    const fetchPageData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchHousehold(), fetchEvacuationContext()]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, [id, evacuationIdFromUrl]);

    // ─── Modal Handlers ───────────────────────────────────────────────

    const openAdd = () => {
        setEditingMember(null);
        setMemberModal(true);
    };

    const openEdit = (member) => {
        setEditingMember(member);
        setMemberModal(true);
    };

    const handleSave = async (formData) => {
        if (editingMember) {
            await updateMember(id, editingMember.member_id, formData);
        } else {
            await addMember(id, formData);
        }

        await fetchHousehold();

        if (evacuationIdFromUrl) {
            await fetchEvacuationContext();
        }
    };

    // ─── Other Handlers ───────────────────────────────────────────────

    const handleDelete = async (memberId) => {
        if (!confirm('Remove this member?')) return;
        try {
            await deleteMember(id, memberId);
            await fetchHousehold();
            if (evacuationIdFromUrl) await fetchEvacuationContext();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member.');
        }
    };

    const handleMemberStatusChange = async (memberId, status, evacId) => {
        const activeEvacuation = evacId
            ? { evacuation_id: evacId }
            : evacuationContext ||
              household?.current_evacuation ||
              household?.currentEvacuation;

        if (!activeEvacuation?.evacuation_id) {
            alert('No evacuation record selected.');
            return;
        }

        try {
            setStatusUpdatingMemberId(memberId);
            await updateMemberEvacuationStatus(
                activeEvacuation.evacuation_id,
                memberId,
                status
            );
            await fetchHousehold();
            if (evacuationIdFromUrl) await fetchEvacuationContext();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update member evacuation status.');
        } finally {
            setStatusUpdatingMemberId(null);
        }
    };

    const handleBack = () => {
        if (centerIdFromUrl) {
            navigate(`/evacuation-centers/${centerIdFromUrl}`);
            return;
        }
        navigate(-1);
    };

    // ─── Derived Data ─────────────────────────────────────────────────

    // Build the list of all active evacuations across all centers
    const allActiveEvacuations = useMemo(() => {
        if (!household) return [];

        // Prefer the new plural relationship
        const evacsList = household.current_evacuations || household.currentEvacuations || [];

        if (evacsList.length > 0) return evacsList;

        // Fallback: single evacuation from context or currentEvacuation
        const single = evacuationContext || household.current_evacuation || household.currentEvacuation;
        return single ? [single] : [];
    }, [household, evacuationContext]);

    const isEvacuated = allActiveEvacuations.length > 0;
    const isScattered = allActiveEvacuations.length > 1;

    // Find personnel's evacuation record for this household
    const personnelEvacuation = useMemo(() => {
        return allActiveEvacuations.find(e => {
            const cId = e.center_id || e.center?.evacuation_center_id;
            return String(cId) === String(assignedCenterId);
        });
    }, [allActiveEvacuations, assignedCenterId]);

    // Build a Set of all evacuated member IDs across all centers
    const allEvacuatedMemberIds = useMemo(() => {
        const ids = new Set();
        allActiveEvacuations.forEach(evac => {
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach(em => ids.add(em.member_id));
        });
        return ids;
    }, [allActiveEvacuations]);

    // Build a map: member_id → { center_id, center_name, evacuation_id, verified_at }
    const memberEvacMap = useMemo(() => {
        const map = {};
        allActiveEvacuations.forEach(evac => {
            const centerId = evac.center_id || evac.center?.evacuation_center_id;
            const centerName = evac.center?.name || 'Unknown Center';
            const evacuationId = evac.evacuation_id;
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach(em => {
                map[em.member_id] = {
                    center_id: centerId,
                    center_name: centerName,
                    evacuation_id: evacuationId,
                    verified_at: em.verified_at,
                    verified_by: evac.verifier?.name || evac.verified_by,
                };
            });
        });
        return map;
    }, [allActiveEvacuations]);

    // Set default active tab to personnel's center (if they have one there) or first tab
    useEffect(() => {
        if (allActiveEvacuations.length > 0 && activeEvacTab === null) {
            const myEvac = allActiveEvacuations.find(e => {
                const cId = e.center_id || e.center?.evacuation_center_id;
                return String(cId) === String(povCenterId);
            });
            setActiveEvacTab(myEvac
                ? (myEvac.center_id || myEvac.center?.evacuation_center_id)
                : (allActiveEvacuations[0].center_id || allActiveEvacuations[0].center?.evacuation_center_id)
            );
        }
    }, [allActiveEvacuations, povCenterId]);

    // Filter members based on search
    const filteredMembers = useMemo(() => {
        if (!household?.members) return [];
        if (!memberSearch.trim()) return household.members;
        const q = memberSearch.toLowerCase();
        return household.members.filter(m => {
            const fullName = [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(' ').toLowerCase();
            return fullName.includes(q) || m.member_id?.toLowerCase().includes(q);
        });
    }, [household?.members, memberSearch]);

    // ─── Permission Helpers ───────────────────────────────────────────

    /**
     * Determines if the current user can modify a specific member's evacuation status.
     * Personnel can only modify members verified at THEIR assigned center.
     * Admin/SuperAdmin can modify all.
     */
    const canModifyMember = (memberId) => {
        if (isSuperAdminUser || isAdminUser) return true;
        if (!isPersonnelUser) return false;

        const memberEvac = memberEvacMap[memberId];
        // If member is not evacuated anywhere, personnel at any center can check them in
        if (!memberEvac) return true;
        // If member is at personnel's assigned center, they can modify
        return String(memberEvac.center_id) === String(assignedCenterId);
    };

    // ─── Guards ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin" size={36} />
                    <p className="text-xs font-bold uppercase tracking-widest">Loading household...</p>
                </div>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <XCircle size={48} className="text-red-200 mb-4" />
                <p className="text-base font-black text-slate-700 mb-1">Household Not Found</p>
                <p className="text-xs text-slate-400 mb-6">
                    This household does not exist or you don&apos;t have access to it.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Members for the active tab
    const getTabMembers = (centerId) => {
        return filteredMembers.filter(m => {
            const evac = memberEvacMap[m.member_id];
            return evac && String(evac.center_id) === String(centerId);
        });
    };

    const unverifiedMembers = filteredMembers.filter(m => !allEvacuatedMemberIds.has(m.member_id));

    // Active tab evacuation record
    const activeTabEvacuation = allActiveEvacuations.find(e => {
        const cId = e.center_id || e.center?.evacuation_center_id;
        return String(cId) === String(activeEvacTab);
    });

    const isMyCenter = (centerId) => String(centerId) === String(assignedCenterId);

    // ─── Render Helper: Member Row ────────────────────────────────────

    const renderMemberRow = (member, showStatus = false, context = null) => {
        const memberEvac = memberEvacMap[member.member_id];
        const isMemberEvacuated = !!memberEvac;
        const isStatusUpdating = statusUpdatingMemberId === member.member_id;
        const canModify = canModifyMember(member.member_id);
        
        // For admins, the active tab defines the POV for the status column.
        // For personnel, it's strictly their assigned center.
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
                            // Member not evacuated anywhere → show check-in control
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

                            // Member is at the current view's center (their POV center)
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

                            // Member is at a DIFFERENT center — read-only
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

    // ─── Render Helper: Members Table ─────────────────────────────────

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

    // ─── Primary evacuation for the status card ──────────────────────
    const primaryEvacuation =
        evacuationContext ||
        household.current_evacuation ||
        household.currentEvacuation;

    // ─── Render ───────────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-left">

            {/* HEADER */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>

                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {household.household_name}
                    </h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {household.household_id}
                    </p>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {isEvacuationContext && (
                        <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border bg-blue-50 text-blue-600 border-blue-100">
                            Evacuation Context
                        </span>
                    )}
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                        isEvacuated
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                        {isEvacuated ? 'Evacuated' : 'Not Evacuated'}
                    </span>
                    {isScattered && (
                        <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border bg-amber-50 text-amber-600 border-amber-100">
                            Scattered
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Basic Information
                    </p>
                    {[
                        { icon: <Users size={16} className="text-blue-600" />,  label: 'Members', value: `${household.member_count || household.members?.length || 0} people` },
                        { icon: <Phone size={16} className="text-blue-600" />,  label: 'Contact', value: household.contact_number || '—' },
                        { icon: <MapPin size={16} className="text-blue-600" />, label: 'Address', value: household.address?.full_address || '—' },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                {icon}
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
                                <p className="text-sm font-bold text-slate-800">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Evacuation Status */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Evacuation Status
                    </p>
                    {isEvacuated ? (
                        <>
                            {isScattered ? (
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
                                    <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold">Family Separated Across {allActiveEvacuations.length} Centers</p>
                                        <p className="text-[10px] mt-0.5 text-amber-700">
                                            {allActiveEvacuations.map(e => e.center?.name || 'Unknown').join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                            {[
                                { icon: <Building size={16} className="text-green-600" />,     label: 'Center',           value: isScattered ? `${allActiveEvacuations.length} centers` : (primaryEvacuation?.center?.name || '—') },
                                { icon: <DoorOpen size={16} className="text-green-600" />,     label: 'Unit',             value: primaryEvacuation?.unit_allocation?.unit?.name || primaryEvacuation?.unitAllocation?.unit?.name || 'No unit assigned' },
                                { icon: <CheckCircle size={16} className="text-green-600" />,  label: 'Event',            value: primaryEvacuation?.event?.name || '—' },
                                { icon: <Users size={16} className="text-green-600" />,        label: 'Verified Members', value: `${allEvacuatedMemberIds.size} of ${household.members?.length || 0} verified` },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
                                        <p className="text-sm font-bold text-slate-800">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                            <XCircle size={40} className="mb-2" />
                            <p className="text-sm font-bold">Not currently evacuated</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Members Section */}
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

                {/* Evacuation Center Tabs (only when evacuated) */}
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

            {/* Check-In Modal */}
            {checkInModal.open && checkInModal.member && (
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
            )}

            {/* Member Modal */}
            <MemberModal
                open={memberModal}
                onClose={() => setMemberModal(false)}
                onSave={handleSave}
                editingMember={editingMember}
            />
        </div>
    );
}