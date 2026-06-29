import React from "react";
import { Activity, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from "recharts";

const renderInsideLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 18) return null;
    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
        >
            {value}
        </text>
    );
};

export default function CenterPerformance({ analytics, isPersonnel }) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="text-emerald-600" size={20} />
                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">{isPersonnel ? 'Your Center Performance' : 'Evacuation Center Performance Dashboard'}</h3>
            </div>

            {analytics.center_performance.length > 0 ? (
                <div className="space-y-6">
                    {/* Capacity comparison Bar Chart */}
                    <div className="h-64 w-full">
                        {(() => {
                            const chartData = analytics.center_performance.map((center) => {
                                const rawCapacity = center.capacity;
                                const rawOccupancy = center.occupancy;
                                const remaining = Math.max(0, rawCapacity - rawOccupancy);
                                return {
                                    name: center.name,
                                    occupancy: rawOccupancy,
                                    remaining: remaining,
                                    rawCapacity,
                                    rawOccupancy,
                                };
                            });

                            const CustomCenterTooltip = ({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;
                                const entry = chartData.find((d) => d.name === label);
                                return (
                                    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-xs text-slate-700">
                                        <p className="font-bold text-slate-800 mb-2">{label}</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2.5 h-2.5 rounded-sm bg-[#e2e8f0] inline-block" />
                                            <span className="text-slate-500">Remaining Slots:</span>
                                            <span className="font-bold text-slate-800">{entry?.remaining}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] inline-block" />
                                            <span className="text-slate-500">Active Occupancy:</span>
                                            <span className="font-bold text-[#3b82f6]">{entry?.rawOccupancy}</span>
                                        </div>
                                        <div className="border-t border-slate-100 mt-2 pt-2 flex items-center gap-2">
                                            <span className="text-slate-400">Total Capacity:</span>
                                            <span className="font-extrabold text-slate-800">{entry?.rawCapacity}</span>
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%" barSize={60}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomCenterTooltip />} cursor={{ fill: "rgba(148,163,184,0.04)" }} />
                                        <Legend 
                                            verticalAlign="top" 
                                            height={36} 
                                            iconType="square" 
                                            iconSize={10}
                                            formatter={(value) => (
                                                <span className="text-slate-500 text-xs font-semibold">
                                                    {value === "remaining" ? "Available Slots" : "Current Occupants"}
                                                </span>
                                            )}
                                        />
                                        <Bar name="occupancy" dataKey="occupancy" stackId="stack" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                                            <LabelList dataKey="rawOccupancy" content={renderInsideLabel} />
                                        </Bar>
                                        <Bar name="remaining" dataKey="remaining" stackId="stack" fill="#e2e8f0" radius={[4, 4, 0, 0]}>
                                            <LabelList dataKey="rawCapacity" content={(props) => {
                                                const { x, y, width, value } = props;
                                                return (
                                                    <text
                                                        x={x + width / 2}
                                                        y={y - 8}
                                                        fill="#64748b"
                                                        textAnchor="middle"
                                                        fontSize={10}
                                                        fontWeight={800}
                                                    >
                                                        Limit: {value}
                                                    </text>
                                                );
                                            }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>

                    {/* Centers detail utilization list */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-black">Evacuation Center</th>
                                    <th className="px-6 py-4 font-black text-center">Households</th>
                                    <th className="px-6 py-4 font-black text-center">Occupants</th>
                                    <th className="px-6 py-4 font-black text-center">Total Capacity</th>
                                    <th className="px-6 py-4 font-black">Capacity Index</th>
                                    <th className="px-6 py-4 font-black text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics.center_performance.map((center) => (
                                    <tr key={center.center_id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-800">{center.name}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{center.households}</td>
                                        <td className="px-6 py-4 text-center font-black text-slate-800">{center.occupancy}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-400">{center.capacity}</td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                                    <div 
                                                        style={{ width: `${Math.min(center.utilization_pct, 100)}%` }} 
                                                        className={`h-full rounded-full transition-all duration-500
                                                            ${center.status === "critical" ? "bg-red-500" 
                                                              : (center.status === "warning" ? "bg-red-500" : "bg-blue-500")}
                                                        `}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-slate-400 min-w-[35px]">{center.utilization_pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                                                ${center.status === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                  : (center.status === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full animate-ping
                                                    ${center.status === "critical" ? "bg-red-400" 
                                                      : (center.status === "warning" ? "bg-amber-400" : "bg-emerald-400")}
                                                `} />
                                                {center.status === "critical" ? "Overcapacity Alert" 
                                                  : (center.status === "warning" ? "Near Capacity" : "Optimal Load")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <AlertTriangle size={36} className="text-slate-600 mb-2" />
                    No evacuation centers are linked to the selected scope.
                </div>
            )}
        </div>
    );
}
