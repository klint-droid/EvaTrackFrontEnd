import React from 'react';
import { ShieldAlert } from 'lucide-react';
import AnimatedFAB from "../ui/AnimatedFAB";
import { Plus } from "lucide-react";


export default function EventHeader({ setShowModal }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Disaster Events
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Manage disaster events and evacuation operations
        </p>
      </div>
      <AnimatedFAB onClick={() => setShowModal(true)} icon={ShieldAlert} label="Declare Disaster Event" />
    </div>
  );
}
