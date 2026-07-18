import React from "react";
import { Search, Download } from "lucide-react";

export default function UserFilters({ search, setSearch, fetchUsers, roleFilter }) {
    return (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="relative flex-1 group">
                <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={16}
                />
                <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") fetchUsers(1, search, roleFilter);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm whitespace-nowrap">
                <Download size={16} /> Export
            </button>
        </div>
    );
}
