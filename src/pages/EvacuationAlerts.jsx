import { useState, useEffect } from 'react';
import {
    Bell, Plus, Eye, Trash2, Clock, RefreshCw,
    Loader2, ChevronLeft, ChevronRight, MoreHorizontal,
    TrendingUp, Search, Filter, CheckCircle2, Play, XCircle
} from 'lucide-react';

import { getAlerts } from '../api/alerts/getAlerts';
import { cancelAlert } from '../api/alerts/cancelAlert';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isPersonnel, isSuperAdmin } from '../utils/roles';
import CreateAlertModal from '../components/alerts/CreateAlertModal';
import AlertDetailModal from '../components/alerts/AlertDetailModal';
import { useAlert } from '../context/AlertContext';
import { Table, TableHeader, TableRow, TableHead, TableCell, RowMenu, StatusBadge } from '../ui/Table';
import { TableLayout } from '../components/ui/TableLayout';
import Pagination from '../components/ui/Pagination';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import AnimatedFAB from "../components/ui/AnimatedFAB";
import { Megaphone } from "lucide-react";


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

    const canCreate = isSuperAdmin() || isAdmin() || isPersonnel();

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
            'Are you sure you want to delete this alert dispatch record?',
            async () => {
                try {
                    await cancelAlert(id);
                    showAlert('Alert record deleted successfully.', 'Success', 'success');
                    fetchAlerts(pagination.current_page);
                } catch (err) {
                    showAlert(err.response?.data?.message || 'Failed to delete alert record.', 'Error', 'danger');
                }
            },
            'Delete Alert Record',
            'danger',
            'Delete'
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Evacuation Alerts</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Broadcast command, status monitor, and log dispatch control
                    </p>
                </div>
                {canCreate && (
                    <AnimatedFAB onClick={() => setCreateModal(true)} icon={Megaphone} label="Create Broadcast Alert" />
                )}
            </div>

            {/* ── Stats Cards Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Alerts Sent (24h) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 flex flex-col gap-1 ">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Alerts Sent (24h)</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">{stats.total.toLocaleString()}</p>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {stats.rate > 0 ? `${stats.rate}%` : '—'}
                        </span>
                    </div>
                </div>

                {/* Delivery Rate */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 flex flex-col gap-1 ">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Delivery Rate</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">{stats.rate}%</p>
                        <span className="text-xs font-medium text-slate-400">Network avg</span>
                    </div>
                </div>

                {/* Active Broadcasts */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 flex flex-col gap-1  border-l-4 border-l-red-500">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Broadcasts</p>
                    <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">{alerts.filter(a => a.status === 'sent').length}</p>
                        <span className="text-xs font-medium text-slate-400">Ongoing scenarios</span>
                    </div>
                </div>
            </div>

            <TableLayout
                title="Evacuation Alerts"
                badgeText={`${pagination.total || alerts.length} Dispatches`}
                subtitle="Broadcast emergency warnings, SMS notifications, and disaster alerts"
                onExport={() => {
                  const csvHeader = "Notification ID,Message,Urgency,Recipients,Status,Timestamp\n";
                  const csvRows = filteredAlerts
                    .map((a) => `${a.notif_id},"${a.message || ''}",${a.urgency_level?.urgency_label || ''},${a.recipients_count || 0},${a.status || ''},"${a.created_at || ''}"`)
                    .join("\n");
                  const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.setAttribute("download", "evacuation_alerts_report.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                onAdd={canCreate ? () => setCreateModal(true) : undefined}
                addLabel="Broadcast Alert"
                pagination={
                    <Pagination
                        currentPage={pagination.current_page || 1}
                        totalPages={pagination.last_page || 1}
                        totalEntries={pagination.total || alerts.length}
                        perPage={pagination.per_page || 10}
                        onPageChange={(page) => fetchAlerts(page)}
                    />
                }
            >
                <Table>
                    <TableHeader>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <TableHead
                              filterable
                              filterValue={searchTerm}
                              onFilterChange={(v) => setSearchTerm(v)}
                            >
                              Broadcast Message
                            </TableHead>
                            <TableHead
                              filterable
                              filterValue={selectedEvent}
                              onFilterChange={(v) => setSelectedEvent(v)}
                              filterOptions={events.map(e => ({ value: e.event_id, label: e.name }))}
                            >
                              Event
                            </TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead className="text-center">Recipients</TableHead>
                            <TableHead
                              filterable
                              filterValue={statusFilter}
                              onFilterChange={(v) => setStatusFilter(v)}
                              filterOptions={[
                                { value: 'sent', label: 'Sent' },
                                { value: 'failed', label: 'Failed' },
                                { value: 'scheduled', label: 'Scheduled' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'cancelled', label: 'Stopped' },
                              ]}
                            >
                              Delivery Status
                            </TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </tr>
                    </TableHeader>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-slate-300" size={32} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">querying system registry...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredAlerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="7" className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        No matching dispatches found.
                                    </TableCell>
                                </TableRow>
                            ) : filteredAlerts.map(alert => (
                                <TableRow key={alert.notif_id} className="group">
                                    <TableCell className="max-w-xs">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">
                                            {alert.message}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-mono mt-1 font-bold">
                                            UID: {alert.notif_id}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {alert.event ? (
                                            <a
                                                href="/events"
                                                className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border bg-sky-500/10 border-sky-500/25 text-sky-600 hover:underline inline-block"
                                            >
                                                {alert.event.name}
                                            </a>
                                        ) : (
                                            <span className="text-[9px] text-slate-400 font-bold">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {(alert.center?.evacuation_center_id || alert.evacuation_center_id) ? (
                                            <a
                                                href={`/evacuation-centers/${alert.center?.evacuation_center_id || alert.evacuation_center_id}`}
                                                className="text-xs font-bold text-blue-600 hover:underline hover:text-blue-700"
                                            >
                                                {alert.center?.name || alert.evacuation_center?.name || 'Evacuation Center'}
                                            </a>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                                {alert.target_filter === 'evacuated'
                                                    ? 'Evacuated Households'
                                                    : alert.target_filter === 'not_evacuated'
                                                        ? 'Non-Evacuated'
                                                        : 'Public Broadcast'
                                                }
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                                                <Bell size={10} className="text-blue-600" />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
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
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                                            {alert.status === 'completed' && (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-600">
                                                    <CheckCircle2 size={14} />
                                                    Completed
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
                                                    alert.status === 'cancelled' || alert.status === 'failed' || alert.status === 'completed'
                                                        ? 'text-slate-400'
                                                        : 'text-blue-600'
                                                }`}>
                                                    {alert.status === 'scheduled' ? (
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
                                    <TableCell className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                        {alert.created_at
                                            ? new Date(alert.created_at).toLocaleString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <RowMenu
                                            onView={() => setDetailId(alert.notif_id)}
                                            actions={
                                                alert.is_recurring && alert.status === 'scheduled' && canCreate
                                                    ? [{ label: "Stop Recurring Broadcast", danger: true, onClick: () => handleCancel(alert.notif_id) }]
                                                    : []
                                            }
                                            onDelete={canCreate ? () => handleCancel(alert.notif_id) : undefined}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </Table>
                </TableLayout>

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