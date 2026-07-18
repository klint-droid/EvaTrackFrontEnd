import React from 'react';
import { StatCard } from '../ui/StatCard';

export default function RequestsSummaryCards({ pendingCount, acknowledgedCount, approvedCount, rejectedCount, deliveredCount, loading, requests }) {
  return (
    <>
      <StatCard
        title="Pending"
        value={loading && !requests.length ? '...' : pendingCount}
        dotColor="#f59e0b" // amber-500
      />
      <StatCard
        title="Acknowledged"
        value={loading && !requests.length ? '...' : acknowledgedCount}
        dotColor="#3b82f6" // blue-500
      />
      <StatCard
        title="Approved"
        value={loading && !requests.length ? '...' : approvedCount}
        dotColor="#6366f1" // indigo-500
      />
      <StatCard
        title="Rejected"
        value={loading && !requests.length ? '...' : rejectedCount}
        dotColor="#ef4444" // red-500
      />
      <StatCard
        title="Delivered"
        value={loading && !requests.length ? '...' : deliveredCount}
        dotColor="#10b981" // emerald-500
      />
    </>
  );
}
