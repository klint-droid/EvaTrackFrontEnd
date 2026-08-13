import React from 'react';
import { StatCard } from '../ui/StatCard';

export default function RequestsSummaryCards({ pendingCount, acknowledgedCount, approvedCount, rejectedCount, deliveredCount, criticalCount, highCount, mediumCount, lowCount, loading, requests }) {
  const val = (v) => loading && !requests.length ? '...' : v;
  return (
    <div className="space-y-3">
      {/* Status Row */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 pl-0.5">Status</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard title="Pending" value={val(pendingCount)} dotColor="#f59e0b" />
          <StatCard title="Acknowledged" value={val(acknowledgedCount)} dotColor="#3b82f6" />
          <StatCard title="Approved" value={val(approvedCount)} dotColor="#6366f1" />
          <StatCard title="Rejected" value={val(rejectedCount)} dotColor="#ef4444" />
          <StatCard title="Delivered" value={val(deliveredCount)} dotColor="#10b981" />
        </div>
      </div>
      {/* Urgency Row */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 pl-0.5">Urgency</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Critical" value={val(criticalCount)} dotColor="#dc2626" />
          <StatCard title="High" value={val(highCount)} dotColor="#f97316" />
          <StatCard title="Medium" value={val(mediumCount)} dotColor="#f59e0b" />
          <StatCard title="Low" value={val(lowCount)} dotColor="#94a3b8" />
        </div>
      </div>
    </div>
  );
}
