import React from "react";
import { Search, SearchIcon, QrCode, Loader2, AlertCircle, User, Users, MapPin } from "lucide-react";

const getEvacuationProgress = (h) => {
    const currentEvac = h.current_evacuation || h.currentEvacuation;
    const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2") && !currentEvac.event?.ended_at;
    const isReturned = currentEvac && (currentEvac.household_status_id === 6 || currentEvac.household_status_id === "6");

    const evacuated = isEvacuated ? Number(currentEvac.evacuated_count || 0) : 0;
    const total = Math.max(
        Number(h.members_count || 0),
        Number(h.member_count || 0),
        Number(h.members?.length || 0),
        evacuated
    );
    const pct = total > 0 ? Math.min(100, Math.round((evacuated / total) * 100)) : 0;

    if (isReturned) {
        return {
            status: 'returned',
            label: 'Returned Home',
            badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
            dotClass: 'bg-blue-500',
            centerName: currentEvac.center?.name || currentEvac.center_id
        };
    }

    if (total === 0) {
        return {
            status: 'empty',
            label: 'No members registered',
            badgeClass: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
            dotClass: 'bg-slate-400',
            centerName: null
        };
    }

    if (isEvacuated) {
        if (evacuated >= total) {
            return {
                status: 'full',
                label: `${evacuated} of ${total} Evacuated (100%)`,
                badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
                dotClass: 'bg-emerald-500',
                centerName: currentEvac.center?.name || currentEvac.center?.center_name || currentEvac.center_id
            };
        }
        return {
            status: 'partial',
            label: `${evacuated} of ${total} Evacuated (${pct}%)`,
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
            dotClass: 'bg-amber-500',
            centerName: currentEvac.center?.name || currentEvac.center?.center_name || currentEvac.center_id
        };
    }

    return {
        status: 'not_evacuated',
        label: `0 of ${total} Evacuated (0%)`,
        badgeClass: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
        dotClass: 'bg-slate-400',
        centerName: null
    };
};

export default function RegistrySearch({
    query,
    setQuery,
    handleSearch,
    setQrModalOpen,
    loading,
    results,
    records,
    getHeadName,
    handleVerify
}) {
    return (
        <div className="p-6 sm:p-8 space-y-6">
            {/* Title */}
            <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                    <Search size={16} className="text-blue-600" />
                    Registry Manual Query
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                    Query family head names/IDs, or trigger QR card scanning below
                </p>
            </div>

            {/* Input fields beside QR scanner button */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <SearchIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                        size={18}
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                        placeholder="Enter Household Name, ID, or Member Name..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white dark:bg-slate-900 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setQrModalOpen(true)}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm dark:shadow-none shadow-blue-600/10"
                        title="Scan Digital QR Card"
                    >
                        <QrCode size={18} />
                        <span>Scan QR</span>
                    </button>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Search"}
                    </button>
                </div>
            </div>

            {/* Search Registry Results Box */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {results === undefined ? (
                    <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center space-y-2">
                        <Search className="text-slate-300" size={24} />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting query database sync...</p>
                        <p className="text-[10px] text-slate-400">Type family head credentials above or trigger live scan</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-rose-50/20">
                        <AlertCircle className="text-rose-400 mx-auto mb-2" size={24} />
                        <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">No matching families found in registry.</p>
                    </div>
                ) : (
                    records.map((h) => {
                        const currentEvac = h.current_evacuation || h.currentEvacuation;
                        const prog = getEvacuationProgress(h);
                        const totalMembersCount = Math.max(
                            Number(h.members_count || 0),
                            Number(h.member_count || 0),
                            Number(h.members?.length || 0)
                        );
                        return (
                            <div
                                key={h.household_id}
                                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl border-l-[5px] border-l-blue-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md dark:shadow-none hover:border-slate-300 dark:border-slate-600 transition-all duration-200 text-left"
                            >
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
                                            {h.household_name}
                                        </h3>
                                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono font-medium">
                                            {h.household_id}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <User size={14} className="text-slate-400" />
                                            <span>Head: {getHeadName(h)}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users size={14} className="text-slate-400" />
                                            <span>{totalMembersCount} Members</span>
                                        </span>
                                    </div>

                                    {/* Evacuation Status Section */}
                                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${prog.badgeClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${prog.dotClass}`} />
                                            {prog.label}
                                        </span>
                                        {prog.centerName ? (
                                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <MapPin size={12} className="text-emerald-500" />
                                                Sheltered at <strong className="text-slate-700 dark:text-slate-200 font-bold">{prog.centerName}</strong>
                                                {currentEvac?.event?.name && (
                                                    <span className="text-slate-400 font-normal ml-1">
                                                        (Event: {currentEvac.event.name})
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Ready for check-in</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleVerify(h)}
                                    className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm dark:shadow-none shadow-blue-600/10 transition-all duration-200 sm:self-center self-start"
                                >
                                    <span>Admit</span>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
