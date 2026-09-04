import React from "react";
import { ShieldAlert } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const ISSUE_STATUS_COLORS = {
    open: "#ef4444",        // Red
    in_progress: "#f59e0b", // Amber
    resolved: "#10b981",    // Emerald
    closed: "#64748b"       // Slate
};

const CATEGORY_COLORS = {
    incident: "#ec4899",      // Pink
    facility_issue: "#3b82f6",// Blue
    health_issue: "#10b981",  // Emerald
    safety_issue: "#f97316",  // Orange
    other: "#64748b"          // Slate
};

export default function CenterIssuesAnalytics({ analytics }) {
    const centerIssues = analytics?.center_issues || {};
    const statusDist = centerIssues.status_distribution || [];
    const categoryDist = centerIssues.category_distribution || [];

    const totalIssues = statusDist.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const resolvedIssues = (statusDist.find(s => s.status_key === 'resolved')?.count || 0) + (statusDist.find(s => s.status_key === 'closed')?.count || 0);
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs transition-colors text-left space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <ShieldAlert size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">Facility Health & Active Issues</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Resolution rates and incident category breakdown</p>
                    </div>
                </div>

                {/* Resolution KPI Badge */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-3.5 py-1.5 rounded-xl">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resolution Rate</span>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{resolutionRate}% resolved</p>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                        {resolvedIssues} / {totalIssues} Resolved
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Issues Status Donut Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Issue Resolution Status
                            </h4>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Total: {totalIssues}
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
                                                <Cell key={`cell-${index}`} fill={ISSUE_STATUS_COLORS[entry.status_key] || "#64748b"} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No facility issues recorded</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {statusDist.map((item) => {
                            const pct = totalIssues > 0 ? Math.round((item.count / totalIssues) * 100) : 0;
                            return (
                                <div key={item.status_key} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ISSUE_STATUS_COLORS[item.status_key] }} />
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

                {/* 2. Category Distribution Bar Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Issues by Category
                            </h4>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {categoryDist.length} Categories
                            </span>
                        </div>
                        <div className="h-52">
                            {categoryDist.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="category_label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                            {categoryDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category_key] || "#64748b"} />
                                            ))}
                                            <LabelList dataKey="count" position="top" fill="#64748b" fontSize={10} fontWeight={800} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No issues reported</div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {categoryDist.map((item) => (
                            <div key={item.category_key} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg shadow-xs">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category_key] }} />
                                    <span className="text-slate-700 dark:text-slate-300 font-bold truncate capitalize text-[11px]">{item.category_label}</span>
                                </div>
                                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs shrink-0 ml-1">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
