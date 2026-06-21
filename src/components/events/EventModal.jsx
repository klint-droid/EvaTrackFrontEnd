import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Wind, Activity, Droplets, Mountain, Flame, 
    MoreHorizontal, AlertTriangle, Megaphone 
} from 'lucide-react';
import API from '../../api';
import { createEvent } from '../../api/events/createEvent';
import { getDisasterTypes } from '../../api/events/getDisasterTypes';
import { getSeverityLevels } from '../../api/events/getSeverityLevels';

const getIconForType = (typeName) => {
    const lower = (typeName || '').toLowerCase();
    if (lower.includes('typhoon') || lower.includes('storm')) return Wind;
    if (lower.includes('earthquake')) return Activity;
    if (lower.includes('flood')) return Droplets;
    if (lower.includes('volcan')) return Mountain;
    if (lower.includes('fire')) return Flame;
    return MoreHorizontal;
};

export default function EventModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', type_id: '', severity_id: '' });
    const [disasterTypes, setDisasterTypes] = useState([]);
    const [severityLevels, setSeverityLevels] = useState([]);
    const [availableScopes, setAvailableScopes] = useState([]);
    const [selectedScopes, setSelectedScopes] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const [typeRes, severityRes, brgyRes] = await Promise.all([
                    getDisasterTypes(), 
                    getSeverityLevels(),
                    API.get('/api/barangays')
                ]);
                setSeverityLevels(severityRes.data || []);
                setDisasterTypes(typeRes.data || []);
                
                const mambaling = (brgyRes.data || []).find(b => b.barangay_name.toLowerCase().includes('mambaling'));
                if (mambaling) {
                    const sitiosRes = await API.get(`/api/barangays/${mambaling.barangay_id}/sitios`);
                    const fetchedSitios = sitiosRes.data || [];
                    const scopes = [
                        { id: `brgy-${mambaling.barangay_id}`, name: `Brgy. ${mambaling.barangay_name}` },
                        ...fetchedSitios.map(s => ({ id: `sitio-${s.sitio_id}`, name: `Sitio ${s.sitio_name}` }))
                    ];
                    setAvailableScopes(scopes);
                } else {
                    setAvailableScopes([]);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load options.');
            } finally {
                setTypesLoading(false);
            }
        };
        fetchTypes();
    }, []);

    const handleSubmit = async () => {
        if (!form.name || !form.type_id || !form.severity_id) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createEvent(form);
            if (onCreated) onCreated();
            if (onClose) onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event.');
            setLoading(false);
        }
    };

    const handleAddScope = (e) => {
        const val = e.target.value;
        if (!val) return;
        const scope = availableScopes.find(s => s.id === val);
        if (scope && !selectedScopes.find(s => s.id === scope.id)) {
            setSelectedScopes([...selectedScopes, scope]);
        }
        e.target.value = "";
    };

    const handleRemoveScope = (id) => {
        setSelectedScopes(selectedScopes.filter(s => s.id !== id));
    };

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 sm:p-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Declare Official Disaster Event</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Formalize crisis response and activate barangay-level command protocols.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-3">
                            <AlertTriangle size={18} />
                            {error}
                        </div>
                    )}

                    {/* 1. EVENT CATEGORY */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 tracking-widest uppercase">1. Event Category</label>
                        {typesLoading ? (
                            <div className="text-sm text-slate-400">Loading categories...</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {disasterTypes.map(type => {
                                    const isSelected = form.type_id === type.type_id;
                                    const Icon = getIconForType(type.type_name);
                                    return (
                                        <button
                                            key={type.type_id}
                                            onClick={() => setForm({ ...form, type_id: type.type_id })}
                                            className={`flex flex-col items-center justify-center py-5 rounded-xl border-2 transition-all ${
                                                isSelected 
                                                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm' 
                                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            <Icon size={28} className={`mb-3 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={1.5} />
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-center px-1 break-words line-clamp-1">{type.type_name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 2. DECLARATION LEVEL */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 tracking-widest uppercase">2. Severity Level</label>
                            {typesLoading ? (
                                <div className="text-sm text-slate-400">Loading levels...</div>
                            ) : (
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {severityLevels.map(severity => {
                                        const isSelected = form.severity_id === severity.severity_id;
                                        return (
                                            <button
                                                key={severity.severity_id}
                                                onClick={() => setForm({ ...form, severity_id: severity.severity_id })}
                                                className={`flex-1 py-3.5 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                                    isSelected
                                                        ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                {severity.severity_label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3. EVENT NAME */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 tracking-widest uppercase">3. Event Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Typhoon Aghon - May 2024"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-[#3a3a3a] border-2 border-blue-500 ring-4 ring-blue-50 rounded-xl px-4 py-3 text-sm font-medium outline-none text-white placeholder-slate-500 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* 4. GEOGRAPHIC SCOPE */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 tracking-widest uppercase">4. Geographic Scope</label>
                            <div className="w-full border-2 border-slate-200 rounded-xl p-3 min-h-[52px] bg-white transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedScopes.map(scope => (
                                        <span key={scope.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                            {scope.name}
                                            <button onClick={() => handleRemoveScope(scope.id)} className="hover:text-red-500 transition-colors">
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    onChange={handleAddScope} 
                                    className="w-full text-sm font-medium outline-none text-slate-600 bg-transparent cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Add Territory +</option>
                                    {availableScopes.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* CRITICAL WARNING */}
                    <div className="mt-8 border-l-4 border-red-500 bg-white shadow-sm ring-1 ring-slate-100 p-5 rounded-r-xl">
                        <div className="flex gap-4">
                            <AlertTriangle size={24} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1.5">Critical Action Warning</h4>
                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                                    This action will trigger automatic notifications to all barangay officials, emergency response teams, and local evacuation coordinators. Official data reporting windows will be initialized upon declaration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-3 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || typesLoading || !form.name || !form.type_id || !form.severity_id}
                        className="px-6 py-2.5 bg-[#f5cb5c] hover:bg-[#ebd54b] text-slate-900 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Megaphone size={16} strokeWidth={2.5} />
                        {loading ? 'Declaring...' : 'Declare Event'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}