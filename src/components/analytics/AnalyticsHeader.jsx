import React from "react";
import { RefreshCw, Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";

export default function AnalyticsHeader({
    isPersonnel,
    assignedCenter,
    exportDropdown,
    setExportDropdown,
    exporting,
    loading,
    refreshing,
    handleExport,
    exportRef,
    handleRefresh
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                    Reports & Analytics
                </h1>
                <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {isPersonnel && assignedCenter
                        ? `Real-time demographic tracking, evacuation trends, and utilization metrics for ${assignedCenter.name || "your assigned center"}.`
                        : 'Real-time demographic tracking, evacuation intake trends, and center utilization indices across all locations.'
                    }
                </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setExportDropdown(prev => !prev)}
                        disabled={exporting || loading}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {exporting ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : (
                            <Download size={14} />
                        )}
                        {exporting ? "Exporting..." : "Export Reports"}
                        <ChevronDown size={14} />
                    </button>

                    {exportDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Report to Export</p>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {[
                                    { key: "dromic", label: "DROMIC Master List", desc: "DSWD compliant evacuee profiling list", formats: ["csv", "pdf"] },
                                    { key: "demographics", label: "Demographic Summary", desc: "Aggregated stats, age groups, gender details", formats: ["csv", "pdf"] },
                                    { key: "utilization", label: "Center Utilization & Capacity", desc: "Occupancy rates, available slots per center", formats: ["csv", "pdf"] },
                                    { key: "vulnerable", label: "Vulnerable Groups Care List", desc: "Targeted lists of PWDs, pregnant, seniors", formats: ["csv", "pdf"] },
                                    { key: "resources", label: "Resource Requests Report", desc: "Logistic request status and urgency audits", formats: ["csv", "pdf"] },
                                    { key: "issues", label: "Center Issues Log", desc: "Facility issues tracking and severity levels", formats: ["csv", "pdf"] },
                                    { key: "daily-intake", label: "Daily Intake Trends", desc: "Tabular curve of daily evacuee intake", formats: ["csv"] }
                                ].map((report) => (
                                    <div key={report.key} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{report.label}</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{report.desc}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {report.formats.includes("csv") && (
                                                <button
                                                    onClick={() => handleExport(report.key, "csv")}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-md transition-all cursor-pointer"
                                                >
                                                    <FileSpreadsheet size={12} className="text-emerald-600" />
                                                    CSV
                                                </button>
                                            )}
                                            {report.formats.includes("pdf") && (
                                                <button
                                                    onClick={() => handleExport(report.key, "pdf")}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-md transition-all cursor-pointer"
                                                >
                                                    <FileText size={12} className="text-rose-600" />
                                                    PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                    title="Force refresh"
                >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    Refresh Metrics
                </button>
            </div>
        </div>
    );
}

