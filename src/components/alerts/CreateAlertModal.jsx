import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Shield, MessageSquare, Smartphone, Laptop,
    AlertTriangle, AlertCircle, Info, Activity
} from 'lucide-react';
import { sendAlert } from '../../api/alerts/sendAlert';
import { getUrgencyLevels } from '../../api/alerts/getUrgencyLevels';
import { getCenters } from '../../api/evacuation/getCenters';
import { getEvents } from '../../api/events/getEvents';

const URGENCY_CONFIG = {
    critical: { icon: AlertTriangle, text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', activeBg: 'bg-red-50/50', activeBorder: 'border-red-400', leftBar: 'bg-red-500' },
    high:     { icon: AlertCircle,   text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', activeBg: 'bg-orange-50/50', activeBorder: 'border-orange-400', leftBar: 'bg-orange-500' },
    medium:   { icon: Activity,      text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', activeBg: 'bg-yellow-50/50', activeBorder: 'border-yellow-400', leftBar: 'bg-yellow-500' },
    low:      { icon: Info,          text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', activeBg: 'bg-green-50/50', activeBorder: 'border-green-400', leftBar: 'bg-green-500' },
};

export default function CreateAlertModal({ onClose, onSent }) {
    const [form, setForm] = useState({
        message: '',
        urgency_level_id: '',
        scheduled_at: '',
        is_recurring: false,
        recurrence_type: 'daily',
        recurrence_end_at: '',
    });
    
    const [channels, setChannels] = useState({
        sms: true,
        push: true,
        inApp: true
    });
    
    const [selectedTargets, setSelectedTargets] = useState([{ type: 'all', id: 'all' }]);
    const [isScheduled, setIsScheduled] = useState(false);
    
    const [urgencyLevels, setUrgencyLevels] = useState([]);
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getUrgencyLevels().then(res => setUrgencyLevels(res.data || []));
        getCenters().then(res => setCenters(Array.isArray(res) ? res : (res?.data ?? [])));
        getEvents().then(res => setEvents((res.data || []).filter(e => !e.ended_at)));
    }, []);

    const targetOptions = [
        { type: 'all', id: 'all', label: 'All Public' },
        ...centers.map(c => ({ type: 'center', id: c.evacuation_center_id, label: c.name })),
        ...events.map(e => ({ type: 'event', id: e.event_id, label: e.name }))
    ];

    const handleSubmit = async () => {
        if (!form.message || !form.urgency_level_id) {
            setError('Message and urgency level are required.');
            return;
        }
        
        let channelVal = 'both';
        if (channels.sms && !channels.push) channelVal = 'sms';
        if (!channels.sms && channels.push) channelVal = 'push';

        setLoading(true);
        setError(null);
        try {
            const promises = selectedTargets.map(target => {
                const payload = { 
                    message: form.message,
                    urgency_level_id: form.urgency_level_id,
                    channel: channelVal,
                    target_filter: 'all', 
                    evacuation_center_id: target.type === 'center' ? target.id : undefined,
                    evacuation_event_id: target.type === 'event' ? target.id : undefined,
                };
                
                if (isScheduled && form.scheduled_at) {
                    payload.scheduled_at = form.scheduled_at;
                }
                
                if (form.is_recurring) {
                    payload.is_recurring = true;
                    payload.recurrence_type = form.recurrence_type;
                    payload.recurrence_end_at = form.recurrence_end_at;
                }
                
                return sendAlert(payload);
            });

            await Promise.all(promises);
            onSent();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send alert(s).');
            setLoading(false);
        }
    };

    const handleTargetClick = (e, opt) => {
        if (e.ctrlKey || e.metaKey) {
            // Multi-select logic
            if (opt.type === 'all') {
                setSelectedTargets([{ type: 'all', id: 'all' }]);
                return;
            }
            
            const isAlreadySelected = selectedTargets.some(t => t.type === opt.type && t.id === opt.id);
            let newTargets;
            
            if (isAlreadySelected) {
                newTargets = selectedTargets.filter(t => !(t.type === opt.type && t.id === opt.id));
                if (newTargets.length === 0) newTargets = [{ type: 'all', id: 'all' }];
            } else {
                newTargets = selectedTargets.filter(t => t.type !== 'all');
                newTargets.push({ type: opt.type, id: opt.id });
            }
            setSelectedTargets(newTargets);
        } else {
            // Single select logic
            setSelectedTargets([{ type: opt.type, id: opt.id }]);
        }
    };

    const selectedUrgency = urgencyLevels.find(u => u.urgency_id === form.urgency_level_id);
    const urgencyConf = selectedUrgency ? URGENCY_CONFIG[selectedUrgency.urgency_key] : URGENCY_CONFIG.low;
    const UrgencyIcon = urgencyConf?.icon || Info;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 sm:p-8">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* LEFT PANE - Form */}
                <div className="flex-1 flex flex-col h-full bg-white relative z-10 border-r border-slate-200">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Official Alert</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Broadcast an emergency notification to defined sectors.
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 bg-white text-left">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Urgency */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                                Urgency Level <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {urgencyLevels.map(u => {
                                    const isSelected = form.urgency_level_id === u.urgency_id;
                                    const conf = URGENCY_CONFIG[u.urgency_key] || URGENCY_CONFIG.low;
                                    const IconObj = conf.icon;
                                    return (
                                        <button
                                            key={u.urgency_id}
                                            onClick={() => setForm({ ...form, urgency_level_id: u.urgency_id })}
                                            className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                                                isSelected 
                                                    ? `${conf.activeBorder} ${conf.activeBg}` 
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <IconObj size={24} className={isSelected ? conf.text : 'text-slate-400'} strokeWidth={2.5} />
                                            <span className={`text-[12px] font-bold mt-2 ${isSelected ? conf.text : 'text-slate-600'}`}>
                                                {u.urgency_label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                                Alert Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={5}
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value.slice(0, 300) })}
                                placeholder="Enter official directive or situational update..."
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-slate-700 font-medium placeholder-slate-400"
                            />
                            <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
                                <span>Supports clear, concise formatting.</span>
                                <span className="font-mono">{form.message.length} / 300</span>
                            </div>
                        </div>

                        {/* Split row: Target & Channels */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Target Audience */}
                            <div className="space-y-3 flex flex-col">
                                <label className="text-xs font-black text-slate-800">Target Audience</label>
                                <div className="border-2 border-slate-200 rounded-xl overflow-hidden h-40 overflow-y-auto bg-white flex flex-col p-1.5">
                                    {targetOptions.map((opt, i) => {
                                        const isSelected = selectedTargets.some(t => t.type === opt.type && t.id === opt.id);
                                        return (
                                            <button
                                                key={`${opt.type}-${opt.id}`}
                                                onClick={(e) => handleTargetClick(e, opt)}
                                                className={`text-left px-3 py-2 text-sm rounded-lg transition-all ${
                                                    isSelected ? 'bg-slate-300/60 font-bold text-slate-800' : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1 px-1">Hold Ctrl/Cmd to select multiple.</p>
                            </div>

                            {/* Delivery Channels */}
                            <div className="space-y-3 flex flex-col">
                                <label className="text-xs font-black text-slate-800">Delivery Channels</label>
                                <div className="border-2 border-slate-200 rounded-xl p-5 flex-1 bg-white space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={channels.sms} onChange={e => setChannels({...channels, sms: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                                        <MessageSquare size={16} className="text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700">SMS Broadcast</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={channels.push} onChange={e => setChannels({...channels, push: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                                        <Smartphone size={16} className="text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700">Push Notification</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Broadcast */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between pb-6">
                            <div>
                                <h4 className="text-sm font-black text-slate-800">Schedule Broadcast</h4>
                                <p className="text-xs text-slate-500 font-medium">Delay sending to a specific date/time.</p>
                            </div>
                            <button 
                                onClick={() => setIsScheduled(!isScheduled)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${isScheduled ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isScheduled ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                        
                        {isScheduled && (
                            <div className="animate-in slide-in-from-top-2">
                                <input
                                    type="datetime-local"
                                    value={form.scheduled_at}
                                    onChange={e => setForm({...form, scheduled_at: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                                />
                            </div>
                        )}
                        
                        {/* Recurring Broadcast */}
                        <div className="pt-2 border-t border-slate-100 pb-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_recurring}
                                    onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                />
                                <span className="text-sm font-black text-slate-800">Set as Recurring Alert</span>
                            </label>

                            {form.is_recurring && (
                                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recurrence Interval</label>
                                        <div className="flex gap-2">
                                            {['hourly', 'daily', 'weekly'].map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, recurrence_type: opt })}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                                                        form.recurrence_type === opt
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Recurrence On</label>
                                        <input
                                            type="datetime-local"
                                            value={form.recurrence_end_at}
                                            onChange={e => setForm({ ...form, recurrence_end_at: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !form.message || !form.urgency_level_id}
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Shield size={16} strokeWidth={2.5} />
                            {loading ? 'Processing...' : 'Confirm & Broadcast'}
                        </button>
                    </div>
                </div>

                {/* RIGHT PANE - Mobile Preview */}
                <div className="w-[360px] lg:w-[420px] shrink-0 bg-slate-50 flex flex-col relative hidden md:flex">
                    <div className="pt-10 pb-4 text-center">
                        <h3 className="text-xs font-black text-slate-600 capitalize tracking-wide">Mobile Preview</h3>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center p-6 pb-12">
                        {/* Phone Frame */}
                        <div className="w-[280px] h-[560px] bg-white rounded-[2.5rem] shadow-2xl border-[12px] border-slate-900 overflow-hidden relative flex flex-col">
                            {/* StatusBar */}
                            <div className="bg-black text-white px-5 py-1.5 flex justify-between items-center text-[10px] font-medium absolute top-0 w-full z-20">
                                <span>12:00</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                </div>
                            </div>
                            
                            {/* App Content */}
                            <div className="flex-1 bg-slate-50 pt-10 p-4">
                                
                                {/* Notification Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative overflow-hidden flex flex-col gap-2 mt-2">
                                    {/* Left color bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgencyConf.leftBar}`} />
                                    
                                    <div className={`flex items-center gap-1.5 ${urgencyConf.text}`}>
                                        <UrgencyIcon size={14} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">
                                            {selectedUrgency?.urgency_label || 'Critical'} Alert
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-700 font-medium leading-relaxed break-words whitespace-pre-wrap">
                                        {form.message || <span className="text-slate-400">Enter official directive or situational update...</span>}
                                    </p>
                                    
                                    <p className="text-[9px] font-bold text-slate-400 text-right mt-3">Just now</p>
                                </div>

                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-6 w-full text-center">
                        <p className="text-xs text-slate-400 font-medium">Preview is approximate.</p>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}