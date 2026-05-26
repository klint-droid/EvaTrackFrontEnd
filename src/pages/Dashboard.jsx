import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Users, 
  PieChart, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  MapPin,
  DoorOpen,
  Bell,
  AlertTriangle,
  Package,
  ShieldAlert,
  Clock,
  ArrowRight,
  Plus,
  Activity,
  Radio,
  RefreshCw,
  Smartphone,
  MessageSquare,
  Wrench,
  HeartPulse,
  Shield,
  FileWarning
} from "lucide-react";
import { getCenters } from "../api/evacuation/getCenters";
import { getAlerts } from "../api/alerts/getAlerts";
import { getCenterIssueReports } from "../api/centerIssueReports/getCenterIssueReports";
import { getResourceRequests } from "../api/resourceRequests/getResourceRequests";
import { getUser } from "../api/auth/getUser";
import CapacityChart from "../components/dashboard/CapacityChart";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    totalHouseholds: 0,
    pendingRequests: 0,
    openIssues: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Context
      try {
        const userRes = await getUser();
        setUser(userRes?.data || userRes);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }

      // 2. Fetch Evacuation Centers
      let centers = [];
      try {
        const centersRes = await getCenters();
        centers = Array.isArray(centersRes) ? centersRes : (centersRes?.data ?? []);
      } catch (err) {
        console.error("Failed to load evacuation centers:", err);
      }

      const capacities = centers.map(c => ({
        name: c.name,
        current: Number(c.current_occupancy) || 0,
        max: Number(c.capacity) || 0,
        households: Number(c.household_count) || 0,
      }));

      setChartData(capacities);

      const totalCenters = centers.length;
      const totalCapacity = capacities.reduce((sum, c) => sum + c.max, 0);
      const totalOccupied = capacities.reduce((sum, c) => sum + c.current, 0);
      const totalHouseholds = capacities.reduce((sum, c) => sum + c.households, 0);

      // 3. Fetch Recent Broadcast Alerts
      let alertsList = [];
      try {
        const alertsRes = await getAlerts(1);
        alertsList = alertsRes?.data || alertsRes || [];
      } catch (err) {
        console.error("Failed to load alerts:", err);
      }

      // 4. Fetch Center Issue Reports
      let issuesList = [];
      let openIssuesCount = 0;
      try {
        const issuesRes = await getCenterIssueReports();
        issuesList = issuesRes?.data || [];
        openIssuesCount = issuesRes?.summary?.open ?? issuesList.filter(i => i.status === 'open').length;
      } catch (err) {
        console.error("Failed to load issue reports:", err);
      }

      // 5. Fetch Resource Requests
      let requestsList = [];
      let pendingRequestsCount = 0;
      try {
        const requestsRes = await getResourceRequests();
        requestsList = requestsRes?.data || [];
        pendingRequestsCount = requestsRes?.summary?.pending ?? requestsList.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').length;
      } catch (err) {
        console.error("Failed to load resource requests:", err);
      }

      setStats({
        totalCenters,
        totalCapacity,
        totalOccupied,
        totalHouseholds,
        pendingRequests: pendingRequestsCount,
        openIssues: openIssuesCount,
      });

      setRecentAlerts(Array.isArray(alertsList) ? alertsList.slice(0, 4) : []);
      setRecentRequests(Array.isArray(requestsList) ? requestsList.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').slice(0, 3) : []);
      setRecentIssues(Array.isArray(issuesList) ? issuesList.filter(i => i.status === 'open').slice(0, 3) : []);

    } catch (err) {
      console.error("Dashboard operations metrics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = Math.max(stats.totalCapacity - stats.totalOccupied, 0);
  const occupancyRate = stats.totalCapacity > 0 ? Math.round((stats.totalOccupied / stats.totalCapacity) * 100) : 0;

  const getAlertUrgencyStyle = (key) => {
    switch (key) {
      case 'critical': return 'bg-red-500 shadow-lg shadow-red-500/40 animate-pulse';
      case 'high':     return 'bg-orange-500 shadow-md shadow-orange-500/30';
      case 'medium':   return 'bg-yellow-400';
      case 'low':      return 'bg-green-500';
      default:         return 'bg-slate-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'facility_issue': return Wrench;
      case 'health_issue':   return HeartPulse;
      case 'safety_issue':   return Shield;
      case 'incident':       return FileWarning;
      default:               return AlertTriangle;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 👋 WELCOME BANNER WITH COHESIVE COMPLEMENTARY DESIGN */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Operations Dashboard
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Welcome back, {user?.name || "Operator"}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
              Here is your situational overview today. Easily monitor shelter capacity ratios, track pending relief dispatches, register evacuees, and broadcast warning logs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button 
              onClick={loadDashboard}
              disabled={loading}
              className="p-3 bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white rounded-xl shadow-sm flex items-center justify-center disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={15} className={`${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/10 rounded-xl shadow-sm text-xs font-bold text-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Live System Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 STREAMLINED METRICS GRID (COHESIVE LEFT-BORDER ACCENTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Active Shelters", 
            val: stats.totalCenters, 
            icon: Home, 
            border: "border-l-4 border-indigo-500",
            color: "text-indigo-600",
            sub: "Fully Operational"
          },
          { 
            label: "Total Occupancy", 
            val: stats.totalOccupied, 
            icon: Users, 
            border: "border-l-4 border-violet-500",
            color: "text-violet-600",
            sub: stats.totalCapacity > 0 ? `${stats.totalOccupied.toLocaleString()} / ${stats.totalCapacity.toLocaleString()} registered (${occupancyRate}%)` : "No slots registered"
          },
          { 
            label: "Active Concerns", 
            val: stats.openIssues, 
            icon: AlertTriangle, 
            border: stats.openIssues > 0 ? "border-l-4 border-rose-500 animate-pulse" : "border-l-4 border-emerald-500",
            color: stats.openIssues > 0 ? "text-rose-600" : "text-emerald-600",
            sub: stats.openIssues > 0 ? "Field Action Required" : "All Systems Clear"
          },
          { 
            label: "Pending Logistics", 
            val: stats.pendingRequests, 
            icon: Package, 
            border: stats.pendingRequests > 0 ? "border-l-4 border-amber-500" : "border-l-4 border-emerald-500",
            color: stats.pendingRequests > 0 ? "text-amber-600" : "text-emerald-600",
            sub: stats.pendingRequests > 0 ? `${stats.pendingRequests} items awaiting dispatch` : "Fully Supplied"
          },
        ].map((item, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-100 ${item.border} shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
              <item.icon size={18} className={item.color} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{item.val.toLocaleString()}</h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-tight truncate">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT OPERATIONS AREA (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Capacity Utilization Chart */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Capacity Utilization</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active shelter occupancy ratios</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#4472C4]" />
                  <span>Max Capacity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#ED7D31]" />
                  <span>Occupancy</span>
                </div>
              </div>
            </div>
            
            {chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No center capacity telemetry registered.</p>
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <CapacityChart data={chartData} />
              </div>
            )}
          </div>

          {/* Shelters Breakdown list table */}
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Center Breakdown</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current deployment status by location</p>
                </div>
              </div>
              <Link to="/evacuation-centers" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 tracking-widest uppercase flex items-center gap-1">
                View Centers
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Center Name</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Occupancy Load</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Households</th>
                    <th className="px-6 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {chartData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                        No center deployment records registered.
                      </td>
                    </tr>
                  ) : (
                    chartData.map((c, index) => {
                      const percent = c.max ? (c.current / c.max) * 100 : 0;
                      const isCritical = percent >= 90;
                      const isWarning = percent >= 60;

                      return (
                        <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4.5">
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px]">{c.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Limit: {c.max} Slots</span>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex flex-col items-center gap-1.5 max-w-[140px] mx-auto">
                              <div className="flex justify-between w-full text-[9px] font-mono font-bold text-slate-400">
                                <span>{c.current} occupied</span>
                                <span>{Math.round(percent)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <DoorOpen size={13} className="text-purple-400" />
                              <span className="text-xs font-bold text-slate-700">{c.households}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              isCritical ? 'bg-red-50 text-red-600 border-red-100' : 
                              isWarning ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                              {isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'CAPABLE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── RIGHT INFORMATION SIDEBAR (1/3 width) ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Quick Shortcuts Grid */}
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 tracking-wider uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-500" />
              Shortcuts Portal
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/evacuation-alerts" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                <Radio size={18} className="mb-2 text-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-black">Broadcast Alert</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Disperse Emergency Alerts</span>
              </Link>
              <Link to="/center-issue-reports" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                <AlertCircle size={18} className="mb-2 text-indigo-600 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black">Report Issue</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Log shelter incidents</span>
              </Link>
              <Link to="/resource-requests" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                <Package size={18} className="mb-2 text-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-black">Request Supplies</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Order Logistics Packs</span>
              </Link>
              <Link to="/households" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                <Users size={18} className="mb-2 text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-black">Register Family</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Enroll Evacuee listings</span>
              </Link>
            </div>
          </div>

          {/* Emergency Broadcast alerts logs */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Bell size={14} className="text-rose-500" />
                Recent Broadcasts
              </h3>
              <span className="flex items-center gap-1 text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                live stream
              </span>
            </div>
            
            {recentAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-100 rounded-xl">No active transmissions logged.</p>
            ) : (
              <div className="space-y-3.5">
                {recentAlerts.map((alert, i) => (
                  <div key={alert.notif_id || i} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getAlertUrgencyStyle(alert.urgency_level?.urgency_key)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-semibold leading-normal truncate" title={alert.message}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-bold font-mono text-slate-400 uppercase bg-slate-100 px-1 rounded">
                          {alert.channel || 'Broadcast'}
                        </span>
                        <span className="text-[8px] font-medium text-slate-400 flex items-center gap-0.5">
                          <Clock size={8} />
                          {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incidents and Urgent requests */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-orange-500" />
              Active Concerns
            </h3>

            {/* Active Incident Concerns (Issues) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Incidents ({recentIssues.length})</span>
                <Link to="/center-issue-reports" className="text-[8px] font-black text-indigo-500 hover:underline uppercase">View All</Link>
              </div>

              {recentIssues.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">No active center incidents</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentIssues.map((issue, idx) => {
                    const CategoryIcon = getCategoryIcon(issue.category);
                    return (
                      <div key={issue.report_id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 hover:bg-slate-100/50 transition-colors">
                        <div className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CategoryIcon size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-800 leading-snug truncate">{issue.title}</p>
                          <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{issue.center?.name || 'Assigned Center'}</p>
                        </div>
                        <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                          {issue.severity || 'medium'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Logistics Needs (Requests) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Logistics Needs ({recentRequests.length})</span>
                <Link to="/resource-requests" className="text-[8px] font-black text-indigo-500 hover:underline uppercase">View All</Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">All supply requests fulfilled</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentRequests.map((req, idx) => (
                    <div key={req.request_id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 hover:bg-slate-100/50 transition-colors">
                      <div className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 leading-snug truncate">{req.resource_type}</p>
                        <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">Qty: {req.quantity} · {req.center?.name || 'Assigned Center'}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        {req.urgency_level?.urgency_label || 'medium'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;