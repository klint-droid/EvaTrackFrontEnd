import React from 'react';
import { Clock, Truck, CheckCircle2 } from 'lucide-react';

export default function RequestsSummaryCards({ pendingCount, acknowledgedCount, deliveredCount, loading, requests }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
          <Clock size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Requests</p>
          {loading && !requests.length ? (
            <div className="h-8 bg-slate-200 animate-pulse rounded w-12 mt-1"></div>
          ) : (
            <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Truck size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acknowledged</p>
          {loading && !requests.length ? (
            <div className="h-8 bg-slate-200 animate-pulse rounded w-12 mt-1"></div>
          ) : (
            <p className="text-2xl font-black text-slate-900">{acknowledgedCount}</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
          <CheckCircle2 size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivered 24h</p>
          {loading && !requests.length ? (
            <div className="h-8 bg-slate-200 animate-pulse rounded w-12 mt-1"></div>
          ) : (
            <p className="text-2xl font-black text-slate-900">{deliveredCount}</p>
          )}
        </div>
      </div>
    </div>
  );
}
