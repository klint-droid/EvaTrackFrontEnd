import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Timer, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Wind,
  Droplets,
  Activity,
  Flame,
  Calendar
} from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import EndEventButton from './EndEventButton';

const getIconForType = (typeName) => {
  const lower = (typeName || '').toLowerCase();
  if (lower.includes('typhoon') || lower.includes('storm')) return Wind;
  if (lower.includes('earthquake')) return Activity;
  if (lower.includes('flood')) return Droplets;
  if (lower.includes('fire')) return Flame;
  return ShieldAlert;
};

export default function ActiveEventsList({ activeEvents = [], fetchEvents }) {
  const hasActiveEvents = activeEvents.length > 0;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${hasActiveEvents ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Active Disaster Operations
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Live emergency declarations and multi-facility response coordination
            </p>
          </div>
        </div>

        {hasActiveEvents ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            {activeEvents.length} Active {activeEvents.length === 1 ? 'Emergency' : 'Emergencies'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            All Facilities Normal
          </span>
        )}
      </div>
      
      {/* Active Operations List or Clean Empty State */}
      {!hasActiveEvents ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-10 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            No Active Disaster Operations
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            All designated evacuation centers are operating in standard readiness mode. Declare an event when an official disaster advisory is triggered.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {activeEvents.map(event => {
            const startDate = new Date(event.started_at);
            const now = new Date();
            const diffMs = Math.max(0, now.getTime() - startDate.getTime());
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const elapsed = diffDays > 0 ? `${diffDays}d ${diffHours}h` : `${diffHours}h`;

            const IconComponent = getIconForType(event.primary_type?.type_name);

            return (
              <div 
                key={event.event_id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all flex flex-col justify-between"
              >
                {/* Card Top / Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-500/20">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                          {event.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                          EVT-{event.event_id}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {event.primary_type?.type_name || 'Disaster Event'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={event.severity} />
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-lg text-xs border border-rose-200 dark:border-rose-900/60">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                      </span>
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="px-6 py-5 space-y-4">
                  
                  {/* Key Operational Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    
                    {/* 1. Start Time */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Started</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <span className="font-normal text-slate-400 ml-1">
                          {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>

                    {/* 2. Elapsed Duration */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Elapsed</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {elapsed}
                      </p>
                    </div>

                    {/* 3. Coverage */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                        <span>Mobilization</span>
                      </div>
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        All Shelters Active
                      </p>
                    </div>

                  </div>

                  {/* Operational Banner Note */}
                  <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Coverage Scope: City-Wide Emergency Response Protocol Mobilized</span>
                  </div>

                </div>

                {/* Card Footer Actions */}
                <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Disaster operations active across all centers
                  </span>
                  
                  <EndEventButton
                    eventId={event.event_id}
                    onEnded={fetchEvents}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
