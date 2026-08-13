import React from "react";
import { Home, Users, Activity, TrendingUp } from "lucide-react";

export default function AnalyticsKPIs({ analytics, isPersonnel }) {
    const summary = analytics?.summary || {
        total_households: 0,
        total_individuals: 0,
        active_centers: 0,
        avg_occupancy_pct: 0
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* HOUSEHOLDS CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {isPersonnel ? 'Center Households' : 'Total Households'}
                    </span>
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        <Home size={16} />
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                        {(summary.total_households || 0).toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1">
                        {isPersonnel ? 'Evacuated at assigned center' : 'Registered household profiles'}
                    </p>
                </div>
            </div>

            {/* POPULATION CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {isPersonnel ? 'Center Evacuated' : 'Evacuated Population'}
                    </span>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <Users size={16} />
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                        {(summary.total_individuals || 0).toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1">
                        {isPersonnel ? 'Individual evacuees present' : 'Total physical evacuees'}
                    </p>
                </div>
            </div>

            {/* ACTIVE CENTERS CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Active Centers
                    </span>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                        <Activity size={16} />
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                        {summary.active_centers || 0}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1">
                        Operational shelters
                    </p>
                </div>
            </div>

            {/* CAPACITY UTILIZATION CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Capacity Utilization
                    </span>
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                        <TrendingUp size={16} />
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                        {summary.avg_occupancy_pct || 0}%
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1">
                        Average shelter occupancy rate
                    </p>
                </div>
            </div>
        </div>
    );
}

