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
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-2">
                <Package className="text-emerald-600" size={20} />
                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Logistics & Resource Demands</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Status Donut Chart */}
                <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                            Request Status Breakdown
                        </h4>
                        <div className="h-44 flex items-center justify-center">
                            {analytics.resource_requests?.status_distribution?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.resource_requests.status_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {analytics.resource_requests.status_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={REQ_STATUS_COLORS[entry.status_key] || "#64748b"} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No resource requests recorded</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {analytics.resource_requests?.status_distribution?.map((item) => (
                            <div key={item.status_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REQ_STATUS_COLORS[item.status_key] }} />
                                    <span className="text-slate-500 font-bold truncate capitalize">{item.status_label}</span>
                                </div>
                                <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Urgency Distribution Bar Chart */}
                <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                            Demands by Urgency Index
                        </h4>
                        <div className="h-44">
                            {analytics.resource_requests?.urgency_distribution?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.resource_requests.urgency_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="urgency_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                                            {analytics.resource_requests.urgency_distribution.map((entry, index) => (
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
                        {analytics.resource_requests?.urgency_distribution?.map((item) => (
                            <div key={item.urgency_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: URGENCY_COLORS[item.urgency_key] }} />
                                    <span className="text-slate-500 font-bold truncate capitalize">{item.urgency_label}</span>
                                </div>
                                <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Requested Items (Horizontal Bar Chart) */}
                <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                            Top Requested Resource Types
                        </h4>
                        <div className="h-44">
                            {analytics.resource_requests?.top_types?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.resource_requests.top_types} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                        <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={9} width={80} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
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
                    <div className="mt-4 border-t border-slate-200/60 pt-3">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                            Total Request Types: {analytics.resource_requests?.top_types?.length || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
