import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Send, Clock, RefreshCw,
    MessageSquare, Smartphone, CheckCircle
} from 'lucide-react';
import { sendAlert } from '../../api/alerts/sendAlert';
import { getUrgencyLevels } from '../../api/alerts/getUrgencyLevels';
import { previewRecipients } from '../../api/alerts/previewRecipients';
import { getCenters } from '../../api/evacuation/getCenters';
import { getEvents } from '../../api/events/getEvents';

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
    medium:   { bg: 'bg-yellow-400', text: 'text-slate-900', border: 'border-yellow-400' },
    low:      { bg: 'bg-green-500',  text: 'text-white', border: 'border-green-500'  },
};

export default function CreateAlertModal({ onClose, onSent }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [urgencyLevels, setUrgencyLevels] = useState([]);
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [recipientCount, setRecipientCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [targetMode, setTargetMode] = useState('all');

    useEffect(() => {
        getUrgencyLevels().then(res => setUrgencyLevels(res.data || []));
        getCenters().then(res => setCenters(Array.isArray(res.data) ? res.data : res.data?.data ?? []));
        getEvents().then(res => setEvents((res.data || []).filter(e => !e.ended_at)));
    }, []);

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

    const handleTargetMode = (mode) => {
        setTargetMode(mode);
        setForm(prev => ({
            ...prev,
            target_filter: 'all',
            evacuation_center_id: '',
            evacuation_event_id: '',
        }));
    };

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
            if (!payload.evacuation_event_id)  delete payload.evacuation_event_id;
            if (!payload.scheduled_at)         delete payload.scheduled_at;
            if (!payload.is_recurring) {
                delete payload.recurrence_type;
                delete payload.recurrence_end_at;
            }
            await sendAlert(payload);
            const channelLabel = form.channel === 'both' ? 'Push & SMS'
                : form.channel === 'sms' ? 'SMS' : 'Push';
            setSuccess(`Alert broadcasted via ${channelLabel}.`);
            onSent();
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

    const selectedUrgency = urgencyLevels.find(u => u.urgency_id === form.urgency_level_id);
    const urgencyKey = selectedUrgency?.urgency_key;

    const broadcastLabel = form.is_recurring
        ? 'Schedule Recurring Alert'
        : form.scheduled_at
            ? 'Schedule Alert'
            : 'Broadcast Now';

    const BroadcastIcon = form.is_recurring ? RefreshCw : form.scheduled_at ? Clock : Send;

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
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Alert</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Broadcast emergency notifications to households
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 mx-6" />

                {/* Form body */}
                <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">

                    {/* Feedback banners */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-4 py-3 flex items-center gap-2">
                            <CheckCircle size={14} />
                            {success}
                        </div>
                    )}

                    {/* Targeting */}
                    <div className="space-y-2.5">
                        <Label>Recipients</Label>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all',    label: 'All' },
                                { value: 'center', label: 'By Center' },
                                { value: 'event',  label: 'By Event' },
                            ].map(opt => (
                                <ToggleBtn
                                    key={opt.value}
                                    active={targetMode === opt.value}
                                    onClick={() => handleTargetMode(opt.value)}
                                >
                                    {opt.label}
                                </ToggleBtn>
                            ))}
                        </div>

                        {targetMode === 'center' && (
                            <select
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                                value={form.evacuation_center_id}
                                onChange={e => setForm({ ...form, evacuation_center_id: e.target.value, target_filter: 'all' })}
                            >
                                <option value="">Select center…</option>
                                {centers.map(c => (
                                    <option key={c.evacuation_center_id} value={c.evacuation_center_id}>{c.name}</option>
                                ))}
                            </select>
                        )}

                        {targetMode === 'event' && (
                            <select
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                                value={form.evacuation_event_id}
                                onChange={e => setForm({ ...form, evacuation_event_id: e.target.value, target_filter: 'all' })}
                            >
                                <option value="">Select event…</option>
                                {events.map(e => (
                                    <option key={e.event_id} value={e.event_id}>{e.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Evacuation status sub-filter */}
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all',           label: 'All' },
                                { value: 'evacuated',     label: 'Evacuated' },
                                { value: 'not_evacuated', label: 'Not Evacuated' },
                            ].map(opt => (
                                <ToggleBtn
                                    key={opt.value}
                                    active={form.target_filter === opt.value}
                                    activeClass="bg-blue-600 text-white border-blue-600"
                                    onClick={() => setForm({ ...form, target_filter: opt.value })}
                                >
                                    {opt.label}
                                </ToggleBtn>
                            ))}
                        </div>
                    </div>

                    {/* Urgency */}
                    <div className="space-y-2.5">
                        <Label>Urgency Level</Label>
                        <div className="flex gap-1.5 flex-wrap">
                            {urgencyLevels.map(u => {
                                const style = getUrgencyStyle(u);
                                const isSelected = form.urgency_level_id === u.urgency_id;
                                return (
                                    <button
                                        key={u.urgency_id}
                                        type="button"
                                        onClick={() => setForm({ ...form, urgency_level_id: u.urgency_id })}
                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                            isSelected
                                                ? `${style.bg} ${style.text} ${style.border}`
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {u.urgency_label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notification channels */}
                    <div className="space-y-2.5">
                        <Label>Channels</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'push', label: 'Push Notification', Icon: Smartphone },
                                { value: 'sms',  label: 'SMS Text',          Icon: MessageSquare },
                            ].map(({ value, label, Icon }) => {
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
                                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 transition-all text-left ${
                                            isActive
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            isActive ? 'bg-blue-100' : 'bg-slate-100'
                                        }`}>
                                            <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                        </div>
                                        <span className={`text-xs font-bold leading-tight ${
                                            isActive ? 'text-blue-700' : 'text-slate-400'
                                        }`}>
                                            {label}
                                        </span>
                                        {isActive && (
                                            <CheckCircle size={13} className="ml-auto text-blue-500 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all resize-none"
                            placeholder="Enter emergency message…"
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                            <span>{form.message.length} chars</span>
                            <span className={recipientCount === 0 ? 'text-red-400' : 'text-slate-400'}>
                                {previewing
                                    ? 'Counting…'
                                    : recipientCount !== null
                                        ? `${recipientCount} household${recipientCount !== 1 ? 's' : ''}`
                                        : 'Select filters above'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Schedule (collapsible-ish) */}
                    <div className="space-y-2">
                        <Label>Schedule (optional)</Label>
                        <input
                            type="datetime-local"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
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
                                className="accent-blue-600 w-4 h-4 rounded"
                            />
                            <span className="text-xs font-bold text-slate-600">Repeat this alert</span>
                        </label>

                        {form.is_recurring && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex gap-1.5">
                                    {['hourly', 'daily', 'weekly'].map(opt => (
                                        <ToggleBtn
                                            key={opt}
                                            active={form.recurrence_type === opt}
                                            onClick={() => setForm({ ...form, recurrence_type: opt })}
                                        >
                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </ToggleBtn>
                                    ))}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Stop On
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={form.recurrence_end_at}
                                        onChange={e => setForm({ ...form, recurrence_end_at: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || recipientCount === 0 || !form.message || !form.urgency_level_id}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                    >
                        {loading ? (
                            <span className="animate-pulse text-sm">Sending…</span>
                        ) : (
                            <>
                                <BroadcastIcon size={15} strokeWidth={2.5} />
                                {broadcastLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* Tiny helpers */
function Label({ children }) {
    return (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {children}
        </p>
    );
}

function ToggleBtn({ active, onClick, children, activeClass }) {
    const ac = activeClass || 'bg-slate-800 text-white border-slate-800';
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                active
                    ? ac
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
        >
            {children}
        </button>
    );
}