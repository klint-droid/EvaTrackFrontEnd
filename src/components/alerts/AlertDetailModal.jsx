import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
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

    const getStatusColor = (status) => {
        const map = {
            sent:      'bg-green-50 text-green-600 border-green-100',
            failed:    'bg-red-50 text-red-600 border-red-100',
            scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
            pending:   'bg-yellow-50 text-yellow-600 border-yellow-100',
            cancelled: 'bg-slate-50 text-slate-500 border-slate-100',
        };
        return map[status] || map.pending;
    };

    const getUrgencyColor = (key) => {
        const map = {
            critical: 'bg-red-50 text-red-600 border-red-100',
            high:     'bg-orange-50 text-orange-600 border-orange-100',
            medium:   'bg-yellow-50 text-yellow-600 border-yellow-100',
            low:      'bg-green-50 text-green-600 border-green-100',
        };
        return map[key] || map.low;
    };

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-800">Alert Details</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-slate-300" size={28} />
                        </div>
                    ) : !alert ? (
                        <p className="text-red-500 text-sm">Failed to load alert.</p>
                    ) : (
                        <>
                            {/* Meta */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2.5 py-1 text-[9px] font-black rounded-full border ${getStatusColor(alert.status)}`}>
                                    {alert.status?.toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-1 text-[9px] font-black rounded-full border ${getUrgencyColor(alert.urgency_level?.urgency_key)}`}>
                                    {alert.urgency_level?.urgency_label}
                                </span>
                                <span className="px-2.5 py-1 text-[9px] font-black rounded-full border bg-slate-50 text-slate-500 border-slate-100">
                                    {alert.channel?.toUpperCase()}
                                </span>
                                <span className="px-2.5 py-1 text-[9px] font-black rounded-full border bg-slate-50 text-slate-500 border-slate-100">
                                    {alert.target_filter?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            {/* Message */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</p>
                                <p className="text-sm text-slate-700">{alert.message}</p>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sent By</p>
                                    <p className="font-bold text-slate-700">{alert.sender?.name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipients</p>
                                    <p className="font-bold text-slate-700">{alert.recipients?.length || 0} households</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</p>
                                    <p className="font-bold text-slate-700">
                                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : '—'}
                                    </p>
                                </div>
                                {alert.scheduled_at && (
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheduled At</p>
                                        <p className="font-bold text-slate-700">
                                            {new Date(alert.scheduled_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Logs */}
                            {alert.logs?.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Delivery Logs ({alert.logs.length})
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {alert.logs.map(log => (
                                            <div
                                                key={log.log_id}
                                                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {log.status === 'sent'
                                                        ? <CheckCircle size={13} className="text-green-500" />
                                                        : <XCircle size={13} className="text-red-500" />
                                                    }
                                                    <span className="text-xs font-medium text-slate-600">
                                                        {log.household_id}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">
                                                        {log.channel}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${getStatusColor(log.status)}`}>
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
            </div>
        </div>,
        document.body
    );
}