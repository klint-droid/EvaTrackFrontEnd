import { Link } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  GraduationCap,
  Hospital,
  School,
} from "lucide-react";

const centers = [
  {
    name: "Barangay Hall Shelter A",
    distance: "0.8 km",
    location: "Brgy. San Jose",
    services: "food, water, medical",
    status: "Open",
    count: "180 / 300",
    color: "emerald",
    icon: Building2,
  },
  {
    name: "City Sports Complex",
    distance: "1.1 km",
    location: "Brgy. Poblacion",
    services: "food, water",
    status: "Near full",
    count: "270 / 300",
    color: "amber",
    icon: Hospital,
  },
  {
    name: "Municipal Gymnasium",
    distance: "1.4 km",
    location: "Brgy. Sta. Cruz",
    services: "food, water, medical, WiFi",
    status: "Open",
    count: "200 / 600",
    color: "emerald",
    icon: GraduationCap,
  },
  {
    name: "Coastal Elementary School",
    distance: "0.9 km",
    location: "Brgy. Coastal",
    services: "water only",
    status: "Full",
    count: "300 / 300",
    color: "rose",
    icon: School,
  },
];

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

const capacityWidth = {
  Open: "60%",
  "Near full": "88%",
  Full: "100%",
};

const Landing = () => {
  return (
    <main className="min-h-[calc(100vh-48px)] bg-slate-100 text-left">
      <section className="bg-[#0f1c2d] text-white">
        <div className="bg-red-500 px-5 py-3 text-xs font-semibold text-white sm:px-8">
          <div className="mx-auto flex max-w-6xl items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
            <center><span>
              Active Alert: Typhoon Signal No. 3 in effect. Please proceed to the nearest evacuation center if in low-lying areas.
            </span></center>
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
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-500">Live Map</div>

            <div className="absolute left-[33%] top-[32%] text-center text-[10px] text-slate-300">
              <span className="mx-auto mb-1 block h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              Brgy Hall A
            </div>
            <div className="absolute right-[24%] top-[22%] text-center text-[10px] text-slate-300">
              <span className="mx-auto mb-1 block h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              Municipal Gym
            </div>
            <div className="absolute right-[29%] top-[48%] text-center text-[10px] text-slate-300">
              <span className="mx-auto mb-1 block h-4 w-4 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              Sports Complex
            </div>
            <div className="absolute left-[26%] top-[58%] text-center text-[10px] text-slate-300">
              <span className="mx-auto mb-1 block h-4 w-4 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
              Coastal Elem.
            </div>

            <div className="absolute inset-x-4 bottom-4 space-y-2">
              {centers.slice(0, 3).map((center) => {
                const styles = colorStyles[center.color];
                return (
                  <div key={center.name} className="flex items-center gap-3 rounded-md bg-[#0b1727]/95 px-3 py-2 shadow-lg">
                    <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold text-white">{center.name}</div>
                      <div className="text-[10px] text-slate-400">{center.distance} away - {center.count} capacity</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${styles.badge}`}>{center.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 py-8 sm:px-8 lg:grid-cols-4">
        {[
          ["12", "Centers Open", "text-slate-950"],
          ["4,210", "Evacuees Sheltered", "text-slate-950"],
          ["68%", "Avg Capacity", "text-emerald-500"],
          ["3", "Centers At Full", "text-red-500"],
        ].map(([value, label, color]) => (
          <div key={label} className="rounded-lg bg-white px-5 py-5 shadow-sm">
            <div className={`text-3xl font-black leading-none ${color}`}>{value}</div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="mb-5">
          <h2 className="!mb-1 text-2xl font-black !text-slate-950">Evacuation centers near you</h2>
          <p className="text-xs text-slate-500">Updated 2 minutes ago - Sorted by distance</p>
        </div>

        <div className="space-y-4">
          {centers.map((center) => {
            const Icon = center.icon;
            const styles = colorStyles[center.color];
            return (
              <article key={center.name} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${styles.icon}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-black text-slate-950">{center.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${styles.badge}`}>{center.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      <span className="font-bold text-sky-600">{center.distance}</span> - {center.location} - Services: {center.services}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${styles.bar}`} style={{ width: capacityWidth[center.status] }} />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{center.count}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="bg-black px-5 py-6 text-xs sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-slate-500">
          <span className="font-bold text-white">EVA<span className="text-sky-500">TRACK</span></span>
          <span className="text-right">Disaster Readiness &amp; Response Portal - Real-time data</span>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
