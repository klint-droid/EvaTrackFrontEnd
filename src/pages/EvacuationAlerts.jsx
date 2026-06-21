import { useState, useEffect } from 'react';
import {
    Bell, Plus, Eye, Trash2, Clock, RefreshCw,
    Loader2, ChevronLeft, ChevronRight, MoreHorizontal,
    TrendingUp, Search, Filter, CheckCircle2, Play, XCircle
} from 'lucide-react';

import { getAlerts } from '../api/alerts/getAlerts';
import { cancelAlert } from '../api/alerts/cancelAlert';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isPersonnel } from '../utils/roles';
import CreateAlertModal from '../components/alerts/CreateAlertModal';
import AlertDetailModal from '../components/alerts/AlertDetailModal';

export default function EvacuationAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [createModal, setCreateModal] = useState(false);
    const [detailId, setDetailId] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    
    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');

    const canCreate = isAdmin() || isPersonnel();

    const fetchAlerts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAlerts(page, selectedEvent || undefined);
            setAlerts(res.data || []);
            setPagination(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEvents().then(res => setEvents(res.data || []));
    }, []);

    useEffect(() => { fetchAlerts(); }, [selectedEvent]);

    const handleCancel = async (id) => {
        if (!confirm('Cancel this scheduled alert?')) return;
        try {
            await cancelAlert(id);
            fetchAlerts(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel alert.');
        }
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
        <div className="space-y-6 animate-in fade-in duration-500 text-left">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Evacuation Alerts</h1>
                    <p className="text-sm text-slate-500 font-medium">
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

            {/* ── Stats Cards Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Alerts Sent (24h) */}
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 flex flex-col gap-1 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Alerts Sent (24h)</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{stats.total.toLocaleString()}</p>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {stats.rate > 0 ? `${stats.rate}%` : '—'}
                        </span>
                    </div>
                </div>

                {/* Delivery Rate */}
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 flex flex-col gap-1 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Delivery Rate</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{stats.rate}%</p>
                        <span className="text-xs font-medium text-slate-400">Network avg</span>
                    </div>
                </div>

                {/* Active Broadcasts */}
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 flex flex-col gap-1 shadow-sm border-l-4 border-l-red-500">
                    <p className="text-xs font-bold text-slate-500">Active Broadcasts</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{alerts.filter(a => a.status === 'sent').length}</p>
                        <span className="text-xs font-medium text-slate-400">Ongoing scenarios</span>
                    </div>
                </div>
            </div>

            {/* ── Filter Toolbar ── */}
            <div className="bg-white border border-slate-200 px-5 py-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
                {/* Left: Filters label + Search */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-slate-700 flex-shrink-0">
                        <Filter size={14} />
                        <span className="text-sm font-bold">Filters</span>
                    </div>
                    <div className="relative flex-1 sm:max-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all text-slate-700 placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Right: Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:ml-auto">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Urgency:</span>
                        <select
                            value={urgencyFilter}
                            onChange={e => setUrgencyFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/15 transition-all text-slate-700 cursor-pointer"
                        >
                            <option value="">All Levels</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Event:</span>
                        <select
                            value={selectedEvent}
                            onChange={e => setSelectedEvent(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/15 transition-all text-slate-700 cursor-pointer"
                        >
                            <option value="">All Events</option>
                            {events.map(e => (
                                <option key={e.event_id} value={e.event_id}>
                                    {e.name}{e.ended_at ? ' (Ended)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/15 transition-all text-slate-700 cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="sent">Sent</option>
                            <option value="failed">Failed</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Stopped</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500">Channel:</span>
                        <select
                            value={channelFilter}
                            onChange={e => setChannelFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/15 transition-all text-slate-700 cursor-pointer"
                        >
                            <option value="">All Channels</option>
                            <option value="sms">SMS</option>
                            <option value="push">Push</option>
                            <option value="both">Both</option>
                        </select>
                    </div>

                    {(searchTerm || urgencyFilter || statusFilter || channelFilter || selectedEvent) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setUrgencyFilter('');
                                setStatusFilter('');
                                setChannelFilter('');
                                setSelectedEvent('');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-all px-2 py-1 hover:bg-blue-50 rounded-lg"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* ── Transmission Data Table ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900">
                                {['Broadcast Message', 'Event', 'Urgency', 'Target', 'Total Targets', 'Delivery Status', 'Timestamp', 'Command'].map(h => (
                                    <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-slate-300" size={32} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">querying system registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
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
                                        {alert.event ? (
                                            <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border bg-sky-500/10 border-sky-500/25 text-sky-600">
                                                {alert.event.name}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-slate-400 font-bold">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${getUrgencyStyle(alert.urgency_level?.urgency_key)}`}>
                                            {alert.urgency_level?.urgency_label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className="text-xs font-medium text-slate-700">
                                            {alert.center?.name || alert.evacuation_center?.name
                                                ? (alert.center?.name || alert.evacuation_center?.name)
                                                : alert.target_filter === 'evacuated'
                                                    ? 'Evacuated Households'
                                                    : alert.target_filter === 'not_evacuated'
                                                        ? 'Non-Evacuated'
                                                        : 'Public Broadcast'
                                            }
                                        </span>
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
                                            {alert.status === 'sent' && (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                                    <CheckCircle2 size={14} />
                                                    Delivered
                                                </span>
                                            )}
                                            {alert.status === 'scheduled' && (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                    <Clock size={14} />
                                                    Scheduled
                                                </span>
                                            )}
                                            {alert.status === 'pending' && (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                                    <Play size={14} className="fill-blue-600" />
                                                    Sending...
                                                </span>
                                            )}
                                            {alert.status === 'failed' && (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                                    <XCircle size={14} />
                                                    Failed
                                                </span>
                                            )}
                                            {alert.status === 'cancelled' && (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                                    <XCircle size={14} />
                                                    Stopped
                                                </span>
                                            )}
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
                                                <p className="text-[9px] font-medium text-slate-400 mt-1 flex items-center gap-1">
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
                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
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