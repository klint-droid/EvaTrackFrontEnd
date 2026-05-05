import { useEffect, useState } from 'react';
import { createEvent } from '../../api/events/createEvent';
import { getDisasterTypes } from '../../api/events/getDisasterTypes';
import { getSeverityLevels } from '../../api/events/getSeverityLevels';

export default function EventModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', type_id: '', severity_id: '' });
    const [disasterTypes, setDisasterTypes] = useState([]);
    const [severityLevels, setSeverityLevels] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const [typeRes, severityRes] = await Promise.all([getDisasterTypes(), getSeverityLevels()]);
                setSeverityLevels(severityRes.data);
                setDisasterTypes(typeRes.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to load option.');
            } finally {
                setTypesLoading(false);
            }
        };
        fetchTypes();
    }, []);
    const handleSubmit = async () => {
        if (!form.name || !form.type_id || !form.severity_id) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createEvent(form);
            onCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Create Evacuation Event</h2>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Event Name</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            placeholder="e.g. Typhoon Carina Relief Operation"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            value={form.type_id}
                            onChange={e => setForm({ ...form, type_id: Number(e.target.value) })}
                            disabled={typesLoading}
                        >
                            <option value="">{typesLoading ? 'Loading...' : 'Select type'}</option>
                            {disasterTypes.map(type => (
                                <option key={type.type_id} value={type.type_id}>
                                    {type.type_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Severity Level</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                        value={form.severity_id}
                        onChange={e => setForm({ ...form, severity_id: Number(e.target.value) })}
                        disabled={typesLoading}
                        >
                        <option value="">{typesLoading ? 'Loading...' : 'Select severity level'}</option>
                        {severityLevels.map(severity => (
                            <option key={severity.severity_id} value={severity.severity_id}>
                            {severity.severity_label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || typesLoading}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}