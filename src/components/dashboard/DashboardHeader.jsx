import React from "react";

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
}) {
    const todayFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8 flex items-center justify-between shadow-sm text-white">
            {/* Background Accent Blur */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2 max-w-xl">
                <div className="text-blue-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <span>{todayFormatted}</span>
                    <span className="text-blue-400">•</span>
                    <span className="text-blue-300 font-semibold uppercase text-[11px] tracking-wider">
                        {isPersonnel && assignedCenter ? assignedCenter.name : "Command Overview"}
                    </span>
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
            </div>

            {/* Radar Graphic Right Decoration */}
            <div className="hidden sm:block flex-shrink-0 relative z-10 pl-4">
                <RadarGraphic />
            </div>
        </div>
    );
}
