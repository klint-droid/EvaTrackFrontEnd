import React from "react";
import { Package } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const REQ_STATUS_COLORS = {
    pending: "#64748b",      // Slate
    acknowledged: "#8b5cf6", // Purple
    approved: "#3b82f6",     // Blue
    delivered: "#10b981",    // Emerald
    rejected: "#ef4444"      // Red
};

const URGENCY_COLORS = {
    critical: "#dc2626", // Red
    high: "#f97316",     // Orange
    medium: "#eab308",   // Yellow
    low: "#3b82f6"       // Blue
};

export default function ResourceRequestsAnalytics({ analytics }) {
    const resRequests = analytics?.resource_requests || {};
    const statusDist = resRequests.status_distribution || [];
    const urgencyDist = resRequests.urgency_distribution || [];
    const topTypes = resRequests.top_types || [];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs transition-colors text-left space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    <Package size={18} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">Logistics & Resource Demands</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Request status breakdowns, urgency distribution, and supply types</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Status Donut Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                            Request Status Breakdown
                        </h4>
                        <div className="h-44 flex items-center justify-center">
                            {statusDist.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={3}
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
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {statusDist.map((item) => (
                            <div key={item.status_key} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REQ_STATUS_COLORS[item.status_key] }} />
                                    <span className="text-slate-600 dark:text-slate-300 font-semibold truncate capitalize">{item.status_label}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Urgency Distribution Bar Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                            Demands by Urgency Index
                        </h4>
                        <div className="h-44">
                            {urgencyDist.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={urgencyDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="urgency_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                                            {urgencyDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.urgency_key] || "#3b82f6"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No urgency metrics found</div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {urgencyDist.map((item) => (
                            <div key={item.urgency_key} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: URGENCY_COLORS[item.urgency_key] }} />
                                    <span className="text-slate-600 dark:text-slate-300 font-semibold truncate capitalize">{item.urgency_label}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Requested Items (Horizontal Bar Chart) */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                            Top Requested Resource Types
                        </h4>
                        <div className="h-44">
                            {topTypes.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topTypes} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                        <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={9} width={80} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }} />
                                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                            <LabelList dataKey="total_quantity" content={(props) => {
                                                const { x, y, width, value } = props;
                                                return (
                                                    <text x={x + width + 5} y={y + 11} fill="#64748b" fontSize={9} fontWeight={700}>
                                                        Qty: {value}
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
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-2.5 text-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                            Total Request Types: {topTypes.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

