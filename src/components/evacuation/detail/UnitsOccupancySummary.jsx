import React, { useMemo } from 'react';
import {
  DoorOpen,
  GaugeCircle,
  AlertTriangle,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function UnitsOccupancySummary({ units = [] }) {
  const stats = useMemo(() => {
    let available = 0;
    let high = 0;
    let full = 0;
    let totalCapacity = 0;
    let totalOccupied = 0;

    units.forEach((unit) => {
      const occupancy = Number(unit.current_occupancy ?? 0);
      const capacity = Number(unit.max_capacity ?? 0);

      const percent =
        capacity > 0
          ? Math.round((occupancy / capacity) * 100)
          : 0;

      totalCapacity += capacity;
      totalOccupied += occupancy;

      if (capacity > 0 && occupancy >= capacity) {
        full += 1;
      } else if (percent >= 80) {
        high += 1;
      } else {
        available += 1;
      }
    });

    const utilization =
      totalCapacity > 0
        ? Math.round((totalOccupied / totalCapacity) * 100)
        : 0;

    return {
      available,
      high,
      full,
      totalCapacity,
      totalOccupied,
      utilization,
    };
  }, [units]);

  const bars = [
    {
      key: 'available',
      label: 'Available',
      icon: DoorOpen,
      value: stats.available,
      color: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'high',
      label: 'High',
      icon: GaugeCircle,
      value: stats.high,
      color: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'full',
      label: 'Full',
      icon: AlertTriangle,
      value: stats.full,
      color: 'bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const totalUnits = units.length;

  const utilizationColor =
    stats.utilization >= 100
      ? 'bg-rose-500'
      : stats.utilization >= 80
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-center gap-2">
        <Users size={15} className="text-blue-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Occupancy Overview
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {bars.map((bar) => {
          const Icon = bar.icon;
          const percentage =
            totalUnits > 0
              ? Math.round((bar.value / totalUnits) * 100)
              : 0;

          return (
            <div
              key={bar.key}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${bar.text}`}
                >
                  <Icon size={14} />
                  {bar.label}
                </span>

                <span className="text-xl font-black leading-none text-slate-900 dark:text-white">
                  {bar.value}
                </span>
              </div>

              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${bar.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="mt-1 text-[10px] font-semibold text-slate-400">
                {percentage}% of units
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-1">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2
              size={13}
              className={
                stats.utilization >= 100
                  ? 'text-rose-500'
                  : 'text-emerald-500'
              }
            />
            Overall Slot Utilization
          </span>

          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {stats.totalOccupied} / {stats.totalCapacity} persons ·{' '}
            {stats.utilization}%
          </span>
        </div>

        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${utilizationColor}`}
            style={{
              width: `${Math.min(100, stats.utilization)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
