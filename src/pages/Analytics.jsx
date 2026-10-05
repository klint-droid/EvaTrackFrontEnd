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
import { useUserStore } from "../store/useUserStore";
import { useAlert } from "../context/AlertContext";

export default function Analytics() {
    // Derive role context from Zustand for UI branching
    const storedUser = useUserStore(state => state.user) || {};
    const isPersonnel = storedUser?.role === "evac_personnel";
    const assignedCenter = storedUser?.assigned_center; // { id, name } or null

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const { showAlert } = useAlert();

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
                event_id: "all",
                center_id: selectedCenterId,
                start_date: startDate,
                end_date: endDate,
                format: format
            });
        } catch (err) {
            console.error("Export failed:", err);
            showAlert("Export failed: " + (err.response?.data?.message || err.message || "Unknown error"), "Export Error", "danger");
        } finally {
            setExporting(false);
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

    // Fetch the dashboard statistics (scoped by date range and evacuation center)
    const fetchAnalytics = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            let queryParams = `event_id=all`;
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
        fetchCenters();
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [selectedCenterId, startDate, endDate]);

    const handleRefresh = () => {
        fetchAnalytics(true);
    };

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
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3 text-xs font-semibold">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                /* ── LOADING SKELETON STATE ── */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-80 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-72 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
                        <div className="h-72 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
                    </div>
                </div>
            ) : analytics ? (
                <div className="space-y-6">
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
                <div className="h-[50vh] flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-6">
                    <AlertTriangle size={40} className="text-amber-500 mb-2" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Analytics Data Available</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">Unable to construct metrics for the selected scope or server response was empty.</p>
                </div>
            )}

        </div>
    );
}