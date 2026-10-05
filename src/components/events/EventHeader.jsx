import React from 'react';
import { ShieldAlert, Plus, Radio } from 'lucide-react';

export default function EventHeader({ setShowModal }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
          <span>Operations Command</span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400">City-Wide Scope</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Disaster Events & Response
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
          Coordinate city-wide disaster declarations, real-time facility mobilization, and post-incident logs
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 hover:shadow-rose-600/30 transition-all cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>Declare Disaster Event</span>
        </button>
      </div>
    </div>
  );
}
