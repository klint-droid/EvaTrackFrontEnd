import { useState, useEffect } from 'react';
import {
    Bell, Plus, Eye, Trash2, Clock, RefreshCw, 
    Loader2, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

import { getAlerts } from '../api/alerts/getAlerts';
import { cancelAlert } from '../api/alerts/cancelAlert';
import { isAdmin, isPersonnel } from '../utils/roles';  // ← fixed import
import CreateAlertModal from '../components/alerts/CreateAlertModal';
import AlertDetailModal from '../components/alerts/AlertDetailModal';

export default function EvacuationAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [createModal, setCreateModal] = useState(false);
    const [detailId, setDetailId] = useState(null);

    const canCreate = isAdmin() || isPersonnel();  

    const fetchAlerts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAlerts(page);
            setAlerts(res.data);
            setPagination(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const handleCancel = async (id) => {
        if (!confirm('Cancel this scheduled alert?')) return;
        try {
            await cancelAlert(id);
            fetchAlerts(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel alert.');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            sent:      'bg-green-50 text-green-600 border-green-100',
            failed:    'bg-red-50 text-red-600 border-red-100',
            scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
            pending:   'bg-yellow-50 text-yellow-600 border-yellow-100',
            cancelled: 'bg-slate-50 text-slate-500 border-slate-100',
        };
        return map[status] || map.pending;
    };

    const getUrgencyBadge = (key) => {
        const map = {
            critical: 'bg-red-50 text-red-600 border-red-100',
            high:     'bg-orange-50 text-orange-600 border-orange-100',
            medium:   'bg-yellow-50 text-yellow-600 border-yellow-100',
            low:      'bg-green-50 text-green-600 border-green-100',
        };
        return map[key] || map.low;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alerts</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                        Send and manage household alerts
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Create Alert
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {['Message', 'Urgency', 'Channel', 'Recipients', 'Status', 'Sent At', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-slate-300" size={32} />
                                    </td>
                                </tr>
                            ) : alerts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center text-slate-400 text-sm">
                                        No alerts yet.
                                    </td>
                                </tr>
                            ) : alerts.map(alert => (
                                <tr key={alert.notif_id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {alert.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            {alert.notif_id}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getUrgencyBadge(alert.urgency_level?.urgency_key)}`}>
                                            {alert.urgency_level?.urgency_label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 uppercase">
                                            {alert.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <Bell size={12} className="text-blue-400" />
                                            <span className="text-sm font-bold text-slate-700">
                                                {alert.recipients_count || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusBadge(alert.status)}`}>
                                            {alert.status}
                                        </span>
                                        {alert.is_recurring && (
                                            <p className="text-[9px] text-blue-500 mt-1 flex items-center gap-1">
                                                <RefreshCw size={9} />
                                                {alert.recurrence_type}
                                            </p>
                                        )}
                                        {alert.status === 'scheduled' && alert.scheduled_at && (
                                            <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock size={9} />
                                                {new Date(alert.scheduled_at).toLocaleString()}
                                            </p>
                                        )}
                                        {alert.last_sent_at && (
                                            <p className="text-[9px] text-slate-400 mt-1">
                                                Last: {new Date(alert.last_sent_at).toLocaleString()}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {alert.created_at
                                            ? new Date(alert.created_at).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setDetailId(alert.notif_id)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {alert.status === 'scheduled' && canCreate && (
                                                <button
                                                    onClick={() => handleCancel(alert.notif_id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Cancel Alert"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="group-hover:hidden text-slate-300">
                                            <MoreHorizontal size={16} className="ml-auto" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page {pagination.current_page || 1} of {pagination.last_page || 1}
                        {' · '}
                        {pagination.total || 0} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={!pagination.prev_page_url}
                            onClick={() => fetchAlerts(pagination.current_page - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={!pagination.next_page_url}
                            onClick={() => fetchAlerts(pagination.current_page + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {createModal && (
                <CreateAlertModal
                    onClose={() => setCreateModal(false)}
                    onSent={() => fetchAlerts(1)}
                />
            )}
            {detailId && (
                <AlertDetailModal
                    notifId={detailId}
                    onClose={() => setDetailId(null)}
                />
            )}
        </div>
    );
}