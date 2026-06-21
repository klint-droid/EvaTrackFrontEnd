import { createPortal } from 'react-dom';
import { X, Clock, Calendar, AlertTriangle, Info, MapPin } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function EventDetailsModal({ event, onClose }) {
    if (!event) return null;

    const start = new Date(event.started_at);
    const end = event.ended_at ? new Date(event.ended_at) : null;
    
    let durationStr = "—";
    if (end) {
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        durationStr = diffDays > 0 
            ? `${diffDays} Day${diffDays > 1 ? 's' : ''} ${diffHours} Hour${diffHours !== 1 ? 's' : ''}` 
            : `${diffHours} Hour${diffHours !== 1 ? 's' : ''}`;
    }

    const allCenters = event.historical_centers && event.historical_centers.length > 0 
        ? event.historical_centers 
        : (event.evacuation_centers || []);
    
    const centersCount = allCenters.length;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 sm:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-300">
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Historical Event Details</h2>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{event.event_id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Event Name</label>
                            <p className="text-base font-semibold text-slate-900">{event.name}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category</label>
                            <p className="text-sm font-medium text-slate-700">{event.primary_type?.type_name || '—'}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Severity</label>
                            <SeverityBadge severity={event.severity} />
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                <Calendar size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Started</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700">
                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
                                <span className="text-slate-500 font-medium">{start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                        </div>
                        {end && (
                            <div>
                                <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                    <Clock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ended</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-700">
                                    {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
                                    <span className="text-slate-500 font-medium">{end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                <Info size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mt-2">{durationStr}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                <MapPin size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Affected Areas</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mt-2">Brgy. Mambaling</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Shelters Assigned</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mt-2">{centersCount} shelter{centersCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {allCenters.length > 0 && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Shelters Used</label>
                            <div className="flex flex-wrap gap-2">
                                {allCenters.map(center => (
                                    <span 
                                        key={center.evacuation_center_id} 
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-600"
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                        {center.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
