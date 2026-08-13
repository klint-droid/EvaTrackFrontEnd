import React from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function EvacuationTrendsChart({ analytics }) {
    const trends = analytics?.evacuation_trends || [];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs transition-colors text-left">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    <BarChart3 size={18} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        Daily Evacuation Intake Curves
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Timeline of daily admitted households and total physical evacuees</p>
                </div>
            </div>

            <div className="h-72 w-full">
                {trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIndividuals" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorHouseholds" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "10px", color: "#1e293b", fontSize: "12px" }}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            <Area type="monotone" name="Evacuated Individuals" dataKey="individuals" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIndividuals)" />
                            <Area type="monotone" name="Evacuated Households" dataKey="households" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHouseholds)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                        <AlertCircle size={28} className="mb-2 text-slate-400" />
                        No daily intake records recorded for selected scope.
                    </div>
                )}
            </div>
        </div>
    );
}

