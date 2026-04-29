import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Send, Clock, RefreshCw, Bell,
    MessageSquare, Smartphone, Users,
    CheckCircle, Activity
} from 'lucide-react';
import { sendAlert } from '../../api/alerts/sendAlert';
import { getUrgencyLevels } from '../../api/alerts/getUrgencyLevels';
import { previewRecipients } from '../../api/alerts/previewRecipients';
import { getCenters } from '../../api/evacuation/getCenters';
import { getEvents } from '../../api/events/getEvents';
import { getAlerts } from '../../api/alerts/getAlerts';

const EMPTY_FORM = {
    message: '',
    urgency_level_id: '',
    channel: 'both',
    target_filter: 'all',
    evacuation_center_id: '',
    evacuation_event_id: '',
    scheduled_at: '',
    is_recurring: false,
    recurrence_type: 'daily',
    recurrence_end_at: '',
};

const URGENCY_COLORS = {
    critical: { bg: 'bg-red-500',    text: 'text-white', border: 'border-red-500'    },
    high:     { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
    medium:   { bg: 'bg-yellow-400', text: 'text-white', border: 'border-yellow-400' },
    low:      { bg: 'bg-green-500',  text: 'text-white', border: 'border-green-500'  },
};

const URGENCY_INACTIVE = 'bg-white text-slate-500 border-slate-200 hover:border-slate-300';

export default function CreateAlertModal({ onClose, onSent }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [urgencyLevels, setUrgencyLevels] = useState([]);
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [recipientCount, setRecipientCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // targeting mode: 'all' | 'center' | 'event'
    const [targetMode, setTargetMode] = useState('all');

    useEffect(() => {
        getUrgencyLevels().then(res => setUrgencyLevels(res.data || []));
        getCenters().then(res => setCenters(Array.isArray(res.data) ? res.data : res.data?.data ?? []));
        getEvents().then(res => setEvents((res.data || []).filter(e => !e.ended_at)));
        getAlerts(1).then(res => setRecentAlerts(res.data?.slice(0, 5) || []));
    }, []);

    // auto preview recipients
    useEffect(() => {
        const timeout = setTimeout(async () => {
            setPreviewing(true);
            try {
                const params = { target_filter: form.target_filter };
                if (form.evacuation_center_id) params.evacuation_center_id = form.evacuation_center_id;
                if (form.evacuation_event_id) params.evacuation_event_id = form.evacuation_event_id;
                const res = await previewRecipients(params);
                setRecipientCount(res.recipient_count);
            } catch (err) {
                console.error(err);
            } finally {
                setPreviewing(false);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [form.target_filter, form.evacuation_center_id, form.evacuation_event_id]);

    // when target mode changes, reset filters
    const handleTargetMode = (mode) => {
        setTargetMode(mode);
        setForm(prev => ({
            ...prev,
            target_filter: 'all',
            evacuation_center_id: '',
            evacuation_event_id: '',
        }));
    };

    const selectedUrgency = urgencyLevels.find(u => u.urgency_id === form.urgency_level_id);

    const getDeliveryStats = () => {
        if (!recentAlerts.length) return { rate: 0, sent: 0, total: 0 };
        const total = recentAlerts.reduce((s, a) => s + (a.recipients_count || 0), 0);
        const sent = recentAlerts.filter(a => a.status === 'sent')
            .reduce((s, a) => s + (a.recipients_count || 0), 0);
        const rate = total > 0 ? Math.round((sent / total) * 100) : 0;
        return { rate, sent, total };
    };

    const stats = getDeliveryStats();

    const handleSubmit = async () => {
        if (!form.message || !form.urgency_level_id) {
            setError('Message and urgency level are required.');
            return;
        }
        if (recipientCount === 0) {
            setError('No recipients match the selected filters.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const payload = { ...form };
            if (!payload.evacuation_center_id) delete payload.evacuation_center_id;
            if (!payload.evacuation_event_id) delete payload.evacuation_event_id;
            if (!payload.scheduled_at) delete payload.scheduled_at;
            if (!payload.is_recurring) {
                delete payload.recurrence_type;
                delete payload.recurrence_end_at;
            }

            await sendAlert(payload);

            const channelLabel = form.channel === 'both' ? 'Push & SMS'
                : form.channel === 'sms' ? 'SMS' : 'Push';
            setSuccess(`Alert successfully broadcasted via ${channelLabel}.`);

            // refresh recent alerts
            getAlerts(1).then(res => setRecentAlerts(res.data?.slice(0, 5) || []));
            onSent();

            // reset form
            setForm(EMPTY_FORM);
            setTargetMode('all');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send alert.');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyStyle = (urgency) => {
        const key = urgency?.urgency_key;
        return URGENCY_COLORS[key] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    };

    const getRecentUrgencyBadge = (key) => {
        const map = {
            critical: 'bg-red-100 text-red-600',
            high:     'bg-orange-100 text-orange-600',
            medium:   'bg-yellow-100 text-yellow-700',
            low:      'bg-green-100 text-green-600',
        };
        return map[key] || map.low;
    };

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div className="absolute inset-0 bg-slate-900/70 animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-800">Evacuation Alerts</h2>
                        <p className="text-xs text-slate-400">Broadcast emergency notifications to households</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex divide-x divide-slate-100">

                    {/* LEFT — Form */}
                    <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[75vh]">

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                                <CheckCircle size={15} />
                                {success}
                            </div>
                        )}

                        {/* Broadcast Targeting */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Broadcast Targeting
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'all',    label: 'All' },
                                    { value: 'center', label: 'By Center' },
                                    { value: 'event',  label: 'By Event' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleTargetMode(opt.value)}
                                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                                            targetMode === opt.value
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {targetMode === 'center' && (
                                <select
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none mt-2"
                                    value={form.evacuation_center_id}
                                    onChange={e => setForm({ ...form, evacuation_center_id: e.target.value, target_filter: 'all' })}
                                >
                                    <option value="">Select center</option>
                                    {centers.map(c => (
                                        <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {targetMode === 'event' && (
                                <select
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none mt-2"
                                    value={form.evacuation_event_id}
                                    onChange={e => setForm({ ...form, evacuation_event_id: e.target.value, target_filter: 'all' })}
                                >
                                    <option value="">Select event</option>
                                    {events.map(e => (
                                        <option key={e.event_id} value={e.event_id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Evacuation status filter */}
                            <div className="flex gap-2 mt-2">
                                {[
                                    { value: 'all',           label: 'All Households' },
                                    { value: 'evacuated',     label: 'Evacuated' },
                                    { value: 'not_evacuated', label: 'Not Evacuated' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, target_filter: opt.value })}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                            form.target_filter === opt.value
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Urgency Level */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Urgency Level
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {urgencyLevels.map(u => {
                                    const style = getUrgencyStyle(u);
                                    const isSelected = form.urgency_level_id === u.urgency_id;
                                    return (
                                        <button
                                            key={u.urgency_id}
                                            type="button"
                                            onClick={() => setForm({ ...form, urgency_level_id: u.urgency_id })}
                                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                                                isSelected
                                                    ? `${style.bg} ${style.text} ${style.border}`
                                                    : URGENCY_INACTIVE
                                            }`}
                                        >
                                            {u.urgency_label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Schedule (optional)
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                value={form.scheduled_at}
                                onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                            />
                        </div>

                        {/* Recurring */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_recurring}
                                    onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                                    className="accent-blue-600 w-4 h-4"
                                />
                                <span className="text-xs font-bold text-slate-600">Repeat this alert</span>
                            </label>

                            {form.is_recurring && (
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'hourly', label: 'Hourly' },
                                            { value: 'daily',  label: 'Daily' },
                                            { value: 'weekly', label: 'Weekly' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, recurrence_type: opt.value })}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                                    form.recurrence_type === opt.value
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-slate-600 border-slate-200'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            Stop On
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none mt-1"
                                            value={form.recurrence_end_at}
                                            onChange={e => setForm({ ...form, recurrence_end_at: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notification Methods */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Notification Methods
                            </label>
                            <div className="space-y-2">
                                {[
                                    { value: 'push', label: 'Push Notification', icon: Smartphone },
                                    { value: 'sms',  label: 'SMS Text',          icon: MessageSquare },
                                ].map(({ value, label, icon: Icon }) => {
                                    const isActive = form.channel === value || form.channel === 'both';
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => {
                                                if (form.channel === 'both') {
                                                    setForm({ ...form, channel: value === 'push' ? 'sms' : 'push' });
                                                } else if (form.channel === value) {
                                                    setForm({ ...form, channel: 'both' });
                                                } else {
                                                    setForm({ ...form, channel: 'both' });
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                                                isActive
                                                    ? 'border-red-400 bg-red-50'
                                                    : 'border-slate-200 bg-white opacity-50'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-red-100' : 'bg-slate-100'}`}>
                                                <Icon size={16} className={isActive ? 'text-red-500' : 'text-slate-400'} />
                                            </div>
                                            <span className={`text-sm font-bold ${isActive ? 'text-red-600' : 'text-slate-400'}`}>
                                                {label}
                                            </span>
                                            {isActive && (
                                                <div className="ml-auto w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                                    <CheckCircle size={12} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Alert Message */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Alert Message
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                                placeholder="Enter emergency message here..."
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 px-1">
                                <span>{form.message.length} CHARS</span>
                                <span className="font-bold">
                                    {previewing ? 'COUNTING...' : recipientCount !== null
                                        ? `BROADCASTING TO ${recipientCount} HOUSEHOLD${recipientCount !== 1 ? 'S' : ''}`
                                        : 'SELECT FILTERS ABOVE'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Broadcast Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || recipientCount === 0 || !form.message || !form.urgency_level_id}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-500/20"
                        >
                            {loading ? (
                                <span className="animate-pulse">Sending...</span>
                            ) : (
                                <>
                                    {form.is_recurring
                                        ? <RefreshCw size={16} />
                                        : form.scheduled_at
                                            ? <Clock size={16} />
                                            : <Send size={16} />
                                    }
                                    {form.is_recurring
                                        ? 'Schedule Recurring Alert'
                                        : form.scheduled_at
                                            ? 'Schedule Alert'
                                            : 'Broadcast Now'
                                    }
                                </>
                            )}
                        </button>
                    </div>

                    {/* RIGHT — Stats + Recent */}
                    <div className="w-72 p-6 space-y-5 bg-slate-900 flex-shrink-0">

                        {/* Delivery Rate */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-blue-400" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Delivery Rate
                                </p>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                                <div className="flex items-end justify-between">
                                    <p className="text-3xl font-black text-white">{stats.rate}%</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Delivered Status</p>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                        style={{ width: `${stats.rate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                                    <span>{stats.sent} Sent</span>
                                    <span>{stats.total} Total</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Bell size={14} className="text-slate-400" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Recent Activity
                                </p>
                            </div>
                            <div className="space-y-2">
                                {recentAlerts.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center py-4">No recent alerts</p>
                                ) : recentAlerts.map(alert => (
                                    <div key={alert.notif_id} className="bg-slate-800 rounded-xl p-3 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 text-[8px] font-black rounded-full ${getRecentUrgencyBadge(alert.urgency_level?.urgency_key)}`}>
                                                {alert.urgency_level?.urgency_label?.toUpperCase()}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase flex items-center gap-1 ${
                                                alert.status === 'sent' ? 'text-green-400' : 'text-slate-400'
                                            }`}>
                                                {alert.status === 'sent' && <CheckCircle size={9} />}
                                                {alert.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 font-medium line-clamp-1">
                                            {alert.message}
                                        </p>
                                        <div className="flex items-center justify-between text-[8px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Users size={8} />
                                                {alert.recipients_count || 0}
                                            </span>
                                            <span>
                                                {alert.created_at
                                                    ? new Date(alert.created_at).toLocaleString('en-PH', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })
                                                    : '—'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}