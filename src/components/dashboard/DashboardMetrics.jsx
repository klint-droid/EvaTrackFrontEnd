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
            border: "border-l-4 border-indigo-500",
            color: "text-indigo-600",
            sub: isPersonnel && assignedCenter 
                ? `${displayAvailableSlots.toLocaleString()} slots available` 
                : "Fully Operational"
        },
        { 
            label: isPersonnel ? "Center Occupancy" : "Total Occupancy", 
            val: displayTotalOccupied, 
            icon: Users, 
            border: "border-l-4 border-violet-500",
            color: "text-violet-600",
            sub: displayTotalCapacity > 0 ? `${displayTotalOccupied.toLocaleString()} / ${displayTotalCapacity.toLocaleString()} registered (${occupancyRate}%)` : "No slots registered"
        },
        { 
            label: isPersonnel ? "Center Concerns" : "Active Concerns", 
            val: displayOpenIssues, 
            icon: AlertTriangle, 
            border: displayOpenIssues > 0 ? "border-l-4 border-rose-500 animate-pulse" : "border-l-4 border-emerald-500",
            color: displayOpenIssues > 0 ? "text-rose-600" : "text-emerald-600",
            sub: displayOpenIssues > 0 ? "Field Action Required" : "All Systems Clear"
        },
        { 
            label: isPersonnel ? "Center Logistics" : "Pending Logistics", 
            val: displayPendingRequests, 
            icon: Package, 
            border: displayPendingRequests > 0 ? "border-l-4 border-amber-500" : "border-l-4 border-emerald-500",
            color: displayPendingRequests > 0 ? "text-amber-600" : "text-emerald-600",
            sub: displayPendingRequests > 0 ? `${displayPendingRequests} items awaiting dispatch` : "Fully Supplied"
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {metrics.map((item, i) => {
                const Icon = item.icon;
                return (
                    <div key={i} className={`bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-slate-200/60 ${item.border} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-28 sm:h-32`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                            <Icon size={18} className={item.color} />
                        </div>
                        <div>
                            {loading ? (
                                <div className="w-16 h-7 bg-slate-200/50 rounded-md animate-pulse animate-duration-1000" />
                            ) : (
                                <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">{item.val.toLocaleString()}</h2>
                            )}
                            {loading ? (
                                <div className="w-28 h-3 bg-slate-100 rounded-sm animate-pulse mt-2.5" />
                            ) : (
                                <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-tight truncate">{item.sub}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
