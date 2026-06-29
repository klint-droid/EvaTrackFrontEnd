import React from 'react';
import { Plus } from 'lucide-react';

export default function ReportsHeader({ canCreate, openCreateModal }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Evacuation Center Issues
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Report and monitor incidents, facility problems, health issues, and safety concerns inside your assigned evacuation center.
        </p>
      </div>

      {canCreate && (
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} />
          Report Issue
        </button>
      )}
    </div>
  );
}
