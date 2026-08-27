import React, { useEffect, useState } from "react";
import { getCenters } from "../api/evacuation/getCenters";
import { getAlerts } from "../api/alerts/getAlerts";
import { getCenterIssueReports } from "../api/centerIssueReports/getCenterIssueReports";
import { getResourceRequests } from "../api/resourceRequests/getResourceRequests";
import { getUser } from "../api/auth/getUser";
import { getEvents } from "../api/events/getEvents";
import { getActiveEvent } from "../api/events/getActiveEvent";
import { getLastUpdated } from "../api/analytics/getLastUpdated";

import { useUserStore } from "../store/useUserStore";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import DashboardCapacityArea from "../components/dashboard/DashboardCapacityArea";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";

// Module-level cache to persist dashboard metrics across route navigation
let dashboardCache = null;
let dashboardCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache expiration

const Dashboard = () => {
    // Derive role context from Zustand for UI branching
    const storedUser = useUserStore(state => state.user) || {};
    const isPersonnel = storedUser?.role === "evac_personnel";
    const assignedCenter = storedUser?.assigned_center; // { id, name } or null

    const [user, setUser] = useState(dashboardCache?.user || null);
    const [centers, setCenters] = useState(dashboardCache?.centers || []);
    const [activeEvents, setActiveEvents] = useState(dashboardCache?.activeEvents || []);
    const [activeEvent, setActiveEvent] = useState(dashboardCache?.activeEvent || null);
    const [selectedEventId, setSelectedEventId] = useState("all");
    const [stats, setStats] = useState(dashboardCache?.stats || {
        totalCenters: 0,
        totalCapacity: 0,
        totalOccupied: 0,
        totalHouseholds: 0,
        pendingRequests: 0,
        openIssues: 0,
    });
    const [recentAlerts, setRecentAlerts] = useState(dashboardCache?.recentAlerts || []);
    const [recentRequests, setRecentRequests] = useState(dashboardCache?.recentRequests || []);
    const [recentIssues, setRecentIssues] = useState(dashboardCache?.recentIssues || []);
    const [lastUpdatedTime, setLastUpdatedTime] = useState(dashboardCache?.lastUpdatedTime || null);
    const [loading, setLoading] = useState(!dashboardCache);

    useEffect(() => {
        const now = Date.now();
        const isCacheExpired = !dashboardCacheTime || (now - dashboardCacheTime > CACHE_DURATION);
        
        // Automatically load in the background if cache is stale
        if (isCacheExpired) {
            loadDashboard(false);
        }
    }, []);

    const loadDashboard = async (forceRefresh = false) => {
        if (!dashboardCache || forceRefresh) {
            setLoading(true);
        }
        try {
            const [userRes, centersRes, alertsRes, issuesRes, requestsRes, eventsRes, lastUpdatedRes, activeEvtRes] = await Promise.allSettled([
                getUser(),
                getCenters(),
                getAlerts(1),
                getCenterIssueReports({ limit: 10 }),
                getResourceRequests({ limit: 10 }),
                getEvents(),
                getLastUpdated(),
                getActiveEvent()
            ]);

            // 1. Process User Context
            let currentUser = user;
            if (userRes.status === 'fulfilled') {
                const res = userRes.value;
                currentUser = res?.data || res;
                setUser(currentUser);
            } else {
                console.error("Failed to load user profile:", userRes.reason);
            }

            // 2. Process Evacuation Centers
            let centersList = [];
            if (centersRes.status === 'fulfilled') {
                const res = centersRes.value;
                centersList = Array.isArray(res) ? res : (res?.data ?? []);
            } else {
                console.error("Failed to load evacuation centers:", centersRes.reason);
            }

            // If personnel, restrict dashboard views strictly to their assigned center
            if (isPersonnel) {
                const assignedId = storedUser?.assigned_center?.id || storedUser?.assigned_center_id;
                if (assignedId) {
                    const targetId = Number(assignedId) || assignedId;
                    centersList = centersList.filter(c => {
                        const centerId = Number(c.evacuation_center_id) || c.evacuation_center_id;
                        return centerId === targetId;
                    });
                }
            }
            setCenters(centersList);

            // Process Events
            let eventsList = [];
            if (eventsRes.status === 'fulfilled') {
                const res = eventsRes.value;
                eventsList = res?.data || res || [];
            } else {
                console.error("Failed to load events:", eventsRes.reason);
            }
            setActiveEvents(eventsList);

            // Process Primary Active Event
            let primaryActiveEvt = null;
            if (activeEvtRes && activeEvtRes.status === 'fulfilled') {
                const res = activeEvtRes.value;
                primaryActiveEvt = res?.data || res || null;
            }
            setActiveEvent(primaryActiveEvt);

            // Default dropdown to the current active event
            if (primaryActiveEvt?.event_id) {
                setSelectedEventId(String(primaryActiveEvt.event_id));
            } else {
                const ongoing = eventsList.find(e => !e.ended_at);
                if (ongoing?.event_id) {
                    setSelectedEventId(String(ongoing.event_id));
                }
            }

            const capacities = centersList.map(c => ({
                name: c.name,
                current: Number(c.current_occupancy) || 0,
                max: Number(c.capacity) || 0,
                households: Number(c.household_count) || 0,
            }));

            const totalCenters = centersList.length;
            const totalCapacity = capacities.reduce((sum, c) => sum + c.max, 0);
            const totalOccupied = capacities.reduce((sum, c) => sum + c.current, 0);
            const totalHouseholds = capacities.reduce((sum, c) => sum + c.households, 0);

            // 3. Process Recent Broadcast Alerts
            let alertsList = [];
            if (alertsRes.status === 'fulfilled') {
                const res = alertsRes.value;
                alertsList = res?.data || res || [];
            } else {
                console.error("Failed to load alerts:", alertsRes.reason);
            }

            // 4. Process Center Issue Reports
            let issuesList = [];
            let openIssuesCount = 0;
            if (issuesRes.status === 'fulfilled') {
                const res = issuesRes.value;
                issuesList = res?.data || [];
                openIssuesCount = res?.summary?.open ?? issuesList.filter(i => i.status === 'open').length;
            } else {
                console.error("Failed to load issue reports:", issuesRes.reason);
            }

            // 5. Process Resource Requests
            let requestsList = [];
            let pendingRequestsCount = 0;
            if (requestsRes.status === 'fulfilled') {
                const res = requestsRes.value;
                requestsList = res?.data || [];
                pendingRequestsCount = res?.summary?.pending ?? requestsList.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').length;
            } else {
                console.error("Failed to load resource requests:", requestsRes.reason);
            }

            // 6. Process Last Updated
            let updatedTimeStr = null;
            if (lastUpdatedRes.status === 'fulfilled' && lastUpdatedRes.value?.success) {
                const dt = lastUpdatedRes.value.last_updated;
                if (dt) {
                    updatedTimeStr = new Date(dt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                }
            }

            const newStats = {
                totalCenters,
                totalCapacity,
                totalOccupied,
                totalHouseholds,
                pendingRequests: pendingRequestsCount,
                openIssues: openIssuesCount,
            };

            const finalAlerts = Array.isArray(alertsList) ? alertsList.slice(0, 4) : [];

            setStats(newStats);
            setRecentAlerts(finalAlerts);
            setRecentRequests(requestsList);
            setRecentIssues(issuesList);
            setLastUpdatedTime(updatedTimeStr);

            // Cache the result
            dashboardCache = {
                user: currentUser,
                centers: centersList,
                activeEvents: eventsList,
                stats: newStats,
                recentAlerts: finalAlerts,
                recentRequests: requestsList,
                recentIssues: issuesList,
                lastUpdatedTime: updatedTimeStr,
            };
            dashboardCacheTime = Date.now();

        } catch (err) {
            console.error("Dashboard operations metrics error:", err);
        } finally {
            setLoading(false);
        }
    };

    const activeEventsList = activeEvents.filter(e => !e.ended_at);
    const hasActiveEvent = activeEventsList.length > 0;

    // Since disaster events auto-assign all centers, active shelters represent all operational/available centers
    const filteredCenters = hasActiveEvent
        ? centers.filter(c => c.status_id === 1 || c.status_id === "1" || c.status === "active" || c.current_event_id !== null || !c.status_id)
        : centers;

    const chartData = filteredCenters.map(c => ({
        name: c.name || c.center_name,
        current: Number(c.current_occupancy) || 0,
        max: Number(c.capacity) || 0,
        households: Number(c.household_count) || 0,
    }));

    const displayRequests = recentRequests.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').slice(0, 3);
    const displayIssues = recentIssues.filter(i => i.status === 'open').slice(0, 3);

    const displayTotalCenters = filteredCenters.length;
    const displayTotalCapacity = chartData.reduce((sum, c) => sum + c.max, 0);
    const displayTotalOccupied = chartData.reduce((sum, c) => sum + c.current, 0);

    const displayPendingRequests = stats.pendingRequests || recentRequests.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').length;
    const displayOpenIssues = stats.openIssues || recentIssues.filter(i => i.status === 'open').length;

    const displayAvailableSlots = Math.max(displayTotalCapacity - displayTotalOccupied, 0);
    const occupancyRate = displayTotalCapacity > 0 ? Math.round((displayTotalOccupied / displayTotalCapacity) * 100) : 0;


    return (
        <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500 text-left">
            
            {/* 👋 WELCOME BANNER WITH COHESIVE COMPLEMENTARY DESIGN */}
            <DashboardHeader 
                isPersonnel={isPersonnel}
                assignedCenter={assignedCenter}
                loading={loading}
                user={user}
                selectedEventId={selectedEventId}
                setSelectedEventId={setSelectedEventId}
                activeEvents={activeEvents}
                activeEvent={activeEvent}
                recentAlerts={recentAlerts}
                loadDashboard={loadDashboard}
                lastUpdatedTime={lastUpdatedTime}
            />

            {/* 🔹 STREAMLINED METRICS GRID (COHESIVE LEFT-BORDER ACCENTS) */}
            <DashboardMetrics 
                isPersonnel={isPersonnel}
                assignedCenter={assignedCenter}
                displayAvailableSlots={displayAvailableSlots}
                displayTotalCenters={displayTotalCenters}
                displayTotalOccupied={displayTotalOccupied}
                displayTotalCapacity={displayTotalCapacity}
                occupancyRate={occupancyRate}
                displayOpenIssues={displayOpenIssues}
                displayPendingRequests={displayPendingRequests}
                loading={loading}
            />

            {/* 🔹 MAIN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                
                {/* ── LEFT OPERATIONS AREA (2/3 width) ── */}
                <DashboardCapacityArea 
                    isPersonnel={isPersonnel}
                    assignedCenter={assignedCenter}
                    loading={loading}
                    chartData={chartData}
                />

                {/* ── RIGHT INFORMATION SIDEBAR (1/3 width) ── */}
                <DashboardSidebar 
                    loading={loading}
                    recentAlerts={recentAlerts}
                    displayIssues={displayIssues}
                    displayRequests={displayRequests}
                />

            </div>

        </div>
    );
};

export default Dashboard;