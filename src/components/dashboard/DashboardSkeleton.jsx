import React from "react";
import { 
  Home, 
  Users, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  MapPin, 
  Activity, 
  Bell, 
  ShieldAlert, 
  Clock 
} from "lucide-react";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 👋 WELCOME BANNER SKELETON */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <div className="w-28 h-3 bg-indigo-400/40 rounded-sm" />
            </div>
            <div className="w-64 h-8 bg-slate-700/60 rounded-xl" />
            <div className="w-96 h-4 bg-slate-700/30 rounded-md" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl" />
            <div className="w-32 h-9 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 🔹 METRICS GRID SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Home, border: "border-l-4 border-slate-300" },
          { icon: Users, border: "border-l-4 border-slate-300" },
          { icon: AlertTriangle, border: "border-l-4 border-slate-300" },
          { icon: Package, border: "border-l-4 border-slate-300" }
        ].map((item, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-100 ${item.border} shadow-sm flex flex-col justify-between h-32`}>
            <div className="flex justify-between items-start">
              <div className="w-20 h-3 bg-slate-200 rounded-sm" />
              <item.icon size={18} className="text-slate-300" />
            </div>
            <div>
              <div className="w-16 h-7 bg-slate-200 rounded-md" />
              <div className="w-32 h-3 bg-slate-100 rounded-sm mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 MAIN GRID SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT OPERATIONS AREA (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Capacity Utilization Chart Skeleton */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-300">
                  <TrendingUp size={18} />
                </div>
                <div className="space-y-1.5">
                  <div className="w-36 h-4 bg-slate-200 rounded-md" />
                  <div className="w-48 h-2.5 bg-slate-100 rounded-sm" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 h-3.5 bg-slate-100 rounded-sm" />
                <div className="w-20 h-3.5 bg-slate-100 rounded-sm" />
              </div>
            </div>
            
            {/* Visual Bar Grid Mockup */}
            <div className="h-[280px] flex items-end justify-between px-6 pb-2 pt-4">
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <div key={bar} className="w-14 flex flex-col items-center gap-3">
                  <div className="w-full flex items-end gap-1.5 h-44">
                    <div className="w-1/2 bg-slate-100 rounded-t-md" style={{ height: `${30 + Math.random() * 60}%` }} />
                    <div className="w-1/2 bg-slate-200 rounded-t-md" style={{ height: `${10 + Math.random() * 40}%` }} />
                  </div>
                  <div className="w-10 h-3 bg-slate-100 rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Center Breakdown table skeleton */}
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-300 rounded-lg">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1.5">
                  <div className="w-36 h-4 bg-slate-200 rounded-md" />
                  <div className="w-48 h-2.5 bg-slate-100 rounded-sm" />
                </div>
              </div>
              <div className="w-16 h-3 bg-slate-200 rounded-sm" />
            </div>

            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map((row) => (
                <div key={row} className="px-6 py-5 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="w-48 h-4 bg-slate-200 rounded-md" />
                    <div className="w-24 h-2.5 bg-slate-100 rounded-sm" />
                  </div>
                  <div className="w-32 h-4 bg-slate-100 rounded-md" />
                  <div className="w-16 h-4 bg-slate-100 rounded-md" />
                  <div className="w-20 h-6 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT INFORMATION SIDEBAR (1/3 width) ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Shortcuts Portal Skeleton */}
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-slate-300" />
              <div className="w-28 h-3.5 bg-slate-200 rounded-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100/50 rounded-2xl h-24">
                  <div className="w-5 h-5 bg-slate-200 rounded-md mb-2" />
                  <div className="w-16 h-3 bg-slate-200 rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Broadcasts Skeleton */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-300" />
                <div className="w-28 h-3.5 bg-slate-200 rounded-sm" />
              </div>
              <div className="w-16 h-4 bg-slate-100 rounded-sm" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((alert) => (
                <div key={alert} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <span className="w-2 h-2 rounded-full mt-1.5 bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-3.5 bg-slate-200 rounded-md" />
                    <div className="flex gap-2">
                      <div className="w-12 h-3 bg-slate-100 rounded-sm" />
                      <div className="w-16 h-3 bg-slate-100 rounded-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incidents and Urgent requests Skeleton */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-slate-300" />
              <div className="w-28 h-3.5 bg-slate-200 rounded-sm" />
            </div>

            <div className="space-y-4">
              {[1, 2].map((group) => (
                <div key={group} className="space-y-2.5">
                  <div className="w-20 h-3 bg-slate-200 rounded-sm" />
                  <div className="space-y-2">
                    {[1, 2].map((item) => (
                      <div key={item} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                        <div className="w-6 h-6 bg-slate-200 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="w-32 h-3 bg-slate-200 rounded-sm" />
                          <div className="w-20 h-2 bg-slate-100 rounded-sm" />
                        </div>
                        <div className="w-12 h-4 bg-slate-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardSkeleton;
