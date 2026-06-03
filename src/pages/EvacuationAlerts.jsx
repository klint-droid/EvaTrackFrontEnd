import { useState, useEffect } from 'react';
import {
    Bell, Plus, Eye, Trash2, Clock, RefreshCw,
    Loader2, ChevronLeft, ChevronRight, MoreHorizontal,
    Activity, CheckCircle, TrendingUp, Users, Search, Filter, Radio, MessageSquare, Smartphone
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
    
    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');

    const canCreate = isAdmin() || isPersonnel();

    const fetchAlerts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAlerts(page);
            setAlerts(res.data || []);
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

    const getStatusStyle = (status) => {
        const map = {
            sent:      'bg-emerald-500/10 border-emerald-500/25 text-emerald-600',
            failed:    'bg-rose-500/10 border-rose-500/25 text-rose-600',
            scheduled: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600',
            pending:   'bg-amber-500/10 border-amber-500/25 text-amber-700',
            cancelled: 'bg-slate-500/10 border-slate-500/20 text-slate-500',
        };
        return map[status] || map.pending;
    };

    const getUrgencyStyle = (key) => {
        const map = {
            critical: 'bg-red-500/10 border-red-500/25 text-red-600 font-extrabold',
            high:     'bg-orange-500/10 border-orange-500/25 text-orange-600',
            medium:   'bg-yellow-500/10 border-yellow-500/25 text-yellow-700',
            low:      'bg-green-500/10 border-green-500/25 text-green-600',
        };
        return map[key] || map.low;
    };

    const getUrgencyDot = (key) => {
        const map = {
            critical: 'bg-red-500 shadow-lg shadow-red-500/40 animate-pulse',
            high:     'bg-orange-500 shadow-md shadow-orange-500/30 animate-pulse',
            medium:   'bg-yellow-400',
            low:      'bg-green-500',
        };
        return map[key] || 'bg-slate-300';
    };

    // Derived statistics
    const stats = (() => {
        if (!alerts.length) return { rate: 0, sent: 0, total: 0, failed: 0 };
        const total   = alerts.reduce((s, a) => s + (a.recipients_count || 0), 0);
        const sent    = alerts.filter(a => a.status === 'sent').reduce((s, a) => s + (a.recipients_count || 0), 0);
        const failed  = alerts.filter(a => a.status === 'failed').length;
        const rate    = total > 0 ? Math.round((sent / total) * 100) : 0;
        return { rate, sent, total, failed };
    })();

    // Client-side filtering for search & filters
    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              alert.notif_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUrgency = !urgencyFilter || alert.urgency_level?.urgency_key === urgencyFilter;
        const matchesStatus = !statusFilter || alert.status === statusFilter;
        const matchesChannel = !channelFilter || alert.channel === channelFilter || (channelFilter === 'both' && alert.channel === 'both');

        return matchesSearch && matchesUrgency && matchesStatus && matchesChannel;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Emergency Operations Center</h1>
                    <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mt-1">
                        Broadcast command, status monitor, and log dispatch control
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 duration-200"
                    >
                        <Plus size={14} strokeWidth={3.5} />
                        <span>Create Broadcast Alert</span>
                    </button>
                )}
            </div>

            {/* ── Operations Analytics dashboard ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Modern HSL glowing delivery card */}
                <div className="bg-slate-950 rounded-3xl p-6 text-white space-y-4 border border-slate-900 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <Activity size={14} className="text-blue-400" />
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Network Delivery Success
                            </p>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            active gateway
                        </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-3">
                        <p className="text-5xl font-black leading-none font-mono tracking-tight">{stats.rate}%</p>
                        <p className="text-xs text-slate-400 font-bold">
                            {stats.sent} / {stats.total} total reached
                        </p>
                    </div>

                    <div className="space-y-1.5 mt-2">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/30"
                                style={{ width: `${stats.rate}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-black tracking-wider text-slate-500 uppercase">
                            <span>0% reached</span>
                            <span>100% target</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={<CheckCircle size={15} className="text-emerald-500" />}
                        iconBg="bg-emerald-500/10 border border-emerald-500/20"
                        label="Active Broadcasts"
                        value={alerts.filter(a => a.status === 'sent').length}
                    />
                    <StatCard
                        icon={<Clock size={15} className="text-indigo-500" />}
                        iconBg="bg-indigo-500/10 border border-indigo-500/20"
                        label="Scheduled Alerts"
                        value={alerts.filter(a => a.status === 'scheduled').length}
                    />
                    <StatCard
                        icon={<TrendingUp size={15} className="text-amber-500" />}
                        iconBg="bg-amber-500/10 border border-amber-500/20"
                        label="Total Logs"
                        value={pagination.total || 0}
                    />
                    <StatCard
                        icon={<Users size={15} className="text-sky-500" />}
                        iconBg="bg-sky-500/10 border border-sky-500/20"
                        label="Recipients Reach"
                        value={stats.total}
                    />
                </div>

                {/* Pulsing Command Center Activity Feed */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Command Transmission Log
                        </p>
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            live stream
                        </span>
                    </div>
                    {recentAlerts.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No transmissions logged.</p>
                    ) : (
                        <div className="space-y-3.5 mt-2 overflow-y-auto max-h-[140px] pr-1">
                            {recentAlerts.map(alert => (
                                <div key={alert.notif_id} className="flex items-start gap-3 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getUrgencyDot(alert.urgency_level?.urgency_key)}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-700 font-semibold truncate leading-snug">
                                            {alert.message}
                                        </p>
                                        <span className="text-[8px] font-mono text-slate-400">ID: {alert.notif_id}</span>
                                    </div>
                                    <span className={`flex-shrink-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full border ${getStatusStyle(alert.status)}`}>
                                        {alert.status === 'cancelled' ? 'stopped' : alert.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Command & Filter Control Toolbar ── */}
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search broadcast logs..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-slate-700 placeholder-slate-400"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                    {/* Urgency */}
                    <div className="flex items-center gap-1.5">
                        <Filter size={11} className="text-slate-400" />
                        <select
                            value={urgencyFilter}
                            onChange={e => setUrgencyFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-600"
                        >
                            <option value="">All Urgencies</option>
                            <option value="critical">Critical Only</option>
                            <option value="high">High Only</option>
                            <option value="medium">Medium Only</option>
                            <option value="low">Low Only</option>
                        </select>
                    </div>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-600"
                    >
                        <option value="">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Stopped</option>
                    </select>

                    {/* Channel */}
                    <select
                        value={channelFilter}
                        onChange={e => setChannelFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-600"
                    >
                        <option value="">All Channels</option>
                        <option value="sms">SMS Text</option>
                        <option value="push">Push Notification</option>
                        <option value="both">Both (SMS + Push)</option>
                    </select>

                    {/* Reset */}
                    {(searchTerm || urgencyFilter || statusFilter || channelFilter) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setUrgencyFilter('');
                                setStatusFilter('');
                                setChannelFilter('');
                            }}
                            className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-wider transition-all pl-2"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* ── Transmission Data Table ── */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden border-b-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {['Broadcast Message', 'Urgency', 'Delivery Channel', 'Total Targets', 'Delivery Status', 'Logged At', 'Command'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-slate-300" size={32} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">querying system registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        No matching dispatches found.
                                    </td>
                                </tr>
                            ) : filteredAlerts.map(alert => (
                                <tr key={alert.notif_id} className="hover:bg-slate-50/20 transition-colors group">
                                    <td className="px-6 py-4.5 max-w-xs">
                                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                                            {alert.message}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-mono mt-1 font-bold">
                                            UID: {alert.notif_id}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${getUrgencyStyle(alert.urgency_level?.urgency_key)}`}>
                                            {alert.urgency_level?.urgency_label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <div className="flex items-center gap-2">
                                            {alert.channel === 'push' && (
                                                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                                                    <Smartphone size={11} className="text-blue-500" />
                                                    <span className="text-[9px] font-bold uppercase">Push</span>
                                                </div>
                                            )}
                                            {alert.channel === 'sms' && (
                                                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                                                    <MessageSquare size={11} className="text-indigo-500" />
                                                    <span className="text-[9px] font-bold uppercase">SMS</span>
                                                </div>
                                            )}
                                            {alert.channel === 'both' && (
                                                <div className="flex items-center gap-1.5 text-slate-700 bg-blue-50/60 px-2 py-0.5 rounded-lg border border-blue-100">
                                                    <Radio size={11} className="text-blue-600" />
                                                    <span className="text-[9px] font-extrabold uppercase">Push+SMS</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                                                <Bell size={10} className="text-blue-600" />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 font-mono">
                                                {alert.recipients_count || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <div>
                                            <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${getStatusStyle(alert.status)}`}>
                                                {alert.status === 'cancelled' ? 'stopped' : alert.status}
                                            </span>
                                            {alert.is_recurring && (
                                                <p className={`text-[8px] font-extrabold mt-1.5 flex items-center gap-1 ${
                                                    alert.status === 'cancelled' || alert.status === 'failed'
                                                        ? 'text-slate-400'
                                                        : 'text-blue-600'
                                                }`}>
                                                    {alert.status !== 'cancelled' && alert.status !== 'failed' ? (
                                                        <RefreshCw size={8} className="animate-spin duration-1000" />
                                                    ) : (
                                                        <RefreshCw size={8} />
                                                    )}
                                                    <span className="uppercase tracking-widest">{alert.recurrence_type}</span>
                                                </p>
                                            )}
                                            {alert.status === 'scheduled' && alert.scheduled_at && (
                                                <p className="text-[9px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                                                    <Clock size={8} />
                                                    {new Date(alert.scheduled_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5 text-[10px] font-semibold text-slate-500">
                                        {alert.created_at
                                            ? new Date(alert.created_at).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <button
                                                onClick={() => setDetailId(alert.notif_id)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow"
                                                title="View Details & Logs"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            {alert.status === 'scheduled' && canCreate && (
                                                <button
                                                    onClick={() => handleCancel(alert.notif_id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow"
                                                    title="Cancel Dispatch"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="group-hover:hidden text-slate-300">
                                            <MoreHorizontal size={14} className="ml-auto" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Page {pagination.current_page || 1} of {pagination.last_page || 1}
                        {' · '}
                        {pagination.total || 0} total records
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={!pagination.prev_page_url}
                            onClick={() => fetchAlerts(pagination.current_page - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            disabled={!pagination.next_page_url}
                            onClick={() => fetchAlerts(pagination.current_page + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <ChevronRight size={14} />
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

/* ── High-UX stat card ── */
function StatCard({ icon, iconBg, label, value }) {
    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow hover:-translate-y-0.5 group">
            <div className="flex items-center justify-between">
                <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                    {icon}
                </div>
            </div>
            <div className="mt-3">
                <p className="text-2xl font-black text-slate-800 leading-none font-mono tracking-tight">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
            </div>
        </div>
    );
}