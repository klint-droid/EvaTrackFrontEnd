import { useEffect, useState } from 'react';
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

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isSuperAdminUser = isSuperAdmin();
    const isAdminUser = isAdmin();
    const isPersonnelUser = isPersonnel();

    const activeEvacuation = household?.current_evacuation || household?.currentEvacuation;
    const isHouseholdManageable = isSuperAdminUser || isAdminUser || 
        (isPersonnelUser && activeEvacuation?.center_id === currentUser?.assigned_center_id);

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

    const handleMemberStatusChange = async (memberId, status) => {
        const activeEvacuation =
            evacuationContext ||
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

    // ─── Guards ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    if (!household) {
        return <div className="p-6 text-red-500">Household not found.</div>;
    }

    const evacuation =
        evacuationContext ||
        household.current_evacuation ||
        household.currentEvacuation;

    const isEvacuated = !!evacuation;

    const evacuatedMembers =
        evacuation?.evacuated_members ||
        evacuation?.evacuatedMembers ||
        [];

    const verifiedMemberIds = new Set(evacuatedMembers.map(item => item.member_id));
    const showMemberEvacuationStatus = isEvacuationContext && isEvacuated;

    // ─── Render ───────────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

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
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Basic Information
                    </p>
                    {[
                        { icon: Users,  label: 'Members', value: `${household.member_count || household.members?.length || 0} people` },
                        { icon: Phone,  label: 'Contact', value: household.contact_number || '—' },
                        { icon: MapPin, label: 'Address', value: household.address?.full_address || '—' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon size={16} className="text-blue-600" />
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
                            {[
                                { icon: Building,     label: 'Center',           value: evacuation.center?.name || '—' },
                                { icon: DoorOpen,     label: 'Unit',             value: evacuation.unit_allocation?.unit?.name || 'No unit assigned' },
                                { icon: CheckCircle,  label: 'Event',            value: evacuation.event?.name || '—' },
                                { icon: Users,        label: 'Verified Members', value: `${evacuatedMembers.length || evacuation.evacuated_count || 0} verified` },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon size={16} className="text-green-600" />
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

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Members ({household.members?.length || 0})
                        </p>
                        {showMemberEvacuationStatus && (
                            <p className="text-xs text-slate-400 mt-1">
                                Mark each household member as Evacuated or Not Verified for this evacuation record.
                            </p>
                        )}
                    </div>
                    {canEdit && (
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
                        >
                            <Plus size={13} /> Add Member
                        </button>
                    )}
                </div>

                {!household.members?.length ? (
                    <div className="py-10 text-center text-slate-400 text-sm">
                        No members recorded.
                    </div>
                ) : (
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
                                        ...(showMemberEvacuationStatus ? ['Status'] : []),
                                        ''
                                    ].map(h => (
                                        <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                                {household.members.map(member => {
                                    const isMemberEvacuated = verifiedMemberIds.has(member.member_id);
                                    const isStatusUpdating = statusUpdatingMemberId === member.member_id;

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

                                            {showMemberEvacuationStatus && (
                                                <td className="px-6 py-3">
                                                    <select
                                                        value={isMemberEvacuated ? 'evacuated' : 'not_verified'}
                                                        disabled={!canEdit || isStatusUpdating}
                                                        onChange={e => handleMemberStatusChange(member.member_id, e.target.value)}
                                                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg border outline-none disabled:opacity-60 ${
                                                            isMemberEvacuated
                                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                                : 'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}
                                                    >
                                                        <option value="evacuated">Evacuated</option>
                                                        <option value="not_verified">Not Verified</option>
                                                    </select>
                                                </td>
                                            )}

                                            <td className="px-6 py-3">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => openEdit(member)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(member.member_id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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