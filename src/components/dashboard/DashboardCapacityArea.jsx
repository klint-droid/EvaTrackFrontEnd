import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ChevronRight } from "lucide-react";
import CapacityChart from "./CapacityChart";

const MOCK_BARS = [
    { height1: "65%", height2: "25%" },
    { height1: "45%", height2: "15%" },
    { height1: "80%", height2: "35%" },
    { height1: "55%", height2: "20%" },
    { height1: "70%", height2: "40%" },
    { height1: "50%", height2: "30%" }
];

const statusDot = {
    CRITICAL: "bg-rose-500",
    WARNING: "bg-amber-500",
    CAPABLE: "bg-emerald-500",
};

export default function DashboardCapacityArea({
    isPersonnel,
    assignedCenter,
    loading,
    chartData
}) {
    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Capacity Utilization Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{isPersonnel ? 'Center Capacity' : 'Capacity Utilization'}</h3>
                            <p className="text-xs text-slate-400 font-medium">{isPersonnel && assignedCenter ? `${assignedCenter.name} occupancy` : 'Active shelter occupancy ratios'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
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
                                    <div className="w-1/2 bg-slate-100 dark:bg-slate-800 rounded-t-md" style={{ height: bar.height1 }} />
                                    <div className="w-1/2 bg-slate-200 dark:bg-slate-700 rounded-t-md" style={{ height: bar.height2 }} />
                                </div>
                                <div className="w-10 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm" />
                            </div>
                        ))}
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/20">
                        <p className="text-xs text-slate-400 font-medium">No center capacity telemetry registered.</p>
                    </div>
                ) : (
                    <div className="h-[220px] sm:h-[280px] w-full">
                        <CapacityChart data={chartData} />
                    </div>
                )}
            </div>

            {/* Shelter Status List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {isPersonnel ? 'Your Center Status' : 'Shelter status'}
                    </h2>
                    {!isPersonnel && (
                        <Link to="/evacuation-centers" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 font-medium">
                            View all centers <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    {loading ? (
                        [1, 2, 3, 4].map((row) => (
                            <div key={row} className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="flex-1 space-y-1">
                                    <div className="w-36 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                                </div>
                                <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            </div>
                        ))
                    ) : chartData.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-medium">
                            No center deployment records registered.
                        </div>
                    ) : (
                        chartData.map((c, index) => {
                            const pct = c.max ? Math.round((c.current / c.max) * 100) : 0;
                            const status = pct >= 90 ? "CRITICAL" : pct >= 60 ? "WARNING" : "CAPABLE";

                            return (
                                <div key={index} className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status]}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{c.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{c.current} / {c.max} evacuees</div>
                                    </div>
                                    <div className="w-32 hidden sm:block">
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${statusDot[status]} transition-all duration-700`}
                                                style={{ width: `${Math.min(pct, 100)}%` }} 
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-10 text-right">{pct}%</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

