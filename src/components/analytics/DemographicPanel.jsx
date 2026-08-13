import React from "react";
import { Users, HeartPulse, UserCheck, ShieldAlert, Baby, Accessibility, Heart, Award } from "lucide-react";
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
    const ageGroups = analytics?.demographics?.age_groups || [
        { group: 'Children (0-12)', count: 0 },
        { group: 'Youth (13-17)', count: 0 },
        { group: 'Adults (18-59)', count: 0 },
        { group: 'Elderly (60+)', count: 0 }
    ];

    const genderData = analytics?.demographics?.gender || [
        { gender: 'Male', count: 0 },
        { gender: 'Female', count: 0 }
    ];

    const vulnerableGroups = analytics?.demographics?.vulnerable_groups || [];

    const totalAgeCount = ageGroups.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const maleCount = genderData.find(g => g.gender?.toLowerCase() === 'male')?.count || genderData[0]?.count || 0;
    const femaleCount = genderData.find(g => g.gender?.toLowerCase() === 'female')?.count || genderData[1]?.count || 0;
    const totalGender = maleCount + femaleCount;
    const malePct = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 50;
    const femalePct = totalGender > 0 ? 100 - malePct : 50;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            {/* 1. AGE DISTRIBUTION & VULNERABILITIES */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs flex flex-col justify-between transition-colors">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                                <Users size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                    Age Distribution & Vulnerability
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Demographic breakdown captured from verified evacuees</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        {/* Donut Chart */}
                        <div className="h-44 flex justify-center items-center relative">
                            {totalAgeCount > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ageGroups}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={48}
                                            outerRadius={68}
                                            paddingAngle={3}
                                            dataKey="count"
                                        >
                                            {ageGroups.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-2">
                                    <span className="text-[11px] font-semibold text-slate-400">No Age Data</span>
                                </div>
                            )}
                        </div>

                        {/* Donut Legends */}
                        <div className="space-y-2.5">
                            {ageGroups.map((item, idx) => (
                                <div key={item.group} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: AGE_COLORS[idx % AGE_COLORS.length] }} />
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">{item.group}</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vulnerable profiles & care lists */}
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Vulnerable Profiles & Care Lists
                        </h4>
                        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/50">
                            Priority Care
                        </span>
                    </div>

                    {vulnerableGroups.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {vulnerableGroups.map((group) => (
                                <div key={group.key} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">{group.label}</span>
                                        <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{group.count}</h5>
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                                        Tracked
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-400 font-medium">No special vulnerable attributes recorded for current selection.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. GENDER & HOUSEHOLD EVACUATION PROFILE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs flex flex-col justify-between transition-colors space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            <UserCheck size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                Gender & Household Status Profile
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Gender balance ratio and evacuation lifecycle progress</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Gender Balance Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                                    Male: <strong className="text-slate-900 dark:text-slate-100">{maleCount}</strong> ({malePct}%)
                                </span>
                                <span className="flex items-center gap-1.5">
                                    Female: <strong className="text-slate-900 dark:text-slate-100">{femaleCount}</strong> ({femalePct}%)
                                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                                </span>
                            </div>
                            
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-800">
                                <div style={{ width: `${malePct}%` }} className="bg-blue-500 h-full transition-all duration-500" title={`Male: ${maleCount}`} />
                                <div style={{ width: `${femalePct}%` }} className="bg-pink-500 h-full transition-all duration-500" title={`Female: ${femaleCount}`} />
                            </div>
                        </div>

                        {/* Household Status Distribution Graph */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                Household Evacuation Lifecycle Statuses
                            </h4>
                            <div className="h-44 w-full">
                                {analytics?.status_distribution?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.status_distribution} layout="vertical" margin={{ top: 0, right: 15, left: 5, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                            <YAxis dataKey="status_label" type="category" stroke="#94a3b8" fontSize={11} width={90} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }}
                                            />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                                                {analytics.status_distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status_key] || "#3b82f6"} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                                        No lifecycle status distribution recorded.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

