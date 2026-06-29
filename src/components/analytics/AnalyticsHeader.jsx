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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Analytics Command Center
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                    {isPersonnel && assignedCenter
                        ? `Real-time demographic tracking, evacuation trends, and utilization metrics for ${assignedCenter.name || "your assigned center"}.`
                        : 'Real-time demographic tracking, evacuation intake trends, and center utilization indices across all locations.'
                    }
                </p>
            </div>

            <div className="flex items-center gap-2">
                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setExportDropdown(prev => !prev)}
                        disabled={exporting || loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black active:scale-95 transition-all shadow-md shadow-blue-600/10 disabled:opacity-50 cursor-pointer"
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
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Report to Export</p>
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
                                    <div key={report.key} className="p-3.5 hover:bg-slate-50/50 transition-colors flex flex-col gap-2">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800">{report.label}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium">{report.desc}</p>
                                        </div>
                                        <div className="flex gap-2.5">
                                            {report.formats.includes("csv") && (
                                                <button
                                                    onClick={() => handleExport(report.key, "csv")}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                                                >
                                                    <FileSpreadsheet size={12} className="text-emerald-500" />
                                                    CSV
                                                </button>
                                            )}
                                            {report.formats.includes("pdf") && (
                                                <button
                                                    onClick={() => handleExport(report.key, "pdf")}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                                                >
                                                    <FileText size={12} className="text-red-500" />
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
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
                    title="Force refresh"
                >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    Refresh Metrics
                </button>
            </div>
        </div>
    );
}
