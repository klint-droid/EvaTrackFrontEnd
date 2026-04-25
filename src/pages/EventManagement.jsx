import { useEffect, useState } from 'react';
import { getEvents } from '../api/events/getEvents';
import EventModal from '../components/events/EventModal';
import EndEventButton from '../components/events/EndEventButton';
import AssignCentersModal from '../components/events/AssignCentersModal';

export default function EventManagement() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [assigningEvent, setAssigningEvent] = useState(null); // event being assigned

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await getEvents();
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Evacuation Events</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    + Create Event
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading events...</p>
            ) : events.length === 0 ? (
                <p className="text-gray-500">No events found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-3">Event ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Started At</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.event_id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">{event.event_id}</td>
                                    <td className="px-4 py-3">{event.name}</td>
                                    <td className="px-4 py-3">{event.type}</td>
                                    <td className="px-4 py-3">
                                        {new Date(event.started_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {event.ended_at ? (
                                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                                Ended
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {!event.ended_at && (
                                                <>
                                                    <button
                                                        onClick={() => setAssigningEvent(event)}
                                                        className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                                    >
                                                        Assign Centers
                                                    </button>
                                                    <EndEventButton
                                                        eventId={event.event_id}
                                                        onEnded={fetchEvents}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <EventModal
                    onClose={() => setShowModal(false)}
                    onCreated={fetchEvents}
                />
            )}

            {assigningEvent && (
                <AssignCentersModal
                    event={assigningEvent}
                    onClose={() => setAssigningEvent(null)}
                    onSaved={fetchEvents}
                />
            )}
        </div>
    );
}