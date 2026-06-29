import React from "react";
import { Link } from "react-router-dom";
import { Activity, Radio, AlertCircle, Package, Users, Bell, Clock, ShieldAlert, CheckCircle2, Wrench, HeartPulse, Shield, FileWarning, AlertTriangle } from "lucide-react";

export default function DashboardSidebar({
    loading,
    recentAlerts,
    displayIssues,
    displayRequests
}) {
    const getAlertUrgencyStyle = (key) => {
        switch (key) {
            case 'critical': return 'bg-red-500 shadow-lg shadow-red-500/40 animate-pulse';
            case 'high':     return 'bg-orange-500 shadow-md shadow-orange-500/30';
            case 'medium':   return 'bg-yellow-400';
            case 'low':      return 'bg-green-500';
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

    return (
        <div className="lg:col-span-1 space-y-6">
            {/* Quick Shortcuts Grid */}
            <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-indigo-500" />
                    Shortcuts Portal
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/evacuation-alerts" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                        <Radio size={18} className="mb-2 text-indigo-600 group-hover:scale-105 transition-transform" />
                        <span className="text-xs font-black">Broadcast Alert</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Disperse Emergency Alerts</span>
                    </Link>
                    <Link to="/center-issue-reports" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                        <AlertCircle size={18} className="mb-2 text-indigo-600 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black">Report Issue</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Log shelter incidents</span>
                    </Link>
                    <Link to="/resource-requests" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                        <Package size={18} className="mb-2 text-indigo-600 group-hover:scale-105 transition-transform" />
                        <span className="text-xs font-black">Request Supplies</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Order Logistics Packs</span>
                    </Link>
                    <Link to="/household-verification" className="flex flex-col items-center justify-center p-4 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 rounded-2xl transition-all text-center group active:scale-95">
                        <Users size={18} className="mb-2 text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-xs font-black">Register Family</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Enroll Evacuee listings</span>
                    </Link>
                </div>
            </div>

            {/* Emergency Broadcast alerts logs */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Bell size={14} className="text-rose-500" />
                        Recent Broadcasts
                    </h3>
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                        live stream
                    </span>
                </div>
                
                {loading ? (
                    <div className="space-y-3.5 animate-pulse">
                        {[1, 2, 3].map((alert) => (
                            <div key={alert} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                <span className="w-2 h-2 rounded-full mt-1.5 bg-slate-200 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-full h-3.5 bg-slate-200 rounded-md" />
                                    <div className="flex gap-2">
                                        <div className="w-12 h-3 bg-slate-100 rounded-sm" />
                                        <div className="w-16 h-3 bg-slate-100 rounded-sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentAlerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-100 rounded-xl">No active transmissions logged.</p>
                ) : (
                    <div className="space-y-3.5">
                        {recentAlerts.map((alert, i) => (
                            <div key={alert.notif_id || i} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getAlertUrgencyStyle(alert.urgency_level?.urgency_key)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-700 font-semibold leading-normal truncate" title={alert.message}>
                                        {alert.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-bold font-mono text-slate-400 uppercase bg-slate-100 px-1 rounded">
                                            {alert.channel || 'Broadcast'}
                                        </span>
                                        <span className="text-[8px] font-medium text-slate-400 flex items-center gap-0.5">
                                            <Clock size={8} />
                                            {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Incidents and Urgent requests */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-orange-500" />
                    Active Concerns
                </h3>

                {/* Active Incident Concerns (Issues) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Incidents ({displayIssues.length})</span>
                        <Link to="/center-issue-reports" className="text-[8px] font-black text-indigo-500 hover:underline uppercase">View All</Link>
                    </div>

                    {loading ? (
                        <div className="space-y-2.5 animate-pulse">
                            {[1, 2].map((item) => (
                                <div key={item} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                                    <div className="w-6 h-6 bg-slate-200 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-32 h-3 bg-slate-200 rounded-sm" />
                                        <div className="w-20 h-2 bg-slate-100 rounded-sm" />
                                    </div>
                                    <div className="w-12 h-4 bg-slate-200 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : displayIssues.length === 0 ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">No active center incidents</span>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {displayIssues.map((issue, idx) => {
                                const CategoryIcon = getCategoryIcon(issue.category);
                                return (
                                    <div key={issue.report_id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 hover:bg-slate-100/50 transition-colors">
                                        <div className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CategoryIcon size={12} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-slate-800 leading-snug truncate">{issue.title}</p>
                                            <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{issue.center?.name || 'Assigned Center'}</p>
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                            {issue.severity || 'medium'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Logistics Needs (Requests) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Logistics Needs ({displayRequests.length})</span>
                        <Link to="/resource-requests" className="text-[8px] font-black text-indigo-500 hover:underline uppercase">View All</Link>
                    </div>

                    {loading ? (
                        <div className="space-y-2.5 animate-pulse">
                            {[1, 2].map((item) => (
                                <div key={item} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                                    <div className="w-6 h-6 bg-slate-200 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-32 h-3 bg-slate-200 rounded-sm" />
                                        <div className="w-20 h-2 bg-slate-100 rounded-sm" />
                                    </div>
                                    <div className="w-12 h-4 bg-slate-200 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : displayRequests.length === 0 ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">All supply requests fulfilled</span>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {displayRequests.map((req, idx) => (
                                <div key={req.request_id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 hover:bg-slate-100/50 transition-colors">
                                    <div className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Package size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-800 leading-snug truncate">{req.resource_type}</p>
                                        <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">Qty: {req.quantity} · {req.center?.name || 'Assigned Center'}</p>
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                        {req.urgency_level?.urgency_label || 'medium'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
