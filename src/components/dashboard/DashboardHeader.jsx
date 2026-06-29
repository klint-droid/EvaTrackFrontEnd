import React from "react";
import { RefreshCw } from "lucide-react";

export default function DashboardHeader({
    isPersonnel,
    assignedCenter,
    loading,
    user,
    selectedEventId,
    setSelectedEventId,
    activeEvents,
    loadDashboard,
    lastUpdatedTime
}) {
    return (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-white relative overflow-hidden shadow-sm">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-12 top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {isPersonnel && assignedCenter ? `${assignedCenter.name} — Center Dashboard` : 'Operations Dashboard'}
                    </div>
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight flex flex-wrap items-center gap-2">
                        Welcome back, {loading ? <span className="inline-block w-40 h-8 bg-white/20 rounded-xl animate-pulse align-middle" /> : (user?.name || "Operator")}!
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-300 max-w-xl font-medium leading-relaxed hidden sm:block">
                        {isPersonnel && assignedCenter
                            ? `Viewing real-time operations for ${assignedCenter.name}. Monitor capacity, track pending logistics, and manage evacuees for your assigned center.`
                            : 'Here is your situational overview today. Easily monitor shelter capacity ratios, track pending relief dispatches, register evacuees, and broadcast warning logs.'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    {/* Active Event Filter Dropdown */}
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="px-4 py-2.5 bg-white/10 border border-white/10 hover:bg-white/15 transition-all text-white text-xs font-bold rounded-xl shadow-sm focus:outline-none cursor-pointer"
                    >
                        <option value="all" className="bg-slate-900 text-white">All Active Events</option>
                        {activeEvents.filter(evt => !evt.ended_at).map(evt => (
                            <option key={evt.event_id} value={evt.event_id} className="bg-slate-900 text-white">
                                {evt.name}
                            </option>
                        ))}
                    </select>

                    <button 
                        onClick={() => loadDashboard(true)}
                        disabled={loading}
                        className="p-3 bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white rounded-xl shadow-sm flex items-center justify-center disabled:opacity-50"
                        title="Refresh Dashboard Data"
                    >
                        <RefreshCw size={15} className={`${loading ? 'animate-spin' : ''}`} />
                    </button>
                    
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-xs font-bold text-white transition-all hover:bg-white/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span>Last Updated: {loading ? "..." : (lastUpdatedTime || "Just now")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
