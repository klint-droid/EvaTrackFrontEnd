import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ReportsSummaryCards({ openCount, inProgressCount, resolvedCount, criticalCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
          <AlertTriangle size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open</p>
          <p className="text-2xl font-black text-slate-900">{openCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Clock size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Progress</p>
          <p className="text-2xl font-black text-slate-900">{inProgressCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
          <CheckCircle2 size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolved</p>
          <p className="text-2xl font-black text-slate-900">{resolvedCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
          <ShieldAlert size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical</p>
          <p className="text-2xl font-black text-slate-900">{criticalCount}</p>
        </div>
      </div>
    </div>
  );
}
