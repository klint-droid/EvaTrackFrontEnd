import { useState, useEffect } from 'react';
import { getCenters } from '../../api/evacuation/getCenters';
import { assignCenters } from '../../api/events/assignCenters';

export default function AssignCentersModal({ event, onClose, onSaved }) {
    const [centers, setCenters] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const res = await getCenters();
                setCenters(res.data);

                // pre-check centers already assigned to this event
                const alreadyAssigned = res.data
                    .filter(c => c.current_event_id === event.event_id)
                    .map(c => c.evacuation_center_id);
                setSelected(alreadyAssigned);
            } catch (err) {
                setError('Failed to load centers.');
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, [event.event_id]);

    const toggle = (centerId) => {
        setSelected(prev =>
            prev.includes(centerId)
                ? prev.filter(id => id !== centerId)
                : [...prev, centerId]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await assignCenters(event.event_id, selected);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign centers.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-1">Assign Centers</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Event: <span className="font-medium text-gray-700">{event.name}</span>
                </p>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                {loading ? (
                    <p className="text-gray-500 text-sm">Loading centers...</p>
                ) : centers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No centers available.</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {centers.map(center => {
                            const isAssignedElsewhere =
                                center.current_event_id &&
                                center.current_event_id !== event.event_id;

                            return (
                                <label
                                    key={center.evacuation_center_id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                                        isAssignedElsewhere ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(center.evacuation_center_id)}
                                        onChange={() => !isAssignedElsewhere && toggle(center.evacuation_center_id)}
                                        disabled={isAssignedElsewhere}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{center.name}</p>
                                        {isAssignedElsewhere && (
                                            <p className="text-xs text-orange-500">
                                                Already assigned to another event
                                            </p>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}