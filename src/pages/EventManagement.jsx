import { useEffect, useState } from 'react';
import { getEvents } from '../api/events/getEvents';
import EventModal from '../components/events/EventModal';
import EndEventButton from '../components/events/EndEventButton';
import AssignCentersModal from '../components/events/AssignCentersModal';
import SeverityBadge from '../components/events/SeverityBadge';
import { 
  Activity, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  History, 
  Clock, 
  CheckCircle2, 
  Plus, 
  AlertCircle 
} from 'lucide-react';

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

    useEffect(() => { 
        fetchEvents(); 
    }, []);

    // Filter active and historical events
    const activeEvents = events.filter(e => !e.ended_at);
    const historicalEvents = events.filter(e => e.ended_at);

    // Calculate metrics
    const activeCount = activeEvents.length;
    const totalAssignedCenters = activeEvents.reduce((acc, curr) => {
        return acc + (curr.evacuation_centers?.length || 0);
    }, 0);
    const historyCount = historicalEvents.length;

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            
            {/* 1. Official Barangay Header Panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 mb-8">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Activity className="text-blue-800 w-7 h-7" /> Disaster Events
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Create and manage disaster events.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm rounded-lg shadow transition-all duration-150"
                >
                    <Plus className="w-4 h-4" /> Declare Disaster Event
                </button>
            </div>

            {/* 2. Operations Metrics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Active Incidents Block */}
                <div className="bg-white border-l-4 border-red-600 p-5 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Emergencies</span>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{activeCount}</h3>
                        <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                            {activeCount > 0 ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> 
                                    Response operations ongoing
                                </>
                            ) : 'Local status secured'}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                </div>

                {/* Earmarked Shelters Block */}
                <div className="bg-white border-l-4 border-blue-600 p-5 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shelters Assigned</span>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalAssignedCenters}</h3>
                        <p className="text-xs text-slate-500 mt-1">Centers actively hosting evacuees</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
                        <MapPin className="w-6 h-6" />
                    </div>
                </div>

                {/* Historical Log Block */}
                <div className="bg-white border-l-4 border-emerald-600 p-5 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Closed Incidents</span>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{historyCount}</h3>
                        <p className="text-xs text-slate-500 mt-1">Archived historical operations</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <History className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm mt-3 font-medium">Synchronizing operational logs...</p>
                </div>
            ) : (
                <>
                    {/* 3. Active Incident Hero Panel */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> Active Events
                        </h2>
                        
                        {activeEvents.length === 0 ? (
                            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-center">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-slate-800 font-bold text-base">All Clear</h3>
                                <p className="text-slate-500 text-sm mt-1">There are no active disaster operations recorded in this barangay.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {activeEvents.map(event => (
                                    <div key={event.event_id} className="bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden">
                                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-600 text-white rounded-lg">
                                                    <ShieldAlert className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-slate-900 text-base">{event.name}</h3>
                                                    <span className="font-mono text-xs text-red-600">{event.event_id}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <SeverityBadge severity={event.severity} />
                                                <span className="px-3 py-1 bg-red-600 text-white font-bold rounded-full text-xs animate-pulse">
                                                    ACTIVE CRISIS
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="flex items-start gap-2.5">
                                                    <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs text-slate-400 font-semibold block uppercase">Disaster Type</span>
                                                        <span className="text-sm font-bold text-slate-800">{event.primary_type?.type_name || 'Not Specified'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2.5">
                                                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs text-slate-400 font-semibold block uppercase">Declared At</span>
                                                        <span className="text-sm font-semibold text-slate-800">{new Date(event.started_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2.5">
                                                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <span className="text-xs text-slate-400 font-semibold block uppercase">Assigned Centers</span>
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {event.evacuation_centers?.length || 0} shelters allocated
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub-panel displaying allocated evacuation center names */}
                                            {event.evacuation_centers && event.evacuation_centers.length > 0 && (
                                                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Earmarked Shelters</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {event.evacuation_centers.map(center => (
                                                            <span key={center.evacuation_center_id} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                                {center.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => setAssigningEvent(event)}
                                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-blue-800 hover:bg-blue-900 text-white shadow-sm transition-all duration-150"
                                                >
                                                    <MapPin className="w-4 h-4" /> Assign Shelters
                                                </button>
                                                <EndEventButton
                                                    eventId={event.event_id}
                                                    onEnded={fetchEvents}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Historical Operations Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <History className="text-slate-500 w-5 h-5" /> Operational Incident Logs
                            </h2>
                            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold rounded-full text-xs">
                                {historicalEvents.length} Total
                            </span>
                        </div>

                        {historicalEvents.length === 0 ? (
                            <p className="p-6 text-slate-500 text-sm text-center">No historical operation logs recorded.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-left">
                                            <th className="px-6 py-3.5">Incident ID</th>
                                            <th className="px-6 py-3.5">Name</th>
                                            <th className="px-6 py-3.5">Disaster Type</th>
                                            <th className="px-6 py-3.5">Severity</th>
                                            <th className="px-6 py-3.5">Declared At</th>
                                            <th className="px-6 py-3.5">Operational Duration</th>
                                            <th className="px-6 py-3.5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historicalEvents.map(event => {
                                            const start = new Date(event.started_at);
                                            const end = event.ended_at ? new Date(event.ended_at) : null;
                                            
                                            // Calculate human readable operational length
                                            let durationStr = "—";
                                            if (end) {
                                                const diffMs = end.getTime() - start.getTime();
                                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                durationStr = diffDays > 0 
                                                    ? `${diffDays}d ${diffHours}h` 
                                                    : `${diffHours}h`;
                                            }

                                            return (
                                                <tr key={event.event_id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{event.event_id}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-800">{event.name}</td>
                                                    <td className="px-6 py-4 text-slate-600">{event.primary_type?.type_name || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <SeverityBadge severity={event.severity} />
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{start.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-500">{durationStr}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-full text-xs">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                                                            Archived
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* 5. Trigger Panels & Dialogs */}
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