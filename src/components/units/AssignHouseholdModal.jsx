import { useState, useEffect } from 'react';
import { getUnassignedHouseholds } from '../../api/allocations/getUnassignedHouseholds';
import { assignHousehold } from '../../api/allocations/assignHousehold';

export default function AssignHouseholdModal({ centerId, unit, onClose, onAssigned }) {
    const [households, setHouseholds] = useState([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const available = unit.max_capacity - unit.current_occupancy;

    useEffect(() => {
        getUnassignedHouseholds(centerId)
            .then(res => setHouseholds(res.data || []))
            .catch(() => setError('Failed to load households.'))
            .finally(() => setLoading(false));
    }, [centerId]);

    const handleAssign = async () => {
        if (!selected) {
            setError('Please select a household.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await assignHousehold(unit.unit_id, selected);
            onAssigned();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign household.');
        } finally {
            setSaving(false);
        }
    };

    // separate into fits and doesnt fit
    const fits = households.filter(r => r.evacuated_count <= available);
    const doesNotFit = households.filter(r => r.evacuated_count > available);
    const sorted = [...fits, ...doesNotFit]; // fits first, disabled ones at bottom

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-1">Assign Household</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Unit: <span className="font-medium text-gray-700">{unit.name}</span>
                    {' · '}
                    <span className={`font-medium ${available <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                        {available} slots available
                    </span>
                </p>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                {available <= 0 ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-3">
                        This unit is full. No slots available.
                    </div>
                ) : null}

                {loading ? (
                    <p className="text-gray-500 text-sm">Loading households...</p>
                ) : households.length === 0 ? (
                    <p className="text-gray-500 text-sm">No unassigned households in this center.</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {sorted.map(record => {
                            const exceedsCapacity = record.evacuated_count > available;
                            const isSelected = selected === record.evacuation_id;

                            return (
                                <label
                                    key={record.evacuation_id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                                        ${exceedsCapacity
                                            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                                            : isSelected
                                                ? 'border-blue-500 bg-blue-50 cursor-pointer'
                                                : 'hover:bg-gray-50 cursor-pointer'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="household"
                                        value={record.evacuation_id}
                                        checked={isSelected}
                                        disabled={exceedsCapacity}
                                        onChange={() => !exceedsCapacity && setSelected(record.evacuation_id)}
                                        className="accent-blue-600"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700">
                                            {record.household?.household_name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {record.evacuated_count} people · {record.evacuation_id}
                                        </p>
                                    </div>
                                    {exceedsCapacity && (
                                        <span className="text-xs text-red-400 font-medium whitespace-nowrap">
                                            Needs {record.evacuated_count} slots
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                )}

                {/* legend */}
                {doesNotFit.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                        * Grayed out households exceed this unit's available slots.
                    </p>
                )}

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={saving || loading || !selected || available <= 0}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Assigning...' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );
}