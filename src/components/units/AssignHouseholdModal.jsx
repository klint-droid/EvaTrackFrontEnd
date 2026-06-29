import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
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

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 my-auto">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200/60 relative">
                    <h2 className="text-xl font-bold text-slate-900">Assign Household</h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{unit.name}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`font-semibold ${available <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                            {available} slots available
                        </span>
                    </p>
                    <button 
                        onClick={onClose} 
                        className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {available <= 0 ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-center">
                            <AlertCircle className="text-red-400 mb-2" size={24} />
                            <p className="text-sm font-medium text-red-700">This unit is full.</p>
                            <p className="text-xs text-red-500 mt-1">There are no available slots for new households.</p>
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="py-8 flex justify-center items-center">
                            <div className="animate-pulse flex flex-col items-center gap-3">
                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                <div className="h-3 w-48 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    ) : households.length === 0 ? (
                        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            <p className="text-sm font-medium text-slate-500">No unassigned households</p>
                            <p className="text-xs text-slate-400 mt-1">All households in this center have been assigned.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sorted.map(record => {
                                const exceedsCapacity = record.evacuated_count > available;
                                const isSelected = selected === record.evacuation_id;

                                return (
                                    <label
                                        key={record.evacuation_id}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all
                                            ${exceedsCapacity
                                                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                                                : isSelected
                                                    ? 'border-blue-500 bg-blue-50/50 shadow-[0_0_0_1px_rgba(59,130,246,1)] cursor-pointer'
                                                    : 'hover:border-slate-300 border-slate-200 cursor-pointer bg-white'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="household"
                                            value={record.evacuation_id}
                                            checked={isSelected}
                                            disabled={exceedsCapacity}
                                            onChange={() => !exceedsCapacity && setSelected(record.evacuation_id)}
                                            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                                                {record.household?.household_name}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-600/80' : 'text-slate-500'}`}>
                                                {record.evacuated_count} people · ID: {record.evacuation_id}
                                            </p>
                                        </div>
                                        {exceedsCapacity && (
                                            <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-md whitespace-nowrap">
                                                Needs {record.evacuated_count} slots
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* legend */}
                    {doesNotFit.length > 0 && available > 0 && (
                        <p className="text-[11px] font-medium text-slate-400 text-center pt-2">
                            * Grayed out households require more slots than available.
                        </p>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={saving || loading || !selected || available <= 0}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                        {saving ? 'Assigning...' : 'Assign Household'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}