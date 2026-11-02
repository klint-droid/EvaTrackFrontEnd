import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

const getStatusKey = (report) => {
  const status = typeof report.status === 'object'
    ? report.status?.status_key
    : report.status;
  return (status || 'open').toLowerCase();
};

const getSeverityKey = (report) => {
  const severity = typeof report.severity === 'object'
    ? report.severity?.severity_key
    : report.severity;
  return (severity || '').toLowerCase();
};

export default function IssuesTriageSummary({ reports = [] }) {
  const stats = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;
    let critical = 0;

    reports.forEach((report) => {
      const statusKey = getStatusKey(report);
      if (statusKey === 'open') open += 1;
      else if (statusKey === 'in_progress') inProgress += 1;
      else if (statusKey === 'resolved') resolved += 1;
      else if (statusKey === 'closed') closed += 1;

      if (getSeverityKey(report) === 'critical') critical += 1;
    });

    const total = reports.length;
    const settled = resolved + closed;
    const resolutionRate = total > 0 ? Math.round((settled / total) * 100) : 0;

    return { open, inProgress, resolved, closed, critical, total, resolutionRate };
  }, [reports]);

  const tiles = [
    {
      key: 'open',
      label: 'Open',
      value: stats.open,
      icon: AlertTriangle,
      ring: 'border-amber-200 dark:border-amber-800/60',
      tile: 'bg-amber-50/70 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      ring: 'border-blue-200 dark:border-blue-800/60',
      tile: 'bg-blue-50/70 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      ring: 'border-emerald-200 dark:border-emerald-800/60',
      tile: 'bg-emerald-50/70 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'closed',
      label: 'Closed',
      value: stats.closed,
      icon: ShieldCheck,
      ring: 'border-slate-200 dark:border-slate-700',
      tile: 'bg-slate-50 dark:bg-slate-800/50',
      text: 'text-slate-600 dark:text-slate-300',
    },
    {
      key: 'critical',
      label: 'Critical',
      value: stats.critical,
      icon: AlertOctagon,
      ring: 'border-rose-200 dark:border-rose-800/60',
      tile: 'bg-rose-50/70 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const resolutionColor =
    stats.resolutionRate >= 75
      ? 'bg-emerald-500'
      : stats.resolutionRate >= 40
        ? 'bg-amber-500'
        : 'bg-rose-500';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.key}
              className={`flex items-center gap-3 rounded-xl border ${tile.ring} ${tile.tile} px-3.5 py-3`}
            >
              <Icon size={18} className={`${tile.text} flex-shrink-0`} />
              <div className="min-w-0">
                <p className={`text-xl font-black leading-none ${tile.text}`}>{tile.value}</p>
                <p className="mt-1 truncate text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {tile.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Resolution Rate
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {stats.resolutionRate}% · {stats.total} issue{stats.total === 1 ? '' : 's'}
          </span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${resolutionColor}`}
            style={{ width: `${Math.min(100, stats.resolutionRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
