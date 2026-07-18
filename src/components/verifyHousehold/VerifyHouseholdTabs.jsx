import React from "react";
import { Search, UserPlus } from "lucide-react";

export default function VerifyHouseholdTabs({ tab, setTab }) {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setTab("admit")}
                    className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer flex items-center gap-2 focus:outline-none ${
                        tab === "admit"
                            ? 'border-slate-900 text-slate-900 dark:text-slate-50'
                            : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-300'
                    }`}
                >
                    <Search size={16} />
                    Registry Admission
                </button>
                <button
                    onClick={() => setTab("manual")}
                    className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer flex items-center gap-2 focus:outline-none ${
                        tab === "manual"
                            ? 'border-slate-900 text-slate-900 dark:text-slate-50'
                            : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-300'
                    }`}
                >
                    <UserPlus size={16} />
                    On-Site Registration
                </button>
            </nav>
        </div>
    );
}
