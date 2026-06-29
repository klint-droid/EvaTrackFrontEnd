import React from "react";
import { ArrowLeft } from "lucide-react";

export default function HouseholdHeader({ household, isEvacuationContext, isEvacuated, isScattered, handleBack }) {
    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handleBack}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
                <ArrowLeft size={20} className="text-slate-600" />
            </button>

            <div>
                <h1 className="text-2xl font-black text-slate-900">
                    {household.household_name}
                </h1>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {household.household_id}
                </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {isEvacuationContext && (
                    <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border bg-blue-50 text-blue-600 border-blue-100">
                        Evacuation Context
                    </span>
                )}
                <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                    isEvacuated
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                    {isEvacuated ? 'Evacuated' : 'Not Evacuated'}
                </span>
                {isScattered && (
                    <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border bg-amber-50 text-amber-600 border-amber-100">
                        Scattered
                    </span>
                )}
            </div>
        </div>
    );
}
