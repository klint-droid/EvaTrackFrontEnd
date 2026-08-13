import React from "react";
import { Link } from "react-router-dom";
import { Radio, ClipboardList, Truck, UserPlus, Bell, Clock, ShieldAlert, CheckCircle2, Wrench, HeartPulse, Shield, FileWarning, AlertTriangle, ChevronRight, Package } from "lucide-react";

export default function DashboardSidebar({
    loading,
    recentAlerts,
    displayIssues,
    displayRequests
}) {
    const getAlertUrgencyStyle = (key) => {
        switch (key) {
            case 'critical': return 'bg-rose-500 shadow-sm shadow-rose-500/40 animate-ping';
            case 'high':     return 'bg-amber-500';
            case 'medium':   return 'bg-yellow-400';
            case 'low':      return 'bg-emerald-500';
            default:         return 'bg-slate-300';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'facility_issue': return Wrench;
            case 'health_issue':   return HeartPulse;
            case 'safety_issue':   return Shield;
            case 'incident':       return FileWarning;
            default:               return AlertTriangle;
        }
    };

    const QUICK_ACTIONS = [
        { 
            icon: Radio, 
            label: "Broadcast Alert", 
            sub: "Send emergency advisory", 
            color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
            link: "/evacuation-alerts" 
        },
        { 
            icon: ClipboardList, 
            label: "Report Issue", 
            sub: "Log shelter incident", 
            color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
            link: "/center-issue-reports" 
        },
        { 
            icon: Truck, 
            label: "Request Supplies", 
            sub: "Order logistics pack", 
            color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
            link: "/resource-requests" 
        },
        { 
            icon: UserPlus, 
            label: "Register Family", 
            sub: "Enroll evacuee household", 
            color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
            link: "/household-verification" 
        },
    ];

    return (
        <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions Card Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick actions</h2>
                    <Link to="/evacuation-alerts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                    {QUICK_ACTIONS.map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link
                                key={a.label}
                                to={a.link}
                                className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-3 text-left hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all bg-white dark:bg-slate-900 group"
                            >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 border ${a.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{a.label}</div>
                                    <div className="text-[11px] text-slate-400 truncate">{a.sub}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Emergency Broadcast Transmission Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-rose-500" />
                        Recent Broadcasts
                    </h3>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        Live Feed
                    </span>
                </div>
                
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full mt-1.5 bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentAlerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No active transmissions logged.</p>
                ) : (
                    <div className="space-y-3">
                        {recentAlerts.slice(0, 3).map((alert, i) => (
                            <div key={alert.notif_id || i} className="flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getAlertUrgencyStyle(alert.urgency_level?.urgency_key)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-snug truncate" title={alert.message}>
                                        {alert.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {alert.channel || 'Broadcast'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Concerns Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        Active Concerns ({displayIssues.length})
                    </h3>
                    <Link to="/center-issue-reports" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</Link>
                </div>

                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        {[1, 2].map((item) => (
                            <div key={item} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center gap-2">
                                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <div className="w-28 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayIssues.length === 0 ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">All shelter systems clear</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayIssues.slice(0, 3).map((issue, idx) => {
                            const CategoryIcon = getCategoryIcon(issue.category);
                            return (
                                <div key={issue.report_id || idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <CategoryIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{issue.title}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{issue.center?.name || 'Assigned Center'}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 uppercase">
                                        {issue.severity || 'med'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

