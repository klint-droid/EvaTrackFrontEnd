import React from "react";
import { Users, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const AGE_COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#8b5cf6"]; // Blue, Sky, Emerald, Purple
const STATUS_COLORS = {
    active: "#3b82f6",
    evacuated: "#10b981",
    not_evacuated: "#ef4444",
    relocated: "#8b5cf6",
    displaced: "#f59e0b",
    returned: "#6b7280"
};

export default function DemographicPanel({ analytics }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AGE & VULNERABILITIES */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                        <Users size={18} className="text-purple-600" />
                        Age Distribution & Vulnerability
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        {/* Donut Chart */}
                        <div className="h-48 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.demographics.age_groups}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="count"
                                    >
                                        {analytics.demographics.age_groups.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Donut Legends */}
                        <div className="space-y-3">
                            {analytics.demographics.age_groups.map((item, idx) => (
                                <div key={item.group} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: AGE_COLORS[idx] }} />
                                        <span className="text-slate-500 font-medium">{item.group}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vulnerable groups segment */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Vulnerable Profiles & Care Lists
                    </h4>
                    {analytics.demographics.vulnerable_groups.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {analytics.demographics.vulnerable_groups.map((group) => (
                                <div key={group.key} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500 font-bold">{group.label}</span>
                                        <h5 className="text-lg font-black text-slate-800 mt-0.5">{group.count}</h5>
                                    </div>
                                    <div className="text-[10px] text-indigo-600 font-bold px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                                        Care List
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 italic">No vulnerable individuals registered.</p>
                    )}
                </div>
            </div>

            {/* GENDER & HOUSEHOLD STATUS DISTRIBUTION */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
                <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-600" />
                        Gender & Household Status Profile
                    </h3>

                    <div className="space-y-6">
                        {/* Gender Balance Progress Bars */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                Gender Balance Ratio
                            </h4>
                            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Male ({analytics.demographics.gender[0]?.count || 0})</span>
                                <span className="flex items-center gap-1.5">Female ({analytics.demographics.gender[1]?.count || 0}) <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /></span>
                            </div>
                            
                            {/* Progress Bar Component */}
                            {(() => {
                                const m = analytics.demographics.gender[0]?.count || 0;
                                const f = analytics.demographics.gender[1]?.count || 0;
                                const tot = m + f;
                                const mPct = tot > 0 ? (m / tot) * 100 : 50;
                                const fPct = tot > 0 ? (f / tot) * 100 : 50;
                                return (
                                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                                        <div style={{ width: `${mPct}%` }} className="bg-blue-500 h-full transition-all duration-500" title="Male" />
                                        <div style={{ width: `${fPct}%` }} className="bg-pink-500 h-full transition-all duration-500" title="Female" />
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Household Status Distribution Graph */}
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                Household Evacuation Lifecycle Statuses
                            </h4>
                            <div className="h-44 w-full">
                                {analytics.status_distribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.status_distribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                            <YAxis dataKey="status_label" type="category" stroke="#94a3b8" fontSize={11} width={85} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b" }}
                                            />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                                {analytics.status_distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status_key] || "#3b82f6"} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">No lifecycle status data found.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
