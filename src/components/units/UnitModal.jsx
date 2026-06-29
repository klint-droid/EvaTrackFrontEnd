import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
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
        getAccommodationTypes().then(res => setTypes(res.data || []));
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
        
        // Check if unit capacity alone exceeds center capacity
        if (newCapacity > centerCapacity) {
            setError(`Unit capacity (${newCapacity}) cannot exceed center capacity (${centerCapacity}).`);
            return;
        }

        // Check if total would exceed center capacity
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
            if (unit) {
                await updateUnit(centerId, unit.unit_id, form);
            } else {
                await createUnit(centerId, form);
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
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 my-auto">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200/60 relative">
                    <h2 className="text-xl font-bold text-slate-900">
                        {unit ? 'Edit Accommodation Unit' : 'Add Accommodation Unit'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Configure the unit details and its capacity limit.
                    </p>
                    <button 
                        onClick={onClose} 
                        className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Unit Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                                placeholder="e.g. Room A, Tent 1"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Unit Type</label>
                            <select
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
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
                                <label className="text-xs font-semibold text-slate-600">Max Capacity</label>
                                <span className="text-[10px] font-medium text-slate-400">
                                    Center Capacity: {centerCapacity}
                                </span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max={centerCapacity}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                                placeholder="e.g. 20"
                                value={form.max_capacity}
                                onChange={e => setForm({ ...form, max_capacity: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? 'Saving...' : unit ? 'Save Changes' : 'Create Unit'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}