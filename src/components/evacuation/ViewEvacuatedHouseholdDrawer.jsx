import React, { useState, useEffect } from 'react';
import {
  X, Users, Phone, Home, Calendar, Clock,
  CheckCircle2, ExternalLink, Trash2, ArrowRight, MapPin, Loader2
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

export default function ViewEvacuatedHouseholdDrawer({
  record,
  units = [],
  onClose,
  canManage = false,
  onViewProfile,
  onDeleteRecord,
  onAssignUnit,
  onUnassignUnit,
  isAssigningUnit = false,
  isUnassigning = false,
  assignConfirmOpen = false,
  unassignConfirmOpen = false,
}) {
  const [localUnitId, setLocalUnitId] = useState('');

  const alloc =
    record?.unit_allocation ||
    record?.unitAllocation ||
    record?.unit_allocations?.[0] ||
    null;

  const currentAllocationId = alloc?.allocation_id;
  const currentUnitId = alloc?.unit_id || alloc?.unit?.unit_id || record?.unit?.unit_id || '';

  useEffect(() => {
    if (record && !assignConfirmOpen && !unassignConfirmOpen) {
      setLocalUnitId(String(currentUnitId ?? ''));
    }
  }, [record, currentUnitId, assignConfirmOpen, unassignConfirmOpen]);

  if (!record) return null;

  const household = record.household || {};
  const matchedUnitFromList = units.find(
    (u) => String(u.unit_id) === String(currentUnitId)
  );
  const unitName =
    alloc?.unit?.name ||
    record.unit?.name ||
    matchedUnitFromList?.name ||
    '';
  const unitType =
    alloc?.unit?.type?.type_label ||
    record.unit?.type?.type_label ||
    matchedUnitFromList?.type?.type_label ||
    '';
  const memberCount = Number(record.evacuated_count || household.member_count || 0);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isBusy = isAssigningUnit || isUnassigning;

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
            <Users size={14} className="text-blue-500 flex-shrink-0" />
            <span>Evacuated Household</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500 truncate">
              / ID-{record.household_id || record.evacuation_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onViewProfile && (
              <button
                type="button"
                onClick={() => onViewProfile(record)}
                className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors inline-flex items-center gap-1"
              >
                Profile <ExternalLink size={11} />
              </button>
            )}
            <ActionMenu
              onView={onViewProfile ? () => onViewProfile(record) : undefined}
              onDelete={
                canManage && onDeleteRecord
                  ? () => {
                      onClose();
                      onDeleteRecord(record.evacuation_id);
                    }
                  : undefined
              }
              canDelete={canManage}
            />
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
                <Users size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                  {household.household_name || 'Evacuated Household'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/40">
                    {memberCount} Evacuees
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-[#1e2a3d] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#263047] rounded-md capitalize">
                    Method: {record.method || 'Manual'}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border ${
                      unitName
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40'
                    }`}
                  >
                    {unitName ? 'Unit Assigned' : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail Fields ── */}
          <div className="px-5 py-4 space-y-5">

            {/* Quick Facts 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact Phone" icon={Phone}>
                <span className="font-mono text-xs">{household.contact_number || '—'}</span>
              </Field>
              <Field label="Evacuation ID" icon={CheckCircle2}>
                <span className="font-mono text-xs">#{record.evacuation_id}</span>
              </Field>
              <Field label="Verified On" icon={Calendar}>
                <span className="text-xs">{formatDateTime(record.verified_at || record.created_at)}</span>
              </Field>
              <Field label="Total Members" icon={Users}>
                <span className="font-bold text-slate-800 dark:text-slate-100">{memberCount} Present</span>
              </Field>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Assigned Accommodation Unit + Direct Room/Unit Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Home size={11} /> Assigned Accommodation Unit
              </span>

              {/* Current Unit Card */}
              <div className="bg-slate-50 dark:bg-[#1e2a3d] border border-slate-100 dark:border-[#263047] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 ${
                      unitName
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                        : 'bg-slate-100 dark:bg-[#141b29] text-slate-400'
                    }`}
                  >
                    <Home size={14} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        unitName
                          ? 'text-slate-900 dark:text-white'
                          : 'italic text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {unitName || 'No unit assigned to this household yet'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                      {unitName
                        ? unitType || 'Standard Shelter Unit'
                        : 'Select an available room or tent below to assign'}
                    </p>
                  </div>
                </div>

                {unitName && (
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                )}
              </div>

              {/* Room / Unit Assignment Dropdown */}
              {canManage && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {unitName ? 'Change Room / Unit Assignment' : 'Assign Room / Unit'}
                  </label>
                  <select
                    value={localUnitId}
                    disabled={isBusy || units.length === 0}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      if (newVal === String(currentUnitId ?? '')) return;
                      setLocalUnitId(newVal);

                      if (!newVal) {
                        if (currentUnitId && currentAllocationId && onUnassignUnit) {
                          onUnassignUnit(
                            currentUnitId,
                            currentAllocationId,
                            household.household_name || 'Evacuated Household',
                            unitName
                          );
                        }
                        return;
                      }

                      const targetUnit = units.find(
                        (u) => String(u.unit_id) === String(newVal)
                      );
                      if (targetUnit && onAssignUnit) {
                        onAssignUnit(record, targetUnit);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Unassigned (No Room / Unit)</option>
                    {units.map((u) => {
                      const occupancy = Number(u.current_occupancy ?? 0);
                      const capacity = Number(u.max_capacity ?? 0);
                      const available = Math.max(0, capacity - occupancy);
                      const isCurrent = String(u.unit_id) === String(currentUnitId);
                      const insufficientSpace = !isCurrent && capacity > 0 && memberCount > available;
                      const typeLabel = u.type?.type_label || 'Room';

                      return (
                        <option
                          key={u.unit_id}
                          value={String(u.unit_id)}
                          disabled={insufficientSpace}
                        >
                          {u.name} ({typeLabel} • {occupancy}/{capacity}
                          {insufficientSpace
                            ? ` — Needs ${memberCount} slots`
                            : ` — ${available} slots left`}
                          )
                        </option>
                      );
                    })}
                  </select>

                  {isBusy && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Updating room assignment…</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Origin Address */}
            {(household.barangay || household.address) && (
              <>
                <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />
                <Field label="Origin Address" icon={MapPin}>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {household.address?.full_address ||
                      `${household.street_address ? `${household.street_address}, ` : ''}${
                        household.barangay?.name || household.address?.barangay || 'Registered Barangay'
                      }`}
                  </span>
                </Field>
              </>
            )}

            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Evacuation Status Timeline */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock size={11} /> Evacuation Timeline
              </span>
              <div className="space-y-2.5">
                {[
                  {
                    label: 'Household Verified & Admitted',
                    time: formatDateTime(record.verified_at || record.created_at),
                    active: true,
                  },
                  {
                    label: unitName
                      ? `Assigned to ${unitName}`
                      : 'Awaiting Room / Unit Assignment',
                    time: unitName ? unitType || 'Active Shelter Unit' : 'Pending allocation',
                    active: Boolean(unitName),
                  },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${
                        step.active ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          step.active
                            ? 'text-slate-800 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.time && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{step.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Drawer Footer Actions ── */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Quick Actions
          </p>
          <div className="flex gap-2 flex-wrap">
            {onViewProfile && (
              <button
                type="button"
                onClick={() => onViewProfile(record)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
              >
                <span>Full Profile</span>
                <ArrowRight size={12} />
              </button>
            )}
            {canManage && onDeleteRecord && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteRecord(record.evacuation_id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
              >
                <Trash2 size={12} />
                <span>Delete Record</span>
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
