import React from 'react';
import { ShieldAlert, MapPin, Clock, Timer, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import EndEventButton from './EndEventButton';

export default function ActiveEventsList({ activeEvents, setAssigningEvent, fetchEvents }) {
  return (
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

                <div className="px-6 py-5">
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
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs">Affected Areas: Mambaling</span>
                    </div>
                  </div>

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
  );
}
