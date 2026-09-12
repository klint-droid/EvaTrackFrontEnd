import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Component: EvacuationHeader
 *
 * Adheres to Single Responsibility Principle (SRP).
 * Strictly responsible for rendering evacuation center identity,
 * active disaster event badge, and back navigation.
 */
export default function EvacuationHeader({ center, onBack }) {
    if (!center) return null;

    return (
        <div className="flex flex-col gap-0.5 items-start">
            <div className="flex items-center gap-1">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 flex-shrink-0"
                    title="Back to Evacuation Centers"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-none">
                    {center.name}
                </h1>
                <span className={`ml-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                    center.current_event
                        ? "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300"
                        : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>
                    {center.current_event?.name || "No Event Assigned"}
                </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 pl-10 text-left">
                {center.osm_address}
            </p>
        </div>
    );
}
