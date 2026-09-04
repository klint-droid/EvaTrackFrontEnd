import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ExternalLink, Wrench, HeartPulse, Shield, FileWarning, AlertTriangle,
  MapPin, Clock, Activity, CheckCircle2, ShieldCheck, ArrowRight,
  User, Calendar, Paperclip, Hash, Sparkles
} from 'lucide-react';

const STATUS_OPTIONS = [
  { key: 'open',        label: 'Open',        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40' },
  { key: 'resolved',    label: 'Resolved',    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40' },
  { key: 'closed',      label: 'Closed',      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-400/40' },
];

const getCategoryIcon = (category = '') => {
  switch (category) {
    case 'facility_issue': return <Wrench size={16} className="text-blue-500" />;
    case 'health_issue':   return <HeartPulse size={16} className="text-emerald-500" />;
    case 'safety_issue':   return <Shield size={16} className="text-orange-500" />;
    case 'incident':       return <FileWarning size={16} className="text-rose-500" />;
    default:               return <AlertTriangle size={16} className="text-amber-500" />;
  }
};

const getCategoryLabel = (category = '') => {
  switch (category) {
    case 'facility_issue': return 'Facility Issue';
    case 'health_issue':   return 'Health Issue';
    case 'safety_issue':   return 'Safety Issue';
    case 'incident':       return 'Incident Report';
    default:               return 'General Issue';
  }
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatTimeAgo = (d) => {
  if (!d) return '';
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const severityConfig = {
  critical: { cls: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800', dot: 'bg-rose-500', ping: true },
  high:     { cls: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800', dot: 'bg-orange-500', ping: false },
  medium:   { cls: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800', dot: 'bg-amber-400', ping: false },
  low:      { cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400', ping: false },
};

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {Icon && <Icon size={11} />} {label}
      </span>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{children}</div>
    </div>
  );
}

import JiraActionMenu from '../ui/JiraActionMenu';

export default function ViewDetailsModal({
  report,
  onClose,
  canUpdateStatus,
  handleStatusChange,
  handleDelete,
  openEditModal
}) {
  const [currentStatus, setCurrentStatus] = useState('open');
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (report) {
      const sk = typeof report.status === 'object' ? report.status?.status_key : report.status || 'open';
      setCurrentStatus(sk);
    }
  }, [report]);

  if (!report) return null;

  const shortId = report.report_id?.slice(-8) || report.report_id || '—';
  const severityKey = (typeof report.severity === 'object' ? report.severity?.severity_key : report.severity) || 'medium';
  const sev = severityConfig[severityKey] || severityConfig.medium;
  const statusObj = STATUS_OPTIONS.find(s => s.key === currentStatus) || STATUS_OPTIONS[0];

  const r = report.reporter || report.reported_by_user;
  const reporterName = r?.name?.trim()
    || [r?.first_name, r?.last_name].filter(Boolean).join(' ')
    || r?.email?.split('@')[0]
    || 'Staff Officer';

  const initials = (
    r?.first_name?.[0] ||
    r?.name?.split(' ')?.[0]?.[0] ||
    r?.email?.[0] ||
    'U'
  ).toUpperCase();

  const onStatusSelect = async (newStatus) => {
    setCurrentStatus(newStatus);
    setStatusChanging(true);
    if (handleStatusChange) await handleStatusChange(report.report_id, newStatus);
    setStatusChanging(false);
  };

  return createPortal(
    <>
      {/* Translucent backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9998] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Right-side Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white dark:bg-[#0f1623] border-l border-slate-200 dark:border-[#1e2a3d] shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">

        {/* ── Drawer Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>Issue Report</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500">/ {report.report_id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {openEditModal && (
              <button 
                onClick={() => { onClose(); openEditModal(report); }} 
                className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
              >
                Edit
              </button>
            )}
            <JiraActionMenu
              itemId={report.report_id}
              itemKey={report.report_id}
              currentStatus={currentStatus}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={canUpdateStatus && handleStatusChange ? onStatusSelect : undefined}
              onDelete={handleDelete ? () => { onClose(); handleDelete(report.report_id); } : undefined}
              canDelete={Boolean(handleDelete)}
              canChangeStatus={canUpdateStatus}
            />
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Title Section */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#1e2a3d]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-[#1e2a3d] flex-shrink-0">
                {getCategoryIcon(report.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                  {report.title}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* Status badge / dropdown */}
                  {canUpdateStatus && handleStatusChange ? (
                    <select
                      value={currentStatus}
                      onChange={(e) => onStatusSelect(e.target.value)}
                      disabled={statusChanging}
                      className={`px-2 py-1 text-[10px] font-black uppercase tracking-wide rounded-md border cursor-pointer outline-none transition-all ${statusObj.color}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wide rounded-md border ${statusObj.color}`}>
                      {statusObj.label}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatTimeAgo(report.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail Fields ── */}
          <div className="px-5 py-4 space-y-5">

            {/* Quick facts row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Report ID" icon={Hash}>
                <span className="font-mono text-xs">{report.report_id || '—'}</span>
              </Field>
              <Field label="Category" icon={Activity}>
                <span className="capitalize">{getCategoryLabel(report.category)}</span>
              </Field>
              <Field label="Severity" icon={AlertTriangle}>
                <span className="capitalize font-bold">{severityKey}</span>
              </Field>
              <Field label="Date Filed" icon={Calendar}>
                <span className="text-xs">{formatDate(report.created_at)}</span>
              </Field>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Location */}
            <Field label="Evacuation Center" icon={MapPin}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{report.center?.name || 'Assigned Center'}</span>
              </div>
            </Field>

            {/* Reporter */}
            <Field label="Reported By" icon={User}>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{reporterName}</p>
                  {r?.email && (
                    <p className="text-[10px] text-slate-400">{r.email}</p>
                  )}
                </div>
              </div>
            </Field>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Description */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Detailed Description
              </span>
              <div className="bg-slate-50 dark:bg-[#1e2a3d] border border-slate-100 dark:border-[#263047] rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                {report.description || <span className="italic text-slate-400">No description provided.</span>}
              </div>
            </div>

            {/* Attachment Photo / Document */}
            {report.attachment_url && (
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Paperclip size={11} /> Attachment
                </span>
                <div className="border border-slate-200 dark:border-[#263047] rounded-xl overflow-hidden bg-slate-50 dark:bg-[#1e2a3d] relative group flex justify-center items-center p-2">
                  {report.attachment_url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img 
                      src={report.attachment_url} 
                      alt="Attachment" 
                      className="max-h-[220px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-slate-500 dark:text-slate-400">
                      <Paperclip size={28} className="mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Document Attached</span>
                    </div>
                  )}
                  
                  <a 
                    href={report.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock size={11} /> Status Timeline
              </span>
              <div className="space-y-2.5">
                {[
                  { label: 'Issue reported', time: report.created_at, active: true },
                  { label: 'In Progress (Assigned)', time: currentStatus !== 'open' ? report.updated_at : null, active: ['in_progress', 'resolved', 'closed'].includes(currentStatus) },
                  { label: 'Resolved', time: null, active: ['resolved', 'closed'].includes(currentStatus) },
                  { label: 'Closed / Verified', time: null, active: currentStatus === 'closed' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${step.active ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${step.active ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
                        {step.label}
                      </p>
                      {step.time && step.active && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(step.time)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Drawer Footer Actions ── */}
        {canUpdateStatus && handleStatusChange && (
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Actions</p>
            <div className="flex gap-2 flex-wrap">
              {currentStatus === 'open' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('in_progress')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
                >
                  <Sparkles size={12} /> Start Progress
                </button>
              )}
              {currentStatus === 'in_progress' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('resolved')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                >
                  <CheckCircle2 size={12} /> Mark Resolved
                </button>
              )}
              {currentStatus === 'resolved' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('closed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-xs"
                >
                  <ShieldCheck size={12} /> Close Issue
                </button>
              )}
              {currentStatus !== 'open' && currentStatus !== 'closed' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('open')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-all"
                >
                  Re-open
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
