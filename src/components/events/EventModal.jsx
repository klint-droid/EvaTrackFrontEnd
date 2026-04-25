import { useState } from 'react';
import { createEvent } from '../../api/events/createEvent';

const EVENT_TYPES = ['Typhoon', 'Flood', 'Earthquake', 'Fire', 'Other'];

export default function EventModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!form.name || !form.type) {
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
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="">Select type</option>
                            {EVENT_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
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
                        disabled={loading}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}