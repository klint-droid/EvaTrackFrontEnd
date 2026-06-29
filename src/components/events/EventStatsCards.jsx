import React from 'react';
import { Flame, Building2, CheckCircle2 } from 'lucide-react';

export default function EventStatsCards({ activeCount, totalAssignedCenters, uniqueRegions, historyTotal }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between group hover:border-slate-300 transition-colors">
        <div className="space-y-1">
          <span className="text-sm text-slate-500 font-medium">Closed Incidents</span>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{historyTotal || 0}</p>
          <p className="text-xs text-slate-400 font-medium">
            Archived operations
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
