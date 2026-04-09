import React, { useEffect, useState } from "react";
import { 
  Home, 
  Users, 
  PieChart, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  MapPin
} from "lucide-react";
import { getCenters } from "../api/evacuation/getCenters";
import { getCapacity } from "../api/evacuation/getCapacity";
import CapacityChart from "../components/dashboard/CapacityChart";

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalCapacity: 0,
    totalOccupied: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getCenters();
      const centerList = res.data || [];

      const capacities = await Promise.all(
        centerList.map(async (c) => {
          try {
            const id = c.evacuation_center_id;
            if (!id) return { name: c.name, current: 0, max: c.capacity || 0 };
            
            const cap = await getCapacity(id);
            return {
              name: c.name,
              current: cap.data?.current ?? 0,
              max: cap.data?.max ?? c.capacity ?? 0,
            };
          } catch (err) {
            return { name: c.name, current: 0, max: c.capacity || 0 };
          }
        })
      );

      setChartData(capacities);

      const totalCenters = centerList.length;
      const totalCapacity = capacities.reduce((sum, c) => sum + (c.max || 0), 0);
      const totalOccupied = capacities.reduce((sum, c) => sum + (c.current || 0), 0);

      setStats({ totalCenters, totalCapacity, totalOccupied });
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  const availableSlots = Math.max(stats.totalCapacity - stats.totalOccupied, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ⚡️ PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Real-time Situational Overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Active</span>
        </div>
      </div>

      {/* 🔹 TOP STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Centers", val: stats.totalCenters, icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Capacity", val: stats.totalCapacity, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Occupied", val: stats.totalOccupied, icon: PieChart, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Available Slots", val: availableSlots, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{item.label}</p>
            <h2 className={`text-2xl font-black tracking-tight ${item.color}`}>{item.val.toLocaleString()}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 🔹 CHART SECTION */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Capacity Utilization</h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <CapacityChart data={chartData} />
          </div>
        </div>
      </div>

      {/* 🔹 TABLE PREVIEW */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <MapPin size={18} />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Center Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Center Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Occupancy</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {chartData.map((c, index) => {
                const percent = c.max ? (c.current / c.max) * 100 : 0;
                const isCritical = percent >= 90;
                const isWarning = percent >= 60;

                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-bold text-slate-800">{c.name}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-between w-full text-[10px] font-bold text-slate-400">
                            <span>{c.current}</span>
                            <span>{c.max}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden min-w-[120px]">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        isCritical ? 'bg-red-50 text-red-600 border-red-100' : 
                        isWarning ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Capable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;