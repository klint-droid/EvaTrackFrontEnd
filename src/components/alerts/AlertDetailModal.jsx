import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, CheckCircle, XCircle, Clock, Loader2,
    RefreshCw, User, Hash, Radio
} from 'lucide-react';
import { getAlertDetail } from '../../api/alerts/getAlertDetail';

export default function AlertDetailModal({ notifId, onClose }) {
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAlertDetail(notifId)
            .then(res => setAlert(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [notifId]);

    const statusStyle = (status) => {
        const map = {
            sent:      'bg-green-50 text-green-600 border-green-200',
            failed:    'bg-red-50 text-red-600 border-red-200',
            scheduled: 'bg-blue-50 text-blue-600 border-blue-200',
            pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
            cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
        };
        return map[status] || map.pending;
    };

    const urgencyStyle = (key) => {
        const map = {
            critical: 'bg-red-50 text-red-600 border-red-200',
            high:     'bg-orange-50 text-orange-600 border-orange-200',
            medium:   'bg-yellow-50 text-yellow-700 border-yellow-200',
            low:      'bg-green-50 text-green-600 border-green-200',
        };
        return map[key] || map.low;
    };


    /* delivery log counts */
    const logStats = alert?.logs ? {
        sent:   alert.logs.filter(l => l.status === 'sent').length,
        failed: alert.logs.filter(l => l.status !== 'sent').length,
        total:  alert.logs.length,
    } : null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Alert Details</h2>
                        {alert && (
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{alert.notif_id}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="h-px bg-slate-100 mx-6" />

                {/* Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-slate-300" size={28} />
                        </div>
                    ) : !alert ? (
                        <p className="text-sm text-red-500 py-4 text-center">Failed to load alert details.</p>
                    ) : (
                        <>
                            {/* Badges row */}
                            <div className="flex flex-wrap gap-1.5">
                                <Badge cls={statusStyle(alert.status)}>
                                    {alert.status === 'cancelled' ? 'stopped' : alert.status}
                                </Badge>
                                <Badge cls={urgencyStyle(alert.urgency_level?.urgency_key)}>
                                    {alert.urgency_level?.urgency_label}
                                </Badge>
                                <Badge cls="bg-slate-100 text-slate-600 border-slate-200">
                                    {alert.channel?.toUpperCase()}
                                </Badge>
                                {alert.target_filter && (
                                    <Badge cls="bg-slate-100 text-slate-600 border-slate-200">
                                        {alert.target_filter.replace('_', ' ')}
                                    </Badge>
                                )}
                                {alert.is_recurring && (
                                    <Badge cls="bg-blue-50 text-blue-600 border-blue-200">
                                        <RefreshCw size={9} className="inline mr-1" />
                                        {alert.recurrence_type}
                                    </Badge>
                                )}
                            </div>

                            {/* Message */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Message
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed">{alert.message}</p>
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <MetaField
                                    icon={<User size={12} className="text-slate-400" />}
                                    label="Sent By"
                                    value={alert.sender?.name || '—'}
                                />
                                <MetaField
                                    icon={<Radio size={12} className="text-slate-400" />}
                                    label="Recipients"
                                    value={`${alert.recipients?.length || 0} households`}
                                />
                                <MetaField
                                    icon={<Clock size={12} className="text-slate-400" />}
                                    label="Created"
                                    value={alert.created_at ? new Date(alert.created_at).toLocaleString() : '—'}
                                />
                                {alert.scheduled_at && (
                                    <MetaField
                                        icon={<Clock size={12} className="text-slate-400" />}
                                        label="Scheduled"
                                        value={new Date(alert.scheduled_at).toLocaleString()}
                                    />
                                )}
                                {alert.last_sent_at && (
                                    <MetaField
                                        icon={<CheckCircle size={12} className="text-slate-400" />}
                                        label="Last Sent"
                                        value={new Date(alert.last_sent_at).toLocaleString()}
                                    />
                                )}
                            </div>

                            {/* Delivery logs */}
                            {alert.logs?.length > 0 && (
                                <div className="space-y-3">
                                    {/* Log summary bar */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Delivery Logs
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] font-bold">
                                            <span className="text-green-600 flex items-center gap-1">
                                                <CheckCircle size={10} /> {logStats.sent} sent
                                            </span>
                                            {logStats.failed > 0 && (
                                                <span className="text-red-500 flex items-center gap-1">
                                                    <XCircle size={10} /> {logStats.failed} failed
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delivery progress */}
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                logStats.failed > 0 ? 'bg-orange-400' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.round((logStats.sent / logStats.total) * 100)}%` }}
                                        />
                                    </div>

                                    {/* Log rows */}
                                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                                        {alert.logs.map(log => (
                                            <div
                                                key={log.log_id}
                                                className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {log.status === 'sent'
                                                        ? <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                                                        : <XCircle size={13} className="text-red-400 flex-shrink-0" />
                                                    }
                                                    <div className="flex items-center gap-1.5">
                                                        <Hash size={10} className="text-slate-300" />
                                                        <span className="text-xs font-medium text-slate-600">
                                                            {log.household_id}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                        {log.channel}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${statusStyle(log.status)}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function Badge({ cls, children }) {
    return (
        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${cls}`}>
            {children}
        </span>
    );
}

function MetaField({ icon, label, value }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                {icon}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-sm font-semibold text-slate-700">{value}</p>
        </div>
    );
}