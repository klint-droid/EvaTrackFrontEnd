import React from 'react';

/**
 * Component: EvacuationStats
 *
 * Adheres to Single Responsibility Principle (SRP).
 * Strictly responsible for displaying capacity, unit counts, and occupancy numbers.
 */
export default function EvacuationStats({ center, units = [], evacuatedHouseholds = [] }) {
    if (!center) return null;

    const unitsOccupancy = units.reduce(
        (sum, u) => sum + (parseInt(u.current_occupancy, 10) || 0),
        0
    );

    const householdsOccupancy = evacuatedHouseholds.reduce(
        (sum, record) => sum + (parseInt(record.evacuated_count ?? record.household?.member_count, 10) || 0),
        0
    );

    const centerOccupancy = parseInt(center.current_occupancy, 10) || 0;
    const totalOccupancy = Math.max(householdsOccupancy, centerOccupancy, unitsOccupancy);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                    Total Capacity
                </p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {center.capacity}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                    Total Units
                </p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {units.length}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 col-span-2 md:col-span-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">
                    Occupied Slots
                </p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {totalOccupancy}
                </p>
            </div>
        </div>
    );
}
