import { useState, useEffect } from 'react';
import {
    Bell, Plus, Eye, Trash2, Clock, RefreshCw,
    Loader2, ChevronLeft, ChevronRight, MoreHorizontal,
    Activity, CheckCircle, TrendingUp, Users
} from 'lucide-react';

import { getAlerts } from '../api/alerts/getAlerts';
import { cancelAlert } from '../api/alerts/cancelAlert';
import { isAdmin, isPersonnel } from '../utils/roles';
import CreateAlertModal from '../components/alerts/CreateAlertModal';
import AlertDetailModal from '../components/alerts/AlertDetailModal';

export default function EvacuationAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [createModal, setCreateModal] = useState(false);
    const [detailId, setDetailId] = useState(null);
    const [recentAlerts, setRecentAlerts] = useState([]);

    const canCreate = isAdmin() || isPersonnel();

    const fetchAlerts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAlerts(page);
            setAlerts(res.data);
            setPagination(res);
            if (page === 1) setRecentAlerts(res.data?.slice(0, 5) || []);
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

    const getUrgencyDot = (key) => {
        const map = {
            critical: 'bg-red-500',
            high:     'bg-orange-500',
            medium:   'bg-yellow-400',
            low:      'bg-green-500',
        };
        return map[key] || 'bg-slate-300';
    };

    /* Delivery stats derived from loaded alerts */
    const stats = (() => {
        if (!alerts.length) return { rate: 0, sent: 0, total: 0, failed: 0 };
        const total   = alerts.reduce((s, a) => s + (a.recipients_count || 0), 0);
        const sent    = alerts.filter(a => a.status === 'sent').reduce((s, a) => s + (a.recipients_count || 0), 0);
        const failed  = alerts.filter(a => a.status === 'failed').length;
        const rate    = total > 0 ? Math.round((sent / total) * 100) : 0;
        return { rate, sent, total, failed };
    })();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Header ── */}
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

            {/* ── Analytics row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Delivery rate card */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Activity size={14} className="text-blue-400" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Delivery Rate
                            </p>
                        </div>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className="text-4xl font-black leading-none">{stats.rate}%</p>
                        <p className="text-xs text-slate-400 mb-1 font-medium">
                            {stats.sent} / {stats.total} recipients
                        </p>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${stats.rate}%` }}
                        />
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<CheckCircle size={14} className="text-green-600" />}
                        iconBg="bg-green-50"
                        label="Sent"
                        value={alerts.filter(a => a.status === 'sent').length}
                    />
                    <StatCard
                        icon={<Clock size={14} className="text-blue-600" />}
                        iconBg="bg-blue-50"
                        label="Scheduled"
                        value={alerts.filter(a => a.status === 'scheduled').length}
                    />
                    <StatCard
                        icon={<TrendingUp size={14} className="text-orange-600" />}
                        iconBg="bg-orange-50"
                        label="Total"
                        value={pagination.total || 0}
                    />
                    <StatCard
                        icon={<Users size={14} className="text-violet-600" />}
                        iconBg="bg-violet-50"
                        label="Recipients"
                        value={stats.total}
                    />
                </div>

                {/* Recent activity */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Recent Activity
                    </p>
                    {recentAlerts.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">No recent alerts.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {recentAlerts.map(alert => (
                                <div key={alert.notif_id} className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getUrgencyDot(alert.urgency_level?.urgency_key)}`} />
                                    <p className="text-xs text-slate-600 font-medium truncate flex-1 leading-tight">
                                        {alert.message}
                                    </p>
                                    <span className={`flex-shrink-0 px-2 py-0.5 text-[8px] font-black rounded-full border ${getStatusBadge(alert.status)}`}>
                                        {alert.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
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

/* ── Tiny stat card ── */
function StatCard({ icon, iconBg, label, value }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
                {icon}
            </div>
            <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
    );
}