import React from "react";

export const StatCard = ({ title, value, dotColor }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }}></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize tracking-wider truncate">{title}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
                {value}
            </div>
        </div>
    );
};
