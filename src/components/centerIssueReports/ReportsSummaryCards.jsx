import React from 'react';
import { StatCard } from '../ui/StatCard';

export default function ReportsSummaryCards({ openCount, inProgressCount, resolvedCount, closedCount, criticalCount }) {
  return (
    <>
      <StatCard
        title="Open"
        value={openCount}
        dotColor="#ef4444" // red-500
      />
      <StatCard
        title="In Progress"
        value={inProgressCount}
        dotColor="#3b82f6" // blue-500
      />
      <StatCard
        title="Resolved"
        value={resolvedCount}
        dotColor="#10b981" // green-500
      />
      <StatCard
        title="Closed"
        value={closedCount}
        dotColor="#64748b" // slate-500
      />
      <StatCard
        title="Critical"
        value={criticalCount}
        dotColor="#f97316" // orange-500
      />
    </>
  );
}
