import { useState } from 'react';
import { endEvent } from '../../api/events/endEvent';

export default function EndEventButton({ eventId, onEnded }) {
    const [loading, setLoading] = useState(false);

    const handleEnd = async () => {
        if (!confirm('Are you sure you want to end this event?')) return;

        setLoading(true);
        try {
            await endEvent(eventId);
            onEnded();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to end event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleEnd}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        >
            {loading ? 'Ending...' : 'End Event'}
        </button>
    );
}