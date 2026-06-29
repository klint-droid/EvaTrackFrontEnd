import React from "react";
import { Users, ShieldCheck, User, UserCheck } from "lucide-react";

export default function UserStats({ totalUsers, adminCount, personnelCount, assignedCount }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
                <div className="space-y-1">
                    <span className="text-sm text-slate-500 font-medium">Total Users</span>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalUsers}</p>
                    <p className="text-xs text-slate-400 font-medium">Authorized accounts</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Users className="w-5 h-5" />
                </div>
            </div>

            {/* Admin Users */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
                <div className="space-y-1">
                    <span className="text-sm text-slate-500 font-medium">Administrators</span>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{adminCount}</p>
                    <p className="text-xs text-slate-400 font-medium">Admin & super admin</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
            </div>

            {/* Personnel */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
                <div className="space-y-1">
                    <span className="text-sm text-slate-500 font-medium">Personnel</span>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{personnelCount}</p>
                    <p className="text-xs text-slate-400 font-medium">Field responders</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                    <User className="w-5 h-5" />
                </div>
            </div>

            {/* Assigned Personnel */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between hover:border-slate-300 transition-colors">
                <div className="space-y-1">
                    <span className="text-sm text-slate-500 font-medium">Assigned</span>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{assignedCount}</p>
                    <p className="text-xs text-slate-400 font-medium">Deployed to shelters</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <UserCheck className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
