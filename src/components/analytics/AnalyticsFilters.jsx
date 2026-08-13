import React from "react";
import { Calendar } from "lucide-react";
import { Select } from "../../ui/Select";
import { Input } from "../../ui/Input";

export default function AnalyticsFilters({
    selectedEventId,
    setSelectedEventId,
    events = [],
    isPersonnel,
    selectedCenterId,
    setSelectedCenterId,
    centers = [],
    assignedCenter,
    startDate,
    setStartDate,
    endDate,
    setEndDate
}) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors text-left">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto">
                {/* Disaster Event Dropdown */}
                <div className="flex flex-col gap-1 min-w-[220px]">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disaster Event</span>
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
                <div className="flex flex-col gap-1 min-w-[220px]">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Evacuation Center</span>
                    {!isPersonnel ? (
                        <Select
                            value={selectedCenterId}
                            onChange={(e) => setSelectedCenterId(e.target.value)}
                            options={[
                                { value: 'all', label: '🏢 All Evacuation Centers' },
                                ...centers.map(center => ({
                                    value: center.evacuation_center_id,
                                    label: center.name
                                }))
                            ]}
                        />
                    ) : (
                        <span className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg inline-block truncate">
                            🏠 {assignedCenter?.name || "Assigned Center"}
                        </span>
                    )}
                </div>
            </div>

            {/* Date Filters Section */}
            <div className="flex flex-row items-end gap-3 w-full lg:w-auto justify-start lg:justify-end">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date</span>
                    <Input
                        type="date"
                        icon={Calendar}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date</span>
                    <Input
                        type="date"
                        icon={Calendar}
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
                        className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors border border-red-100 dark:border-red-900/40 cursor-pointer shrink-0"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}


