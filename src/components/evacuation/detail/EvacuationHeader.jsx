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
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 pl-10 text-left">
                {center.osm_address}
            </p>
        </div>
    );
}
