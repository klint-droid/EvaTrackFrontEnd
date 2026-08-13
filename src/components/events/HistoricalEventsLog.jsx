import React from 'react';
import { Archive, CheckCircle2 } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import { TableLayout } from '../ui/TableLayout';
import { Table, TableHeader, TableRow, TableHead, TableCell, RowMenu } from '../../ui/Table';
import { Pagination } from '../ui/Pagination';

export default function HistoricalEventsLog({
  historyPagination, filters, setFilters,
  disasterTypes, historyLoading, historicalEvents, fetchHistory, setViewingEvent
}) {
  return (
    <TableLayout
      title="Historical Operations Log"
      badgeText={`${historyPagination.total || historicalEvents.length} Archives`}
      subtitle="Past disaster events, emergency responses, and historical incident logs"
      onExport={() => {
        const csvHeader = "Event ID,Name,Type,Severity,Duration,Status\n";
        const csvRows = historicalEvents
          .map((e) => `${e.event_id},"${e.name || ''}",${e.primary_type?.type_name || ''},${e.severity || ''},Closed`)
          .join("\n");
        const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "historical_events_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      pagination={
        <Pagination
          currentPage={historyPagination.current_page || 1}
          totalPages={historyPagination.last_page || 1}
          totalEntries={historyPagination.total || 0}
          perPage={historyPagination.per_page || 10}
          onPageChange={(page) => fetchHistory(page)}
        />
      }
    >
      <Table>
        <TableHeader>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <TableHead>Event ID</TableHead>
            <TableHead
              filterable
              filterValue={filters.q}
              onFilterChange={(v) => setFilters((prev) => ({ ...prev, q: v }))}
            >
              Name
            </TableHead>
            <TableHead
              filterable
              filterValue={filters.type_id}
              onFilterChange={(v) => setFilters((prev) => ({ ...prev, type_id: v }))}
              filterOptions={disasterTypes.map((t) => ({ value: t.type_id, label: t.type_name }))}
            >
              Type
            </TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <tbody>
          {historyLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><div className="w-16 h-3 bg-slate-200 rounded" /></TableCell>
                <TableCell><div className="w-32 h-3 bg-slate-200 rounded" /></TableCell>
                <TableCell><div className="w-20 h-3 bg-slate-200 rounded" /></TableCell>
                <TableCell><div className="w-16 h-5 bg-slate-200 rounded-full" /></TableCell>
                <TableCell><div className="w-12 h-3 bg-slate-200 rounded" /></TableCell>
                <TableCell><div className="w-16 h-3 bg-slate-200 rounded" /></TableCell>
                <TableCell className="text-right"><div className="w-10 h-4 bg-slate-200 rounded ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : historicalEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan="7" className="py-14 text-center text-slate-400 text-xs">
                No historical operations recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            historicalEvents.map((event) => {
              const start = new Date(event.started_at);
              const end = event.ended_at ? new Date(event.ended_at) : null;

              let durationStr = "—";
              if (end) {
                const diffMs = end.getTime() - start.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                durationStr = diffDays > 0 ? `${diffDays} Day${diffDays > 1 ? "s" : ""}` : `${diffHours}h`;
              }

              return (
                <TableRow key={event.event_id}>
                  <TableCell className="font-mono text-xs text-slate-400">{event.event_id}</TableCell>
                  <TableCell isBold>{event.name}</TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                    {event.primary_type?.type_name || "—"}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={event.severity} />
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">{durationStr}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 size={13} />
                      Closed
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowMenu onView={() => setViewingEvent(event)} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </tbody>
      </Table>
    </TableLayout>
  );
}
