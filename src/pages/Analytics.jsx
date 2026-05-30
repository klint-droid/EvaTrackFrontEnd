import React, { useState, useEffect } from "react";
import { 
    BarChart3, Home, Users, Activity, TrendingUp, Calendar, AlertCircle, ChevronDown, RefreshCw, Sparkles, AlertTriangle
} from "lucide-react";
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, LabelList
} from "recharts";
import API from "../api";

const renderInsideLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 18) return null;
    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
        >
            {value}
        </text>
    );
};

export default function Analytics() {
    // Derive role context from localStorage for UI branching
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isPersonnel = storedUser?.role === "evac_personnel";
    const assignedCenter = storedUser?.assigned_center; // { id, name } or null

    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("all");
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Color palettes for the premium charts
    const AGE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6"]; // Blue, Emerald, Purple
    const GENDER_COLORS = ["#60a5fa", "#f472b6"]; // Sky Blue, Pink
    const STATUS_COLORS = {
        active: "#3b82f6",
        evacuated: "#10b981",
        not_evacuated: "#ef4444",
        relocated: "#8b5cf6",
        displaced: "#f59e0b",
        returned: "#6b7280"
    };

    // Fetch the list of disaster events for the dropdown
    const fetchEventsList = async () => {
        try {
            const res = await API.get("/api/analytics/events-list");
            if (res.data && res.data.success) {
                setEvents(res.data.events);
            }
        } catch (err) {
            console.error("Failed to load events list:", err);
            setError("Unable to retrieve disaster events.");
        }
    };

    // Fetch the dashboard statistics
    const fetchAnalytics = async (eventId, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await API.get(`/api/analytics/dashboard?event_id=${eventId}`);
            if (res.data && res.data.success) {
                setAnalytics(res.data.data);
                setError(null);
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setError("Error downloading real-time evacuation trend data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEventsList();
    }, []);

    useEffect(() => {
        fetchAnalytics(selectedEventId);
    }, [selectedEventId]);

    const handleRefresh = () => {
        fetchAnalytics(selectedEventId, true);
    };

    // Helper for selected event details
    const selectedEvent = events.find(e => e.event_id === selectedEventId);

    return (
        <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
            
            {/* ── HEADER COMMAND SECTION ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] text-white relative overflow-hidden shadow-sm">
                <div>
                    <div className="flex items-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-widest mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {isPersonnel && assignedCenter ? 'Center Intelligence' : 'Analytics Command'}
                    </div>
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                        {isPersonnel && assignedCenter ? `${assignedCenter.name} Analytics` : 'Analytics Command Center'}
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-300 max-w-xl font-medium leading-relaxed hidden sm:block">
                        {isPersonnel && assignedCenter
                            ? `Demographic tracking, evacuation intake trends, and utilization data for ${assignedCenter.name}.`
                            : 'Real-time demographic tracking, evacuation intake trends, and center utilization indices.'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isPersonnel && assignedCenter && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                            </span>
                            {assignedCenter.name}
                        </div>
                    )}

                    <button 
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                        className="p-3 bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white rounded-xl shadow-sm flex items-center justify-center disabled:opacity-50"
                        title="Force refresh"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>

                    <div className="relative">
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="appearance-none w-64 px-4 py-3 bg-white/15 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer shadow-sm pr-10"
                        >
                            <option value="all">🌐 All Disaster Events (Cross-Event)</option>
                            {events.map(event => (
                                <option key={event.event_id} value={event.event_id}>
                                    🚨 {event.name} ({event.type})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3.5 top-4 text-white/60 pointer-events-none" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3 shadow-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {loading ? (
                /* ── LOADING SKELETON STATE ── */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-96 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-80 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
                        <div className="h-80 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
                    </div>
                </div>
            ) : analytics ? (
                <div className="space-y-6">
                    
                    {/* ── EVENT METADATA WIDGET ── */}
                    {selectedEventId !== "all" && selectedEvent && (
                        <div className="flex flex-wrap items-center gap-4 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm">
                            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                                <Calendar size={16} /> Selected Disaster Event Status:
                            </span>
                            <span className="text-slate-700 font-medium">Type: {selectedEvent.type}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-700 font-medium">Started: {selectedEvent.started_at ? new Date(selectedEvent.started_at).toLocaleString() : "N/A"}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-700 font-medium">Ended: {selectedEvent.ended_at ? new Date(selectedEvent.ended_at).toLocaleString() : <span className="text-emerald-600 font-bold animate-pulse">● Active & Ongoing</span>}</span>
                        </div>
                    )}

                    {/* ── 1. KPI WIDGETS PANEL ── */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* HOUSEHOLDS CARD */}
                        <div className="bg-white border border-slate-100 border-l-4 border-l-blue-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    {isPersonnel ? 'Center Households' : 'Total Households'}
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {analytics.summary.total_households.toLocaleString()}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">{isPersonnel ? 'Households registered at your center' : 'Unique household profiles registered'}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                                <Home size={22} />
                            </div>
                        </div>

                        {/* POPULATION CARD */}
                        <div className="bg-white border border-slate-100 border-l-4 border-l-emerald-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    {isPersonnel ? 'Center Evacuated' : 'Total Evacuated Individuals'}
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {analytics.summary.total_individuals.toLocaleString()}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">{isPersonnel ? 'Individuals processed at your center' : 'Total physical individuals processed'}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                                <Users size={22} />
                            </div>
                        </div>

                        {/* ACTIVE CENTERS CARD */}
                        <div className="bg-white border border-slate-100 border-l-4 border-l-amber-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Active Evacuation Centers
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {analytics.summary.active_centers}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">Currently operating facilities</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                                <Activity size={22} />
                            </div>
                        </div>

                        {/* CAPACITY UTILIZATION CARD */}
                        <div className="bg-white border border-slate-100 border-l-4 border-l-purple-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Capacity Utilization
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {analytics.summary.avg_occupancy_pct}%
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">Average capacity occupied</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
                                <TrendingUp size={22} />
                            </div>
                        </div>

                    </div>

                    {/* ── 2. EVACUATION INTAKE TRENDS CHART ── */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="text-indigo-600" size={20} />
                            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Daily Evacuation Intake Curves</h3>
                        </div>

                        <div className="h-80 w-full">
                            {analytics.evacuation_trends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.evacuation_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIndividuals" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorHouseholds" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#1e293b" }}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" name="Evacuated Individuals" dataKey="individuals" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIndividuals)" />
                                        <Area type="monotone" name="Evacuated Households" dataKey="households" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHouseholds)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                    <AlertCircle size={32} className="mb-2 text-slate-600" />
                                    No evacuation intake records found for this scope.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── 3. DEMOGRAPHIC INTELLIGENCE PANEL ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* AGE & VULNERABILITIES */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                                    <Users size={18} className="text-purple-600" />
                                    Age Distribution & Vulnerability
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    {/* Donut Chart */}
                                    <div className="h-48 flex justify-center items-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.demographics.age_groups}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={3}
                                                    dataKey="count"
                                                >
                                                    {analytics.demographics.age_groups.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b" }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Donut Legends */}
                                    <div className="space-y-3">
                                        {analytics.demographics.age_groups.map((item, idx) => (
                                            <div key={item.group} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: AGE_COLORS[idx] }} />
                                                    <span className="text-slate-500 font-medium">{item.group}</span>
                                                </div>
                                                <span className="font-bold text-slate-800">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Vulnerable groups segment */}
                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    Vulnerable Profiles & Care Lists
                                </h4>
                                {analytics.demographics.vulnerable_groups.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {analytics.demographics.vulnerable_groups.map((group) => (
                                            <div key={group.key} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs text-slate-500 font-bold">{group.label}</span>
                                                    <h5 className="text-lg font-black text-slate-800 mt-0.5">{group.count}</h5>
                                                </div>
                                                <div className="text-[10px] text-indigo-600 font-bold px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                                                    Care List
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">No vulnerable individuals registered.</p>
                                )}
                            </div>
                        </div>

                        {/* GENDER & HOUSEHOLD STATUS DISTRIBUTION */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-emerald-600" />
                                    Gender & Household Status Profile
                                </h3>

                                <div className="space-y-6">
                                    {/* Gender Balance Progress Bars */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Gender Balance Ratio
                                        </h4>
                                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Male ({analytics.demographics.gender[0]?.count || 0})</span>
                                            <span className="flex items-center gap-1.5">Female ({analytics.demographics.gender[1]?.count || 0}) <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /></span>
                                        </div>
                                        
                                        {/* Progress Bar Component */}
                                        {(() => {
                                            const m = analytics.demographics.gender[0]?.count || 0;
                                            const f = analytics.demographics.gender[1]?.count || 0;
                                            const tot = m + f;
                                            const mPct = tot > 0 ? (m / tot) * 100 : 50;
                                            const fPct = tot > 0 ? (f / tot) * 100 : 50;
                                            return (
                                                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                                                    <div style={{ width: `${mPct}%` }} className="bg-blue-500 h-full transition-all duration-500" title="Male" />
                                                    <div style={{ width: `${fPct}%` }} className="bg-pink-500 h-full transition-all duration-500" title="Female" />
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Household Status Distribution Graph */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                            Household Evacuation Lifecycle Statuses
                                        </h4>
                                        <div className="h-44 w-full">
                                            {analytics.status_distribution.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analytics.status_distribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                        <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                        <YAxis dataKey="status_label" type="category" stroke="#94a3b8" fontSize={11} width={85} tickLine={false} />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b" }}
                                                        />
                                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                                            {analytics.status_distribution.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status_key] || "#3b82f6"} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <p className="text-xs text-slate-500 italic">No lifecycle status data found.</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── 4. CENTER PERFORMANCE & OCCUPANCY UTILIZATION ── */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="text-emerald-600" size={20} />
                            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">{isPersonnel ? 'Your Center Performance' : 'Evacuation Center Performance Dashboard'}</h3>
                        </div>

                        {analytics.center_performance.length > 0 ? (
                            <div className="space-y-6">
                                
                                {/* Capacity comparison Bar Chart */}
                                <div className="h-64 w-full">
                                    {(() => {
                                        const chartData = analytics.center_performance.map((center) => {
                                            const total = center.capacity + center.occupancy;
                                            const capacityPercent = total > 0 ? (center.capacity / total) * 100 : 0;
                                            const occupancyPercent = total > 0 ? (center.occupancy / total) * 100 : 0;
                                            return {
                                                name: center.name,
                                                capacity: Math.round(capacityPercent),
                                                occupancy: Math.round(occupancyPercent),
                                                rawCapacity: center.capacity,
                                                rawOccupancy: center.occupancy,
                                            };
                                        });

                                        const CustomCenterTooltip = ({ active, payload, label }) => {
                                            if (!active || !payload || !payload.length) return null;
                                            const entry = chartData.find((d) => d.name === label);
                                            return (
                                                <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-xs text-slate-700">
                                                    <p className="font-bold text-slate-800 mb-2">{label}</p>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#e2e8f0] inline-block" />
                                                        <span className="text-slate-500">Total Capacity:</span>
                                                        <span className="font-bold text-slate-800">{entry?.rawCapacity}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block" />
                                                        <span className="text-slate-500">Current Occupancy:</span>
                                                        <span className="font-bold text-slate-800">{entry?.rawOccupancy}</span>
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%" barSize={60}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip content={<CustomCenterTooltip />} cursor={{ fill: "rgba(148,163,184,0.04)" }} />
                                                    <Legend 
                                                        verticalAlign="top" 
                                                        height={36} 
                                                        iconType="square" 
                                                        iconSize={10}
                                                        formatter={(value) => (
                                                            <span className="text-slate-500 text-xs font-semibold">
                                                                {value === "capacity" ? "Capacity Limit" : "Active Occupancy"}
                                                            </span>
                                                        )}
                                                    />
                                                    <Bar name="capacity" dataKey="capacity" stackId="stack" fill="#e2e8f0" radius={[0, 0, 0, 0]}>
                                                        <LabelList dataKey="rawCapacity" content={renderInsideLabel} />
                                                    </Bar>
                                                    <Bar name="occupancy" dataKey="occupancy" stackId="stack" fill="#10b981" radius={[4, 4, 0, 0]}>
                                                        <LabelList dataKey="rawOccupancy" content={renderInsideLabel} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        );
                                    })()}
                                </div>

                                {/* Centers detail utilization list */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-black">Evacuation Center</th>
                                                <th className="px-6 py-4 font-black text-center">Households</th>
                                                <th className="px-6 py-4 font-black text-center">Occupants</th>
                                                <th className="px-6 py-4 font-black text-center">Total Capacity</th>
                                                <th className="px-6 py-4 font-black">Capacity Index</th>
                                                <th className="px-6 py-4 font-black text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {analytics.center_performance.map((center) => (
                                                <tr key={center.center_id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4 font-black text-slate-800">{center.name}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{center.households}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-800">{center.occupancy}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-400">{center.capacity}</td>
                                                    <td className="px-6 py-4 min-w-[200px]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                                                <div 
                                                                    style={{ width: `${Math.min(center.utilization_pct, 100)}%` }} 
                                                                    className={`h-full rounded-full transition-all duration-500
                                                                        ${center.status === "critical" ? "bg-red-500" 
                                                                          : (center.status === "warning" ? "bg-amber-500" : "bg-emerald-500")}
                                                                    `}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-black text-slate-400 min-w-[35px]">{center.utilization_pct}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                                                            ${center.status === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                              : (center.status === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}
                                                        `}>
                                                            <span className={`w-1.5 h-1.5 rounded-full animate-ping
                                                                ${center.status === "critical" ? "bg-red-400" 
                                                                  : (center.status === "warning" ? "bg-amber-400" : "bg-emerald-400")}
                                                            `} />
                                                            {center.status === "critical" ? "Overcapacity Alert" 
                                                              : (center.status === "warning" ? "Near Capacity" : "Optimal Load")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                <AlertTriangle size={36} className="text-slate-600 mb-2" />
                                No evacuation centers are linked to the selected scope.
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                 <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <AlertTriangle size={48} className="text-amber-500 mb-2" />
                    <h3 className="text-lg font-black text-slate-800">Terminal Offline</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Unable to construct metrics due to missing database response.</p>
                </div>
            )}

        </div>
    );
}