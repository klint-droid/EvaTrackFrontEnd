import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ExternalLink, Package, Users, MapPin, Clock, Activity,
  CheckCircle2, AlertTriangle, ArrowRight, User, Calendar,
  Droplet, Utensils, HeartPulse, Home, Box, Hash
} from 'lucide-react';

import JiraActionMenu from '../ui/JiraActionMenu';

const STATUS_OPTIONS = [
  { key: 'pending',      label: 'Incoming',       color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40' },
  { key: 'acknowledged', label: 'In Progress',     color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40' },
  { key: 'approved',     label: 'In Review',       color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-400/40' },
  { key: 'rejected',     label: 'Rejected',        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/40' },
  { key: 'delivered',    label: 'Done',            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40' },
];

const getResourceIcon = (type = '') => {
  const l = type.toLowerCase();
  if (l.includes('water') || l.includes('drink')) return <Droplet size={15} className="text-sky-500" />;
  if (l.includes('food') || l.includes('rice') || l.includes('meal')) return <Utensils size={15} className="text-amber-500" />;
  if (l.includes('med') || l.includes('aid') || l.includes('health')) return <HeartPulse size={15} className="text-rose-500" />;
  if (l.includes('tent') || l.includes('blanket') || l.includes('shelter')) return <Home size={15} className="text-indigo-500" />;
  return <Box size={15} className="text-slate-400" />;
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatTimeAgo = (d) => {
  if (!d) return '';
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const urgencyConfig = {
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

export default function ViewRequestDetailsModal({
  request,
  onClose,
  getUrgencyClass,
  getStatusClass,
  canUpdateStatus,
  handleStatusChange,
  handleDelete
}) {
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (request) setCurrentStatus(request.status?.status_key || request.status || 'pending');
  }, [request]);

  if (!request) return null;

  const title = (request.resource_type && request.resource_type !== '/')
    ? request.resource_type
    : (request.request_type ? `${request.request_type} Request` : 'Resource Request');

  const shortId = request.request_id?.slice(-8) || request.request_id || '—';
  const urgencyKey = request.urgency_level?.urgency_key || 'low';
  const urg = urgencyConfig[urgencyKey] || urgencyConfig.low;
  const statusObj = STATUS_OPTIONS.find(s => s.key === currentStatus) || STATUS_OPTIONS[0];
  const r = request.requester;
  const requesterName = r?.name?.trim()
    || [r?.first_name, r?.last_name].filter(Boolean).join(' ')
    || r?.email?.split('@')[0]
    || 'Unknown Officer';

  const initials = (
    r?.first_name?.[0] ||
    r?.name?.split(' ')?.[0]?.[0] ||
    r?.email?.[0] ||
    'U'
  ).toUpperCase();

  const onStatusSelect = async (newStatus) => {
    setCurrentStatus(newStatus);
    setStatusChanging(true);
    if (handleStatusChange) await handleStatusChange(request.request_id, newStatus);
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
            <CheckCircle2 size={14} className="text-blue-500" />
            <span>Resource Request</span>
            <span className="font-mono font-black text-slate-400 dark:text-slate-500">/ RR-{shortId.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <JiraActionMenu
              itemId={request.request_id}
              itemKey={request.request_id}
              currentStatus={currentStatus}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={canUpdateStatus && handleStatusChange ? onStatusSelect : undefined}
              onDelete={handleDelete ? () => { onClose(); handleDelete(request.request_id); } : undefined}
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
                {request.request_type === 'personnel' ? <Users size={18} className="text-blue-500" /> : getResourceIcon(request.resource_type)}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white capitalize leading-snug">
                  {title}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Status badge/dropdown */}
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

                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatTimeAgo(request.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail Fields ── */}
          <div className="px-5 py-4 space-y-5">

            {/* Quick facts row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Request ID" icon={Hash}>
                <span className="font-mono text-xs">{request.request_id || '—'}</span>
              </Field>
              <Field label="Type" icon={Package}>
                <span className="capitalize">{request.request_type || 'Resource'}</span>
              </Field>
              <Field label="Quantity" icon={Activity}>
                {request.quantity
                  ? <span className="font-black text-blue-600 dark:text-blue-400">{Number(request.quantity).toLocaleString()} <span className="text-xs font-semibold text-slate-500">units</span></span>
                  : '—'}
              </Field>
              <Field label="Date Filed" icon={Calendar}>
                <span className="text-xs">{formatDate(request.created_at)}</span>
              </Field>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Location */}
            <Field label="Evacuation Center" icon={MapPin}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{request.center?.name || '—'}</span>
              </div>
            </Field>

            {/* Requester */}
            <Field label="Requested By" icon={User}>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{requesterName}</p>
                  {request.requester?.email && (
                    <p className="text-[10px] text-slate-400">{request.requester.email}</p>
                  )}
                </div>
              </div>
            </Field>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

            {/* Description */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Description
              </span>
              <div className="bg-slate-50 dark:bg-[#1e2a3d] border border-slate-100 dark:border-[#263047] rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                {request.description || <span className="italic text-slate-400">No description provided.</span>}
              </div>
            </div>

            {/* Status History / Timeline placeholder */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock size={11} /> Timeline
              </span>
              <div className="space-y-2.5">
                {[
                  { label: 'Request filed', time: request.created_at, active: true },
                  { label: 'Acknowledged by admin', time: currentStatus !== 'pending' ? request.updated_at : null, active: ['acknowledged','approved','delivered'].includes(currentStatus) },
                  { label: 'Approved & preparing', time: null, active: ['approved','delivered'].includes(currentStatus) },
                  { label: 'Delivered to center', time: null, active: currentStatus === 'delivered' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${step.active ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
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
              {currentStatus === 'pending' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('acknowledged')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                >
                  <ArrowRight size={12} /> Acknowledge
                </button>
              )}
              {currentStatus === 'acknowledged' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('approved')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                >
                  <ArrowRight size={12} /> Approve
                </button>
              )}
              {currentStatus === 'approved' && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('delivered')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                >
                  <CheckCircle2 size={12} /> Mark Delivered
                </button>
              )}
              {!['delivered', 'rejected'].includes(currentStatus) && (
                <button
                  type="button"
                  onClick={() => onStatusSelect('rejected')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                >
                  Reject
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
