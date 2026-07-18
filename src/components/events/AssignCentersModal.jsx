import { useState, useEffect, useCallback } from 'react';
import { getCenters } from '../../api/evacuation/getCenters';
import { assignCenters } from '../../api/events/assignCenters';
import { unassignCenter } from '../../api/events/unassignCenter';
import AlertConfirmModal from '../AlertConfirmModal';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AssignCentersModal({ event, onClose, onSaved }) {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        type: 'assign', // 'assign' | 'unassign'
        center: null,
        isLoading: false
    });

    const fetchCenters = useCallback(async () => {
        try {
            const res = await getCenters();
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            setCenters(list);
        } catch {
            setError('Failed to load centers.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    const openConfirm = (type, center) => {
        setConfirmState({
            isOpen: true,
            type,
            center,
            isLoading: false
        });
    };

    const handleConfirmAction = async () => {
        setConfirmState(prev => ({ ...prev, isLoading: true }));
        setError(null);
        
        try {
            if (confirmState.type === 'assign') {
                await assignCenters(event.event_id, [confirmState.center.evacuation_center_id]);
            } else {
                await unassignCenter(confirmState.center.evacuation_center_id);
            }
            onSaved();
            await fetchCenters();
            setConfirmState(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${confirmState.type} center.`);
            setConfirmState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1">Assign Centers</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-5">
                    Event: <span className="text-slate-700 dark:text-slate-200">{event.name}</span>
                </p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{error}</div>}

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <span className="text-slate-400 text-xs font-bold animate-pulse">Loading centers...</span>
                    </div>
                ) : centers.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <span className="text-slate-400 text-xs font-bold">No centers available.</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-0">
                        {centers.map(center => {
                            const isAssignedToThis = center.current_event_id === event.event_id;
                            const isAssignedElsewhere = center.current_event_id && !isAssignedToThis;

                            return (
                                <div
                                    key={center.evacuation_center_id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        isAssignedToThis ? 'bg-indigo-50/50 border-indigo-100' : 
                                        isAssignedElsewhere ? 'bg-slate-50 dark:bg-slate-800/50 opacity-60 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 hover:shadow-sm dark:shadow-none'
                                    }`}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{center.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isAssignedToThis ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                                    <ShieldCheck size={12} /> Assigned to this event
                                                </span>
                                            ) : isAssignedElsewhere ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-wider">
                                                    <ShieldAlert size={12} /> Assigned to another event
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                                    <ShieldCheck size={12} /> Available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {isAssignedToThis ? (
                                            <button
                                                onClick={() => openConfirm('unassign', center)}
                                                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm dark:shadow-none"
                                            >
                                                Unassign
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => openConfirm('assign', center)}
                                                disabled={isAssignedElsewhere}
                                                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md dark:shadow-none shadow-indigo-500/20 transition-colors disabled:opacity-50 disabled:shadow-none"
                                            >
                                                Assign
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-end pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            <AlertConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.type === 'assign' ? 'Assign Center' : 'Unassign Center'}
                message={
                    confirmState.type === 'assign'
                        ? `Are you sure you want to assign ${confirmState.center?.name} to ${event.name}?`
                        : `Are you sure you want to unassign ${confirmState.center?.name} from ${event.name}?`
                }
                confirmText={confirmState.type === 'assign' ? 'Yes, Assign' : 'Yes, Unassign'}
                cancelText="Cancel"
                type={confirmState.type === 'assign' ? 'success' : 'danger'}
                isLoading={confirmState.isLoading}
                onConfirm={handleConfirmAction}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}