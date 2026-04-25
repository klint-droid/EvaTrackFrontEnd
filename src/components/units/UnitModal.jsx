import { useState, useEffect } from 'react';
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">
                    {unit ? 'Edit Unit' : 'Add Accommodation Unit'}
                </h2>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Unit Name</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            placeholder="e.g. Room A, Tent 1"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            value={form.type_id}
                            onChange={e => setForm({ ...form, type_id: e.target.value })}
                        >
                            <option value="">Select type</option>
                            {types.map(t => (
                                <option key={t.type_id} value={t.type_id}>{t.type_label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Max Capacity
                            <span className="text-xs text-slate-400 ml-1">
                                (Center capacity: {centerCapacity})
                            </span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={centerCapacity}
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            placeholder="e.g. 20"
                            value={form.max_capacity}
                            onChange={e => setForm({ ...form, max_capacity: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : unit ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}