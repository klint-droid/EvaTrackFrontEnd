import React from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function EvacuationTrendsChart({ analytics }) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-indigo-600" size={20} />
                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Daily Evacuation Intake Curves</h3>
            </div>

            <div className="h-80 w-full">
                {analytics.evacuation_trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.evacuation_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIndividuals" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorHouseholds" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#1e293b" }}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area type="monotone" name="Evacuated Individuals" dataKey="individuals" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIndividuals)" />
                            <Area type="monotone" name="Evacuated Households" dataKey="households" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHouseholds)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                        <AlertCircle size={32} className="mb-2 text-slate-600" />
                        No evacuation intake records found for this scope.
                    </div>
                )}
            </div>
        </div>
    );
}
