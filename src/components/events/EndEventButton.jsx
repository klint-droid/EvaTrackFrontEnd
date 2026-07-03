import { useState } from 'react';
import { endEvent } from '../../api/events/endEvent';
import { useAlert } from '../../context/AlertContext';

export default function EndEventButton({ eventId, onEnded }) {
    const [loading, setLoading] = useState(false);
    const { showAlert, showConfirm } = useAlert();

    const handleEnd = async () => {
        showConfirm(
            'Are you sure you want to end this event?',
            async () => {
                setLoading(true);
                try {
                    await endEvent(eventId);
                    onEnded();
                } catch (err) {
                    showAlert(err.response?.data?.message || 'Failed to end event.', 'Error', 'danger');
                } finally {
                    setLoading(false);
                }
            },
            'End Event',
            'danger',
            'End'
        );
    };

    return (
        <button
            onClick={handleEnd}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50"
        >
            {loading ? 'Ending...' : 'End Event'}
        </button>
    );
}