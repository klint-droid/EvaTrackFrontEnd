import React from "react";
import { RefreshCw } from "lucide-react";

function RadarGraphic() {
    return (
        <svg viewBox="0 0 200 200" className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 opacity-90">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="132" cy="70" r="5" fill="#fbbf24" className="animate-ping opacity-75" />
            <circle cx="132" cy="70" r="4" fill="#fbbf24" />
            <circle cx="70" cy="130" r="3.5" fill="#fff" opacity="0.8" />
            <circle cx="100" cy="100" r="3" fill="#fff" />
        </svg>
    );
}

export default function DashboardHeader({
    isPersonnel,
    assignedCenter,
    loading,
    user,
    onRefresh,
    lastUpdatedTime,
    hasActiveEvent,
    activeEvent,
}) {
    const todayFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm text-white">
            {/* Background Accent Blur */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-xl">
                {/* Meta & Status Line */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium">
                    <span className="text-blue-200">{todayFormatted}</span>
                    <span className="text-blue-400">•</span>
                    <span className="text-blue-300 font-semibold uppercase text-[11px] tracking-wider">
                        {isPersonnel && assignedCenter ? assignedCenter.name : "Command Overview"}
                    </span>

                    {/* Calamity Status Indicator */}
                    {hasActiveEvent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-200 text-[11px] font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span>Active Response: {activeEvent?.name || "Emergency Declared"}</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-semibold">
                            <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                            <span>All Systems Normal</span>
                        </span>
                    )}
                </div>

                <h1 className="text-xl sm:text-3xl font-semibold text-white tracking-tight flex items-center gap-2">
                    Welcome back, {loading ? <span className="inline-block w-36 h-7 bg-white/20 rounded-md animate-pulse" /> : (user?.name || "Operator")}
                </h1>

                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-md">
                    {isPersonnel && assignedCenter
                        ? `Monitoring real-time operational status for ${assignedCenter.name}.`
                        : "Real-time monitoring across registered evacuation centers, emergency broadcasts, and field resources."
                    }
                </p>

                {/* Real-time Refresh Action & Timestamp */}
                {onRefresh && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            title="Refresh real-time telemetry"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-300" : ""}`} />
                            <span>{loading ? "Refreshing..." : "Refresh Live Data"}</span>
                        </button>
                        {lastUpdatedTime && (
                            <span className="text-[11px] text-blue-200/80 font-mono">
                                Last updated: {lastUpdatedTime}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Radar Graphic Right Decoration */}
            <div className="hidden sm:block flex-shrink-0 relative z-10 pl-4 self-center">
                <RadarGraphic />
            </div>
        </div>
    );
}
