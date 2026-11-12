import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Shield, MessageSquare, Smartphone, Laptop,
    AlertTriangle, AlertCircle, Info, Activity,
    ChevronDown, Users, MapPin, UserX, Clock, RefreshCw, Calendar, Check
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
        recurrence_interval_value: 3,
        recurrence_interval_unit: 'hours',
        recurrence_end_at: '',
    });
    
    const [channels, setChannels] = useState({
        sms: true,
        push: true,
        inApp: true
    });
    
    const [selectedTargets, setSelectedTargets] = useState([{ type: 'not_evacuated', id: 'not_evacuated' }]);
    const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
    const targetDropdownRef = useRef(null);
    const [isScheduled, setIsScheduled] = useState(false);
    
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helpers for scheduling & recurring settings
    const setEndPreset = (hours) => {
        const base = (isScheduled && form.scheduled_at) ? new Date(form.scheduled_at) : new Date();
        const target = new Date(base.getTime() + hours * 3600 * 1000);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
        setForm(prev => ({ ...prev, recurrence_end_at: formatted }));
    };

    const toggleRecurring = (checked) => {
        if (checked && !form.recurrence_end_at) {
            const base = (isScheduled && form.scheduled_at) ? new Date(form.scheduled_at) : new Date();
            const target = new Date(base.getTime() + 72 * 3600 * 1000); // default +3 days
            const pad = (n) => String(n).padStart(2, '0');
            const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
            setForm(prev => ({ ...prev, is_recurring: true, recurrence_end_at: formatted }));
        } else {
            setForm(prev => ({ ...prev, is_recurring: checked }));
        }
    };

    const toggleScheduleMode = (mode) => {
        if (mode === 'later') {
            setIsScheduled(true);
            if (!form.scheduled_at) {
                const nextHour = new Date(Date.now() + 3600 * 1000);
                nextHour.setMinutes(0, 0, 0);
                const pad = (n) => String(n).padStart(2, '0');
                const formatted = `${nextHour.getFullYear()}-${pad(nextHour.getMonth() + 1)}-${pad(nextHour.getDate())}T${pad(nextHour.getHours())}:${pad(nextHour.getMinutes())}`;
                setForm(prev => ({ ...prev, scheduled_at: formatted }));
            }
        } else {
            setIsScheduled(false);
            setForm(prev => ({ ...prev, scheduled_at: '' }));
        }
    };

    const getPlainScheduleSummary = () => {
        if (!isScheduled && !form.is_recurring) {
            return 'Sends immediately once confirmed. Does not repeat.';
        }

        let parts = [];
        if (isScheduled && form.scheduled_at) {
            const d = new Date(form.scheduled_at);
            const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
            parts.push(`First alert will send on ${dateStr} at ${timeStr}`);
        } else {
            parts.push('First alert will send immediately now');
        }

        if (form.is_recurring) {
            let freq = '';
            if (form.recurrence_type === 'hourly') {
                freq = 'every 1 hour';
            } else if (form.recurrence_type === 'daily') {
                freq = 'every day';
            } else if (form.recurrence_type === 'weekly') {
                freq = 'every week';
            } else if (form.recurrence_type === 'custom') {
                const val = form.recurrence_interval_value || 1;
                const unit = form.recurrence_interval_unit || 'hours';
                const singularUnit = unit.replace(/s$/, '');
                freq = `every ${val} ${val === 1 ? singularUnit : unit}`;
            } else {
                freq = 'periodically';
            }
            
            parts.push(`then repeat ${freq}`);

            if (form.recurrence_end_at) {
                const endD = new Date(form.recurrence_end_at);
                const endDateStr = endD.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const endTimeStr = endD.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
                parts.push(`until ${endDateStr} at ${endTimeStr}`);
            }
        }

        return parts.join(', ') + '.';
    };

    const appendCenterStatus = () => {
        if (!centers || centers.length === 0) {
            setError('No evacuation centers found to include status.');
            return;
        }

        const statusList = centers.map(c => {
            const capacity = Number(c.capacity) || 1;
            const current = Number(c.current_occupancy) || 0;
            const pct = Math.min(100, Math.round((current / capacity) * 100));
            let statusDesc = 'space available';
            if (pct >= 100) {
                statusDesc = 'FULL';
            } else if (pct >= 80) {
                statusDesc = 'near full';
            }
            return `${c.name} (${pct}% occupied, ${statusDesc})`;
        }).join(', ');

        const statusText = `CENTER STATUS: ${statusList}.`;

        setForm(prev => {
            const currentMsg = (prev.message || '').trim();
            if (currentMsg.includes(statusText)) {
                return prev;
            }
            const combined = currentMsg ? `${currentMsg}\n\n${statusText}` : statusText;
            return {
                ...prev,
                message: combined.slice(0, 500)
            };
        });
        setError(null);
    };

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
        { type: 'not_evacuated', id: 'not_evacuated', label: 'Non-Evacuated Only' },
        { type: 'all', id: 'all', label: 'All Registered Public' },
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

        if (isScheduled && !form.scheduled_at) {
            setError('Please pick a date and time for the scheduled broadcast.');
            return;
        }

        if (form.is_recurring && !form.recurrence_end_at) {
            setError('Please choose when the recurring alert should stop repeating.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const promises = selectedTargets.map(target => {
                let targetFilter = 'all';
                let centerId = undefined;

                if (target.type === 'not_evacuated') {
                    targetFilter = 'not_evacuated';
                } else if (target.type === 'center') {
                    targetFilter = 'all';
                    centerId = target.id;
                } else {
                    targetFilter = 'all';
                }

                const payload = { 
                    message: form.message,
                    channel: channelVal,
                    target_filter: targetFilter, 
                    evacuation_center_id: centerId,
                };
                
                if (isScheduled && form.scheduled_at) {
                    payload.scheduled_at = form.scheduled_at;
                }
                
                if (form.is_recurring) {
                    payload.is_recurring = true;
                    payload.recurrence_type = form.recurrence_type;
                    payload.recurrence_end_at = form.recurrence_end_at;
                    if (form.recurrence_type === 'custom') {
                        const val = Math.max(1, parseInt(form.recurrence_interval_value, 10) || 1);
                        const unit = form.recurrence_interval_unit || 'hours';
                        let minutes = val * 60;
                        if (unit === 'minutes') minutes = val;
                        else if (unit === 'hours') minutes = val * 60;
                        else if (unit === 'days') minutes = val * 1440;
                        else if (unit === 'weeks') minutes = val * 10080;

                        payload.recurrence_interval_value = val;
                        payload.recurrence_interval_unit = unit;
                        payload.recurrence_interval_minutes = minutes;
                    }
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
        if (opt.type === 'not_evacuated') {
            setSelectedTargets([{ type: 'not_evacuated', id: 'not_evacuated' }]);
            return;
        }

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
            setSelectedTargets(remaining.length > 0 ? remaining : [{ type: 'not_evacuated', id: 'not_evacuated' }]);
        } else {
            const filtered = selectedTargets.filter(t => t.type !== 'all' && t.type !== 'not_evacuated');
            setSelectedTargets([...filtered, { type: 'center', id: opt.id }]);
        }
    };

    const isNotEvacuatedSelected = selectedTargets.some(t => t.type === 'not_evacuated');
    const isAllSelected = selectedTargets.some(t => t.type === 'all');
    const selectedCenterCount = selectedTargets.filter(t => t.type === 'center').length;
    
    let targetSummaryLabel = 'Non-Evacuated Only';
    if (isNotEvacuatedSelected) {
        targetSummaryLabel = 'Non-Evacuated Only';
    } else if (isAllSelected) {
        targetSummaryLabel = 'All Registered Public';
    } else {
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
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                    Alert Message <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={appendCenterStatus}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all shadow-sm"
                                    title="Append live occupancy status of all evacuation centers to current message"
                                >
                                    Include Center Status
                                </button>
                            </div>
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

                        {/* Target Audience (Full Width) */}
                        <div className="space-y-2 flex flex-col relative" ref={targetDropdownRef}>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                    <span>Target Audience</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    {isNotEvacuatedSelected
                                        ? 'Non-Evacuated Only'
                                        : isAllSelected
                                        ? 'All Registered Citizens'
                                        : `${selectedCenterCount} Center(s) Selected`}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsTargetDropdownOpen(prev => !prev)}
                                className={`w-full min-h-[52px] px-4 py-2.5 bg-white dark:bg-slate-900 border-2 rounded-xl flex items-center justify-between text-left transition-all ${
                                    isTargetDropdownOpen
                                        ? 'border-blue-500 ring-4 ring-blue-500/10'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isNotEvacuatedSelected 
                                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                            : isAllSelected
                                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                    }`}>
                                        {isNotEvacuatedSelected ? (
                                            <UserX size={17} />
                                        ) : isAllSelected ? (
                                            <Users size={17} />
                                        ) : (
                                            <MapPin size={17} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block truncate">
                                            {targetSummaryLabel}
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-medium">
                                            {isNotEvacuatedSelected
                                                ? 'Broadcast will reach only households that have NOT yet evacuated.'
                                                : isAllSelected
                                                ? 'Broadcast will reach all citizens and evacuation units.'
                                                : `Alert targeted specifically to ${selectedCenterCount} designated evacuation center(s).`}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {!isAllSelected && !isNotEvacuatedSelected && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                            {selectedCenterCount}
                                        </span>
                                    )}
                                    <ChevronDown
                                        size={18}
                                        className={`text-slate-400 transition-transform duration-200 ${
                                            isTargetDropdownOpen ? 'rotate-180 text-blue-600' : ''
                                        }`}
                                    />
                                </div>
                            </button>

                            {/* Dropdown Popover */}
                            {isTargetDropdownOpen && (
                                <div className="absolute top-[72px] left-0 right-0 z-50 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {/* General Scope Options */}
                                    <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
                                        {/* Non-Evacuated Only Option */}
                                        <button
                                            type="button"
                                            onClick={() => toggleTarget({ type: 'not_evacuated', id: 'not_evacuated' })}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-bold transition-all ${
                                                isNotEvacuatedSelected
                                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isNotEvacuatedSelected}
                                                    onChange={() => {}}
                                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                                <div className="flex items-center gap-1.5">
                                                    <UserX size={14} className="text-amber-600 dark:text-amber-400" />
                                                    <span>Non-Evacuated Only</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-amber-600/80 dark:text-amber-400 font-medium">Households not in centers</span>
                                        </button>

                                        {/* All Public Option */}
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
                                                    <span>All Registered Public</span>
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

                        {/* Delivery Channels (Full Width) */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                    <span>Delivery Channels</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <span className="text-[11px] text-slate-400 font-medium">Select 1 or both channels</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* SMS Card */}
                                <label
                                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        channels.sms
                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={channels.sms}
                                        onChange={e => setChannels({ ...channels, sms: e.target.checked })}
                                        className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={16} className={channels.sms ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                                            <span className={`text-sm font-bold ${channels.sms ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-200'}`}>
                                                SMS Broadcast
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-tight">
                                            Direct text message to registered mobile phone numbers
                                        </p>
                                    </div>
                                </label>

                                {/* Push Card */}
                                <label
                                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        channels.push
                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={channels.push}
                                        onChange={e => setChannels({ ...channels, push: e.target.checked })}
                                        className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={16} className={channels.push ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                                            <span className={`text-sm font-bold ${channels.push ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-200'}`}>
                                                Push Notification
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-tight">
                                            Instant mobile app push alert to citizen devices
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
                                {channels.sms && channels.push
                                    ? '✓ Selected: Sending via both SMS Text and Push Notification'
                                    : channels.sms
                                    ? '✓ Selected: Sending via SMS Text Message only'
                                    : channels.push
                                    ? '✓ Selected: Sending via Mobile Push Notification only'
                                    : '⚠ Please select at least one delivery channel (SMS or Push)'}
                            </p>
                        </div>

                        {/* Timing & Repeat Section */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
                            <div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                                    <span>When should this alert send?</span>
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                    Choose whether to broadcast right now or pick an exact time in the future.
                                </p>
                            </div>

                            {/* Send Time Option Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleScheduleMode('now')}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        !isScheduled
                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">Send Immediately</span>
                                        {!isScheduled && <Check size={14} className="text-blue-600" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                        Broadcasts right now upon clicking confirm
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toggleScheduleMode('later')}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        isScheduled
                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">Schedule for Later</span>
                                        {isScheduled && <Check size={14} className="text-blue-600" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                        Set a specific date and time to broadcast
                                    </p>
                                </button>
                            </div>

                            {/* Scheduled Date & Time Picker */}
                            {isScheduled && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                        <Calendar size={14} className="text-blue-600" />
                                        <span>Pick Date and Time for First Broadcast:</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.scheduled_at}
                                        onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                                    />
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        The alert will automatically be dispatched when this date and time arrives.
                                    </p>
                                </div>
                            )}

                            {/* Recurring Alert Toggle */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.is_recurring}
                                        onChange={e => toggleRecurring(e.target.checked)}
                                        className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <RefreshCw size={14} className="text-blue-600" />
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                                                Repeat this alert automatically
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                            Re-send this message on a recurring schedule (e.g. daily updates or hourly reminders).
                                        </p>
                                    </div>
                                </label>

                                {/* Recurring Settings Box */}
                                {form.is_recurring && (
                                    <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
                                        {/* Step A: How often */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                                                <span>How often should it repeat?</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Choose a preset or set custom interval</span>
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {[
                                                    { key: 'hourly', label: 'Every 1 Hour', sub: 'Urgent notices' },
                                                    { key: 'daily', label: 'Every Day', sub: 'Daily briefing' },
                                                    { key: 'weekly', label: 'Every Week', sub: 'Weekly advisory' },
                                                    { key: 'custom', label: 'Custom', sub: 'Set own interval' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.key}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, recurrence_type: opt.key })}
                                                        className={`p-2.5 rounded-lg border text-center transition-all ${
                                                            form.recurrence_type === opt.key
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">{opt.label}</div>
                                                        <div className={`text-[10px] mt-0.5 ${form.recurrence_type === opt.key ? 'text-blue-100' : 'text-slate-400'}`}>
                                                            {opt.sub}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Custom Interval Configurator */}
                                            {form.recurrence_type === 'custom' && (
                                                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5 animate-in slide-in-from-top-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                                Custom Repeat Interval:
                                                            </div>
                                                            <div className="text-[11px] text-slate-400">
                                                                Set exactly how many minutes, hours, or days between broadcasts
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="999"
                                                                value={form.recurrence_interval_value}
                                                                onChange={e => {
                                                                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                                                    setForm({ ...form, recurrence_interval_value: val });
                                                                }}
                                                                className="w-20 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold text-center text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            />
                                                            <select
                                                                value={form.recurrence_interval_unit}
                                                                onChange={e => setForm({ ...form, recurrence_interval_unit: e.target.value })}
                                                                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            >
                                                                <option value="minutes">Minutes</option>
                                                                <option value="hours">Hours</option>
                                                                <option value="days">Days</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Quick Presets */}
                                                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
                                                        {[
                                                            { val: 30, unit: 'minutes', label: '30 Mins' },
                                                            { val: 2, unit: 'hours', label: '2 Hours' },
                                                            { val: 3, unit: 'hours', label: '3 Hours' },
                                                            { val: 6, unit: 'hours', label: '6 Hours' },
                                                            { val: 12, unit: 'hours', label: '12 Hours' },
                                                            { val: 2, unit: 'days', label: '2 Days' },
                                                        ].map(preset => {
                                                            const isSelected = form.recurrence_interval_value === preset.val && form.recurrence_interval_unit === preset.unit;
                                                            return (
                                                                <button
                                                                    key={`${preset.val}-${preset.unit}`}
                                                                    type="button"
                                                                    onClick={() => setForm({ ...form, recurrence_interval_value: preset.val, recurrence_interval_unit: preset.unit })}
                                                                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                                                                        isSelected
                                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                                    }`}
                                                                >
                                                                    {preset.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {form.recurrence_type === 'hourly' && (
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-0.5">
                                                    ℹ Hourly alerts repeat every 1 hour from the first broadcast.
                                                </p>
                                            )}
                                            {form.recurrence_type === 'daily' && (
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-0.5">
                                                    ℹ Daily alerts repeat at {isScheduled && form.scheduled_at ? new Date(form.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'this same time each day'}.
                                                </p>
                                            )}
                                            {form.recurrence_type === 'weekly' && (
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-0.5">
                                                    ℹ Weekly alerts repeat once every 7 days at {isScheduled && form.scheduled_at ? new Date(form.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'this same time'}.
                                                </p>
                                            )}
                                            {form.recurrence_type === 'custom' && (
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-0.5">
                                                    ℹ Custom alert will repeat every {form.recurrence_interval_value} {form.recurrence_interval_value === 1 ? form.recurrence_interval_unit.replace(/s$/, '') : form.recurrence_interval_unit} until the stop date.
                                                </p>
                                            )}
                                        </div>

                                        {/* Step B: Stop Repeating Date & Time */}
                                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                    When should it stop repeating?
                                                </label>
                                                <span className="text-[10px] text-slate-400 font-medium">End date & time</span>
                                            </div>

                                            {/* Quick Preset Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEndPreset(24)}
                                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    +24 Hours
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEndPreset(72)}
                                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    +3 Days
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEndPreset(168)}
                                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    +7 Days (1 Week)
                                                </button>
                                            </div>

                                            <input
                                                type="datetime-local"
                                                value={form.recurrence_end_at}
                                                onChange={e => setForm({ ...form, recurrence_end_at: e.target.value })}
                                                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                                            />
                                        </div>

                                        {/* Plain-English Live Summary */}
                                        <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2.5">
                                            <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div className="text-xs text-blue-900 dark:text-blue-200 font-medium">
                                                <span className="font-bold">Schedule Summary: </span>
                                                {getPlainScheduleSummary()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                        
                                        const computedUrl = (selectedCenters.length === 1 && targetCenter)
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
                                                    {selectedCenters.length === 1 ? 'Center: ' : 'Centers: '}
                                                    <span className="text-slate-800 dark:text-slate-100 font-extrabold">
                                                        {selectedCenters.length > 0
                                                            ? (selectedCenters.length === 1 ? (targetCenter?.name || 'Assigned Center') : `${selectedCenters.length} Centers Selected`)
                                                            : isNotEvacuatedSelected
                                                            ? 'All Evacuation Centers (Public Direct)'
                                                            : 'All Evacuation Centers'}
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