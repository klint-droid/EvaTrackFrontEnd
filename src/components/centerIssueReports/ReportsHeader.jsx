import React from 'react';
import { Plus } from 'lucide-react';
import AnimatedFAB from "../ui/AnimatedFAB";


export default function ReportsHeader({ canCreate, openCreateModal }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Evacuation Center Issues
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Report and monitor incidents, facility problems, health issues, and safety concerns inside your assigned evacuation center.
        </p>
      </div>

      {canCreate && (
        <AnimatedFAB onClick={openCreateModal} icon={Plus} label="Report Issue" />
      )}
    </div>
  );
}
