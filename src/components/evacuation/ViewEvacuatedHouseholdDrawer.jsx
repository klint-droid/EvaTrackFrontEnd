import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Users, Phone, Home, Calendar, Clock, 
  CheckCircle2, ExternalLink, QrCode, UserCheck, Trash2, ArrowRight
} from 'lucide-react';
import JiraActionMenu from '../ui/JiraActionMenu';

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
  onClose,
  canManage = false,
  onViewProfile,
  onDeleteRecord,
  onChangeUnit
}) {
  if (!record) return null;

  const household = record.household || {};
  const unitName = record.unit_allocation?.unit?.name 
    || record.unit_allocations?.[0]?.unit?.name 
    || record.unit?.name;
  const unitType = record.unit_allocation?.unit?.type?.type_label 
    || record.unit?.type?.type_label;
  const memberCount = record.evacuated_count || household.member_count || 0;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return createPortal(
    <>
      {/* Translucent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9998] transition-opacity duration-200" 
        onClick={onClose} 
      />

      {/* Slide-In Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-white dark:bg-[#0f1623] border-l border-slate-200 dark:border-[#1e2a3d] shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden text-left">
        
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Users size={14} className="text-indigo-500" />
            <span>Evacuated Household</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500">/ ID-{record.household_id || record.evacuation_id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {onViewProfile && (
              <button 
                type="button"
                onClick={() => { onClose(); onViewProfile(record); }}
                className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors inline-flex items-center gap-1"
              >
                Profile <ExternalLink size={11} />
              </button>
            )}
            <JiraActionMenu
              onView={() => {}}
              onDelete={canManage && onDeleteRecord ? () => { onClose(); onDeleteRecord(record.evacuation_id); } : undefined}
              canDelete={canManage}
            />
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Header Title Section */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#1e2a3d]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
                <Users size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                  {household.household_name || 'Evacuated Household'}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {memberCount} Evacuees
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md capitalize">
                    Method: {record.method || 'Manual'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Facts Grid */}
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact Phone" icon={Phone}>
                <span className="font-mono text-xs">{household.contact_number || '—'}</span>
              </Field>
              <Field label="Evacuation ID" icon={CheckCircle2}>
                <span className="font-mono text-xs">{record.evacuation_id}</span>
              </Field>
              <Field label="Verified On" icon={Calendar}>
                <span className="text-xs">{formatDateTime(record.verified_at || record.created_at)}</span>
              </Field>
              <Field label="Total Members" icon={Users}>
                <span className="font-bold text-slate-800 dark:text-slate-100">{memberCount} Present</span>
              </Field>
            </div>

            {/* Assigned Accommodation Unit Card */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d] pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Home size={12} /> Assigned Accommodation Unit
              </span>

              {unitName ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                      <Home size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {unitName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {unitType || 'Standard Shelter Unit'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-dashed border-amber-300 dark:border-amber-800 text-center">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">No unit assigned to this household yet.</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Assign an available room or tent from the Accommodation Units tab.</p>
                </div>
              )}
            </div>

            {/* Household Head / Address */}
            {household.barangay && (
              <div className="border-t border-slate-100 dark:border-[#1e2a3d] pt-4 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Origin Address
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {household.street_address ? `${household.street_address}, ` : ''}{household.barangay?.name || 'Barangay'}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ── Drawer Footer Actions ── */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/50 dark:bg-[#141b29]/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1e2a3d] rounded-lg transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            {onViewProfile && (
              <button
                type="button"
                onClick={() => { onClose(); onViewProfile(record); }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all"
              >
                <span>Full Profile</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

      </div>
    </>,
    document.body
  );
}
