import React from 'react';
import {
  X, Home, Users, Hash,
  DoorOpen, Edit3, Plus, Trash2
} from 'lucide-react';
import ActionMenu from '../ui/ActionMenu';

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5 text-left">
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {Icon && <Icon size={11} />} {label}
      </span>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{children}</div>
    </div>
  );
}

export default function ViewUnitDrawer({
  unit,
  allocations = [],
  onClose,
  canManage = false,
  canEdit = false,
  onAssign,
  onUnassign,
  onEdit,
  onDelete,
}) {
  if (!unit) return null;

  const occupancy = Number(unit.current_occupancy ?? 0);
  const capacity = Number(unit.max_capacity ?? 0);
  const percent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
  const isFull = percent >= 100;
  const isHigh = percent >= 80 && percent < 100;

  const statusLabel = isFull ? 'Fully Occupied' : isHigh ? 'High Occupancy' : 'Available';
  const statusColor = isFull
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/40'
    : isHigh
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40'
    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40';

  const progressColor = isFull ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <>
      {/* Mobile-only translucent backdrop */}
      <div
        className="fixed inset-0 top-14 bg-black/20 dark:bg-black/40 z-30 md:hidden transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Jira-Style Inline Right Detail Panel (matches Issue Reports ViewDetailsModal) */}
      <aside className="fixed inset-x-0 top-14 bottom-0 z-40 md:sticky md:top-0 md:inset-auto md:h-[calc(100vh-3.5rem)] w-full md:w-[350px] xl:w-[400px] shrink-0 bg-white dark:bg-[#0f1623] border-l border-slate-200 dark:border-[#1e2a3d] shadow-xl md:shadow-none flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden text-left">

        {/* ── Drawer Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold min-w-0">
            <Home size={14} className="text-blue-500 flex-shrink-0" />
            <span>Accommodation Unit</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500 truncate">
              / ID-{unit.unit_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(unit)}
                className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
              >
                Edit
              </button>
            )}
            {(canEdit || canManage) && (
              <ActionMenu
                onEdit={canEdit && onEdit ? () => onEdit(unit) : undefined}
                onDelete={canEdit && onDelete && occupancy === 0 ? () => { onClose(); onDelete(unit); } : undefined}
                canDelete={canEdit && occupancy === 0}
              />
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Header Title Section */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#1e2a3d]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex-shrink-0">
                <DoorOpen size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                  {unit.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-[#1e2a3d] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#263047] rounded-md">
                    {unit.type?.type_label || 'Standard Room'}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border ${statusColor}`}>
                    {statusLabel} ({percent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Occupancy Capacity</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {occupancy} / {capacity} persons
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#1e2a3d] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Facts Grid */}
          <div className="px-5 py-4 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Unit ID" icon={Hash}>
                <span className="font-mono text-xs">ID-{unit.unit_id}</span>
              </Field>
              <Field label="Type" icon={Home}>
                <span>{unit.type?.type_label || 'Room'}</span>
              </Field>
              <Field label="Capacity" icon={Users}>
                <span>{capacity} Persons</span>
              </Field>
              <Field label="Current Load" icon={Users}>
                <span className="font-bold text-blue-600 dark:text-blue-400">{occupancy} Occupants</span>
              </Field>
            </div>

            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Users size={11} /> Assigned Households ({allocations.length})
                </span>
                {canManage && !isFull && (
                  <button
                    type="button"
                    onClick={() => onAssign(unit)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus size={13} /> Assign Household
                  </button>
                )}
              </div>

              {allocations.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1e2a3d] border border-dashed border-slate-200 dark:border-[#263047] text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No households assigned to this unit yet.
                  </p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onAssign(unit)}
                      className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Assign a household now →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {allocations.map((alloc) => {
                    const hhName = alloc.evacuation_record?.household?.household_name || 'Household';
                    return (
                      <div
                        key={alloc.allocation_id}
                        className="flex items-center justify-between bg-slate-50 dark:bg-[#1e2a3d] p-3 rounded-xl border border-slate-200/80 dark:border-[#263047] hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0 font-black text-xs">
                            {hhName[0] || 'H'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                              {hhName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {alloc.evacuation_record?.evacuated_count || 0} members evacuated
                            </p>
                          </div>
                        </div>

                        {canManage && onUnassign && (
                          <button
                            type="button"
                            onClick={() =>
                              onUnassign(
                                unit.unit_id,
                                alloc.allocation_id,
                                hhName,
                                unit.name
                              )
                            }
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                          >
                            Unassign
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Drawer Footer Actions ── */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Quick Actions
          </p>
          <div className="flex gap-2 flex-wrap">
            {canManage && !isFull && (
              <button
                type="button"
                onClick={() => onAssign(unit)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
              >
                <Plus size={12} />
                <span>Assign Household</span>
              </button>
            )}
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(unit)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-[#263047] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-all"
              >
                <Edit3 size={12} />
                <span>Edit Unit</span>
              </button>
            )}
            {canEdit && onDelete && occupancy === 0 && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(unit);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
