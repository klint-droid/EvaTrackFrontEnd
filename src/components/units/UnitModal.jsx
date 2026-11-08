import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Home, Users, Check, Loader2 } from 'lucide-react';
import { getAccommodationTypes } from '../../api/units/getAccommodationTypes';
import { createUnit } from '../../api/units/createUnit';
import { updateUnit } from '../../api/units/updateUnit';

export default function UnitModal({ centerId, unit, onClose, onSaved, units, centerCapacity }) {
    const [types, setTypes] = useState([]);
    const [form, setForm] = useState({
        name: unit?.name || '',
        type_id: unit?.type_id || '',
        max_capacity: unit?.max_capacity || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAccommodationTypes()
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.data || []);
                setTypes(list);
            })
            .catch(err => {
                console.error('Failed to load accommodation types:', err);
            });
    }, []);

    const getTotalWithoutCurrent = () => {
        return (units || [])
            .filter(u => u.unit_id !== unit?.unit_id)
            .reduce((sum, u) => sum + (Number(u.max_capacity) || 0), 0);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.type_id || !form.max_capacity) {
            setError('All fields are required.');
            return;
        }

        const newCapacity = Number(form.max_capacity);

        if (newCapacity > centerCapacity) {
            setError(`Unit capacity (${newCapacity}) cannot exceed center capacity (${centerCapacity}).`);
            return;
        }

        const existingTotal = getTotalWithoutCurrent();
        const newTotal = existingTotal + newCapacity;

        if (newTotal > centerCapacity) {
            setError(
                `Total unit capacity would be ${newTotal}, exceeding center capacity of ${centerCapacity}. ` +
                `Available remaining: ${centerCapacity - existingTotal}.`
            );
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = {
                name: form.name.trim(),
                type_id: Number(form.type_id),
                max_capacity: newCapacity,
            };
            if (unit) {
                await updateUnit(centerId, unit.unit_id, payload);
            } else {
                await createUnit(centerId, payload);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save unit.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-[#1e2a3d] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-left font-sans">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e2a3d]">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white">
                            {unit ? 'Edit Accommodation Unit' : 'Add Accommodation Unit'}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Configure the room or unit details and capacity limit
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg flex items-start gap-2.5">
                            <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={15} />
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                            <Home size={11} /> Unit Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="e.g. Room A, Tent 1"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                Unit Type
                            </label>
                            <select
                                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                                value={form.type_id}
                                onChange={e => setForm({ ...form, type_id: e.target.value })}
                            >
                                <option value="">Select type...</option>
                                {types.map(t => (
                                    <option key={t.type_id} value={t.type_id}>{t.type_label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                                    <Users size={11} /> Max Capacity
                                </label>
                                <span className="text-[10px] font-semibold text-slate-400">
                                    Max: {centerCapacity}
                                </span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max={centerCapacity}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. 20"
                                value={form.max_capacity}
                                onChange={e => setForm({ ...form, max_capacity: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1e2a3d] hover:bg-slate-200 dark:hover:bg-[#263047] rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        <span>{unit ? 'Save Changes' : 'Create Unit'}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
