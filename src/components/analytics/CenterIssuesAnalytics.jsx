import React from "react";
import { ShieldAlert } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const ISSUE_STATUS_COLORS = {
    open: "#ef4444",        // Red
    in_progress: "#f59e0b", // Amber
    resolved: "#10b981",    // Emerald
    closed: "#6b7280"       // Gray
};

const SEVERITY_COLORS = {
    critical: "#dc2626",
    high: "#f97316",
    medium: "#eab308",
    low: "#3b82f6"
};

const CATEGORY_COLORS = {
    incident: "#ec4899",      // Pink
    facility_issue: "#3b82f6",// Blue
    health_issue: "#10b981",  // Emerald
    safety_issue: "#f97316",  // Orange
    other: "#64748b"          // Slate
};

export default function CenterIssuesAnalytics({ analytics }) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-2">
                <ShieldAlert className="text-emerald-600" size={20} />
                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Facility Health & Active Issues</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issues Status Donut Chart */}
                <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                            Issue Resolution Rate
                        </h4>
                        <div className="h-44 flex items-center justify-center">
                            {analytics.center_issues?.status_distribution?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.center_issues.status_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {analytics.center_issues.status_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={ISSUE_STATUS_COLORS[entry.status_key] || "#64748b"} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No facility issues recorded</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {analytics.center_issues?.status_distribution?.map((item) => (
                            <div key={item.status_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ISSUE_STATUS_COLORS[item.status_key] }} />
                                    <span className="text-slate-500 font-bold truncate capitalize">{item.status_label}</span>
                                </div>
                                <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Severity Level Bar Chart */}
                <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                            Unresolved Issues by Severity
                        </h4>
                        <div className="h-44">
                            {analytics.center_issues?.severity_distribution?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.center_issues.severity_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="severity_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                                            {analytics.center_issues.severity_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity_key] || "#3b82f6"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No severity metrics found</div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {analytics.center_issues?.severity_distribution?.map((item) => (
                            <div key={item.severity_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[item.severity_key] }} />
                                    <span className="text-slate-500 font-bold truncate capitalize">{item.severity_label}</span>
                                </div>
                                <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution Bar Chart */}
                <div className="bg-slate-50 border border-slate-100/60 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                            Common Categories
                        </h4>
                        <div className="h-44">
                            {analytics.center_issues?.category_distribution?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.center_issues.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="category_label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px" }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                                            {analytics.center_issues.category_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category_key] || "#64748b"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No issues reported</div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        {analytics.center_issues?.category_distribution?.map((item) => (
                            <div key={item.category_key} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category_key] }} />
                                    <span className="text-slate-500 font-bold truncate capitalize">{item.category_label}</span>
                                </div>
                                <span className="font-extrabold text-slate-800 shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
