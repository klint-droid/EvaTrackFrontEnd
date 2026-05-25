import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {
  AlertCircle,
  Building2,
  GraduationCap,
  Hospital,
  School,
} from "lucide-react";

const colorStyles = {
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
    icon: "bg-emerald-100 text-emerald-600",
    bar: "bg-emerald-500",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    icon: "bg-amber-100 text-amber-600",
    bar: "bg-amber-500",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-400",
    icon: "bg-rose-100 text-rose-600",
    bar: "bg-rose-500",
  },
};

const getCenterIcon = (index) => {
  const icons = [Building2, School, Hospital, GraduationCap];
  return icons[index % icons.length];
};

const getCenterStatus = (occupiedCount, capacityCount) => {
  const occupied = parseInt(occupiedCount) || 0;
  const capacity = parseInt(capacityCount) || 1;
  const percent = Math.min((occupied / capacity) * 100, 100);

  if (percent >= 100) {
    return { status: "Full", color: "rose", percent };
  }
  if (percent >= 85) {
    return { status: "Near full", color: "amber", percent };
  }
  return { status: "Open", color: "emerald", percent };
};

const mockPositions = [
  { left: "33%", top: "32%" },
  { right: "24%", top: "22%" },
  { right: "29%", top: "48%" },
  { left: "26%", top: "58%" },
];

const Landing = () => {
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState({
    total_centers: 0,
    total_evacuees: 0,
    avg_capacity: 0,
    full_centers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await API.get("/api/public/evacuation-centers");
        if (res.data) {
          setCenters(res.data.centers || []);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch evacuation centers for landing page", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return (

    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      
      {/* Emergency Alert Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium animate-pulse">
        🚨 Active Alert: Typhoon Signal No. 3 in effect. Please proceed to the nearest evacuation center if in low-lying areas.
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Disaster Readiness & Response
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mb-10">
          Find safe shelter instantly. Our real-time portal tracks evacuation center capacities, locations, and available services for you and your family.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/portal"
            className="px-8 py-4 bg-white text-blue-900 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 text-center"
          >
            Find Evacuation Centers 🗺️
          </Link>
          <Link 
            to="/login"
            className="px-8 py-4 bg-blue-700 text-white font-bold rounded-full border border-blue-500 shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 text-center"
          >
            Responder Login 🛡️
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
       
      </div>
    </div>
=======
    <main className="min-h-[calc(100vh-48px)] bg-slate-100 text-left">
      <section className="bg-[#0f1c2d] text-white">
        <div className="bg-red-500 px-5 py-3 text-xs font-semibold text-white sm:px-8">
          <div className="mx-auto flex max-w-6xl items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
            <center>
              <span>
                Active Alert: Live updates are in effect. Please proceed to the nearest open evacuation center in your area if necessary.
              </span>
            </center>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:py-6">
          <div className="flex flex-col justify-center py-5">
            <div className="mb-6 border-l-2 border-sky-400 pl-4 text-[11px] font-bold uppercase tracking-[0.28em] text-sky-300">
              Disaster Response Portal
            </div>
            <h1 className="!my-0 max-w-xl text-[42px] font-black leading-[0.98] tracking-normal !text-white sm:text-6xl lg:text-[64px]">
              Disaster Readiness
              <span className="block text-sky-400">&amp; Response</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-slate-300">
              Find safe shelter instantly. Real-time tracking of evacuation center capacities, locations, and services for you and your family.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/portal"
                className="rounded border border-white px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-slate-950"
              >
                Find Evacuation Center
              </Link>
              <Link
                to="/login"
                className="rounded border border-white/70 px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-slate-950"
              >
                Responder Login
              </Link>
            </div>
          </div>

          <div className="relative min-h-[330px] overflow-hidden rounded-lg bg-[#13243a] shadow-2xl ring-1 ring-white/5">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:96px_96px]" />
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-500">Live Status Map</div>

            {centers.slice(0, 4).map((center, index) => {
              const pos = mockPositions[index % mockPositions.length];
              const { status, color } = getCenterStatus(center.current_occupancy, center.capacity);
              const colorClass =
                color === "emerald"
                  ? "bg-emerald-400 ring-emerald-400/20"
                  : color === "amber"
                  ? "bg-amber-400 ring-amber-400/20"
                  : "bg-rose-500 ring-rose-500/20";
              return (
                <div
                  key={center.evacuation_center_id}
                  className="absolute text-center text-[10px] font-bold text-slate-300"
                  style={{
                    left: pos.left,
                    right: pos.right,
                    top: pos.top,
                  }}
                >
                  <span className={`mx-auto mb-1 block h-4 w-4 rounded-full ${colorClass} ring-4 animate-pulse`} />
                  {center.name.split(" ")[0]}
                </div>
              );
            })}

            <div className="absolute inset-x-4 bottom-4 space-y-2">
              {centers.slice(0, 3).map((center) => {
                const { status, color } = getCenterStatus(center.current_occupancy, center.capacity);
                const styles = colorStyles[color];
                return (
                  <div
                    key={center.evacuation_center_id}
                    className="flex items-center gap-3 rounded-md bg-[#0b1727]/95 px-3 py-2 shadow-lg"
                  >
                    <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-xs font-bold text-white">{center.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {center.osm_address ? center.osm_address.split(",")[0] : "Active Center"} - {center.current_occupancy || 0} / {center.capacity} capacity
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${styles.badge}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 py-8 sm:px-8 lg:grid-cols-4">
        {[
          [stats.total_centers, "Centers Registered", "text-slate-950"],
          [stats.total_evacuees.toLocaleString(), "Evacuees Sheltered", "text-slate-950"],
          [`${stats.avg_capacity}%`, "Avg Capacity Rate", "text-emerald-500"],
          [stats.full_centers, "Centers At Full", "text-red-500"],
        ].map(([value, label, color]) => (
          <div key={label} className="rounded-lg bg-white px-5 py-5 shadow-sm text-left">
            <div className={`text-3xl font-black leading-none ${color}`}>{value}</div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {label}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="mb-5 text-left">
          <h2 className="!mb-1 text-2xl font-black !text-slate-950">Active Evacuation Centers</h2>
          <p className="text-xs text-slate-500">Live statuses and real-time occupancy counts</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm text-slate-500">
              <span className="animate-pulse">Loading live centers...</span>
            </div>
          ) : centers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm text-slate-500">
              No evacuation centers found in records.
            </div>
          ) : (
            centers.map((center, index) => {
              const Icon = getCenterIcon(index);
              const { status, color, percent } = getCenterStatus(center.current_occupancy, center.capacity);
              const styles = colorStyles[color];
              return (
                <article key={center.evacuation_center_id} className="rounded-xl bg-white p-4 shadow-sm text-left">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${styles.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-black text-slate-950">{center.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${styles.badge}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        <span className="font-bold text-sky-600">Location:</span> {center.osm_address || "No address specified"}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">
                          {center.current_occupancy || 0} / {center.capacity} ({Math.round(percent)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <footer className="bg-black px-5 py-6 text-xs sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-slate-500">
          <span className="font-bold text-white">
            EVA<span className="text-sky-500">TRACK</span>
          </span>
          <span className="text-right">Disaster Readiness &amp; Response Portal - Live Public Data</span>
        </div>
      </footer>
    </main>

  );
};

export default Landing;
