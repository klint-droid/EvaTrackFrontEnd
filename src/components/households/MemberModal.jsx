import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { getLookups } from '../../api/lookups/getLookups';

const EMPTY_FORM = {
    first_name: '',
    middle_name: '',
    last_name: '',
    birth_date: '',
    gender_id: '',
    relationship_id: '',
    civil_status_id: '',
    vulnerable_group_ids: [],
};

export default function MemberModal({ open, onClose, onSave, editingMember }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [lookups, setLookups] = useState(null);
    const [loadingLookups, setLoadingLookups] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch lookups once on mount
    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const data = await getLookups();
                setLookups(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingLookups(false);
            }
        };

        fetchLookups();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (editingMember) {
            setForm({
                first_name:          editingMember.first_name || '',
                middle_name:         editingMember.middle_name || '',
                last_name:           editingMember.last_name || '',
                birth_date:          editingMember.birth_date || '',
                gender_id:           editingMember.gender_id || '',
                relationship_id:     editingMember.relationship_id || '',
                civil_status_id:     editingMember.civil_status_id || '',
                vulnerable_group_ids: editingMember.vulnerable_groups?.map(v => v.id) || [],
            });
        } else {
            setForm(EMPTY_FORM);
        }

        setError(null);
    }, [editingMember, open]);

    const handleVulnerableToggle = (id) => {
        setForm(prev => ({
            ...prev,
            vulnerable_group_ids: prev.vulnerable_group_ids.includes(id)
                ? prev.vulnerable_group_ids.filter(v => v !== id)
                : [...prev.vulnerable_group_ids, id],
        }));
    };

    const handleSubmit = async () => {
        if (!form.first_name || !form.last_name || !form.birth_date) {
            setError('First name, last name, and birth date are required.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save member.');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-800 tracking-tight">
                        {editingMember ? 'Edit Member' : 'Add Member'}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <p className="text-red-500 text-xs font-medium">{error}</p>
                    )}

                    {loadingLookups ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="animate-spin text-slate-300" size={24} />
                        </div>
                    ) : (
                        <>
                            {/* Name Fields */}
                            {[
                                { key: 'first_name',  label: 'First Name' },
                                { key: 'middle_name', label: 'Middle Name' },
                                { key: 'last_name',   label: 'Last Name' },
                            ].map(field => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={form[field.key]}
                                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                    />
                                </div>
                            ))}

                            {/* Birth Date */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    value={form.birth_date}
                                    onChange={e => setForm({ ...form, birth_date: e.target.value })}
                                />
                            </div>

                            {/* Gender Dropdown */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Gender
                                </label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                    value={form.gender_id}
                                    onChange={e => setForm({ ...form, gender_id: Number(e.target.value) })}
                                >
                                    <option value="">Select gender</option>
                                    {lookups?.genders?.map(g => (
                                        <option key={g.id} value={g.id}>{g.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Relationship Dropdown */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Relation to Head
                                </label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                    value={form.relationship_id}
                                    onChange={e => setForm({ ...form, relationship_id: Number(e.target.value) })}
                                >
                                    <option value="">Select relationship</option>
                                    {lookups?.relationships?.map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Civil Status Dropdown */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Civil Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                    value={form.civil_status_id}
                                    onChange={e => setForm({ ...form, civil_status_id: Number(e.target.value) })}
                                >
                                    <option value="">Select civil status</option>
                                    {lookups?.civil_statuses?.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Vulnerable Groups Checkboxes */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    Vulnerable Groups
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {lookups?.vulnerable_groups?.map(v => {
                                        const checked = form.vulnerable_group_ids.includes(v.id);
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => handleVulnerableToggle(v.id)}
                                                className={`px-3 py-1.5 text-[10px] font-black rounded-full border transition-all ${
                                                    checked
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'
                                                }`}
                                            >
                                                {v.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={saving || loadingLookups}
                        className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}