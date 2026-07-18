import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, User, MapPin, Activity, Tag, CheckCircle, Clock, Package, Users, Building, Target } from 'lucide-react';

export default function ViewRequestDetailsModal({ request, onClose, getUrgencyClass, getStatusClass }) {
  if (!request) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-auto flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-slate-50 dark:bg-slate-800/50/50">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
              {request.resource_type}
            </h2>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
              {request.request_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Tag size={12}/> Type</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
                {request.request_type === 'personnel' ? <Users size={14} className="text-blue-500" /> : <Package size={14} className="text-blue-500" />}
                {request.request_type}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Activity size={12}/> Urgency</span>
              <div>
                 <span className={`px-2 py-1 text-[10px] font-black rounded-lg border uppercase ${getUrgencyClass(request.urgency_level?.urgency_key)}`}>
                    {request.urgency_level?.urgency_label || '—'}
                 </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12}/> Status</span>
              <div>
                 <span className={`px-2 py-1 text-[10px] font-black rounded-lg border uppercase ${getStatusClass(request.status?.status_key)}`}>
                    {request.status?.status_label || request.status || '—'}
                 </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Date</span>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {request.created_at ? new Date(request.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Evacuation Center</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{request.center?.name || '—'}</div>
                </div>
                <div className="space-y-1 text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Target size={12}/> Target Agency</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{request.target_agency || '—'}</div>
                </div>
                <div className="space-y-1 text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Building size={12}/> Quantity</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{request.quantity || '—'}</div>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-4">
              {request.description || <span className="italic text-slate-400">No description provided.</span>}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm dark:shadow-none hover:bg-slate-50 dark:bg-slate-800/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
