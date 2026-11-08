import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Check, Loader2, Users } from 'lucide-react';
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

    const fits = households.filter(r => r.evacuated_count <= available);
    const doesNotFit = households.filter(r => r.evacuated_count > available);
    const sorted = [...fits, ...doesNotFit];

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-[#1e2a3d] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-left font-sans">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e2a3d]">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white">
                            Assign Household to {unit.name}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>Select an unassigned household</span>
                            <span>•</span>
                            <span className={`font-bold ${available <= 0 ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'}`}>
                                {available} slots available
                            </span>
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
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg flex items-start gap-2.5">
                            <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={15} />
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</p>
                        </div>
                    )}

                    {available <= 0 ? (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-lg flex flex-col items-center justify-center text-center">
                            <AlertCircle className="text-rose-400 mb-2" size={22} />
                            <p className="text-xs font-bold text-rose-700 dark:text-rose-300">This unit is full.</p>
                            <p className="text-[11px] text-rose-500 mt-0.5">There are no available slots for new households.</p>
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="py-8 flex justify-center items-center">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <Loader2 size={15} className="animate-spin text-blue-500" />
                                <span>Loading unassigned households...</span>
                            </div>
                        </div>
                    ) : households.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-slate-200 dark:border-[#263047] bg-slate-50/50 dark:bg-[#1e2a3d]/50 rounded-xl">
                            <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={24} />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No unassigned households</p>
                            <p className="text-[11px] text-slate-400 mt-1">All households in this center have been assigned.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sorted.map(record => {
                                const exceedsCapacity = record.evacuated_count > available;
                                const isSelected = selected === record.evacuation_id;

                                return (
                                    <label
                                        key={record.evacuation_id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                            exceedsCapacity
                                                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-[#141b29] border-slate-200 dark:border-[#1e2a3d]'
                                                : isSelected
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-[0_0_0_1px_rgba(59,130,246,1)] cursor-pointer'
                                                : 'hover:border-slate-300 dark:hover:border-slate-600 border-slate-200 dark:border-[#263047] cursor-pointer bg-slate-50/50 dark:bg-[#1e2a3d]'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="household"
                                            value={record.evacuation_id}
                                            checked={isSelected}
                                            disabled={exceedsCapacity}
                                            onChange={() => !exceedsCapacity && setSelected(record.evacuation_id)}
                                            className="w-4 h-4 text-blue-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-extrabold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {record.household?.household_name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {record.evacuated_count} people · ID: {record.evacuation_id}
                                            </p>
                                        </div>
                                        {exceedsCapacity && (
                                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60 whitespace-nowrap">
                                                Needs {record.evacuated_count} slots
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {doesNotFit.length > 0 && available > 0 && (
                        <p className="text-[11px] font-medium text-slate-400 text-center pt-1">
                            * Grayed out households require more slots than available.
                        </p>
                    )}
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
                        onClick={handleAssign}
                        disabled={saving || loading || !selected || available <= 0}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        <span>{saving ? 'Assigning...' : 'Assign Household'}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
