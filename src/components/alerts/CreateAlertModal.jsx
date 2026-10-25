import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Shield, MessageSquare, Smartphone, Laptop,
    AlertTriangle, AlertCircle, Info, Activity,
    ChevronDown, Users, MapPin
} from 'lucide-react';
import { sendAlert } from '../../api/alerts/sendAlert';
import { getCenters } from '../../api/evacuation/getCenters';
import { getEvents } from '../../api/events/getEvents';

export default function CreateAlertModal({ onClose, onSent }) {
    const [form, setForm] = useState({
        message: '',
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
    const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
    const targetDropdownRef = useRef(null);
    const [isScheduled, setIsScheduled] = useState(false);
    
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Close target dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target)) {
                setIsTargetDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        getCenters().then(res => setCenters(Array.isArray(res) ? res : (res?.data ?? [])));
        getEvents().then(res => setEvents((res.data || []).filter(e => !e.ended_at)));
    }, []);

    const targetOptions = [
        { type: 'all', id: 'all', label: 'All Public' },
        ...centers.map(c => ({ type: 'center', id: c.evacuation_center_id, label: c.name }))
    ];

    const handleSubmit = async () => {
        if (!form.message) {
            setError('Alert message is required.');
            return;
        }

        if (!channels.sms && !channels.push) {
            setError('Please select at least one delivery channel (SMS or Push).');
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
                    channel: channelVal,
                    target_filter: 'all', 
                    evacuation_center_id: target.type === 'center' ? target.id : undefined,
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

    const toggleTarget = (opt) => {
        if (opt.type === 'all') {
            setSelectedTargets([{ type: 'all', id: 'all' }]);
            return;
        }

        const isAlreadySelected = selectedTargets.some(
            t => t.type === 'center' && String(t.id) === String(opt.id)
        );

        if (isAlreadySelected) {
            const remaining = selectedTargets.filter(
                t => !(t.type === 'center' && String(t.id) === String(opt.id))
            );
            setSelectedTargets(remaining.length > 0 ? remaining : [{ type: 'all', id: 'all' }]);
        } else {
            const filtered = selectedTargets.filter(t => t.type !== 'all');
            setSelectedTargets([...filtered, { type: 'center', id: opt.id }]);
        }
    };

    const isAllSelected = selectedTargets.some(t => t.type === 'all');
    const selectedCenterCount = selectedTargets.filter(t => t.type === 'center').length;
    
    let targetSummaryLabel = 'All Public';
    if (!isAllSelected) {
        if (selectedCenterCount === 1) {
            const c = centers.find(center => String(center.evacuation_center_id) === String(selectedTargets[0]?.id));
            targetSummaryLabel = c?.name || '1 Center Selected';
        } else {
            targetSummaryLabel = `${selectedCenterCount} Centers Selected`;
        }
    }


    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 sm:p-8">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* LEFT PANE - Form */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative z-10 border-r border-slate-200 dark:border-slate-700">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900 shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Create Official Alert</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                                Broadcast an emergency notification to defined sectors.
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 bg-white dark:bg-slate-900 text-left">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Message */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                Alert Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={5}
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value.slice(0, 500) })}
                                placeholder="Enter official directive or situational update..."
                                className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400"
                            />
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
                                <span>Structured Event, Center & URL link are automatically attached.</span>
                                <span className="font-mono">{form.message.length} / 500</span>
                            </div>
                        </div>

                        {/* Split row: Target Audience & Delivery Channels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Target Audience (Multi-Select Dropdown) */}
                            <div className="space-y-2 flex flex-col relative" ref={targetDropdownRef}>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-800 dark:text-slate-100">
                                        Target Audience
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {isAllSelected ? 'All Citizens' : `${selectedCenterCount} selected`}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsTargetDropdownOpen(prev => !prev)}
                                    className={`w-full h-[52px] px-3.5 bg-white dark:bg-slate-900 border-2 rounded-xl flex items-center justify-between text-left transition-all ${
                                        isTargetDropdownOpen
                                            ? 'border-blue-500 ring-4 ring-blue-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        {isAllSelected ? (
                                            <Users size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                        ) : (
                                            <MapPin size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                        )}
                                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                            {targetSummaryLabel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {!isAllSelected && (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                                {selectedCenterCount}
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-400 transition-transform duration-200 ${
                                                isTargetDropdownOpen ? 'rotate-180 text-blue-600' : ''
                                            }`}
                                        />
                                    </div>
                                </button>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1 truncate">
                                    {isAllSelected
                                        ? 'Broadcast will reach all citizens and evacuation units.'
                                        : `Alert targeted specifically to ${selectedCenterCount} designated evacuation center(s).`}
                                </p>

                                {/* Dropdown Popover */}
                                {isTargetDropdownOpen && (
                                    <div className="absolute top-[72px] left-0 right-0 z-50 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        {/* All Public Option */}
                                        <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => toggleTarget({ type: 'all', id: 'all' })}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-bold transition-all ${
                                                    isAllSelected
                                                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        onChange={() => {}}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-blue-600 dark:text-blue-400" />
                                                        <span>All Public</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">Broadcast to all</span>
                                            </button>
                                        </div>

                                        {/* Evacuation Centers Section Header */}
                                        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                                            <span>Evacuation Centers</span>
                                            <span>{centers.length} Centers</span>
                                        </div>

                                        {/* Scrollable Center Options */}
                                        <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
                                            {centers.map(c => {
                                                const isSelected = selectedTargets.some(
                                                    t => t.type === 'center' && String(t.id) === String(c.evacuation_center_id)
                                                );
                                                return (
                                                    <button
                                                        key={c.evacuation_center_id}
                                                        type="button"
                                                        onClick={() => toggleTarget({ type: 'center', id: c.evacuation_center_id })}
                                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                                                            isSelected
                                                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                                                                : 'text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                        <span className="truncate">{c.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Channels */}
                            <div className="space-y-2 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-800 dark:text-slate-100">
                                        Delivery Channels
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">Select 1 or both</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 h-[52px]">
                                    <label
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            channels.sms
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={channels.sms}
                                            onChange={e => setChannels({ ...channels, sms: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        />
                                        <MessageSquare size={16} className={channels.sms ? 'text-blue-600 dark:text-blue-400 shrink-0' : 'text-slate-400 shrink-0'} />
                                        <span className="text-xs font-semibold truncate">SMS Broadcast</span>
                                    </label>
                                    <label
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                            channels.push
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={channels.push}
                                            onChange={e => setChannels({ ...channels, push: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        />
                                        <Smartphone size={16} className={channels.push ? 'text-blue-600 dark:text-blue-400 shrink-0' : 'text-slate-400 shrink-0'} />
                                        <span className="text-xs font-semibold truncate">Push Notification</span>
                                    </label>
                                </div>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1 truncate">
                                    {channels.sms && channels.push
                                        ? 'Active: SMS Broadcast & Push Notification'
                                        : channels.sms
                                        ? 'Active: SMS Broadcast only'
                                        : channels.push
                                        ? 'Active: Push Notification only'
                                        : 'None selected (requires at least one)'}
                                </p>
                            </div>
                        </div>

                        {/* Schedule Broadcast */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between pb-6">
                            <div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">Schedule Broadcast</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Delay sending to a specific date/time.</p>
                            </div>
                            <button 
                                onClick={() => setIsScheduled(!isScheduled)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${isScheduled ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white dark:bg-slate-900 rounded-full absolute top-0.5 transition-all shadow-sm dark:shadow-none ${isScheduled ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>
                        
                        {isScheduled && (
                            <div className="animate-in slide-in-from-top-2">
                                <input
                                    type="datetime-local"
                                    value={form.scheduled_at}
                                    onChange={e => setForm({...form, scheduled_at: e.target.value})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-200"
                                />
                            </div>
                        )}
                        
                        {/* Recurring Broadcast */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 pb-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_recurring}
                                    onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                />
                                <span className="text-sm font-black text-slate-800 dark:text-slate-100">Set as Recurring Alert</span>
                            </label>

                            {form.is_recurring && (
                                <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Recurrence Interval</label>
                                        <div className="flex gap-2">
                                            {['hourly', 'daily', 'weekly'].map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, recurrence_type: opt })}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                                                        form.recurrence_type === opt
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm dark:shadow-none'
                                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50'
                                                    }`}
                                                >
                                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">End Recurrence On</label>
                                        <input
                                            type="datetime-local"
                                            value={form.recurrence_end_at}
                                            onChange={e => setForm({ ...form, recurrence_end_at: e.target.value })}
                                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-slate-50 transition-all"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !form.message}
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md dark:shadow-none shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Shield size={16} strokeWidth={2.5} />
                            {loading ? 'Processing...' : 'Confirm & Broadcast'}
                        </button>
                    </div>
                </div>

                {/* RIGHT PANE - Mobile Preview */}
                <div className="w-[360px] lg:w-[420px] shrink-0 bg-slate-50 dark:bg-slate-800/50 flex flex-col relative hidden md:flex">
                    <div className="pt-10 pb-4 text-center">
                        <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 capitalize tracking-wide">Mobile Preview</h3>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center p-6 pb-12">
                        {/* Phone Frame */}
                        <div className="w-[280px] h-[560px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-[12px] border-slate-900 overflow-hidden relative flex flex-col">
                            {/* StatusBar */}
                            <div className="bg-black text-white px-5 py-1.5 flex justify-between items-center text-[10px] font-medium absolute top-0 w-full z-20">
                                <span>12:00</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-white dark:bg-slate-900 rounded-sm" />
                                    <div className="w-2.5 h-2.5 bg-white dark:bg-slate-900 rounded-full" />
                                </div>
                            </div>
                            
                            {/* App Content */}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 pt-10 p-4">
                                
                                {/* Notification Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 p-4 relative overflow-hidden flex flex-col gap-2 mt-2">
                                    {/* Left color bar */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                    
                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                        <Shield size={14} strokeWidth={2.5} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">
                                            Emergency Alert
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed break-words whitespace-pre-wrap">
                                        {form.message || <span className="text-slate-400">Enter official directive or situational update...</span>}
                                    </p>
                                     
                                    {/* Calculated structured details preview */}
                                    {(() => {
                                        const selectedCenters = centers.filter(c => selectedTargets.some(t => t.type === 'center' && String(t.id) === String(c.evacuation_center_id)));
                                        const targetCenter = selectedCenters[0] || null;
                                        const targetEvent = events[0] || null;
                                        
                                        const computedUrl = (!isAllSelected && targetCenter)
                                            ? `http://100.73.14.100:5173/evacuation-centers/${targetCenter.evacuation_center_id}` 
                                            : `http://100.73.14.100:5173/public`;

                                        const nowStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

                                        return (
                                            <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[10px]">
                                                <span className="font-extrabold text-slate-700 dark:text-slate-200">
                                                    As of {nowStr} Announcement
                                                </span>
                                                <span className="font-bold text-slate-500">
                                                    Event: <span className="text-slate-800 dark:text-slate-100 font-extrabold">{targetEvent?.name || 'General Emergency Alert'}</span>
                                                </span>
                                                <span className="font-bold text-slate-500">
                                                    {(!isAllSelected && selectedCenters.length === 1) ? 'Center: ' : 'Centers: '}
                                                    <span className="text-slate-800 dark:text-slate-100 font-extrabold">
                                                        {isAllSelected 
                                                            ? 'All Evacuation Centers' 
                                                            : selectedCenters.length === 1 
                                                            ? (targetCenter?.name || 'Assigned Center') 
                                                            : `${selectedCenters.length} Centers Selected`}
                                                    </span>
                                                </span>
                                                <a 
                                                    href={computedUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-bold text-blue-600 underline truncate block mt-0.5 hover:text-blue-700"
                                                >
                                                    {computedUrl}
                                                </a>
                                            </div>
                                        );
                                    })()}

                                    <p className="text-[9px] font-bold text-slate-400 text-right mt-2">Just now</p>
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