import React, { useState, useEffect } from 'react';
import {
    X, Megaphone, Bell, CheckCircle2, XCircle, Clock,
    RefreshCw, User, Users, Radio, MapPin, AlertTriangle,
    ExternalLink, Hash, Calendar, Sparkles, Ban
} from 'lucide-react';
import { getAlertDetail } from '../../api/alerts/getAlertDetail';

const formatRecurrenceLabel = (alert) => {
    if (!alert?.is_recurring) return '';
    if (alert.recurrence_type === 'custom') {
        if (alert.recurrence_interval_value && alert.recurrence_interval_unit) {
            return `Every ${alert.recurrence_interval_value} ${alert.recurrence_interval_unit}`;
        }
        if (alert.recurrence_interval_minutes) {
            const mins = alert.recurrence_interval_minutes;
            if (mins % 1440 === 0) return `Every ${mins / 1440} days`;
            if (mins % 60 === 0) return `Every ${mins / 60} hours`;
            return `Every ${mins} mins`;
        }
        return 'Custom Interval';
    }
    return alert.recurrence_type ? alert.recurrence_type.toUpperCase() : 'RECURRING';
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

const statusConfig = {
    sent: {
        label: 'Delivered',
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40',
        icon: CheckCircle2
    },
    scheduled: {
        label: 'Scheduled',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40',
        icon: Clock
    },
    pending: {
        label: 'Sending...',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/40',
        icon: RefreshCw
    },
    failed: {
        label: 'Failed',
        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/40',
        icon: XCircle
    },
    completed: {
        label: 'Completed',
        color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-400/40',
        icon: CheckCircle2
    },
    cancelled: {
        label: 'Stopped',
        color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-400/40',
        icon: Ban
    },
};

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

export default function AlertDetailModal({
    notifId,
    onClose,
    canManage = false,
    onCancelRecurring
}) {
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!notifId) {
            setAlert(null);
            return;
        }
        setLoading(true);
        getAlertDetail(notifId)
            .then(res => setAlert(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [notifId]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!notifId) return null;

    const st = statusConfig[alert?.status] || statusConfig.sent;
    const StatusIcon = st.icon;

    // Delivery stats
    const logStats = alert?.logs ? {
        sent: alert.logs.filter(l => l.status === 'sent').length,
        failed: alert.logs.filter(l => l.status !== 'sent').length,
        total: alert.logs.length,
    } : null;

    const cleanMessage = alert?.message
        ? alert.message.split('\n\nEvent:')[0].split('\n\nCenter:')[0].split('\n\nCenters:')[0].split('\n\nLink:')[0].split('\n\nhttp')[0].trim()
        : '';

    const publicOrigin = typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://100.73.14.100:5173';

    const portalLink = alert?.center?.evacuation_center_id || alert?.evacuation_center_id
        ? `${publicOrigin}/evacuation-centers/${alert?.center?.evacuation_center_id || alert?.evacuation_center_id}`
        : `${publicOrigin}/public`;

    const targetLabel = alert?.target_filter === 'evacuated'
        ? 'Evacuated Households'
        : alert?.target_filter === 'not_evacuated'
            ? 'Non-Evacuated'
            : 'Public Broadcast';

    return (
        <>
            {/* Mobile-only translucent backdrop */}
            <div
                className="fixed inset-0 top-14 bg-black/20 dark:bg-black/40 z-30 md:hidden transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Jira-Style Inline Right Detail Panel (matches Issue Reports ViewDetailsModal) */}
            <aside className="fixed inset-x-0 top-14 bottom-0 z-40 md:sticky md:top-0 md:inset-auto md:h-[calc(100vh-3.5rem)] w-full md:w-[380px] xl:w-[440px] shrink-0 bg-white dark:bg-[#0f1623] border-l border-slate-200 dark:border-[#1e2a3d] shadow-xl md:shadow-none flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden text-left">

                {/* ── Drawer Top Bar (No UID) ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold min-w-0">
                        <Megaphone size={14} className="text-blue-500 flex-shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">Alert Details</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors"
                            title="Close details"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-5 space-y-6 animate-pulse">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : !alert ? (
                        <div className="p-8 text-center">
                            <AlertTriangle size={32} className="mx-auto text-rose-400 mb-2" />
                            <p className="text-xs font-bold text-rose-500">Failed to load alert details.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Directive Title & Badges Section */}
                            <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-[#1e2a3d]">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        <Megaphone size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                                            {cleanMessage || 'Evacuation Directive'}
                                        </h2>
                                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border ${st.color}`}>
                                                <StatusIcon size={11} className={alert.status === 'pending' ? 'animate-spin' : ''} />
                                                <span>{st.label}</span>
                                            </span>

                                            {/* Evacuation Alert Pill */}
                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/40">
                                                🚨 Evacuation Alert
                                            </span>

                                            {/* Channel */}
                                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-400/30">
                                                {alert.channel?.toUpperCase() || 'BROADCAST'}
                                            </span>

                                            {/* Recurrence Pill */}
                                            {alert.is_recurring && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded-md border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-400/40">
                                                    <RefreshCw size={9} className={alert.status === 'scheduled' ? 'animate-spin' : ''} />
                                                    <span>{formatRecurrenceLabel(alert)}</span>
                                                </span>
                                            )}

                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                                                {formatTimeAgo(alert.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Detail Fields ── */}
                            <div className="px-5 py-4 space-y-5">

                                {/* Quick facts 2x2 grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Target Audience" icon={Users}>
                                        <span className="text-xs font-semibold">{targetLabel}</span>
                                    </Field>
                                    <Field label="Channel" icon={Radio}>
                                        <span className="text-xs font-bold uppercase">{alert.channel || 'All'}</span>
                                    </Field>
                                    <Field label="Disaster Event" icon={AlertTriangle}>
                                        {alert.event ? (
                                            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                                                {alert.event.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">General Advisory</span>
                                        )}
                                    </Field>
                                    <Field label="Recipients" icon={Users}>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <Bell size={10} />
                                            </div>
                                            <span className="font-mono text-xs font-bold">
                                                {alert.recipients_count || alert.recipients?.length || 0} households
                                            </span>
                                        </div>
                                    </Field>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

                                {/* Station / Center Scope */}
                                <Field label="Evacuation Center" icon={MapPin}>
                                    {(alert.center?.evacuation_center_id || alert.evacuation_center_id) ? (
                                        <a
                                            href={`/evacuation-centers/${alert.center?.evacuation_center_id || alert.evacuation_center_id}`}
                                            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                        >
                                            <span>{alert.center?.name || alert.evacuation_center?.name || 'Assigned Center'}</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    ) : (
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            All Evacuation Centers (General Dispatch)
                                        </span>
                                    )}
                                </Field>

                                {/* Sender */}
                                <Field label="Dispatched By" icon={User}>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                                            {(alert.sender?.name || alert.sender?.first_name || 'EA').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {alert.sender?.name || 'Evacuation Admin'}
                                            </p>
                                            {alert.sender?.email && (
                                                <p className="text-[10px] text-slate-400">{alert.sender.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </Field>

                                {/* Timing Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Dispatched At" icon={Clock}>
                                        <span className="text-xs">{formatDate(alert.created_at)}</span>
                                    </Field>
                                    {alert.scheduled_at && (
                                        <Field label="Scheduled For" icon={Calendar}>
                                            <span className="text-xs">{formatDate(alert.scheduled_at)}</span>
                                        </Field>
                                    )}
                                    {alert.last_sent_at && (
                                        <Field label="Last Sent" icon={CheckCircle2}>
                                            <span className="text-xs">{formatDate(alert.last_sent_at)}</span>
                                        </Field>
                                    )}
                                    {alert.is_recurring && alert.recurrence_end_at && (
                                        <Field label="Recurrence Ends" icon={RefreshCw}>
                                            <span className="text-xs">{formatDate(alert.recurrence_end_at)}</span>
                                        </Field>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

                                {/* Broadcast Directive Message Card */}
                                <div className="space-y-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Broadcast Directive Message
                                    </span>
                                    <div className="bg-slate-50 dark:bg-[#141b29] border border-slate-200 dark:border-[#1e2a3d] rounded-xl p-4 space-y-3">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                                            {cleanMessage}
                                        </p>
                                        <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-col gap-1 text-xs">
                                            <span className="font-extrabold text-slate-700 dark:text-slate-200">
                                                As of {formatDate(alert.created_at)} Announcement
                                            </span>
                                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                                Event: <span className="text-slate-800 dark:text-slate-100 font-bold">{alert.event?.name || 'General Emergency'}</span>
                                            </span>
                                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                                Centers: <span className="text-slate-800 dark:text-slate-100 font-bold">{alert.center?.name || 'All Evacuation Centers'}</span>
                                            </span>
                                            <a
                                                href={portalLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 truncate mt-1 inline-flex items-center gap-1"
                                            >
                                                <span className="truncate">{portalLink}</span>
                                                <ExternalLink size={11} className="flex-shrink-0" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100 dark:border-[#1e2a3d]" />

                                {/* Delivery Logs */}
                                {alert.logs && alert.logs.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Radio size={11} /> Delivery Logs
                                            </span>
                                            <div className="flex items-center gap-3 text-[10px] font-black">
                                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 size={11} /> {logStats?.sent || 0} sent
                                                </span>
                                                {(logStats?.failed || 0) > 0 && (
                                                    <span className="text-rose-500 flex items-center gap-1">
                                                        <XCircle size={11} /> {logStats.failed} failed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    (logStats?.failed || 0) > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.round(((logStats?.sent || 0) / (logStats?.total || 1)) * 100)}%` }}
                                            />
                                        </div>

                                        {/* Household Log Rows */}
                                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                            {alert.logs.map(log => (
                                                <div
                                                    key={log.log_id}
                                                    className="flex items-center justify-between bg-slate-50 dark:bg-[#141b29] border border-slate-200/70 dark:border-[#1e2a3d] rounded-xl px-3 py-2 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {log.status === 'sent' ? (
                                                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                                                        ) : (
                                                            <XCircle size={13} className="text-rose-500 flex-shrink-0" />
                                                        )}
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 truncate">
                                                            {log.household_id || 'Household'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-[9px] font-black uppercase text-slate-400">
                                                            {log.channel}
                                                        </span>
                                                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase ${
                                                            log.status === 'sent'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/40'
                                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/40'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </div>

                {/* ── Drawer Footer Actions ── */}
                {alert && alert.is_recurring && alert.status === 'scheduled' && canManage && onCancelRecurring && (
                    <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d] bg-slate-50/80 dark:bg-[#141b29]/80 backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Directive Actions</p>
                        <button
                            type="button"
                            onClick={() => onCancelRecurring(alert.notif_id)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
                        >
                            <Ban size={13} />
                            <span>Stop Recurring Broadcast</span>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
