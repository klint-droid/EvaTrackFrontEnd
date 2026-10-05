import React from "react";
import { 
    Search, 
    SearchIcon, 
    QrCode, 
    Loader2, 
    AlertCircle, 
    User, 
    Users, 
    MapPin, 
    Home, 
    ArrowRight, 
    X, 
    CheckCircle2, 
    BadgeCheck, 
    Sparkles,
    Calendar,
    Phone
} from "lucide-react";

const getEvacuationProgress = (h) => {
    const currentEvac = h.current_evacuation || h.currentEvacuation;
    const latestEvac = h.latest_evacuation || h.latestEvacuation;
    const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2") && !currentEvac.event?.ended_at && Number(currentEvac.evacuated_count || 0) > 0;
    const isReturned = (!isEvacuated && latestEvac && (latestEvac.household_status_id === 6 || latestEvac.household_status_id === "6")) ||
                       (currentEvac && (currentEvac.household_status_id === 6 || currentEvac.household_status_id === "6"));

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
            label: 'RETURNED HOME',
            badgeClass: 'bg-blue-100/70 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60',
            dotClass: 'bg-blue-500',
            centerName: latestEvac?.center?.name || latestEvac?.center_id,
            isCheckout: true
        };
    }

    if (total === 0) {
        return {
            status: 'empty',
            label: 'NO MEMBERS',
            badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700',
            dotClass: 'bg-slate-400',
            centerName: null
        };
    }

    if (isEvacuated) {
        if (evacuated >= total) {
            return {
                status: 'full',
                label: `EVACUATED (100%)`,
                badgeClass: 'bg-emerald-100/70 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
                dotClass: 'bg-emerald-500',
                centerName: currentEvac.center?.name || currentEvac.center?.center_name || currentEvac.center_id,
                isFull: true
            };
        }
        return {
            status: 'partial',
            label: `PARTIAL (${evacuated}/${total})`,
            badgeClass: 'bg-amber-100/70 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60',
            dotClass: 'bg-amber-500',
            centerName: currentEvac.center?.name || currentEvac.center?.center_name || currentEvac.center_id,
            isFull: false
        };
    }

    return {
        status: 'not_evacuated',
        label: `READY FOR CHECK-IN`,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
        dotClass: 'bg-slate-400',
        centerName: null,
        isFull: false
    };
};

export default function RegistrySearch({
    query,
    setQuery,
    searchType = 'household',
    setSearchType,
    handleSearch,
    setQrModalOpen,
    loading,
    results,
    records,
    getHeadName,
    handleVerify
}) {
    const onSwitchType = (newType) => {
        if (newType === searchType) return;
        if (setSearchType) {
            setSearchType(newType);
        }
        if (query && query.trim().length >= 1) {
            handleSearch(newType, query.trim());
        }
    };

    return (
        <div className="p-6 sm:p-8 space-y-6">
            {/* Jira-Style Header & Segmented Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <Search size={16} className="text-blue-600 dark:text-blue-400" />
                        Registry Query
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Search family units or individual evacuees to initiate center admission
                    </p>
                </div>

                {/* Jira-Style Segmented Switcher */}
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-center">
                    <button
                        type="button"
                        onClick={() => onSwitchType('household')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            searchType === 'household'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <Home size={13} />
                        <span>Households</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSwitchType('member')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            searchType === 'member'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <User size={13} />
                        <span>Members</span>
                    </button>
                </div>
            </div>

            {/* Jira-Style Search Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1 group">
                    <SearchIcon
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none"
                        size={17}
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                        placeholder={
                            searchType === 'household' 
                                ? "Search by household name (e.g. Sacnanas) or ID (HH-0088)..." 
                                : "Search by member's first or last name (e.g. Mary Sacnanas)..."
                        }
                        className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-inner dark:shadow-none"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                            title="Clear query"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setQrModalOpen(true)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                        title="Scan QR Card"
                    >
                        <QrCode size={15} className="text-blue-600 dark:text-blue-400" />
                        <span>Scan QR</span>
                    </button>

                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all duration-150 disabled:opacity-50 flex items-center justify-center min-w-[85px] shadow-sm shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={15} /> : "Search"}
                    </button>
                </div>
            </div>

            {/* Results Counter / Filter Indicator */}
            {results !== undefined && (
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span>
                        Found <strong className="text-slate-800 dark:text-slate-200">{records.length}</strong> {searchType === 'household' ? 'household(s)' : 'family match(es)'} for "{query}"
                    </span>
                    <span className="text-[11px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        Mode: {searchType}
                    </span>
                </div>
            )}

            {/* Search Registry Results Box (Jira Card Style) */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {results === undefined ? (
                    <div className="py-14 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-2">
                        <Search className="text-slate-300 dark:text-slate-600" size={26} />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            Ready to query registry
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Search by {searchType === 'household' ? 'household name/ID' : 'member name'} or scan a digital QR card
                        </p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50/30 dark:bg-rose-950/20">
                        <AlertCircle className="text-rose-500 mx-auto mb-2" size={24} />
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                            No {searchType === 'household' ? 'households' : 'members'} found matching "{query}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            {searchType === 'household' 
                                ? "Try searching by specific member name using the 'Members' tab." 
                                : "Try searching by household name or check the spelling."}
                        </p>
                    </div>
                ) : (
                    records.map((h) => {
                        const currentEvac = h.current_evacuation || h.currentEvacuation;
                        const prog = getEvacuationProgress(h);
                        const isFullyEvacuated = prog.status === 'full' || prog.isFull;
                        const totalMembersCount = Math.max(
                            Number(h.members_count || 0),
                            Number(h.member_count || 0),
                            Number(h.members?.length || 0)
                        );

                        // If member search mode, extract the matching members
                        const matchingMembers = searchType === 'member' && query.trim()
                            ? (h.members || []).filter(m => {
                                const q = query.trim().toLowerCase();
                                const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
                                return fullName.includes(q) || 
                                       (m.first_name && m.first_name.toLowerCase().includes(q)) ||
                                       (m.last_name && m.last_name.toLowerCase().includes(q));
                            })
                            : [];

                        return (
                            <div
                                key={h.household_id}
                                className="group relative p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-150 text-left"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2.5">
                                        {/* Jira Key & Title Header */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Jira Issue Key Style Badge */}
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded text-[11px] font-mono font-bold">
                                                <Home size={11} className="text-blue-500" />
                                                {h.household_id}
                                            </span>

                                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                                {h.household_name}
                                            </h4>

                                            {/* Jira Status Lozenge */}
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${prog.badgeClass}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${prog.dotClass}`} />
                                                {prog.label}
                                            </span>
                                        </div>

                                        {/* Member Mode Highlight (shows matched person) */}
                                        {searchType === 'member' && matchingMembers.length > 0 && (
                                            <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                                                <p className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 tracking-wider flex items-center gap-1">
                                                    <Sparkles size={11} className="text-blue-500" />
                                                    Matched Member(s) in this Household:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchingMembers.map(m => (
                                                        <span 
                                                            key={m.member_id}
                                                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                                                        >
                                                            <User size={12} className="text-blue-600 dark:text-blue-400" />
                                                            <strong>{m.first_name} {m.last_name}</strong>
                                                            {m.relationship?.relationship_label && (
                                                                <span className="text-[10px] text-slate-400 font-normal">
                                                                    ({m.relationship.relationship_label})
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata Chips (Jira Info Bar) */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="inline-flex items-center gap-1.5">
                                                <User size={13} className="text-slate-400" />
                                                <span>Head: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{getHeadName(h)}</strong></span>
                                            </span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <Users size={13} className="text-slate-400" />
                                                <span>{totalMembersCount} Total Members</span>
                                            </span>

                                            {h.contact_number && (
                                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                                                    <Phone size={12} className="text-slate-400" />
                                                    <span>{h.contact_number}</span>
                                                </span>
                                            )}

                                            {prog.centerName && (
                                                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                                    <MapPin size={12} className="text-emerald-500" />
                                                    <span>{prog.isCheckout ? 'Last Center:' : 'Center:'} <strong>{prog.centerName}</strong></span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Jira-Style Action Button */}
                                    <div className="sm:self-center self-start pt-1 sm:pt-0">
                                        <button
                                            type="button"
                                            disabled={isFullyEvacuated}
                                            onClick={() => !isFullyEvacuated && handleVerify(h)}
                                            title={isFullyEvacuated ? "All members of this household are already evacuated (100%)" : "Proceed to admit household"}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                                                isFullyEvacuated
                                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/80 cursor-not-allowed opacity-50 shadow-none"
                                                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow cursor-pointer active:scale-[0.98]"
                                            }`}
                                        >
                                            <span>{isFullyEvacuated ? "Admitted" : "Admit"}</span>
                                            {isFullyEvacuated ? (
                                                <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
                                            ) : (
                                                <ArrowRight size={13} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
