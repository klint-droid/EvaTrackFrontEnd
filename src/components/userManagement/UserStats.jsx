import React from "react";
import { StatCard } from "../ui/StatCard";

export default function UserStats({ totalUsers, adminCount, personnelCount, assignedCount }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
                title="Total Users" 
                value={totalUsers} 
                dotColor="#6366f1" // indigo-500
            />
            <StatCard 
                title="Administrators" 
                value={adminCount} 
                dotColor="#f59e0b" // amber-500
            />
            <StatCard 
                title="Personnel" 
                value={personnelCount} 
                dotColor="#10b981" // emerald-500
            />
            <StatCard 
                title="Assigned Personnel" 
                value={assignedCount} 
                dotColor="#ef4444" // red-500
            />
        </div>
    );
}

