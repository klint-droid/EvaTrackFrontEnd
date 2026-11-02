import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ChevronRight, Search, X, Filter } from "lucide-react";
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

const getStatus = (c) => {
    const pct = c.max ? Math.round((c.current / c.max) * 100) : 0;
    return pct >= 90 ? "CRITICAL" : pct >= 60 ? "WARNING" : "CAPABLE";
};

export default function DashboardCapacityArea({
    isPersonnel,
    assignedCenter,
    loading,
    chartData = []
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, CRITICAL, WARNING, CAPABLE

    // Compute status counts for filter pills
    const statusCounts = useMemo(() => {
        const counts = { ALL: chartData.length, CRITICAL: 0, WARNING: 0, CAPABLE: 0 };
        chartData.forEach(c => {
            const s = getStatus(c);
            counts[s] = (counts[s] || 0) + 1;
        });
        return counts;
    }, [chartData]);

    // Filter shelters by search term and selected capacity status
    const filteredShelters = useMemo(() => {
        return chartData.filter(c => {
            const matchesSearch = !searchQuery || (c.name || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
            const matchesStatus = filterStatus === "ALL" || getStatus(c) === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [chartData, searchQuery, filterStatus]);

    const resetFilters = () => {
        setSearchQuery("");
        setFilterStatus("ALL");
    };

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
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#1E78C2]" />
                            <span>Occupied</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#F37021]" />
                            <span>Available Capacity</span>
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="h-[320px] sm:h-[370px] flex items-end justify-between px-6 pb-4 pt-6 animate-pulse">
                        {MOCK_BARS.map((bar, idx) => (
                            <div key={idx} className="w-12 sm:w-14 flex flex-col items-center gap-3">
                                <div className="w-full flex flex-col justify-end h-52">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-xs" style={{ height: bar.height2 }} />
                                    <div className="w-full bg-slate-300 dark:bg-slate-800" style={{ height: bar.height1 }} />
                                </div>
                                <div className="w-10 h-3 bg-slate-100 dark:bg-slate-800 rounded-xs" />
                            </div>
                        ))}
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[320px] sm:h-[370px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/20">
                        <p className="text-xs text-slate-400 font-medium">No center capacity telemetry registered.</p>
                    </div>
                ) : (
                    <div className="h-[320px] sm:h-[370px] w-full">
                        <CapacityChart data={chartData} />
                    </div>
                )}
            </div>

            {/* Shelter Status List with Live Search & Capacity Triage */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {isPersonnel ? 'Your Center Status' : 'Shelter Status'}
                        </h2>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {chartData.length}
                        </span>
                    </div>

                    {!isPersonnel && (
                        <Link to="/evacuation-centers" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 font-medium">
                            View all centers <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <div className="mb-3 space-y-2.5">
                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search shelter by name..."
                                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setFilterStatus("ALL")}
                                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                                    filterStatus === "ALL"
                                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                            >
                                All ({statusCounts.ALL})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus("CRITICAL")}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                                    filterStatus === "CRITICAL"
                                        ? "bg-rose-600 text-white"
                                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100"
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Critical ≥90% ({statusCounts.CRITICAL})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus("WARNING")}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                                    filterStatus === "WARNING"
                                        ? "bg-amber-600 text-white"
                                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100"
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Warning 60-89% ({statusCounts.WARNING})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus("CAPABLE")}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                                    filterStatus === "CAPABLE"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100"
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Available &lt;60% ({statusCounts.CAPABLE})
                            </button>
                        </div>
                    </div>
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
                    ) : filteredShelters.length === 0 ? (
                        <div className="py-8 px-4 text-center space-y-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                No shelters match "{searchQuery}" under the selected capacity filter.
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                Reset search and filters
                            </button>
                        </div>
                    ) : (
                        filteredShelters.map((c, index) => {
                            const pct = c.max ? Math.round((c.current / c.max) * 100) : 0;
                            const status = getStatus(c);

                            return (
                                <div key={c.name || index} className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status]}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{c.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                            {c.current} / {c.max} evacuees {c.households ? `(${c.households} households)` : ''}
                                        </div>
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
