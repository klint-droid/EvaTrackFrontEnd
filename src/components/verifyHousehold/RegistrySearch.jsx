import React from "react";
import { Search, SearchIcon, QrCode, Loader2, AlertCircle, User, Users, MapPin } from "lucide-react";

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
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
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
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setQrModalOpen(true)}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/10"
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
                    <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center space-y-2">
                        <Search className="text-slate-300" size={24} />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting query database sync...</p>
                        <p className="text-[10px] text-slate-400">Type family head credentials above or trigger live scan</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-rose-50/20">
                        <AlertCircle className="text-rose-400 mx-auto mb-2" size={24} />
                        <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">No matching families found in registry.</p>
                    </div>
                ) : (
                    records.map((h) => {
                        const currentEvac = h.current_evacuation || h.currentEvacuation;
                        const isEvacuated = currentEvac && !currentEvac.event?.ended_at && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2");
                        return (
                            <div
                                key={h.household_id}
                                className="p-5 bg-white border border-slate-200 rounded-xl border-l-[5px] border-l-blue-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 text-left"
                            >
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                            {h.household_name}
                                        </h3>
                                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[11px] font-mono font-medium">
                                            {h.household_id}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <User size={14} className="text-slate-400" />
                                            <span>Head: {getHeadName(h)}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users size={14} className="text-slate-400" />
                                            <span>{h.member_count || h.members?.length || 0} Members</span>
                                        </span>
                                    </div>

                                    {/* Evacuation Status Section */}
                                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                                        {isEvacuated ? (
                                            <>
                                                <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-600 font-semibold rounded text-[10px] border border-rose-100 uppercase tracking-wider">
                                                    Evacuated
                                                </span>
                                                <span className="text-slate-500 flex items-center gap-1">
                                                    <MapPin size={12} className="text-rose-500" />
                                                    Evacuated to <strong className="text-slate-700 font-bold">{currentEvac.center?.name || currentEvac.center?.center_name || currentEvac.center_id || 'Unknown Center'}</strong>
                                                    {currentEvac.event?.name && (
                                                        <span className="text-slate-400 font-normal ml-1">
                                                            (Event: {currentEvac.event.name})
                                                        </span>
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-500 font-semibold rounded text-[10px] border border-slate-200 uppercase tracking-wider">
                                                    Not Evacuated
                                                </span>
                                                <span className="text-slate-400">Ready for check-in</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleVerify(h)}
                                    className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-blue-600/10 transition-all duration-200 sm:self-center self-start"
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
