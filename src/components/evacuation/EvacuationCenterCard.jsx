import React from "react";
import { Home, MapPin, Users, DoorOpen, ChevronRight, ShieldAlert } from "lucide-react";
import { RowMenu } from "../../ui/Table";

export default function EvacuationCenterCard({
  center,
  isAssigned,
  isFocused,
  onFocus,
  onNavigate,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onAssignPersonnel,
}) {
  const current = Number(center.current_occupancy) || 0;
  const max = Number(center.capacity) || 0;
  const percent = max ? Math.min(100, Math.round((current / max) * 100)) : 0;

  // Status styling
  let statusBadge = {
    label: "Accepting",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    barColor: "bg-emerald-500",
  };
  if (percent >= 90) {
    statusBadge = {
      label: "Full / Critical",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      barColor: "bg-rose-500",
    };
  } else if (percent >= 70) {
    statusBadge = {
      label: "Near Capacity",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      barColor: "bg-amber-500",
    };
  }

  const hasCoordinates =
    !isNaN(parseFloat(center.latitude)) &&
    !isNaN(parseFloat(center.longitude)) &&
    parseFloat(center.latitude) !== 0 &&
    parseFloat(center.longitude) !== 0;

  return (
    <div
      onMouseEnter={() => onFocus && onFocus(center.evacuation_center_id)}
      onClick={() => onNavigate && onNavigate(center.evacuation_center_id)}
      className={`group relative rounded-2xl border transition-all duration-200 p-4 bg-white dark:bg-slate-900 cursor-pointer text-left ${
        isFocused
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/5 -translate-y-0.5"
          : isAssigned
          ? "border-blue-300 dark:border-blue-900/50 shadow-sm hover:border-blue-400 hover:shadow-md"
          : "border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
      }`}
    >
      {/* Top row: Icon, Name, Badges & Context Menu */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              isAssigned
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            }`}
          >
            <Home size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {center.name}
              </h3>

              {isAssigned && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                  My Station
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              <MapPin size={12} className="flex-shrink-0 text-slate-400" />
              <span className="truncate">
                {center.osm_address || "No location address recorded"}
              </span>
            </div>
          </div>
        </div>

        {/* Row menu for actions */}
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
          <RowMenu
            onView={() => onNavigate && onNavigate(center.evacuation_center_id)}
            actions={[
              ...(canEdit && onAssignPersonnel
                ? [{ label: "Assign Personnel", onClick: () => onAssignPersonnel(center) }]
                : []),
            ]}
            onEdit={canEdit && onEdit ? () => onEdit(center) : undefined}
            onDelete={canDelete && onDelete ? () => onDelete(center) : undefined}
          />
        </div>
      </div>

      {/* Active Disaster Event Banner (if assigned) */}
      {center.current_event && (
        <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-1.5 text-[11px] font-semibold text-red-700 dark:text-red-400">
          <ShieldAlert size={12} className="text-red-500 animate-pulse flex-shrink-0" />
          <span className="truncate">{center.current_event.name}</span>
        </div>
      )}

      {/* Occupancy bar */}
      <div className="mt-3 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Occupancy
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded border ${statusBadge.color}`}
            >
              {statusBadge.label}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {percent}%
            </span>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusBadge.barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Counts summary: Occupants vs Households */}
        <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {current}
            </span>
            <span className="text-slate-400">/ {max} capacity</span>
          </div>

          <div className="flex items-center gap-1.5">
            <DoorOpen size={13} className="text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {center.household_count ?? 0}
            </span>
            <span className="text-slate-400">families</span>
          </div>
        </div>
      </div>

      {/* Footer / Quick Manage Link */}
      <div className="mt-3 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <span className="text-[10px] text-slate-400">
          {hasCoordinates ? "📍 GPS Coordinates Pinned" : "⚠️ No GPS Coordinates"}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
          Manage Station <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}
