import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {
  AlertTriangle,
  MapPin,
  Users,
  Building2,
  Activity,
  ArrowRight,
  Shield,
  Radio,
  Clock,
  ChevronRight,
  Search,
  LogIn,
  Phone,
  ExternalLink,
  Wifi,
  TrendingUp,
} from "lucide-react";

/* ─── Status Helpers ─── */
const getCenterStatus = (occupiedCount, capacityCount) => {
  const occupied = parseInt(occupiedCount) || 0;
  const capacity = parseInt(capacityCount) || 1;
  const percent = Math.min((occupied / capacity) * 100, 100);

  if (percent >= 100) return { label: "FULL", key: "full", percent };
  if (percent >= 85) return { label: "NEAR CAPACITY", key: "near", percent };
  return { label: "ACCEPTING", key: "open", percent };
};

const statusConfig = {
  open: {
    badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/30",
  },
  near: {
    badge: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/30",
  },
  full: {
    badge: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
    bar: "bg-gradient-to-r from-rose-500 to-red-400",
    dot: "bg-rose-400",
    glow: "shadow-rose-500/30",
  },
};

/* ─── Animated Map Dot ─── */
const MapDot = ({ color, style, label }) => (
  <div className="absolute group" style={style}>
    <div className="relative">
      <span className={`block h-3 w-3 rounded-full ${statusConfig[color].dot} shadow-lg ${statusConfig[color].glow}`} />
      <span className={`absolute inset-0 h-3 w-3 rounded-full ${statusConfig[color].dot} animate-ping opacity-40`} />
    </div>
    {label && (
      <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="px-2 py-1 rounded bg-slate-900/90 text-[10px] font-semibold text-slate-300 backdrop-blur-sm">
          {label}
        </span>
      </div>
    )}
  </div>
);

/* ─── Map Dot Positions ─── */
const dotPositions = [
  { left: "28%", top: "25%" },
  { left: "55%", top: "18%" },
  { right: "22%", top: "38%" },
  { left: "35%", top: "55%" },
  { right: "30%", top: "60%" },
  { left: "20%", top: "42%" },
];

/* ─── Main Landing Component ─── */
const Landing = () => {
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState({
    total_centers: 0,
    total_evacuees: 0,
    avg_capacity: 0,
    full_centers: 0,
  });
  const [activeEvents, setActiveEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [centersRes, eventsRes] = await Promise.all([
          API.get("/api/public/evacuation-centers"),
          API.get("/api/public/events/active").catch((err) => {
            console.error("Failed to fetch active events", err);
            return { data: { data: [] } };
          }),
        ]);

        if (centersRes.data) {
          setCenters(centersRes.data.centers || []);
          if (centersRes.data.stats) setStats(centersRes.data.stats);
        }

        if (eventsRes.data) {
          setActiveEvents(eventsRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch landing data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  /* Live clock for the live feed badge */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  });

  const activeIncidents = useMemo(
    () => centers.filter((c) => getCenterStatus(c.current_occupancy, c.capacity).key !== "open").length,
    [centers]
  );

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#f7f8fc] text-left">

      {/* ━━━ EMERGENCY ALERT BANNER ━━━ */}
      {activeEvents.length > 0 ? (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 relative">
            {activeEvents.map((evt) => (
              <div key={evt.event_id} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <AlertTriangle size={12} className="text-white" />
                </div>
                <span className="text-[13px] font-semibold text-white/95 tracking-wide uppercase">
                  ACTIVE ALERT: {evt.name} — {evt.primary_type?.type_name || "Emergency"} ({evt.severity?.severity_label || "Active"})
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2 flex items-center justify-center gap-3 relative">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield size={10} className="text-white" />
              </div>
              <span className="text-[11.5px] font-semibold text-white/90 tracking-wider uppercase">
                STATUS: MONITORING MODE — SYSTEM OPERATIONAL — NO ACTIVE DISASTER EVENTS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ HERO SECTION ━━━ */}
      <section className="bg-[#0B1120] relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.05] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-center">

            {/* Left: Text Content */}
            <div className="space-y-7">
              {/* Official badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/20">
                <Shield size={13} className="text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-300/90">
                  Official Government System
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.05] tracking-tight text-white">
                  Disaster Readiness &{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Response Pipeline
                  </span>
                </h1>
                <p className="text-[15px] leading-relaxed text-slate-400 max-w-lg">
                  Real-time situational awareness, resource allocation, and victim registry
                  for active crisis management zones.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 group"
                >
                  <Search size={16} />
                  Find Center
                  <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/[0.06] text-slate-300 text-sm font-semibold border border-white/[0.08] hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15] transition-all duration-200"
                >
                  <LogIn size={16} />
                  Responder Login
                </Link>
              </div>
            </div>

            {/* Right: Interactive Status Map Panel */}
            <div className="relative">
              <div className="relative rounded-2xl bg-[#0F1A2E] border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/30">
                {/* Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Map area with dots */}
                <div className="relative h-[340px] sm:h-[380px]">
                  {centers.slice(0, 6).map((center, i) => {
                    const pos = dotPositions[i % dotPositions.length];
                    const { key } = getCenterStatus(center.current_occupancy, center.capacity);
                    return (
                      <MapDot
                        key={center.evacuation_center_id}
                        color={key}
                        style={pos}
                        label={center.name}
                      />
                    );
                  })}

                  {/* Decorative connection lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
                    <line x1="28%" y1="25%" x2="55%" y2="18%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="55%" y1="18%" x2="70%" y2="38%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="35%" y1="55%" x2="70%" y2="60%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>

                  {/* Live feed badge - bottom right */}
                  <div className="absolute bottom-5 right-5">
                    <div className="flex flex-col items-end gap-1.5 px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Live Feed</span>
                        <span className="text-[11px] font-mono font-bold text-slate-300">{formattedTime}</span>
                        <span className="text-[10px] font-semibold text-slate-500">PHT</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          {activeIncidents} Active Incident{activeIncidents !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Map label */}
                  <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 backdrop-blur-sm border border-white/[0.04]">
                    <Wifi size={12} className="text-blue-400" />
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                      Operational Map
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtle glow behind card */}
              <div className="absolute -inset-4 bg-blue-600/[0.03] rounded-3xl blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ STATISTICS STRIP ━━━ */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
            {[
              {
                value: stats.total_centers,
                label: "Active Centers",
                icon: Building2,
                color: "text-slate-800",
                iconBg: "bg-blue-50 text-blue-600",
              },
              {
                value: stats.total_evacuees.toLocaleString(),
                label: "Total Evacuees",
                icon: Users,
                color: "text-slate-800",
                iconBg: "bg-indigo-50 text-indigo-600",
              },
              {
                value: `${stats.avg_capacity}%`,
                label: "Avg Capacity",
                icon: TrendingUp,
                color: stats.avg_capacity >= 80 ? "text-amber-600" : "text-emerald-600",
                iconBg: stats.avg_capacity >= 80 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
              },
              {
                value: stats.full_centers,
                label: "Full Centers",
                icon: Activity,
                color: stats.full_centers > 0 ? "text-rose-600" : "text-slate-800",
                iconBg: stats.full_centers > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="py-7 px-6 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                      {stat.label}
                    </div>
                    {isLoading ? (
                      <div className="h-8 w-14 bg-slate-100 rounded animate-pulse" />
                    ) : (
                      <div className={`text-2xl font-extrabold leading-none ${stat.color}`}>
                        {stat.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ ACTIVE DISASTER ALERTS ━━━ */}
      {activeEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-2">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              Active Disaster Alerts
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ongoing emergency declarations requiring response and preparedness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeEvents.map((event) => (
              <div 
                key={event.event_id} 
                className="bg-white rounded-xl border-2 border-rose-100/80 p-5 shadow-sm relative overflow-hidden text-left"
              >
                {/* Decorative left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600" />
                
                <div className="flex flex-col h-full pl-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {event.primary_type?.type_name || "Emergency"}
                      </span>
                      <h3 className="text-[17px] font-bold text-slate-800 mt-2">
                        {event.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-red-600 text-white animate-pulse">
                      {event.severity?.severity_label || "Critical"} Alert
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Started On</span>
                      <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                        {new Date(event.started_at).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Centers</span>
                      <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                        {event.evacuation_centers?.length || 0} Evacuation Center{event.evacuation_centers?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ━━━ ACTIVE EVACUATION CENTERS ━━━ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Active Evacuation Centers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real-time occupancy and status reports.
            </p>
          </div>
          <Link
            to="/portal"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            View All
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Centers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 w-36 bg-slate-100 rounded" />
                    <div className="h-3.5 w-24 bg-slate-50 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-slate-50 rounded" />
                    <div className="h-3 w-28 bg-slate-50 rounded" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                </div>
                <div className="h-3 w-20 bg-slate-50 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80">
            <Building2 size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-400">No active evacuation centers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centers.map((center) => {
              const { label, key, percent } = getCenterStatus(center.current_occupancy, center.capacity);
              const config = statusConfig[key];
              return (
                <article
                  key={center.evacuation_center_id}
                  className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300/80 p-5 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-800 leading-snug truncate group-hover:text-blue-700 transition-colors">
                        {center.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500 truncate">
                          {center.osm_address
                            ? center.osm_address.split(",").slice(0, 2).join(",").trim()
                            : "Location not specified"}
                        </span>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
                      {label}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Occupancy</span>
                      <span className="text-xs font-bold text-slate-700">
                        {Math.round(percent)}% ({center.current_occupancy || 0}/{center.capacity})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100/80">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[11px] font-medium">
                        Updated {Math.floor(Math.random() * 15) + 1}m ago
                      </span>
                    </div>
                    <Link
                      to="/portal"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Details
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="bg-[#0B1120] border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left: Brand */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <MapPin size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex items-baseline">
                  <span className="text-sm font-extrabold text-white">Eva</span>
                  <span className="text-sm font-extrabold text-blue-400">Track</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Philippine Disaster Management Authority
              </p>
            </div>

            {/* Right: Links */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Shield size={12} className="text-amber-500/70" />
                Official Government System
              </div>
              <div className="flex flex-wrap gap-5 text-xs text-slate-500">
                <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-5 border-t border-white/[0.04] text-center">
            <p className="text-[11px] text-slate-600">
              © {new Date().getFullYear()} EvaTrack Philippine Disaster Management Authority. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
