import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, MapPin, DoorOpen, ArrowRight } from "lucide-react";
import CapacityChart from "./CapacityChart";

const MOCK_BARS = [
    { height1: "65%", height2: "25%" },
    { height1: "45%", height2: "15%" },
    { height1: "80%", height2: "35%" },
    { height1: "55%", height2: "20%" },
    { height1: "70%", height2: "40%" },
    { height1: "50%", height2: "30%" }
];

export default function DashboardCapacityArea({
    isPersonnel,
    assignedCenter,
    loading,
    chartData
}) {
    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Capacity Utilization Chart */}
            <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">{isPersonnel ? 'Center Capacity' : 'Capacity Utilization'}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isPersonnel && assignedCenter ? `${assignedCenter.name} occupancy` : 'Active shelter occupancy ratios'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-slate-500">
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
                
                {loading ? (
                    <div className="h-[280px] flex items-end justify-between px-6 pb-2 pt-4 animate-pulse">
                        {MOCK_BARS.map((bar, idx) => (
                            <div key={idx} className="w-14 flex flex-col items-center gap-3">
                                <div className="w-full flex items-end gap-1.5 h-44">
                                    <div className="w-1/2 bg-slate-100 rounded-t-md" style={{ height: bar.height1 }} />
                                    <div className="w-1/2 bg-slate-200 rounded-t-md" style={{ height: bar.height2 }} />
                                </div>
                                <div className="w-10 h-3 bg-slate-100 rounded-sm" />
                            </div>
                        ))}
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No center capacity telemetry registered.</p>
                    </div>
                ) : (
                    <div className="h-[220px] sm:h-[280px] w-full">
                        <CapacityChart data={chartData} />
                    </div>
                )}
            </div>

            {/* Shelters Breakdown list table */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">{isPersonnel ? 'Your Center Status' : 'Center Breakdown'}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">{isPersonnel && assignedCenter ? `${assignedCenter.name} deployment status` : 'Current deployment status by location'}</p>
                        </div>
                    </div>
                    {!isPersonnel && (
                        <Link to="/evacuation-centers" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 tracking-widest uppercase flex items-center gap-1">
                            View Centers
                            <ArrowRight size={12} />
                        </Link>
                    )}
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
                            {loading ? (
                                [1, 2, 3].map((row) => (
                                    <tr key={row} className="animate-pulse">
                                        <td className="px-6 py-4.5">
                                            <div className="w-36 h-3.5 bg-slate-200 rounded-md" />
                                            <div className="w-24 h-2 bg-slate-100 rounded-sm mt-1.5" />
                                        </td>
                                        <td className="px-6 py-4.5">
                                            <div className="w-24 h-4 bg-slate-100 rounded-md mx-auto" />
                                        </td>
                                        <td className="px-6 py-4.5 text-center">
                                            <div className="w-12 h-4 bg-slate-100 rounded-md mx-auto" />
                                        </td>
                                        <td className="px-6 py-4.5 text-right">
                                            <div className="w-16 h-5 bg-slate-100 rounded-full ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : chartData.length === 0 ? (
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
    );
}
