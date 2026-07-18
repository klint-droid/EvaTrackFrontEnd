import React from "react";

export const TableLayout = ({ title, actions, stats, tabs, children, pagination }) => {
    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>

            {/* Stats Section */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {stats}
                </div>
            )}

            {/* Main Table Container */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden flex flex-col transition-colors">
                
                {/* Tabs Section */}
                {tabs && (
                    <div className="px-4 border-b border-slate-200 dark:border-slate-800">
                        {tabs}
                    </div>
                )}

                {/* Table Content */}
                <div className="flex-1 overflow-x-auto">
                    {children}
                </div>

                {/* Pagination Section */}
                {pagination && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800">
                        {pagination}
                    </div>
                )}
            </div>
        </div>
    );
};
