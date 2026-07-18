import React from 'react';
import { Plus } from 'lucide-react';
import AnimatedFAB from "../ui/AnimatedFAB";


export default function RequestsHeader({ canCreate, openModal }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Resource Requests</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Request and monitor emergency supplies and personnel assistance.
        </p>
      </div>
      {canCreate && (
        <AnimatedFAB onClick={openModal} icon={Plus} label="New Request" />
      )}
    </div>
  );
}
