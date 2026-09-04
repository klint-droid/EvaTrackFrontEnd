import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, Clock, Loader2, RefreshCw, User, Hash, Radio } from 'lucide-react';
import { getAlertDetail } from '../../api/alerts/getAlertDetail';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';

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
            sent:      'success',
            failed:    'danger',
            scheduled: 'primary',
            pending:   'warning',
            cancelled: 'default',
        };
        return map[status] || 'warning';
    };

    const urgencyStyle = (key) => {
        const map = {
            critical: 'danger',
            high:     'warning',
            medium:   'warning',
            low:      'success',
        };
        return map[key] || 'success';
    };


    /* delivery log counts */
    const logStats = alert?.logs ? {
        sent:   alert.logs.filter(l => l.status === 'sent').length,
        failed: alert.logs.filter(l => l.status !== 'sent').length,
        total:  alert.logs.length,
    } : null;

    return (
        <Modal 
            isOpen={true} 
            onClose={onClose} 
            title={
                <div>
                    Alert Details
                    {alert && <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{alert.notif_id}</span>}
                </div>
            }
        >
            <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-2">

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-slate-300" size={28} />
                        </div>
                    ) : !alert ? (
                        <p className="text-sm text-red-500 py-4 text-center">Failed to load alert details.</p>
                    ) : (
                        <>
                            {/* Badges row */}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={statusStyle(alert.status)}>
                                    {alert.status === 'cancelled' ? 'stopped' : alert.status}
                                </Badge>
                                <Badge variant="danger">
                                    🚨 EVACUATION ALERT
                                </Badge>
                                <Badge variant="default">
                                    {alert.channel?.toUpperCase()}
                                </Badge>
                                {alert.target_filter && (
                                    <Badge variant="default">
                                        {alert.target_filter.replace('_', ' ')}
                                    </Badge>
                                )}
                                {alert.is_recurring && (
                                    <Badge variant="primary">
                                        <RefreshCw size={10} className="inline mr-1" />
                                        {alert.recurrence_type}
                                    </Badge>
                                )}
                            </div>

                            {/* Message Card */}
                            {(() => {
                                const cleanMessage = alert.message
                                    ? alert.message.split('\n\nEvent:')[0].split('\n\nCenter:')[0].split('\n\nCenters:')[0].split('\n\nLink:')[0].split('\n\nhttp')[0].trim()
                                    : '';
                                const dateStr = alert.created_at
                                    ? new Date(alert.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
                                    : new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

                                return (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Broadcast Directive Message
                                        </p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                            {cleanMessage}
                                        </p>
                                        
                                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1 text-xs">
                                            <span className="font-extrabold text-slate-700 dark:text-slate-200">
                                                As of {dateStr} Announcement
                                            </span>
                                            <span className="font-bold text-slate-500">
                                                Event: <span className="text-slate-800 dark:text-slate-100 font-extrabold">{alert.event?.name || 'General Emergency Alert'}</span>
                                            </span>
                                            <span className="font-bold text-slate-500">
                                                {alert.center ? 'Center: ' : 'Centers: '}
                                                <span className="text-slate-800 dark:text-slate-100 font-extrabold">
                                                    {alert.center ? alert.center.name : 'All Evacuation Centers'}
                                                </span>
                                            </span>
                                            <a
                                                href={alert.center ? `http://100.73.14.100:5173/evacuation-centers/${alert.center.evacuation_center_id}` : `http://100.73.14.100:5173/public`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold text-blue-600 underline hover:text-blue-700 truncate mt-1"
                                            >
                                                {alert.center ? `http://100.73.14.100:5173/evacuation-centers/${alert.center.evacuation_center_id}` : `http://100.73.14.100:5173/public`}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })()}

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
                                {alert.is_recurring && alert.recurrence_end_at && (
                                    <MetaField
                                        icon={<RefreshCw size={12} className="text-slate-400" />}
                                        label="Ends Recurrence On"
                                        value={new Date(alert.recurrence_end_at).toLocaleString()}
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
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                                                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 py-2.5"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {log.status === 'sent'
                                                        ? <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                                                        : <XCircle size={13} className="text-red-400 flex-shrink-0" />
                                                    }
                                                    <div className="flex items-center gap-1.5">
                                                        <Hash size={10} className="text-slate-300" />
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
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
        </Modal>
    );
}


function MetaField({ icon, label, value }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                {icon}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
        </div>
    );
}