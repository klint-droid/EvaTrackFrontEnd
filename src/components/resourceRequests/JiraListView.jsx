import React from 'react';
import { 
  Package, MapPin, Clock, ArrowRight, User, CheckCircle2, 
  AlertTriangle, Droplet, Utensils, HeartPulse, Home, Box,
  CheckSquare, Tag, ChevronRight, Inbox, Sparkles
} from 'lucide-react';

const getResourceTheme = (resourceType = '') => {
  const lower = resourceType.toLowerCase();
  if (lower.includes('water') || lower.includes('drink')) {
    return {
      icon: <Droplet size={16} className="text-sky-500" />,
      tagBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
      label: 'Water'
    };
  }
  if (lower.includes('food') || lower.includes('rice') || lower.includes('meal') || lower.includes('canned')) {
    return {
      icon: <Utensils size={16} className="text-amber-500" />,
      tagBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      label: 'Food'
    };
  }
  if (lower.includes('med') || lower.includes('aid') || lower.includes('health') || lower.includes('doctor')) {
    return {
      icon: <HeartPulse size={16} className="text-rose-500" />,
      tagBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      label: 'Medical'
    };
  }
  if (lower.includes('tent') || lower.includes('blanket') || lower.includes('mat') || lower.includes('shelter')) {
    return {
      icon: <Home size={16} className="text-indigo-500" />,
      tagBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      label: 'Shelter'
    };
  }
  return {
    icon: <Box size={16} className="text-slate-400" />,
    tagBg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    label: 'Logistics'
  };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const diff = (new Date().getTime() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

import JiraActionMenu from '../ui/JiraActionMenu';

const STATUS_MENU_OPTIONS = [
  { key: 'pending', label: 'Incoming' },
  { key: 'acknowledged', label: 'In Progress' },
  { key: 'approved', label: 'In Review' },
  { key: 'delivered', label: 'Done' },
];

export default function JiraListView({
  requests = [],
  loading = false,
  canUpdateStatus = false,
  handleStatusChange,
  handleDelete,
  getUrgencyClass,
  getStatusClass,
  setViewingRequest
}) {
  // Sort by newest request first (created_at descending)
  const sortedRequests = [...requests].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  if (loading && sortedRequests.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-3" />
        <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
      </div>
    );
  }

  if (sortedRequests.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Inbox size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3 animate-bounce" />
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">No resource requests found</h3>
        <p className="text-xs text-slate-400 mt-1">Submit a new request to see it listed here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      
      {/* List Header */}
      <div className="grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 select-none bg-slate-50/70 dark:bg-slate-800/40">
        <div className="col-span-2 flex items-center gap-2">
          <span>Ticket</span>
        </div>
        <div className="col-span-4">
          <span>Resource Supply Item</span>
        </div>
        <div className="col-span-3">
          <span>Evacuation Center</span>
        </div>
        <div className="col-span-1 text-center">
          <span>Status</span>
        </div>
        <div className="col-span-2 text-right">
          <span>Requested</span>
        </div>
      </div>

      {/* List Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {sortedRequests.map((req) => {
          const statusKey = req.status?.status_key || req.status || 'pending';
          const shortId = req.request_id?.slice(-8) || req.request_id;
          const resourceTheme = getResourceTheme(req.resource_type);
          const initials = (req.requester?.first_name?.[0] || req.requester?.name?.[0] || 'U').toUpperCase();

          return (
            <div
              key={req.request_id}
              onClick={() => setViewingRequest(req)}
              className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group text-left"
            >
              {/* Ticket ID */}
              <div className="col-span-2 flex items-center gap-2">
                <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {shortId}
                </span>
              </div>

              {/* Resource Summary & Quantity */}
              <div className="col-span-4 flex items-center gap-3 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                  {resourceTheme.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize">
                    {req.resource_type || (req.request_type ? `${req.request_type} Request` : 'Supplies')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                    {req.quantity ? (
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">{req.quantity.toLocaleString()} units</span>
                    ) : null}
                    {req.description && (
                      <>
                        <span>•</span>
                        <span className="truncate">{req.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Evacuation Center */}
              <div className="col-span-3 flex items-center gap-1.5 min-w-0 text-xs text-slate-700 dark:text-slate-300">
                <MapPin size={13} className="text-blue-500 flex-shrink-0" />
                <span className="truncate font-semibold">{req.center?.name || 'Unspecified Center'}</span>
              </div>

              {/* Status Badge */}
              <div className="col-span-1 flex justify-center">
                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusClass(statusKey)}`}>
                  {statusKey.toUpperCase()}
                </span>
              </div>

              {/* Requester & Created Time & Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400">
                  {formatTimeAgo(req.created_at)}
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-xs" title={`Requested by: ${req.requester?.name || 'Officer'}`}>
                  {initials}
                </div>
                <JiraActionMenu
                  itemId={req.request_id}
                  itemKey={req.request_id}
                  currentStatus={statusKey}
                  statusOptions={STATUS_MENU_OPTIONS}
                  onView={() => setViewingRequest(req)}
                  onStatusChange={canUpdateStatus && handleStatusChange ? (newSt) => handleStatusChange(req.request_id, newSt) : undefined}
                  onDelete={handleDelete ? () => handleDelete(req.request_id) : undefined}
                  canDelete={Boolean(handleDelete)}
                  canChangeStatus={canUpdateStatus}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
