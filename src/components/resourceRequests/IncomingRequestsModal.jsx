import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Inbox, Search, Clock, MapPin, Package, Users, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function IncomingRequestsModal({ 
  isOpen, 
  onClose, 
  requests = [], 
  onSelectRequest,
  getUrgencyClass,
  getStatusClass
}) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  // Filter pending incoming requests & sort newest to oldest
  const incomingRequests = useMemo(() => {
    return requests
      .filter((req) => {
        const isPending = req.status?.status_key === 'pending' || req.status === 'pending';
        if (!isPending) return false;

        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const resName = String(req.resource_type || '').toLowerCase();
        const centerName = String(req.center?.name || '').toLowerCase();
        const reqId = String(req.request_id || '').toLowerCase();

        return resName.includes(term) || centerName.includes(term) || reqId.includes(term);
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at || a.created_at_time || 0).getTime();
        const timeB = new Date(b.created_at || b.created_at_time || 0).getTime();
        return timeB - timeA; // Newest to Oldest
      });
  }, [requests, searchTerm]);

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm fixed" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto flex flex-col max-h-[85vh] text-left animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Inbox size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Incoming Requests
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                  {incomingRequests.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ordered by most recent request (Newest to Oldest). Click any request to view & update.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incoming request by resource name, center, or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Incoming Requests List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50 dark:bg-slate-950/40">
          {incomingRequests.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Inbox size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                No incoming pending requests found.
              </p>
            </div>
          ) : (
            incomingRequests.map((req) => (
              <div
                key={req.request_id}
                onClick={() => {
                  onSelectRequest(req);
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {req.request_type === 'personnel' ? <Users size={18} /> : <Package size={18} />}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {req.resource_type}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        ({req.quantity} {req.request_type})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        {req.center?.name || 'Unassigned Center'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {formatDateTime(req.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${getUrgencyClass(req.urgency_level?.urgency_key)}`}>
                    {req.urgency_level?.urgency_label || 'Normal'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-amber-500 flex items-center justify-center transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Total Incoming: <strong className="text-slate-800 dark:text-slate-200">{incomingRequests.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close List
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
