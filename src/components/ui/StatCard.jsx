import React from "react";

export const StatCard = ({ title, value, dotColor }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all shadow-xs min-w-0">
            <div className="flex items-center gap-2 mb-1 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }}></div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate" title={title}>{title}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                {value}
            </div>
        </div>
    );
};
