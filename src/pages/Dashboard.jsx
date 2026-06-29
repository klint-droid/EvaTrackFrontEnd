import React, { useEffect, useState } from "react";
import { getCenters } from "../api/evacuation/getCenters";
import { getAlerts } from "../api/alerts/getAlerts";
import { getCenterIssueReports } from "../api/centerIssueReports/getCenterIssueReports";
import { getResourceRequests } from "../api/resourceRequests/getResourceRequests";
import { getUser } from "../api/auth/getUser";
import { getEvents } from "../api/events/getEvents";
import { getLastUpdated } from "../api/analytics/getLastUpdated";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import DashboardCapacityArea from "../components/dashboard/DashboardCapacityArea";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";

// Module-level cache to persist dashboard metrics across route navigation
let dashboardCache = null;
let dashboardCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache expiration

const Dashboard = () => {
    // Derive role context from localStorage for UI branching
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isPersonnel = storedUser?.role === "evac_personnel";
    const assignedCenter = storedUser?.assigned_center; // { id, name } or null

    const [user, setUser] = useState(dashboardCache?.user || null);
    const [centers, setCenters] = useState(dashboardCache?.centers || []);
    const [activeEvents, setActiveEvents] = useState(dashboardCache?.activeEvents || []);
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
            const [userRes, centersRes, alertsRes, issuesRes, requestsRes, eventsRes, lastUpdatedRes] = await Promise.allSettled([
                getUser(),
                getCenters(),
                getAlerts(1),
                getCenterIssueReports({ limit: 10 }),
                getResourceRequests({ limit: 10 }),
                getEvents(),
                getLastUpdated()
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

    const filteredCenters = selectedEventId === "all_history"
        ? centers
        : selectedEventId === "all"
            ? centers.filter(c => c.current_event_id !== null)
            : centers.filter(c => c.current_event_id === selectedEventId);

    const chartData = filteredCenters.map(c => ({
        name: c.name,
        current: Number(c.current_occupancy) || 0,
        max: Number(c.capacity) || 0,
        households: Number(c.household_count) || 0,
    }));

    const displayRequests = selectedEventId === "all_history"
        ? recentRequests.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').slice(0, 3)
        : selectedEventId === "all"
            ? recentRequests.filter(r => {
                    if (r.status?.status_key !== 'pending' && r.status !== 'pending') return false;
                    const isCenterAssignedToActiveEvent = r.center?.current_event_id &&
                        activeEventsList.some(evt => evt.event_id === r.center.current_event_id);
                    if (isCenterAssignedToActiveEvent) return true;

                    const reqTime = new Date(r.created_at).getTime();
                    return activeEventsList.some(evt => {
                        const startTime = new Date(evt.started_at).getTime();
                        const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                        return reqTime >= startTime && reqTime <= endTime;
                    });
                }).slice(0, 3)
            : recentRequests.filter(r => {
                    if (r.status?.status_key !== 'pending' && r.status !== 'pending') return false;
                    const evt = activeEvents.find(e => e.event_id === selectedEventId);
                    if (!evt) return false;

                    if (!evt.ended_at) {
                        return r.center?.current_event_id === selectedEventId;
                    }

                    const reqTime = new Date(r.created_at).getTime();
                    const startTime = new Date(evt.started_at).getTime();
                    const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                    return reqTime >= startTime && reqTime <= endTime;
                }).slice(0, 3);

    const displayIssues = selectedEventId === "all_history"
        ? recentIssues.filter(i => i.status === 'open').slice(0, 3)
        : selectedEventId === "all"
            ? recentIssues.filter(i => {
                    if (i.status !== 'open') return false;
                    const isCenterAssignedToActiveEvent = i.center?.current_event_id &&
                        activeEventsList.some(evt => evt.event_id === i.center.current_event_id);
                    if (isCenterAssignedToActiveEvent) return true;

                    const issueTime = new Date(i.created_at).getTime();
                    return activeEventsList.some(evt => {
                        const startTime = new Date(evt.started_at).getTime();
                        const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                        return issueTime >= startTime && issueTime <= endTime;
                    });
                }).slice(0, 3)
            : recentIssues.filter(i => {
                    if (i.status !== 'open') return false;
                    const evt = activeEvents.find(e => e.event_id === selectedEventId);
                    if (!evt) return false;

                    if (!evt.ended_at) {
                        return i.center?.current_event_id === selectedEventId;
                    }

                    const issueTime = new Date(i.created_at).getTime();
                    const startTime = new Date(evt.started_at).getTime();
                    const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                    return issueTime >= startTime && issueTime <= endTime;
                }).slice(0, 3);

    const displayTotalCenters = filteredCenters.length;
    const displayTotalCapacity = chartData.reduce((sum, c) => sum + c.max, 0);
    const displayTotalOccupied = chartData.reduce((sum, c) => sum + c.current, 0);


    const displayPendingRequests = selectedEventId === "all_history"
        ? stats.pendingRequests
        : selectedEventId === "all"
            ? recentRequests.filter(r => {
                    if (r.status?.status_key !== 'pending' && r.status !== 'pending') return false;
                    const isCenterAssignedToActiveEvent = r.center?.current_event_id &&
                        activeEventsList.some(evt => evt.event_id === r.center.current_event_id);
                    if (isCenterAssignedToActiveEvent) return true;

                    const reqTime = new Date(r.created_at).getTime();
                    return activeEventsList.some(evt => {
                        const startTime = new Date(evt.started_at).getTime();
                        const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                        return reqTime >= startTime && reqTime <= endTime;
                    });
                }).length
            : recentRequests.filter(r => {
                    if (r.status?.status_key !== 'pending' && r.status !== 'pending') return false;
                    const evt = activeEvents.find(e => e.event_id === selectedEventId);
                    if (!evt) return false;

                    if (!evt.ended_at) {
                        return r.center?.current_event_id === selectedEventId;
                    }

                    const reqTime = new Date(r.created_at).getTime();
                    const startTime = new Date(evt.started_at).getTime();
                    const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                    return reqTime >= startTime && reqTime <= endTime;
                }).length;

    const displayOpenIssues = selectedEventId === "all_history"
        ? stats.openIssues
        : selectedEventId === "all"
            ? recentIssues.filter(i => {
                    if (i.status !== 'open') return false;
                    const isCenterAssignedToActiveEvent = i.center?.current_event_id &&
                        activeEventsList.some(evt => evt.event_id === i.center.current_event_id);
                    if (isCenterAssignedToActiveEvent) return true;

                    const issueTime = new Date(i.created_at).getTime();
                    return activeEventsList.some(evt => {
                        const startTime = new Date(evt.started_at).getTime();
                        const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                        return issueTime >= startTime && issueTime <= endTime;
                    });
                }).length
            : recentIssues.filter(i => {
                    if (i.status !== 'open') return false;
                    const evt = activeEvents.find(e => e.event_id === selectedEventId);
                    if (!evt) return false;

                    if (!evt.ended_at) {
                        return i.center?.current_event_id === selectedEventId;
                    }

                    const issueTime = new Date(i.created_at).getTime();
                    const startTime = new Date(evt.started_at).getTime();
                    const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
                    return issueTime >= startTime && issueTime <= endTime;
                }).length;

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