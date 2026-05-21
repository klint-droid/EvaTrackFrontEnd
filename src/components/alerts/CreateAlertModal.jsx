import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Send, Clock, RefreshCw,
    MessageSquare, Smartphone, CheckCircle,
    AlertTriangle, Sparkles, HelpCircle, Layers
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

const PRESETS = [
    {
        label: 'Typhoon Evacuation',
        message: 'EMERGENCY: Heavy rainfall and severe winds are expected from the typhoon. A mandatory evacuation order is in effect. Please secure your home and move immediately to your designated evacuation center.',
        urgency: 'critical',
        channel: 'both'
    },
    {
        label: 'Flood Advisory',
        message: 'WARNING: Rapidly rising water levels detected. A flood advisory has been issued. Be prepared to evacuate. Move essential belongings and electronics to higher ground.',
        urgency: 'high',
        channel: 'both'
    },
    {
        label: 'Fire Alert',
        message: 'CRITICAL ALERT: An active fire has been reported near your area. Evacuate immediately if you are within the hazard zone. Follow emergency service directions.',
        urgency: 'critical',
        channel: 'both'
    },
    {
        label: 'Safe to Return',
        message: 'ALL CLEAR: The emergency threat has passed. Government and safety agencies have declared it safe to return to your household. Please travel with caution.',
        urgency: 'low',
        channel: 'both'
    }
];

const URGENCY_STYLES = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 active:bg-red-500/30',
    high: 'bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 active:bg-orange-500/30',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/20 active:bg-yellow-500/30',
    low: 'bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 active:bg-green-500/30',
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
        getCenters().then(res => setCenters(Array.isArray(res) ? res : (res?.data ?? [])));
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
        }, 400);
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

    const applyPreset = (preset) => {
        const match = urgencyLevels.find(u => u.urgency_key === preset.urgency);
        setForm(prev => ({
            ...prev,
            message: preset.message,
            urgency_level_id: match ? match.urgency_id : prev.urgency_level_id,
            channel: preset.channel
        }));
        setError(null);
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
            setSuccess(`Alert successfully broadcasted via ${channelLabel}.`);
            onSent();
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send alert.');
        } finally {
            setLoading(false);
        }
    };

    const selectedUrgency = urgencyLevels.find(u => u.urgency_id === form.urgency_level_id);
    const broadcastLabel = form.is_recurring
        ? 'Schedule Recurring Alert'
        : form.scheduled_at
            ? 'Schedule Broadcast'
            : 'Broadcast Urgent Alert Now';

    const BroadcastIcon = form.is_recurring ? RefreshCw : form.scheduled_at ? Clock : Send;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Emergency Broadcast</h2>
                            <Sparkles size={16} className="text-amber-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Dispatch immediate warning alerts across emergency channels
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Feedback banners */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-2xl px-4 py-3 flex items-start gap-2.5 shadow-sm animate-in slide-in-from-top-2">
                            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-semibold rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm animate-in slide-in-from-top-2">
                            <CheckCircle size={15} className="text-green-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Operational Presets */}
                    <div className="space-y-2.5">
                        <Label>Operational Presets (Click to Auto-fill)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESETS.map((p, idx) => {
                                const cls = URGENCY_STYLES[p.urgency] || 'border-slate-200 bg-slate-50 text-slate-700';
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${cls}`}
                                    >
                                        <span className="text-xs font-bold tracking-tight">{p.label}</span>
                                        <span className="text-[9px] font-black uppercase tracking-wider opacity-75 mt-1.5">
                                            {p.urgency} preset
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live Target Estimator widget */}
                    <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-28 h-28 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase">Target Estimator</p>
                                <h4 className="text-xs font-bold text-slate-300">Live Broadcast Reach</h4>
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-500/15 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black border border-blue-500/25">
                                <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 ${previewing ? 'animate-ping' : ''}`} />
                                <span>LIVE COUNT</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tight text-white font-mono">
                                {previewing ? '...' : recipientCount ?? 0}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">households targeted</span>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-3.5">
                            <div>
                                <span className="font-semibold text-slate-500 uppercase tracking-widest text-[8px] mr-1">Channels:</span> 
                                <span className="text-slate-300 font-semibold">{form.channel === 'both' ? 'SMS + Push' : form.channel.toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500 uppercase tracking-widest text-[8px] mr-1">Status:</span> 
                                <span className="text-slate-300 font-semibold">{form.target_filter.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Targeting Mode */}
                    <div className="space-y-3">
                        <Label>Target Filters</Label>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 gap-1">
                            {[
                                { value: 'all',    label: 'All Areas' },
                                { value: 'center', label: 'By Evacuation Center' },
                                { value: 'event',  label: 'By Active Event' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleTargetMode(opt.value)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                        targetMode === opt.value
                                            ? 'bg-white text-slate-900 shadow-sm border border-slate-100 font-black'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {targetMode === 'center' && (
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                                value={form.evacuation_center_id}
                                onChange={e => setForm({ ...form, evacuation_center_id: e.target.value, target_filter: 'all' })}
                            >
                                <option value="">Select Center Target…</option>
                                {centers.map(c => (
                                    <option key={c.evacuation_center_id} value={c.evacuation_center_id}>{c.name}</option>
                                ))}
                            </select>
                        )}

                        {targetMode === 'event' && (
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                                value={form.evacuation_event_id}
                                onChange={e => setForm({ ...form, evacuation_event_id: e.target.value, target_filter: 'all' })}
                            >
                                <option value="">Select Disaster Event Target…</option>
                                {events.map(e => (
                                    <option key={e.event_id} value={e.event_id}>{e.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Evacuation status sub-filter */}
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all',           label: 'All Residents' },
                                { value: 'evacuated',     label: 'Evacuated Only' },
                                { value: 'not_evacuated', label: 'Not Evacuated' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, target_filter: opt.value })}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                                        form.target_filter === opt.value
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/15'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Urgency */}
                    <div className="space-y-2.5">
                        <Label>Urgency Level</Label>
                        <div className="flex gap-1.5 flex-wrap">
                            {urgencyLevels.map(u => {
                                const isSelected = form.urgency_level_id === u.urgency_id;
                                const baseStyle = URGENCY_STYLES[u.urgency_key] || 'border-slate-200 hover:border-slate-300 bg-slate-50';
                                return (
                                    <button
                                        key={u.urgency_id}
                                        type="button"
                                        onClick={() => setForm({ ...form, urgency_level_id: u.urgency_id })}
                                        className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all ${
                                            isSelected
                                                ? `${baseStyle.replace('bg-opacity-10', 'bg-opacity-100')} border-transparent font-black ring-2 ring-slate-900/10`
                                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
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
                        <Label>Broadcast Channels</Label>
                        <div className="grid grid-cols-2 gap-3.5">
                            {[
                                { value: 'push', label: 'Mobile Push Broadcast', description: 'Immediate App Alert', Icon: Smartphone },
                                { value: 'sms',  label: 'Direct SMS Gateway', description: 'SMS Mobile Alert', Icon: MessageSquare },
                            ].map(({ value, label, description, Icon }) => {
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
                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                                            isActive
                                                ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                                                : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {label}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">{description}</p>
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-3 right-3 bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-white">
                                                <CheckCircle size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2.5">
                        <Label>Alert Message Content</Label>
                        <div className="relative">
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs leading-relaxed focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all resize-none font-medium placeholder-slate-400 text-slate-700"
                                placeholder="Type custom emergency notification..."
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider px-0.5">
                            <span>{form.message.length} Characters</span>
                            <span className={recipientCount === 0 ? 'text-red-500 font-bold animate-pulse' : 'text-slate-400'}>
                                {previewing ? 'Estimating Reach...' : `${recipientCount ?? 0} Recipient Households`}
                            </span>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Label>Schedule Delayed Broadcast (Optional)</Label>
                            <Clock size={11} className="text-slate-400" />
                        </div>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-slate-700"
                            value={form.scheduled_at}
                            onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                        />
                    </div>

                    {/* Recurring Options */}
                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={form.is_recurring}
                                    onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                                    className="accent-blue-600 w-4.5 h-4.5 rounded-lg border-slate-300 cursor-pointer"
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Repeat this broadcast alert periodically</span>
                        </label>

                        {form.is_recurring && (
                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Recurrence Interval</span>
                                    <div className="flex gap-1.5">
                                        {['hourly', 'daily', 'weekly'].map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setForm({ ...form, recurrence_type: opt })}
                                                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                                    form.recurrence_type === opt
                                                        ? 'bg-slate-900 border-slate-900 text-white font-black'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                                }`}
                                            >
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                        End Recurrence On
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700"
                                        value={form.recurrence_end_at}
                                        onChange={e => setForm({ ...form, recurrence_end_at: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4.5 border-t border-slate-50 bg-slate-50/50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || recipientCount === 0 || !form.message || !form.urgency_level_id}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 uppercase tracking-widest"
                    >
                        {loading ? (
                            <span className="animate-pulse text-xs">Transmitting Broadcast...</span>
                        ) : (
                            <>
                                <BroadcastIcon size={14} strokeWidth={3} />
                                <span>{broadcastLabel}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function Label({ children }) {
    return (
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {children}
        </p>
    );
}