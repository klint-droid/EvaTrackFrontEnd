import React from "react";

export const TableTabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex gap-6 overflow-x-auto no-scrollbar pt-2 px-2">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`pb-3 text-[13px] font-bold transition-all relative whitespace-nowrap ${
                        activeTab === tab.key
                            ? "text-slate-900 dark:text-slate-50"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-300"
                    }`}
                >
                    {tab.label}
                    {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md" />
                    )}
                </button>
            ))}
        </div>
    );
};
