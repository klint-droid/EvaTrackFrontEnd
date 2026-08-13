import React from 'react';
import { StatCard } from '../ui/StatCard';

export default function ReportsSummaryCards({ openCount, inProgressCount, resolvedCount, closedCount, criticalCount, highCount, mediumCount, lowCount }) {
  return (
    <div className="space-y-3">
      {/* Status Row */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 pl-0.5">Status</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Open" value={openCount} dotColor="#ef4444" />
          <StatCard title="In Progress" value={inProgressCount} dotColor="#3b82f6" />
          <StatCard title="Resolved" value={resolvedCount} dotColor="#10b981" />
          <StatCard title="Closed" value={closedCount} dotColor="#64748b" />
        </div>
      </div>
      {/* Severity Row */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 pl-0.5">Severity</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Critical" value={criticalCount} dotColor="#dc2626" />
          <StatCard title="High" value={highCount} dotColor="#f97316" />
          <StatCard title="Medium" value={mediumCount} dotColor="#f59e0b" />
          <StatCard title="Low" value={lowCount} dotColor="#94a3b8" />
        </div>
      </div>
    </div>
  );
}
