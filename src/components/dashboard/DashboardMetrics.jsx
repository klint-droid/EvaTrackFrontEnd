import React from "react";
import { Home, DoorOpen, Users, AlertTriangle, Package } from "lucide-react";

export default function DashboardMetrics({
    isPersonnel,
    assignedCenter,
    displayAvailableSlots,
    displayTotalCenters,
    displayTotalOccupied,
    displayTotalCapacity,
    occupancyRate,
    displayOpenIssues,
    displayPendingRequests,
    loading
}) {
    const metrics = [
        { 
            label: isPersonnel ? "Available Slots" : "Active Shelters", 
            val: isPersonnel ? displayAvailableSlots : displayTotalCenters, 
            icon: isPersonnel ? DoorOpen : Home, 
            color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50",
            sub: isPersonnel && assignedCenter 
                ? `${displayAvailableSlots.toLocaleString()} slots available` 
                : "Fully Operational"
        },
        { 
            label: isPersonnel ? "Center Occupancy" : "Total Occupancy", 
            val: displayTotalOccupied, 
            icon: Users, 
            color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/50",
            sub: displayTotalCapacity > 0 ? `${displayTotalOccupied.toLocaleString()} / ${displayTotalCapacity.toLocaleString()} registered (${occupancyRate}%)` : "No slots registered"
        },
        { 
            label: isPersonnel ? "Center Concerns" : "Active Concerns", 
            val: displayOpenIssues, 
            icon: AlertTriangle, 
            color: displayOpenIssues > 0 
                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50" 
                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50",
            sub: displayOpenIssues > 0 ? "Field Action Required" : "All Systems Clear"
        },
        { 
            label: isPersonnel ? "Center Logistics" : "Pending Logistics", 
            val: displayPendingRequests, 
            icon: Package, 
            color: displayPendingRequests > 0 
                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50" 
                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50",
            sub: displayPendingRequests > 0 ? `${displayPendingRequests} items awaiting dispatch` : "Fully Supplied"
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {metrics.map((item, i) => {
                const Icon = item.icon;
                return (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-28 sm:h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                            <div className={`p-1.5 rounded-md border ${item.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            {loading ? (
                                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            ) : (
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{item.val.toLocaleString()}</h2>
                            )}
                            {loading ? (
                                <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
                            ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{item.sub}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

