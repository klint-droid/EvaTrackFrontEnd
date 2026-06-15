import { useEffect, useState } from 'react';
import { getEvents } from '../api/events/getEvents';
import EventModal from '../components/events/EventModal';
import EndEventButton from '../components/events/EndEventButton';
import AssignCentersModal from '../components/events/AssignCentersModal';
import SeverityBadge from '../components/events/SeverityBadge';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Plus, 
  AlertTriangle,
  Building2,
  Archive,
  Download,
  ChevronRight,
  Flame,
  Timer
} from 'lucide-react';

export default function EventManagement() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [assigningEvent, setAssigningEvent] = useState(null);

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

    const activeEvents = events.filter(e => !e.ended_at);
    const historicalEvents = events.filter(e => e.ended_at);

    const activeCount = activeEvents.length;
    const totalAssignedCenters = activeEvents.reduce((acc, curr) => {
        return acc + (curr.evacuation_centers?.length || 0);
    }, 0);
    const historyCount = historicalEvents.length;

    // Count unique regions from active events
    const uniqueRegions = new Set();
    activeEvents.forEach(e => {
        (e.evacuation_centers || []).forEach(c => {
            if (c.region) uniqueRegions.add(c.region);
        });
    });

    return (
        <div className="min-h-screen font-sans text-left">
            
            {/* ─── Page Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Disaster Events
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Manage disaster events and evacuation operations
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200"
                >
                    <ShieldAlert className="w-4 h-4" />
                    Declare Disaster Event
                </button>
            </div>

            {/* ─── Stats Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Active Emergencies */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between group hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">Active Emergencies</span>
                            {activeCount > 0 && (
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                                </span>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{activeCount}</p>
                        <p className="text-xs text-slate-400 font-medium">
                            {activeCount > 0 ? 'Response operations ongoing' : 'No active emergencies'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
                        <Flame className="w-5 h-5" />
                    </div>
                </div>

                {/* Shelters Assigned */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between group hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                        <span className="text-sm text-slate-500 font-medium">Shelters Assigned</span>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalAssignedCenters}</p>
                        <p className="text-xs text-slate-400 font-medium">
                            {uniqueRegions.size > 0 ? `Across ${uniqueRegions.size} region${uniqueRegions.size > 1 ? 's' : ''}` : 'Centers actively hosting evacuees'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                </div>

                {/* Closed Incidents */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between group hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                        <span className="text-sm text-slate-500 font-medium">Closed Incidents</span>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{historyCount}</p>
                        <p className="text-xs text-slate-400 font-medium">
                            Archived operations
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/80">
                    <div className="w-7 h-7 border-[2.5px] border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm mt-3 font-medium">Loading events...</p>
                </div>
            ) : (
                <>
                    {/* ─── Active Operations ─── */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h2 className="text-base font-semibold text-slate-800">Active Operations</h2>
                        </div>
                        
                        {activeEvents.length === 0 ? (
                            <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-700">All Clear</h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                                    No active disaster operations in this area.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeEvents.map(event => {
                                    const centersCount = event.evacuation_centers?.length || 0;
                                    const startDate = new Date(event.started_at);
                                    const now = new Date();
                                    const diffMs = now.getTime() - startDate.getTime();
                                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    const elapsed = diffDays > 0 ? `${diffDays}d ${diffHours}h` : `${diffHours}h`;

                                    return (
                                        <div key={event.event_id} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                                            {/* Card Header */}
                                            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold text-slate-900">{event.name}</h3>
                                                            <span className="text-xs font-mono text-slate-400">{event.event_id}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {event.primary_type?.type_name || 'Disaster Event'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <SeverityBadge severity={event.severity} />
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 font-semibold rounded-md text-xs border border-rose-100">
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                                                        </span>
                                                        ACTIVE CRISIS
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="px-6 py-5">
                                                {/* Quick Info Row */}
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs">
                                                            Started {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                                                            {' '}at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Timer className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs">Duration: {elapsed}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs">{centersCount} shelter{centersCount !== 1 ? 's' : ''} assigned</span>
                                                    </div>
                                                </div>

                                                {/* Assigned Shelters */}
                                                {event.evacuation_centers && event.evacuation_centers.length > 0 && (
                                                    <div className="mb-5">
                                                        <p className="text-xs font-medium text-slate-400 mb-2">Assigned Shelters</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {event.evacuation_centers.map(center => (
                                                                <span 
                                                                    key={center.evacuation_center_id} 
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                                                >
                                                                    <MapPin className="w-3 h-3 text-blue-500" />
                                                                    {center.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                                                    <button
                                                        onClick={() => setAssigningEvent(event)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white transition-colors"
                                                    >
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        Manage
                                                    </button>
                                                    <EndEventButton
                                                        eventId={event.event_id}
                                                        onEnded={fetchEvents}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ─── Historical Operations Log ─── */}
                    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Archive className="w-4 h-4 text-slate-400" />
                                <h2 className="text-sm font-semibold text-slate-800">Historical Operations Log</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 font-medium">
                                    {historicalEvents.length} record{historicalEvents.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {historicalEvents.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No historical operations recorded yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Event ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Severity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {historicalEvents.map(event => {
                                            const start = new Date(event.started_at);
                                            const end = event.ended_at ? new Date(event.ended_at) : null;
                                            
                                            let durationStr = "—";
                                            if (end) {
                                                const diffMs = end.getTime() - start.getTime();
                                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                durationStr = diffDays > 0 
                                                    ? `${diffDays} Day${diffDays > 1 ? 's' : ''}` 
                                                    : `${diffHours}h`;
                                            }

                                            return (
                                                <tr key={event.event_id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-3.5 font-mono text-xs text-slate-400">{event.event_id}</td>
                                                    <td className="px-6 py-3.5 font-medium text-slate-800">{event.name}</td>
                                                    <td className="px-6 py-3.5 text-slate-500">{event.primary_type?.type_name || '—'}</td>
                                                    <td className="px-6 py-3.5">
                                                        <SeverityBadge severity={event.severity} />
                                                    </td>
                                                    <td className="px-6 py-3.5 text-slate-500">{durationStr}</td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 font-medium rounded text-xs border border-emerald-100">
                                                            Closed
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

            {/* ─── Modals ─── */}
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