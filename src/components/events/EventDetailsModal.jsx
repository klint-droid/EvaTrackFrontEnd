import { createPortal } from 'react-dom';
import { X, Clock, Calendar, Info, MapPin, Radio, ShieldAlert } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function EventDetailsModal({ event, onClose }) {
    if (!event) return null;

    const start = new Date(event.started_at);
    const end = event.ended_at ? new Date(event.ended_at) : null;
    
    let durationStr = "—";
    if (end) {
        const diffMs = Math.max(0, end.getTime() - start.getTime());
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        durationStr = diffDays > 0 
            ? `${diffDays} Day${diffDays > 1 ? 's' : ''} ${diffHours} Hour${diffHours !== 1 ? 's' : ''}` 
            : `${diffHours} Hour${diffHours !== 1 ? 's' : ''}`;
    } else {
        const diffMs = Math.max(0, Date.now() - start.getTime());
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        durationStr = diffDays > 0 ? `${diffDays}d ${diffHours}h (Ongoing)` : `${diffHours}h (Ongoing)`;
    }

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 sm:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                Disaster Operation Record
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                EVT-{event.event_id}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Event Identity Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                Event Title
                            </label>
                            <p className="text-base font-bold text-slate-900 dark:text-slate-50">
                                {event.name}
                            </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                Category
                            </label>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {event.primary_type?.type_name || '—'}
                            </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                Severity Level
                            </label>
                            <SeverityBadge severity={event.severity} />
                        </div>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Started */}
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                                <Calendar size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Started</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Ended */}
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Status / Ended</span>
                            </div>
                            {end ? (
                                <>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                    Live / Active
                                </span>
                            )}
                        </div>

                        {/* Total Duration */}
                        <div>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                                <Info size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {durationStr}
                            </p>
                        </div>
                    </div>

                    {/* Operational Mobilization Scope */}
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                            <Radio size={14} className="text-blue-500 animate-pulse" />
                            <span>City-Wide Emergency Mobilization</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Under municipal disaster response protocols, all registered evacuation facilities, relief inventory centers, and barangay coordination units are mobilized for city-wide coverage.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}
