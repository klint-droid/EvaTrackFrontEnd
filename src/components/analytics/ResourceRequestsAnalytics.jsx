import React from "react";
import { Package } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const REQ_STATUS_COLORS = {
    pending: "#f59e0b",      // Amber (Incoming)
    acknowledged: "#3b82f6", // Blue (In Progress)
    approved: "#6366f1",     // Indigo (In Review)
    delivered: "#10b981",    // Emerald (Done)
    rejected: "#ef4444"      // Red (Rejected)
};

export default function ResourceRequestsAnalytics({ analytics }) {
    const resRequests = analytics?.resource_requests || {};
    const statusDist = resRequests.status_distribution || [];
    const topTypes = resRequests.top_types || [];

    const totalRequests = statusDist.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const totalDelivered = statusDist.find(s => s.status_key === 'delivered')?.count || 0;
    const fulfillmentRate = totalRequests > 0 ? Math.round((totalDelivered / totalRequests) * 100) : 0;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs transition-colors text-left space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <Package size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">Logistics & Resource Demands</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Request fulfillment progress and top supply item volumes</p>
                    </div>
                </div>
                
                {/* Fulfillment KPI Badge */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-3.5 py-1.5 rounded-xl">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fulfillment Rate</span>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{fulfillmentRate}% fulfilled</p>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                        {totalDelivered} / {totalRequests} Done
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Request Status Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Request Status Breakdown
                            </h4>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Total: {totalRequests}
                            </span>
                        </div>
                        <div className="h-52 flex items-center justify-center">
                            {statusDist.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="count"
                                        >
                                            {statusDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={REQ_STATUS_COLORS[entry.status_key] || "#64748b"} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No resource requests recorded</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {statusDist.map((item) => {
                            const pct = totalRequests > 0 ? Math.round((item.count / totalRequests) * 100) : 0;
                            return (
                                <div key={item.status_key} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: REQ_STATUS_COLORS[item.status_key] }} />
                                        <div className="min-w-0">
                                            <span className="text-slate-700 dark:text-slate-200 font-bold block truncate capitalize text-[11px]">{item.status_label}</span>
                                            <span className="text-[10px] text-slate-400">{pct}%</span>
                                        </div>
                                    </div>
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs shrink-0 ml-1">{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Top Requested Items & Volumes */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Top Requested Resource Types & Volumes
                            </h4>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {topTypes.length} Categories
                            </span>
                        </div>
                        <div className="h-52">
                            {topTypes.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topTypes} layout="vertical" margin={{ top: 5, right: 30, left: 15, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                        <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                            <LabelList dataKey="total_quantity" content={(props) => {
                                                const { x, y, width, value } = props;
                                                return (
                                                    <text x={x + width + 8} y={y + 13} fill="#64748b" fontSize={10} fontWeight={800}>
                                                        {value ? `${Number(value).toLocaleString()} units` : ''}
                                                    </text>
                                                );
                                            }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No resource requests recorded</div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 text-center flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Total Units Demanded:</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                            {topTypes.reduce((acc, curr) => acc + (curr.total_quantity || 0), 0).toLocaleString()} units
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
