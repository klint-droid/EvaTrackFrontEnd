import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, AlertTriangle, Calendar } from "lucide-react";
import API from "../api";
import { exportAnalyticsData } from "../api/evacuationRecords/exportAnalyticsData";

// Extracted Components
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsFilters from "../components/analytics/AnalyticsFilters";
import AnalyticsKPIs from "../components/analytics/AnalyticsKPIs";
import EvacuationTrendsChart from "../components/analytics/EvacuationTrendsChart";
import DemographicPanel from "../components/analytics/DemographicPanel";
import CenterPerformance from "../components/analytics/CenterPerformance";
import ResourceRequestsAnalytics from "../components/analytics/ResourceRequestsAnalytics";
import CenterIssuesAnalytics from "../components/analytics/CenterIssuesAnalytics";

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
            <AnalyticsHeader 
                isPersonnel={isPersonnel}
                assignedCenter={assignedCenter}
                exportDropdown={exportDropdown}
                setExportDropdown={setExportDropdown}
                exporting={exporting}
                loading={loading}
                refreshing={refreshing}
                handleExport={handleExport}
                exportRef={exportRef}
                handleRefresh={handleRefresh}
            />

            {/* ── FILTER COMMAND BAR ── */}
            <AnalyticsFilters 
                selectedEventId={selectedEventId}
                setSelectedEventId={setSelectedEventId}
                events={events}
                isPersonnel={isPersonnel}
                selectedCenterId={selectedCenterId}
                setSelectedCenterId={setSelectedCenterId}
                centers={centers}
                assignedCenter={assignedCenter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
            />

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
                    <AnalyticsKPIs analytics={analytics} isPersonnel={isPersonnel} />

                    {/* ── 2. EVACUATION INTAKE TRENDS CHART ── */}
                    <EvacuationTrendsChart analytics={analytics} />

                    {/* ── 3. DEMOGRAPHIC INTELLIGENCE PANEL ── */}
                    <DemographicPanel analytics={analytics} />

                    {/* ── 4. CENTER PERFORMANCE & OCCUPANCY UTILIZATION ── */}
                    <CenterPerformance analytics={analytics} isPersonnel={isPersonnel} />

                    {/* ── 5. LOGISTICS & RESOURCE REQUESTS ANALYTICS ── */}
                    <ResourceRequestsAnalytics analytics={analytics} />

                    {/* ── 6. CENTER CONDITION & ISSUE HEALTH ── */}
                    <CenterIssuesAnalytics analytics={analytics} />

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