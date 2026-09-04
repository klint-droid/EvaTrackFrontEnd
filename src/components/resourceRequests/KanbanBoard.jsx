import React, { useState } from 'react';
import { 
  Plus, ArrowRight, ArrowLeft,
  MapPin, Droplet, Utensils, HeartPulse, Home, Box,
  Clock, Sparkles, CheckCircle2, Inbox
} from 'lucide-react';
import JiraActionMenu from '../ui/JiraActionMenu';

const COLUMNS = [
  {
    id: 'pending',
    title: 'Incoming',
    icon: Inbox,
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
    dotBg: 'bg-amber-500'
  },
  {
    id: 'acknowledged',
    title: 'In Progress',
    icon: Sparkles,
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
    dotBg: 'bg-blue-500'
  },
  {
    id: 'approved',
    title: 'In Review',
    icon: Clock,
    color: 'indigo',
    badgeClass: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20',
    dotBg: 'bg-indigo-500'
  },
  {
    id: 'delivered',
    title: 'Done',
    icon: CheckCircle2,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
    dotBg: 'bg-emerald-500'
  },
];

const STATUS_MENU_OPTIONS = [
  { key: 'pending', label: 'Incoming' },
  { key: 'acknowledged', label: 'In Progress' },
  { key: 'approved', label: 'In Review' },
  { key: 'delivered', label: 'Done' },
];

const getResourceTheme = (resourceType = '') => {
  const lower = (resourceType || '').toLowerCase();
  if (lower.includes('water') || lower.includes('drink')) return {
    icon: <Droplet size={12} className="text-sky-500" />,
    tagBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    label: 'Water'
  };
  if (lower.includes('food') || lower.includes('rice') || lower.includes('meal') || lower.includes('canned')) return {
    icon: <Utensils size={12} className="text-amber-500" />,
    tagBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    label: 'Food'
  };
  if (lower.includes('med') || lower.includes('aid') || lower.includes('health') || lower.includes('doctor')) return {
    icon: <HeartPulse size={12} className="text-rose-500" />,
    tagBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    label: 'Medical'
  };
  if (lower.includes('tent') || lower.includes('blanket') || lower.includes('mat') || lower.includes('shelter')) return {
    icon: <Home size={12} className="text-indigo-500" />,
    tagBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    label: 'Shelter'
  };
  return {
    icon: <Box size={12} className="text-slate-400" />,
    tagBg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    label: 'General'
  };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'now';
  const diff = (new Date().getTime() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export default function KanbanBoard({
  requests = [],
  loading = false,
  canUpdateStatus = false,
  canCreate = false,
  openModal,
  handleStatusChange,
  handleDelete,
  getUrgencyClass,
  setViewingRequest
}) {
  const [draggedRequestId, setDraggedRequestId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getNextStatus = (s) => ({ pending: 'acknowledged', acknowledged: 'approved', approved: 'delivered' }[s] || null);
  const getPrevStatus = (s) => ({ delivered: 'approved', approved: 'acknowledged', acknowledged: 'pending' }[s] || null);

  const handleDragStart = (e, requestId) => {
    setDraggedRequestId(requestId);
    e.dataTransfer.setData('text/plain', requestId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const requestId = e.dataTransfer.getData('text/plain') || draggedRequestId;
    setDraggedRequestId(null);
    if (requestId && handleStatusChange) {
      const req = requests.find(r => r.request_id === requestId);
      const current = req?.status?.status_key || req?.status;
      if (current !== targetStatus) await handleStatusChange(requestId, targetStatus);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* 4-equal-column grid — no fixed height, columns grow with content */}
      <div className="grid grid-cols-4 gap-2.5 min-w-[780px]">
        {COLUMNS.map((column) => {
          const colRequests = requests.filter(r => {
            const sk = r.status?.status_key || r.status || 'pending';
            return sk.toLowerCase() === column.id;
          });

          const IconComponent = column.icon;
          const isDropActive = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-xl bg-slate-100/80 dark:bg-[#141b29] border transition-all duration-200 ${
                isDropActive
                  ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                  : 'border-slate-200/80 dark:border-[#1e2a3d]'
              }`}
            >
              {/* ── Column Header ── */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/70 dark:border-[#1e2a3d]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dotBg}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {column.title}
                  </span>
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${column.badgeClass}`}>
                  {colRequests.length}
                </span>
              </div>

              {/* ── Cards List (grows with content, no scroll) ── */}
              <div className="flex-1 p-2 space-y-2">
                {colRequests.length === 0 ? (
                  <div className={`rounded-lg border-2 border-dashed p-4 text-center flex flex-col items-center gap-1.5 ${
                    isDropActive
                      ? 'border-blue-400 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-[#1e2a3d]'
                  }`}>
                    <IconComponent size={20} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {isDropActive ? 'Drop here' : 'No requests'}
                    </p>
                  </div>
                ) : (
                  colRequests.map((req) => {
                    const shortId = (req.request_id?.slice(-6) || req.request_id);
                    const resourceTheme = getResourceTheme(req.resource_type);
                    const nextStatus = getNextStatus(column.id);
                    const prevStatus = getPrevStatus(column.id);
                    const initials = (req.requester?.first_name?.[0] || req.requester?.name?.[0] || 'U').toUpperCase();

                    return (
                      <div
                        key={req.request_id}
                        draggable={canUpdateStatus}
                        onDragStart={(e) => handleDragStart(e, req.request_id)}
                        onClick={() => setViewingRequest(req)}
                        className="group relative bg-white dark:bg-[#1e2a3d] rounded-lg border border-slate-200/80 dark:border-[#263047] p-2.5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer text-left"
                      >
                        {/* Category pill + time + 3-dot action menu */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${resourceTheme.tagBg}`}>
                            {resourceTheme.icon}
                            <span>{resourceTheme.label}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-mono text-slate-400">{formatTimeAgo(req.created_at)}</span>
                            <JiraActionMenu
                              itemId={req.request_id}
                              itemKey={req.request_id}
                              currentStatus={column.id}
                              statusOptions={STATUS_MENU_OPTIONS}
                              onView={() => setViewingRequest(req)}
                              onStatusChange={canUpdateStatus && handleStatusChange ? (newSt) => handleStatusChange(req.request_id, newSt) : undefined}
                              onDelete={handleDelete ? () => handleDelete(req.request_id) : undefined}
                              canDelete={Boolean(handleDelete)}
                              canChangeStatus={canUpdateStatus}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <p className="text-[11px] font-extrabold text-slate-900 dark:text-white capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug truncate mb-1">
                          {req.resource_type || (req.request_type ? `${req.request_type} Request` : 'Supplies')}
                        </p>

                        {/* Quantity + Center row */}
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          {req.quantity ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                              {req.quantity.toLocaleString()} units
                            </span>
                          ) : null}
                          {req.center?.name && (
                            <span className="flex items-center gap-0.5 text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                              <MapPin size={9} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{req.center.name}</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom: ID + avatar + actions */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-[#263047]">
                          <span className="font-mono text-[9px] font-bold text-slate-400">
                            {shortId}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Avatar */}
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0" title={req.requester?.name || 'Officer'}>
                              {initials}
                            </div>

                            {/* Arrow buttons */}
                            {canUpdateStatus && (
                              <>
                                {prevStatus && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(req.request_id, prevStatus)}
                                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                    title={`Back to ${prevStatus}`}
                                  >
                                    <ArrowLeft size={11} />
                                  </button>
                                )}
                                {nextStatus && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(req.request_id, nextStatus)}
                                    className="p-0.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                    title={`Advance to ${nextStatus}`}
                                  >
                                    <ArrowRight size={11} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── + Create ── */}
              {canCreate && (
                <button
                  type="button"
                  onClick={openModal}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1e2a3d] rounded-b-xl transition-colors border-t border-slate-200/70 dark:border-[#1e2a3d]"
                >
                  <Plus size={13} />
                  <span>Create</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
