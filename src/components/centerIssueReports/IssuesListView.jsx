import React from 'react';
import { 
  Wrench, HeartPulse, Shield, AlertTriangle, FileWarning,
  MapPin, Clock, Paperclip, ChevronRight 
} from 'lucide-react';

const getCategoryIcon = (category = '') => {
  switch (category) {
    case 'facility_issue': return <Wrench size={13} className="text-blue-500" />;
    case 'health_issue':   return <HeartPulse size={13} className="text-emerald-500" />;
    case 'safety_issue':   return <Shield size={13} className="text-orange-500" />;
    case 'incident':       return <FileWarning size={13} className="text-rose-500" />;
    default:               return <AlertTriangle size={13} className="text-amber-500" />;
  }
};

const getCategoryLabel = (category = '') => {
  switch (category) {
    case 'facility_issue': return 'Facility';
    case 'health_issue':   return 'Health';
    case 'safety_issue':   return 'Safety';
    case 'incident':       return 'Incident';
    default:               return 'Other';
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '—';
  const diff = (new Date().getTime() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

import JiraActionMenu from '../ui/JiraActionMenu';

const STATUS_MENU_OPTIONS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export default function IssuesListView({
  reports = [],
  loading = false,
  canUpdateStatus = false,
  handleStatusChange,
  handleDelete,
  getSeverityClass,
  getStatusClass,
  setViewingReport
}) {
  // Sort newest first
  const sortedReports = [...reports].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-bold text-slate-400">Loading issue reports...</p>
      </div>
    );
  }

  if (sortedReports.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <AlertTriangle size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No issue reports found</h3>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      
      {/* Table Header Row */}
      <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-wider text-slate-400">
        <div className="col-span-2">Key</div>
        <div className="col-span-5">Summary & Category</div>
        <div className="col-span-2">Center</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Updated</div>
        <div className="col-span-1 text-right">Reporter</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {sortedReports.map((report) => {
          const statusKey = typeof report.status === 'object' ? report.status?.status_key : report.status || 'open';
          const reporterName = report.reporter?.name || report.reported_by_user?.name || report.reporter?.first_name || 'Officer';
          const initials = (report.reporter?.first_name?.[0] || report.reporter?.name?.[0] || reporterName?.[0] || 'U').toUpperCase();

          return (
            <div
              key={report.report_id}
              onClick={() => setViewingReport(report)}
              className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer group text-left"
            >
              {/* Ticket ID */}
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                  {report.report_id}
                </span>
              </div>

              {/* Title & Category */}
              <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {getCategoryIcon(report.category)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {report.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 capitalize">
                      {getCategoryLabel(report.category)}
                    </span>
                    {report.attachment_url && (
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                        <Paperclip size={9} />
                        <span>Attachment</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Evacuation Center */}
              <div className="col-span-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{report.center?.name || '—'}</span>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wider ${getStatusClass(statusKey)}`}>
                  {statusKey?.replace('_', ' ')}
                </span>
              </div>

              {/* Updated Time */}
              <div className="col-span-1 text-xs text-slate-400 font-medium">
                {formatTimeAgo(report.created_at)}
              </div>

              {/* Reporter Profile & Actions */}
              <div className="col-span-1 flex items-center justify-end gap-1.5">
                <div 
                  className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs flex-shrink-0"
                  title={`Reported by: ${reporterName}`}
                >
                  {initials}
                </div>
                <JiraActionMenu
                  itemId={report.report_id}
                  itemKey={report.report_id}
                  currentStatus={statusKey}
                  statusOptions={STATUS_MENU_OPTIONS}
                  onView={() => setViewingReport(report)}
                  onStatusChange={canUpdateStatus && handleStatusChange ? (newSt) => handleStatusChange(report.report_id, newSt) : undefined}
                  onDelete={handleDelete ? () => handleDelete(report.report_id) : undefined}
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
