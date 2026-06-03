import React, { useState, useEffect, useRef } from "react";
import { 
    BarChart3, Home, Users, Activity, TrendingUp, Calendar, AlertCircle, ChevronDown, RefreshCw, Sparkles, AlertTriangle, Download, FileSpreadsheet, FileText, Package, ShieldAlert
} from "lucide-react";
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, LabelList
} from "recharts";
import API from "../api";
import { exportAnalyticsData } from "../api/evacuationRecords/exportAnalyticsData";

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

    // Dynamic Filter State
    const initialCenterId = isPersonnel 
        ? (assignedCenter?.evacuation_center_id || assignedCenter?.id || storedUser?.assigned_center_id || "all")
        : "all";
    const [selectedCenterId, setSelectedCenterId] = useState(initialCenterId);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [centers, setCenters] = useState([]);

    // Export Dropdown State
    const [exportDropdown, setExportDropdown] = useState(false);
    const [exporting, setExporting] = useState(false);
    const exportRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setExportDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleExport = async (pathType, format) => {
        setExporting(true);
        setExportDropdown(false);
        try {
            await exportAnalyticsData(pathType, {
                event_id: selectedEventId,
                center_id: selectedCenterId,
                start_date: startDate,
                end_date: endDate,
                format: format
            });
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed: " + (err.response?.data?.message || err.message || "Unknown error"));
        } finally {
            setExporting(false);
        }
    };

    // Color palettes for the premium charts
    const AGE_COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#8b5cf6"]; // Blue, Sky, Emerald, Purple
    const GENDER_COLORS = ["#60a5fa", "#f472b6"]; // Sky Blue, Pink
    const STATUS_COLORS = {
        active: "#3b82f6",
        evacuated: "#10b981",
        not_evacuated: "#ef4444",
        relocated: "#8b5cf6",
        displaced: "#f59e0b",
        returned: "#6b7280"
    };

    const REQ_STATUS_COLORS = {
        pending: "#64748b",      // Slate
        acknowledged: "#8b5cf6", // Purple
        approved: "#3b82f6",     // Blue
        delivered: "#10b981",    // Emerald
        rejected: "#ef4444"      // Red
    };

    const URGENCY_COLORS = {
        critical: "#dc2626", // Red
        high: "#f97316",     // Orange
        medium: "#eab308",   // Yellow
        low: "#3b82f6"       // Blue
    };

    const ISSUE_STATUS_COLORS = {
        open: "#ef4444",        // Red
        in_progress: "#f59e0b", // Amber
        resolved: "#10b981",    // Emerald
        closed: "#6b7280"       // Gray
    };

    const SEVERITY_COLORS = {
        critical: "#dc2626",
        high: "#f97316",
        medium: "#eab308",
        low: "#3b82f6"
    };

    const CATEGORY_COLORS = {
        incident: "#ec4899",      // Pink
        facility_issue: "#3b82f6",// Blue
        health_issue: "#10b981",  // Emerald
        safety_issue: "#f97316",  // Orange
        other: "#64748b"          // Slate
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

    // Fetch list of centers for dropdown (Admin only)
    const fetchCenters = async () => {
        try {
            const res = await API.get("/api/evacuation-centers");
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setCenters(data);
        } catch (err) {
            console.error("Failed to load evacuation centers:", err);
        }
    };

    // Fetch the dashboard statistics
    const fetchAnalytics = async (eventId, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            let queryParams = `event_id=${eventId}`;
            if (selectedCenterId && selectedCenterId !== "all") {
                queryParams += `&center_id=${selectedCenterId}`;
            }
            if (startDate) {
                queryParams += `&start_date=${startDate}`;
            }
            if (endDate) {
                queryParams += `&end_date=${endDate}`;
            }

            const res = await API.get(`/api/analytics/dashboard?${queryParams}`);
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
        fetchCenters();
    }, []);

    useEffect(() => {
        fetchAnalytics(selectedEventId);
    }, [selectedEventId, selectedCenterId, startDate, endDate]);

    const handleRefresh = () => {
        fetchAnalytics(selectedEventId, true);
    };

    // Helper for selected event details
    const selectedEvent = events.find(e => e.event_id === selectedEventId);

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
            
            {/* ── HEADER COMMAND SECTION ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Analytics Command Center
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {isPersonnel && assignedCenter
                            ? `Real-time demographic tracking, evacuation trends, and utilization metrics for ${assignedCenter.name || "your assigned center"}.`
                            : 'Real-time demographic tracking, evacuation intake trends, and center utilization indices across all locations.'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Export Dropdown */}
                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportDropdown(prev => !prev)}
                            disabled={exporting || loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black active:scale-95 transition-all shadow-md shadow-blue-600/10 disabled:opacity-50 cursor-pointer"
                        >
                            {exporting ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Download size={14} />
                            )}
                            {exporting ? "Exporting..." : "Export Reports"}
                            <ChevronDown size={14} />
                        </button>

                        {exportDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Report to Export</p>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {[
                                        { key: "dromic", label: "DROMIC Master List", desc: "DSWD compliant evacuee profiling list", formats: ["csv", "pdf"] },
                                        { key: "demographics", label: "Demographic Summary", desc: "Aggregated stats, age groups, gender details", formats: ["csv", "pdf"] },
                                        { key: "utilization", label: "Center Utilization & Capacity", desc: "Occupancy rates, available slots per center", formats: ["csv", "pdf"] },
                                        { key: "vulnerable", label: "Vulnerable Groups Care List", desc: "Targeted lists of PWDs, pregnant, seniors", formats: ["csv", "pdf"] },
                                        { key: "resources", label: "Resource Requests Report", desc: "Logistic request status and urgency audits", formats: ["csv", "pdf"] },
                                        { key: "issues", label: "Center Issues Log", desc: "Facility issues tracking and severity levels", formats: ["csv", "pdf"] },
                                        { key: "daily-intake", label: "Daily Intake Trends", desc: "Tabular curve of daily evacuee intake", formats: ["csv"] }
                                    ].map((report) => (
                                        <div key={report.key} className="p-3.5 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">{report.label}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">{report.desc}</p>
                                            </div>
                                            <div className="flex gap-2.5">
                                                {report.formats.includes("csv") && (
                                                    <button
                                                        onClick={() => handleExport(report.key, "csv")}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <FileSpreadsheet size={12} className="text-emerald-500" />
                                                        CSV
                                                    </button>
                                                )}
                                                {report.formats.includes("pdf") && (
                                                    <button
                                                        onClick={() => handleExport(report.key, "pdf")}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <FileText size={12} className="text-red-500" />
                                                        PDF
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
                        title="Force refresh"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        Refresh Metrics
                    </button>
                </div>
            </div>

            {/* ── FILTER COMMAND BAR ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                    {/* Disaster Event Dropdown */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disaster Event</span>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100/50 transition-colors"
                        >
                            <option value="all">🌐 All Disaster Events</option>
                            {events.map(event => (
                                <option key={event.event_id} value={event.event_id}>
                                    🚨 {event.name} ({event.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Center Dropdown (Admin Only) */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evacuation Center</span>
                        {!isPersonnel ? (
                            <select
                                value={selectedCenterId}
                                onChange={(e) => setSelectedCenterId(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100/50 transition-colors min-w-[200px]"
                            >
                                <option value="all">🏢 All Evacuation Centers</option>
                                {centers.map(center => (
                                    <option key={center.evacuation_center_id} value={center.evacuation_center_id}>
                                        {center.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="px-3 py-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black rounded-xl inline-block max-w-[250px] truncate">
                                🏠 {assignedCenter?.name || "Assigned Center"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date Filters Section */}
                <div className="flex flex-row gap-4 items-center w-full lg:w-auto justify-start lg:justify-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">From Date</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:bg-slate-100/50 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">To Date</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:bg-slate-100/50 transition-colors"
                        />
                    </div>
                    {(startDate || endDate || (selectedCenterId !== "all" && !isPersonnel)) && (
                        <button
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                                if (!isPersonnel) setSelectedCenterId("all");
                            }}
                            className="mt-5 text-xs text-red-500 hover:text-red-700 font-black uppercase tracking-widest transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wide">{error}</span>
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
                                            const rawCapacity = center.capacity;
                                            const rawOccupancy = center.occupancy;
                                            const remaining = Math.max(0, rawCapacity - rawOccupancy);
                                            return {
                                                name: center.name,
                                                occupancy: rawOccupancy,
                                                remaining: remaining,
                                                rawCapacity,
                                                rawOccupancy,
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
                                                        <span className="text-slate-500">Remaining Slots:</span>
                                                        <span className="font-bold text-slate-800">{entry?.remaining}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] inline-block" />
                                                        <span className="text-slate-500">Active Occupancy:</span>
                                                        <span className="font-bold text-[#3b82f6]">{entry?.rawOccupancy}</span>
                                                    </div>
                                                    <div className="border-t border-slate-100 mt-2 pt-2 flex items-center gap-2">
                                                        <span className="text-slate-400">Total Capacity:</span>
                                                        <span className="font-extrabold text-slate-800">{entry?.rawCapacity}</span>
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%" barSize={60}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip content={<CustomCenterTooltip />} cursor={{ fill: "rgba(148,163,184,0.04)" }} />
                                                    <Legend 
                                                        verticalAlign="top" 
                                                        height={36} 
                                                        iconType="square" 
                                                        iconSize={10}
                                                        formatter={(value) => (
                                                            <span className="text-slate-500 text-xs font-semibold">
                                                                {value === "remaining" ? "Available Slots" : "Current Occupants"}
                                                            </span>
                                                        )}
                                                    />
                                                    <Bar name="occupancy" dataKey="occupancy" stackId="stack" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                                                        <LabelList dataKey="rawOccupancy" content={renderInsideLabel} />
                                                    </Bar>
                                                    <Bar name="remaining" dataKey="remaining" stackId="stack" fill="#e2e8f0" radius={[4, 4, 0, 0]}>
                                                        <LabelList dataKey="rawCapacity" content={(props) => {
                                                            const { x, y, width, value } = props;
                                                            return (
                                                                <text
                                                                    x={x + width / 2}
                                                                    y={y - 8}
                                                                    fill="#64748b"
                                                                    textAnchor="middle"
                                                                    fontSize={10}
                                                                    fontWeight={800}
                                                                >
                                                                    Limit: {value}
                                                                </text>
                                                            );
                                                        }} />
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
                                                                          : (center.status === "warning" ? "bg-red-500" : "bg-blue-500")}
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

                    {/* ── 5. LOGISTICS & RESOURCE REQUESTS ANALYTICS ── */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
                        <div className="flex items-center gap-2">
                            <Package className="text-emerald-600" size={20} />
                            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Logistics & Resource Demands</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Request Status Donut Chart */}
                            <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Request Status Breakdown
                                    </h4>
                                    <div className="h-44 flex items-center justify-center">
                                        {analytics.resource_requests?.status_distribution?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analytics.resource_requests.status_distribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="count"
                                                    >
                                                        {analytics.resource_requests.status_distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={REQ_STATUS_COLORS[entry.status_key] || "#64748b"} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No resource requests recorded</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {analytics.resource_requests?.status_distribution?.map((item) => (
                                        <div key={item.status_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REQ_STATUS_COLORS[item.status_key] }} />
                                                <span className="text-slate-500 font-bold truncate capitalize">{item.status_label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Urgency Distribution Bar Chart */}
                            <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Demands by Urgency Index
                                    </h4>
                                    <div className="h-44">
                                        {analytics.resource_requests?.urgency_distribution?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.resource_requests.urgency_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis dataKey="urgency_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                                                        {analytics.resource_requests.urgency_distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.urgency_key] || "#3b82f6"} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No urgency metrics found</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {analytics.resource_requests?.urgency_distribution?.map((item) => (
                                        <div key={item.urgency_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: URGENCY_COLORS[item.urgency_key] }} />
                                                <span className="text-slate-500 font-bold truncate capitalize">{item.urgency_label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Requested Items (Horizontal Bar Chart) */}
                            <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Top Requested Resource Types
                                    </h4>
                                    <div className="h-44">
                                        {analytics.resource_requests?.top_types?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.resource_requests.top_types} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                    <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                                    <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={9} width={80} tickLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                                        <LabelList dataKey="total_quantity" content={(props) => {
                                                            const { x, y, width, value } = props;
                                                            return (
                                                                <text x={x + width + 5} y={y + 11} fill="#64748b" fontSize={9} fontWeight={700}>
                                                                    Qty: {value}
                                                                </text>
                                                            );
                                                        }} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No resource requests recorded</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 border-t border-slate-200/60 pt-3">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                                        Total Request Types: {analytics.resource_requests?.top_types?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 6. CENTER CONDITION & ISSUE HEALTH ── */}
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="text-emerald-600" size={20} />
                            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Facility Health & Active Issues</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Issues Status Donut Chart */}
                            <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Issue Resolution Rate
                                    </h4>
                                    <div className="h-44 flex items-center justify-center">
                                        {analytics.center_issues?.status_distribution?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analytics.center_issues.status_distribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="count"
                                                    >
                                                        {analytics.center_issues.status_distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={ISSUE_STATUS_COLORS[entry.status_key] || "#64748b"} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No facility issues recorded</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {analytics.center_issues?.status_distribution?.map((item) => (
                                        <div key={item.status_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ISSUE_STATUS_COLORS[item.status_key] }} />
                                                <span className="text-slate-500 font-bold truncate capitalize">{item.status_label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Severity Level Bar Chart */}
                            <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Unresolved Issues by Severity
                                    </h4>
                                    <div className="h-44">
                                        {analytics.center_issues?.severity_distribution?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.center_issues.severity_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis dataKey="severity_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                                                        {analytics.center_issues.severity_distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity_key] || "#3b82f6"} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No severity metrics found</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {analytics.center_issues?.severity_distribution?.map((item) => (
                                        <div key={item.severity_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[item.severity_key] }} />
                                                <span className="text-slate-500 font-bold truncate capitalize">{item.severity_label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Distribution Bar Chart */}
                            <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Common Categories
                                    </h4>
                                    <div className="h-44">
                                        {analytics.center_issues?.category_distribution?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.center_issues.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis dataKey="category_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                                                        {analytics.center_issues.category_distribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category_key] || "#64748b"} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No issues reported</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    {analytics.center_issues?.category_distribution?.map((item) => (
                                        <div key={item.category_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category_key] }} />
                                                <span className="text-slate-500 font-bold truncate capitalize">{item.category_label}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
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