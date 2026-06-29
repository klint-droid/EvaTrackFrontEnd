import React from 'react';
import { Plus } from 'lucide-react';

export default function RequestsHeader({ canCreate, openModal }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Requests</h1>
        <p className="text-sm text-slate-500 font-medium">
          Request and monitor emergency supplies and personnel assistance.
        </p>
      </div>
      {canCreate && (
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> New Request
        </button>
      )}
    </div>
  );
}
