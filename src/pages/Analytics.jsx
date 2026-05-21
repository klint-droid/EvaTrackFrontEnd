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
        <div className="min-h-screen bg-[#090d16] text-slate-100 p-6">
            
            {/* ── HEADER COMMAND SECTION ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#0f172a]/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-lg">
                <div>
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-1">
                        <Sparkles size={14} className="animate-pulse" />
                        Intelligence Terminal
                    </div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                        Analytics Command Center
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Real-time demographic tracking, evacuation intake trends, and center utilization indices.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                        className="p-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-all shadow-md flex items-center justify-center disabled:opacity-50"
                        title="Force refresh"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>

                    <div className="relative">
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="appearance-none w-64 px-4 py-3 bg-[#1e293b]/90 hover:bg-[#334155]/90 text-slate-200 font-semibold rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer shadow-md pr-10"
                        >
                            <option value="all">🌐 All Disaster Events (Cross-Event)</option>
                            {events.map(event => (
                                <option key={event.event_id} value={event.event_id}>
                                    🚨 {event.name} ({event.type})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3.5 top-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 text-red-300 rounded-xl flex items-center gap-3 shadow-md">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {loading ? (
                /* ── LOADING SKELETON STATE ── */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-[#0f172a]/40 border border-slate-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-96 bg-[#0f172a]/40 border border-slate-800 rounded-2xl animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-80 bg-[#0f172a]/40 border border-slate-800 rounded-2xl animate-pulse" />
                        <div className="h-80 bg-[#0f172a]/40 border border-slate-800 rounded-2xl animate-pulse" />
                    </div>
                </div>
            ) : analytics ? (
                <div className="space-y-6">
                    
                    {/* ── EVENT METADATA WIDGET ── */}
                    {selectedEventId !== "all" && selectedEvent && (
                        <div className="flex flex-wrap items-center gap-4 bg-blue-950/20 border border-blue-900/40 p-4 rounded-xl text-sm">
                            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                                <Calendar size={16} /> Selected Disaster Event Status:
                            </span>
                            <span className="text-slate-300 font-medium">Type: {selectedEvent.type}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-300 font-medium">Started: {selectedEvent.started_at ? new Date(selectedEvent.started_at).toLocaleString() : "N/A"}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-300 font-medium">Ended: {selectedEvent.ended_at ? new Date(selectedEvent.ended_at).toLocaleString() : <span className="text-emerald-400 font-bold animate-pulse">● Active & Ongoing</span>}</span>
                        </div>
                    )}

                    {/* ── 1. KPI WIDGETS PANEL ── */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* HOUSEHOLDS CARD */}
                        <div className="bg-[#0f172a]/40 border border-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:border-slate-700/60 transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    Total Households
                                </p>
                                <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                    {analytics.summary.total_households.toLocaleString()}
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1">Unique household profiles registered</p>
                            </div>
                            <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Home size={22} />
                            </div>
                        </div>

                        {/* POPULATION CARD */}
                        <div className="bg-[#0f172a]/40 border border-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:border-slate-700/60 transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    Total Evacuated Individuals
                                </p>
                                <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                                    {analytics.summary.total_individuals.toLocaleString()}
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1">Total physical individuals processed</p>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Users size={22} />
                            </div>
                        </div>

                        {/* ACTIVE CENTERS CARD */}
                        <div className="bg-[#0f172a]/40 border border-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:border-slate-700/60 transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    Active Evacuation Centers
                                </p>
                                <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                                    {analytics.summary.active_centers}
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1">Currently operating facilities</p>
                            </div>
                            <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <Activity size={22} />
                            </div>
                        </div>

                        {/* CAPACITY UTILIZATION CARD */}
                        <div className="bg-[#0f172a]/40 border border-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:border-slate-700/60 transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    Capacity Utilization
                                </p>
                                <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-purple-400 transition-colors">
                                    {analytics.summary.avg_occupancy_pct}%
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1">Average capacity occupied</p>
                            </div>
                            <div className="p-4 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <TrendingUp size={22} />
                            </div>
                        </div>

                    </div>

                    {/* ── 2. EVACUATION INTAKE TRENDS CHART ── */}
                    <div className="bg-[#0f172a]/40 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="text-blue-500" size={20} />
                            <h3 className="text-lg font-bold text-white">Daily Evacuation Intake Curves</h3>
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
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
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
                        <div className="bg-[#0f172a]/40 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Users size={18} className="text-purple-400" />
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
                                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px" }}
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
                                                    <span className="text-slate-400">{item.group}</span>
                                                </div>
                                                <span className="font-semibold text-white">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Vulnerable groups segment */}
                            <div className="mt-8 border-t border-slate-800/50 pt-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                    Vulnerable Profiles & Care Lists
                                </h4>
                                {analytics.demographics.vulnerable_groups.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {analytics.demographics.vulnerable_groups.map((group) => (
                                            <div key={group.key} className="bg-slate-900/60 border border-slate-800/60 p-3.5 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs text-slate-400">{group.label}</span>
                                                    <h5 className="text-lg font-bold text-white mt-0.5">{group.count}</h5>
                                                </div>
                                                <div className="text-[10px] text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
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
                        <div className="bg-[#0f172a]/40 border border-slate-800/80 p-6 rounded-2xl shadow-lg space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-emerald-400" />
                                    Gender & Household Status Profile
                                </h3>

                                <div className="space-y-6">
                                    {/* Gender Balance Progress Bars */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                            Gender Balance Ratio
                                        </h4>
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Male ({analytics.demographics.gender[0]?.count || 0})</span>
                                            <span className="flex items-center gap-1.5">Female ({analytics.demographics.gender[1]?.count || 0}) <span className="w-2.5 h-2.5 rounded-full bg-pink-400" /></span>
                                        </div>
                                        
                                        {/* Progress Bar Component */}
                                        {(() => {
                                            const m = analytics.demographics.gender[0]?.count || 0;
                                            const f = analytics.demographics.gender[1]?.count || 0;
                                            const tot = m + f;
                                            const mPct = tot > 0 ? (m / tot) * 100 : 50;
                                            const fPct = tot > 0 ? (f / tot) * 100 : 50;
                                            return (
                                                <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                                                    <div style={{ width: `${mPct}%` }} className="bg-blue-500 h-full transition-all duration-500" title="Male" />
                                                    <div style={{ width: `${fPct}%` }} className="bg-pink-500 h-full transition-all duration-500" title="Female" />
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Household Status Distribution Graph */}
                                    <div className="pt-4 border-t border-slate-800/50">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                            Household Evacuation Lifecycle Statuses
                                        </h4>
                                        <div className="h-44 w-full">
                                            {analytics.status_distribution.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analytics.status_distribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                                        <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                                                        <YAxis dataKey="status_label" type="category" stroke="#64748b" fontSize={11} width={85} tickLine={false} />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px" }}
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
                    <div className="bg-[#0f172a]/40 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="text-emerald-500" size={20} />
                            <h3 className="text-lg font-bold text-white">Evacuation Center Performance Dashboard</h3>
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
                                                <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-lg p-4 text-xs text-slate-200">
                                                    <p className="font-bold text-white mb-2">{label}</p>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] inline-block" />
                                                        <span className="text-slate-400">Total Capacity:</span>
                                                        <span className="font-bold text-white">{entry?.rawCapacity}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block" />
                                                        <span className="text-slate-400">Current Occupancy:</span>
                                                        <span className="font-bold text-white">{entry?.rawOccupancy}</span>
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%" barSize={60}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                                                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip content={<CustomCenterTooltip />} cursor={{ fill: "rgba(148,163,184,0.04)" }} />
                                                    <Legend 
                                                        verticalAlign="top" 
                                                        height={36} 
                                                        iconType="square" 
                                                        iconSize={10}
                                                        formatter={(value) => (
                                                            <span className="text-slate-400 text-xs font-semibold">
                                                                {value === "capacity" ? "Capacity Limit" : "Active Occupancy"}
                                                            </span>
                                                        )}
                                                    />
                                                    <Bar name="capacity" dataKey="capacity" stackId="stack" fill="#1e293b" radius={[0, 0, 0, 0]}>
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
                                    <table className="w-full text-sm text-left text-slate-300">
                                        <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Evacuation Center</th>
                                                <th className="px-6 py-4 font-semibold text-center">Households</th>
                                                <th className="px-6 py-4 font-semibold text-center">Occupants</th>
                                                <th className="px-6 py-4 font-semibold text-center">Total Capacity</th>
                                                <th className="px-6 py-4 font-semibold">Capacity Index</th>
                                                <th className="px-6 py-4 font-semibold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/40">
                                            {analytics.center_performance.map((center) => (
                                                <tr key={center.center_id} className="hover:bg-slate-900/30 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white">{center.name}</td>
                                                    <td className="px-6 py-4 text-center font-medium">{center.households}</td>
                                                    <td className="px-6 py-4 text-center font-semibold text-slate-100">{center.occupancy}</td>
                                                    <td className="px-6 py-4 text-center font-medium text-slate-400">{center.capacity}</td>
                                                    <td className="px-6 py-4 min-w-[200px]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                                                <div 
                                                                    style={{ width: `${Math.min(center.utilization_pct, 100)}%` }} 
                                                                    className={`h-full rounded-full transition-all duration-500
                                                                        ${center.status === "critical" ? "bg-red-500" 
                                                                          : (center.status === "warning" ? "bg-amber-500" : "bg-emerald-500")}
                                                                    `}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-400 min-w-[35px]">{center.utilization_pct}%</span>
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
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500">
                    <AlertTriangle size={48} className="text-amber-500 mb-2" />
                    <h3 className="text-lg font-bold text-slate-300">Terminal Offline</h3>
                    <p className="text-sm mt-1">Unable to construct metrics due to missing database response.</p>
                </div>
            )}

        </div>
    );
}