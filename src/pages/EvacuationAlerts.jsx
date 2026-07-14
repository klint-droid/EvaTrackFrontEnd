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
import { useAlert } from '../context/AlertContext';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../ui/Table';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export default function EvacuationAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [createModal, setCreateModal] = useState(false);
    const [detailId, setDetailId] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const { showAlert, showConfirm } = useAlert();
    
    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

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
        showConfirm(
            'Cancel this scheduled alert?',
            async () => {
                try {
                    await cancelAlert(id);
                    fetchAlerts(pagination.current_page);
                } catch (err) {
                    showAlert(err.response?.data?.message || 'Failed to cancel alert.', 'Error', 'danger');
                }
            },
            'Cancel Alert',
            'warning',
            'Cancel Schedule'
        );
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

            {/* ── Filter Toolbar & Table Container ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="w-full sm:max-w-[280px]">
                            <Input
                                icon={Search}
                                placeholder="Search alerts..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 relative w-full lg:w-auto justify-end">
                        <div className="w-40">
                            <Select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Statuses' },
                                    { value: 'sent', label: 'Sent' },
                                    { value: 'failed', label: 'Failed' },
                                    { value: 'scheduled', label: 'Scheduled' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'cancelled', label: 'Stopped' },
                                ]}
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                                (urgencyFilter || selectedEvent || channelFilter) || showFilters
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <Filter size={16} />
                            <span className="hidden sm:inline">More Filters</span>
                            {(urgencyFilter || selectedEvent || channelFilter) && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">
                                    {(urgencyFilter ? 1 : 0) + (selectedEvent ? 1 : 0) + (channelFilter ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3>
                                    {(urgencyFilter || selectedEvent || channelFilter) && (
                                        <button 
                                            onClick={() => {
                                                setUrgencyFilter('');
                                                setSelectedEvent('');
                                                setChannelFilter('');
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Urgency</label>
                                        <Select
                                            value={urgencyFilter}
                                            onChange={e => setUrgencyFilter(e.target.value)}
                                            options={[
                                                { value: '', label: 'All Levels' },
                                                { value: 'critical', label: 'Critical' },
                                                { value: 'high', label: 'High' },
                                                { value: 'medium', label: 'Medium' },
                                                { value: 'low', label: 'Low' },
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Event</label>
                                        <Select
                                            value={selectedEvent}
                                            onChange={e => setSelectedEvent(e.target.value)}
                                            options={[
                                                { value: '', label: 'All Events' },
                                                ...events.map(e => ({
                                                    value: e.event_id,
                                                    label: `${e.name}${e.ended_at ? ' (Ended)' : ''}`
                                                }))
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Channel</label>
                                        <Select
                                            value={channelFilter}
                                            onChange={e => setChannelFilter(e.target.value)}
                                            options={[
                                                { value: '', label: 'All Channels' },
                                                { value: 'sms', label: 'SMS' },
                                                { value: 'push', label: 'Push' },
                                                { value: 'both', label: 'Both' },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-900 text-white">
                        <tr className="border-none">
                            {['Broadcast Message', 'Event', 'Urgency', 'Target', 'Total Targets', 'Delivery Status', 'Timestamp', 'Command'].map(h => (
                                <TableHead key={h} className="text-[10px] font-bold text-white uppercase tracking-wider">
                                    {h}
                                </TableHead>
                            ))}
                        </tr>
                    </TableHeader>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan="8" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-slate-300" size={32} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">querying system registry...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredAlerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="8" className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        No matching dispatches found.
                                    </TableCell>
                                </TableRow>
                            ) : filteredAlerts.map(alert => (
                                <TableRow key={alert.notif_id} className="group">
                                    <TableCell className="max-w-xs">
                                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                                            {alert.message}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-mono mt-1 font-bold">
                                            UID: {alert.notif_id}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {alert.event ? (
                                            <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border bg-sky-500/10 border-sky-500/25 text-sky-600">
                                                {alert.event.name}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-slate-400 font-bold">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${getUrgencyStyle(alert.urgency_level?.urgency_key)}`}>
                                            {alert.urgency_level?.urgency_label}
                                        </span>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                                                <Bell size={10} className="text-blue-600" />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 font-mono">
                                                {alert.recipients_count || 0}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell className="text-[10px] font-semibold text-slate-500">
                                        {alert.created_at
                                            ? new Date(alert.created_at).toLocaleString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </Table>

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