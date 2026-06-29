import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function EventHeader({ setShowModal }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Disaster Events
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage disaster events and evacuation operations
        </p>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200"
      >
        <ShieldAlert className="w-4 h-4" />
        Declare Disaster Event
      </button>
    </div>
  );
}
