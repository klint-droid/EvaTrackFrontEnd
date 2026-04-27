import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
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
    X
} from 'lucide-react';

import { getHousehold } from '../api/households/getHousehold';
import { addMember } from '../api/households/addMember';
import { updateMember } from '../api/households/updateMember';
import { deleteMember } from '../api/households/deleteMember';
import { getEvacuationRecord } from '../api/evacuationRecords/getEvacuationRecord';
import { updateMemberEvacuationStatus } from '../api/evacuationRecords/updateMemberEvacuationStatus';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

const EMPTY_MEMBER = {
    name: '',
    age: '',
    gender: 'male',
    relation: '',
    is_pwd: false,
    is_pregnant: false
};

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
    const [form, setForm] = useState(EMPTY_MEMBER);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [statusUpdatingMemberId, setStatusUpdatingMemberId] = useState(null);

    const canEdit = isAdmin() || isSuperAdmin() || isPersonnel();
    const canDelete = isAdmin() || isSuperAdmin();

    const isEvacuationContext = !!evacuationIdFromUrl;

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
            await Promise.all([
                fetchHousehold(),
                fetchEvacuationContext()
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, [id, evacuationIdFromUrl]);

    const openAdd = () => {
        setEditingMember(null);
        setForm(EMPTY_MEMBER);
        setError(null);
        setMemberModal(true);
    };

    const openEdit = (member) => {
        setEditingMember(member);
        setForm({
            name: member.name || '',
            age: member.age || '',
            gender: member.gender || 'male',
            relation: member.relation || '',
            is_pwd: !!member.is_pwd,
            is_pregnant: !!member.is_pregnant,
        });
        setError(null);
        setMemberModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.age || !form.gender || !form.relation) {
            setError('All fields are required.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (editingMember) {
                await updateMember(id, editingMember.member_id, form);
            } else {
                await addMember(id, form);
            }

            setMemberModal(false);

            await fetchHousehold();

            if (evacuationIdFromUrl) {
                await fetchEvacuationContext();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save member.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (memberId) => {
        if (!confirm('Remove this member?')) return;

        try {
            await deleteMember(id, memberId);

            await fetchHousehold();

            if (evacuationIdFromUrl) {
                await fetchEvacuationContext();
            }
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

            if (evacuationIdFromUrl) {
                await fetchEvacuationContext();
            }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    if (!household) {
        return (
            <div className="p-6 text-red-500">Household not found.</div>
        );
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

    const verifiedMemberIds = new Set(
        evacuatedMembers.map(item => item.member_id)
    );

    const showMemberEvacuationStatus = isEvacuationContext && isEvacuated;

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

                    <span
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                            isEvacuated
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}
                    >
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
                        {
                            icon: Users,
                            label: 'Members',
                            value: `${household.member_count || household.members?.length || 0} people`
                        },
                        {
                            icon: Phone,
                            label: 'Contact',
                            value: household.contact_number || '—'
                        },
                        {
                            icon: MapPin,
                            label: 'Address',
                            value: household.address?.full_address || '—'
                        },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                                    {label}
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                    {value}
                                </p>
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
                                {
                                    icon: Building,
                                    label: 'Center',
                                    value: evacuation.center?.name || '—'
                                },
                                {
                                    icon: DoorOpen,
                                    label: 'Unit',
                                    value: evacuation.unit_allocation?.unit?.name || 'No unit assigned'
                                },
                                {
                                    icon: CheckCircle,
                                    label: 'Event',
                                    value: evacuation.event?.name || '—'
                                },
                                {
                                    icon: Users,
                                    label: 'Verified Members',
                                    value: `${evacuatedMembers.length || evacuation.evacuated_count || 0} verified`
                                },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon size={16} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                                            {label}
                                        </p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {value}
                                        </p>
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

            {/* Members */}
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
                                        'PWD',
                                        'Pregnant',
                                        ...(showMemberEvacuationStatus ? ['Status'] : []),
                                        ''
                                    ].map(h => (
                                        <th
                                            key={h}
                                            className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                                        >
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
                                                {member.name}
                                            </td>

                                            <td className="px-6 py-3 text-sm text-slate-500">
                                                {member.age}
                                            </td>

                                            <td className="px-6 py-3 text-sm text-slate-500 capitalize">
                                                {member.gender}
                                            </td>

                                            <td className="px-6 py-3 text-sm text-slate-500">
                                                {member.relation}
                                            </td>

                                            <td className="px-6 py-3">
                                                <span
                                                    className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                                                        member.is_pwd
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                            : 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}
                                                >
                                                    {member.is_pwd ? 'Yes' : 'No'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3">
                                                <span
                                                    className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                                                        member.is_pregnant
                                                            ? 'bg-pink-50 text-pink-600 border-pink-100'
                                                            : 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}
                                                >
                                                    {member.is_pregnant ? 'Yes' : 'No'}
                                                </span>
                                            </td>

                                            {showMemberEvacuationStatus && (
                                                <td className="px-6 py-3">
                                                    <select
                                                        value={isMemberEvacuated ? 'evacuated' : 'not_verified'}
                                                        disabled={!canEdit || isStatusUpdating}
                                                        onChange={(e) =>
                                                            handleMemberStatusChange(
                                                                member.member_id,
                                                                e.target.value
                                                            )
                                                        }
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
            {memberModal && createPortal(
                <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
                        onClick={() => setMemberModal(false)}
                    />

                    <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-800 tracking-tight">
                                {editingMember ? 'Edit Member' : 'Add Member'}
                            </h2>

                            <button
                                onClick={() => setMemberModal(false)}
                                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            {[
                                { key: 'name', label: 'Full Name', type: 'text' },
                                { key: 'age', label: 'Age', type: 'number' },
                                { key: 'relation', label: 'Relation to Head', type: 'text' },
                            ].map(field => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                        {field.label}
                                    </label>

                                    <input
                                        type={field.type}
                                        min={field.key === 'age' ? 0 : undefined}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={form[field.key]}
                                        onChange={e =>
                                            setForm({
                                                ...form,
                                                [field.key]: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            ))}

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Gender
                                </label>

                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                    value={form.gender}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            gender: e.target.value
                                        })
                                    }
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_pwd}
                                        onChange={e =>
                                            setForm({
                                                ...form,
                                                is_pwd: e.target.checked
                                            })
                                        }
                                        className="accent-blue-600 w-4 h-4"
                                    />
                                    <span className="text-xs font-bold text-slate-600">
                                        PWD
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_pregnant}
                                        onChange={e =>
                                            setForm({
                                                ...form,
                                                is_pregnant: e.target.checked
                                            })
                                        }
                                        className="accent-pink-500 w-4 h-4"
                                    />
                                    <span className="text-xs font-bold text-slate-600">
                                        Pregnant
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setMemberModal(false)}
                                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingMember
                                        ? 'Save Changes'
                                        : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}