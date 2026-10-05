import React from 'react';
import { Flame, Radio, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function EventStatsCards({ activeCount = 0, historyTotal = 0 }) {
  const isCrisisActive = activeCount > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* 1. Active Emergencies */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-rose-500 p-5 flex items-start justify-between shadow-sm hover:shadow transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Emergencies
            </span>
            {isCrisisActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {activeCount}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {isCrisisActive ? 'Response operations in progress' : 'No active disaster declarations'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
          <Flame className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Mobilization Scope (Replaced 'Shelters Assigned') */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-blue-500 p-5 flex items-start justify-between shadow-sm hover:shadow transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mobilization Scope
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight pt-1">
            {isCrisisActive ? 'City-Wide Active' : 'Standby Readiness'}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {isCrisisActive ? 'All evacuation shelters mobilized' : 'All municipal shelters on standby'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
          {isCrisisActive ? (
            <Radio className="w-5 h-5 animate-pulse" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* 3. Closed / Historical Incidents */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 p-5 flex items-start justify-between shadow-sm hover:shadow transition-all">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Closed Incidents
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {historyTotal || 0}
          </p>
          <p className="text-xs font-medium text-slate-400">
            Archived incident operations & logs
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
