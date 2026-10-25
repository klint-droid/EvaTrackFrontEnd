import React from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { Select } from "../../ui/Select";
import { Input } from "../../ui/Input";

export const getPresetDates = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return {
        startDate: format(start),
        endDate: format(end),
    };
};

export default function AnalyticsFilters({
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
    const default7Days = getPresetDates(7);
    const preset30Days = getPresetDates(30);

    const is7DaysActive = startDate === default7Days.startDate && endDate === default7Days.endDate;
    const is30DaysActive = startDate === preset30Days.startDate && endDate === preset30Days.endDate;
    const isAllTimeActive = !startDate && !endDate;

    const hasNonDefaultFilter = Boolean(
        !is7DaysActive || (!isPersonnel && selectedCenterId !== "all")
    );

    const handleApplyPreset = (days) => {
        if (days === 0) {
            setStartDate("");
            setEndDate("");
        } else {
            const preset = getPresetDates(days);
            setStartDate(preset.startDate);
            setEndDate(preset.endDate);
        }
    };

    const handleResetToDefault = () => {
        const d = getPresetDates(7);
        setStartDate(d.startDate);
        setEndDate(d.endDate);
        if (!isPersonnel) {
            setSelectedCenterId("all");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors text-left">
            {/* Evacuation Center Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex flex-col gap-1 min-w-[240px]">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Evacuation Center
                    </span>
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

            {/* Time Presets & Date Pickers */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full lg:w-auto justify-start lg:justify-end flex-wrap">
                {/* Quick Preset Buttons */}
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date Window
                    </span>
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <button
                            type="button"
                            onClick={() => handleApplyPreset(7)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                is7DaysActive 
                                    ? "bg-blue-600 text-white shadow-xs" 
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyPreset(30)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                is30DaysActive 
                                    ? "bg-blue-600 text-white shadow-xs" 
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            30 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyPreset(0)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                isAllTimeActive 
                                    ? "bg-blue-600 text-white shadow-xs" 
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            All Time
                        </button>
                    </div>
                </div>

                {/* From Date Picker */}
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        From Date
                    </span>
                    <Input
                        type="date"
                        icon={Calendar}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                {/* To Date Picker */}
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        To Date
                    </span>
                    <Input
                        type="date"
                        icon={Calendar}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                {/* Reset to 7 Days Button */}
                {hasNonDefaultFilter && (
                    <button
                        type="button"
                        onClick={handleResetToDefault}
                        title="Reset to default 7-day view"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/50 cursor-pointer shrink-0"
                    >
                        <RotateCcw size={13} />
                        <span>Reset (7 Days)</span>
                    </button>
                )}
            </div>
        </div>
    );
}
