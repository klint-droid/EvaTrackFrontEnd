import React from "react";

export default function AnalyticsFilters({
    selectedEventId,
    setSelectedEventId,
    events,
    isPersonnel,
    selectedCenterId,
    setSelectedCenterId,
    centers,
    assignedCenter,
    startDate,
    setStartDate,
    endDate,
    setEndDate
}) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                {/* Disaster Event Dropdown */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disaster Event</span>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100/50 transition-colors"
                    >
                        <option value="all">🌐 All Disaster Events</option>
                        {events.map(event => (
                            <option key={event.event_id} value={event.event_id}>
                                🚨 {event.name} ({event.type})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Center Dropdown (Admin Only) */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evacuation Center</span>
                    {!isPersonnel ? (
                        <select
                            value={selectedCenterId}
                            onChange={(e) => setSelectedCenterId(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100/50 transition-colors min-w-[200px]"
                        >
                            <option value="all">🏢 All Evacuation Centers</option>
                            {centers.map(center => (
                                <option key={center.evacuation_center_id} value={center.evacuation_center_id}>
                                    {center.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span className="px-3 py-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black rounded-xl inline-block max-w-[250px] truncate">
                            🏠 {assignedCenter?.name || "Assigned Center"}
                        </span>
                    )}
                </div>
            </div>

            {/* Date Filters Section */}
            <div className="flex flex-row gap-4 items-center w-full lg:w-auto justify-start lg:justify-end">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">From Date</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:bg-slate-100/50 transition-colors"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">To Date</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:bg-slate-100/50 transition-colors"
                    />
                </div>
                {(startDate || endDate || (selectedCenterId !== "all" && !isPersonnel)) && (
                    <button
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            if (!isPersonnel) setSelectedCenterId("all");
                        }}
                        className="mt-5 text-xs text-red-500 hover:text-red-700 font-black uppercase tracking-widest transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
