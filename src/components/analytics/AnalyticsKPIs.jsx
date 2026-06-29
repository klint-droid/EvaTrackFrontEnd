import React from "react";
import { Home, Users, Activity, TrendingUp } from "lucide-react";

export default function AnalyticsKPIs({ analytics, isPersonnel }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* HOUSEHOLDS CARD */}
            <div className="bg-white border border-slate-100 border-l-4 border-l-blue-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {isPersonnel ? 'Center Households' : 'Total Households'}
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {analytics.summary.total_households.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{isPersonnel ? 'Households registered at your center' : 'Unique household profiles registered'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                    <Home size={22} />
                </div>
            </div>

            {/* POPULATION CARD */}
            <div className="bg-white border border-slate-100 border-l-4 border-l-emerald-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {isPersonnel ? 'Center Evacuated' : 'Total Evacuated Individuals'}
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {analytics.summary.total_individuals.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{isPersonnel ? 'Individuals processed at your center' : 'Total physical individuals processed'}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                    <Users size={22} />
                </div>
            </div>

            {/* ACTIVE CENTERS CARD */}
            <div className="bg-white border border-slate-100 border-l-4 border-l-amber-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Active Evacuation Centers
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {analytics.summary.active_centers}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Currently operating facilities</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                    <Activity size={22} />
                </div>
            </div>

            {/* CAPACITY UTILIZATION CARD */}
            <div className="bg-white border border-slate-100 border-l-4 border-l-purple-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Capacity Utilization
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {analytics.summary.avg_occupancy_pct}%
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Average capacity occupied</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
                    <TrendingUp size={22} />
                </div>
            </div>
        </div>
    );
}
