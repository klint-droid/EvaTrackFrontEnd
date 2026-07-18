import React from "react";
import { Select } from "../../ui/Select";
import { Input } from "../../ui/Input";

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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                {/* Disaster Event Dropdown */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disaster Event</span>
                    <Select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        options={[
                            { value: 'all', label: '🌐 All Disaster Events' },
                            ...events.map(event => ({
                                value: event.event_id,
                                label: `🚨 ${event.name} (${event.type})`
                            }))
                        ]}
                    />
                </div>

                {/* Center Dropdown (Admin Only) */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evacuation Center</span>
                    {!isPersonnel ? (
                        <div className="min-w-[200px]"><Select
                            value={selectedCenterId}
                            onChange={(e) => setSelectedCenterId(e.target.value)}
                            options={[
                                { value: 'all', label: '🏢 All Evacuation Centers' },
                                ...centers.map(center => ({
                                    value: center.evacuation_center_id,
                                    label: center.name
                                }))
                            ]}
                        /></div>
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
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">To Date</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
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
