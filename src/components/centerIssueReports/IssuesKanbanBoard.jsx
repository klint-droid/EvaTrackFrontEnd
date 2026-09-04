import React, { useState } from 'react';
import { 
  Plus, ArrowRight, ArrowLeft,
  MapPin, Wrench, HeartPulse, Shield, AlertTriangle, FileWarning,
  Clock, Sparkles, CheckCircle2, ShieldCheck, Paperclip
} from 'lucide-react';
import JiraActionMenu from '../ui/JiraActionMenu';

const COLUMNS = [
  {
    id: 'open',
    title: 'Open',
    icon: AlertTriangle,
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
    dotBg: 'bg-amber-500'
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: Sparkles,
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
    dotBg: 'bg-blue-500'
  },
  {
    id: 'resolved',
    title: 'Resolved',
    icon: CheckCircle2,
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
    dotBg: 'bg-emerald-500'
  },
  {
    id: 'closed',
    title: 'Closed',
    icon: ShieldCheck,
    color: 'slate',
    badgeClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
    dotBg: 'bg-slate-500'
  },
];

const STATUS_MENU_OPTIONS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const getCategoryTheme = (category = '') => {
  switch (category) {
    case 'facility_issue':
      return {
        icon: <Wrench size={12} className="text-blue-500" />,
        tagBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
        label: 'Facility'
      };
    case 'health_issue':
      return {
        icon: <HeartPulse size={12} className="text-emerald-500" />,
        tagBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
        label: 'Health'
      };
    case 'safety_issue':
      return {
        icon: <Shield size={12} className="text-orange-500" />,
        tagBg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
        label: 'Safety'
      };
    case 'incident':
      return {
        icon: <FileWarning size={12} className="text-rose-500" />,
        tagBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        label: 'Incident'
      };
    default:
      return {
        icon: <AlertTriangle size={12} className="text-amber-500" />,
        tagBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        label: 'Other'
      };
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'now';
  const diff = (new Date().getTime() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export default function IssuesKanbanBoard({
  reports = [],
  loading = false,
  canUpdateStatus = false,
  canCreate = false,
  openCreateModal,
  handleStatusChange,
  handleDelete,
  getSeverityClass,
  setViewingReport
}) {
  const [draggedReportId, setDraggedReportId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getNextStatus = (s) => ({
    open: 'in_progress',
    in_progress: 'resolved',
    resolved: 'closed'
  }[s] || null);

  const getPrevStatus = (s) => ({
    closed: 'resolved',
    resolved: 'in_progress',
    in_progress: 'open'
  }[s] || null);

  const handleDragStart = (e, reportId) => {
    setDraggedReportId(reportId);
    e.dataTransfer.setData('text/plain', reportId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const reportId = e.dataTransfer.getData('text/plain') || draggedReportId;
    setDraggedReportId(null);
    if (reportId && handleStatusChange) {
      const rep = reports.find(r => r.report_id === reportId);
      const current = typeof rep?.status === 'object' ? rep?.status?.status_key : rep?.status;
      if (current !== targetStatus) await handleStatusChange(reportId, targetStatus);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* 4-equal-column grid — auto-height columns, all fit on screen */}
      <div className="grid grid-cols-4 gap-2.5 min-w-[780px]">
        {COLUMNS.map((column) => {
          const colReports = reports.filter(r => {
            const sk = typeof r.status === 'object' ? r.status?.status_key : r.status || 'open';
            return sk?.toLowerCase() === column.id;
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
                  {colReports.length}
                </span>
              </div>

              {/* ── Cards List (grows with content) ── */}
              <div className="flex-1 p-2 space-y-2">
                {colReports.length === 0 ? (
                  <div className={`rounded-lg border-2 border-dashed p-4 text-center flex flex-col items-center gap-1.5 ${
                    isDropActive
                      ? 'border-blue-400 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-[#1e2a3d]'
                  }`}>
                    <IconComponent size={20} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {isDropActive ? 'Drop here' : 'No issues'}
                    </p>
                  </div>
                ) : (
                  colReports.map((report) => {
                    const shortId = report.report_id?.slice(-8) || report.report_id;
                    const catTheme = getCategoryTheme(report.category);
                    const nextStatus = getNextStatus(column.id);
                    const prevStatus = getPrevStatus(column.id);
                    const reporterName = report.reporter?.name || report.reported_by_user?.name || report.reporter?.first_name || 'Officer';
                    const initials = (report.reporter?.first_name?.[0] || report.reporter?.name?.[0] || reporterName?.[0] || 'U').toUpperCase();

                    return (
                      <div
                        key={report.report_id}
                        draggable={canUpdateStatus}
                        onDragStart={(e) => handleDragStart(e, report.report_id)}
                        onClick={() => setViewingReport(report)}
                        className="group relative bg-white dark:bg-[#1e2a3d] rounded-lg border border-slate-200/80 dark:border-[#263047] p-2.5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer text-left"
                      >
                        {/* Category pill + time + 3-dot action menu */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${catTheme.tagBg}`}>
                            {catTheme.icon}
                            <span>{catTheme.label}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            {report.attachment_url && (
                              <Paperclip size={10} className="text-slate-400" />
                            )}
                            <span className="text-[9px] font-mono text-slate-400">{formatTimeAgo(report.created_at)}</span>
                            <JiraActionMenu
                              itemId={report.report_id}
                              itemKey={report.report_id}
                              currentStatus={column.id}
                              statusOptions={STATUS_MENU_OPTIONS}
                              onView={() => setViewingReport(report)}
                              onStatusChange={canUpdateStatus && handleStatusChange ? (newSt) => handleStatusChange(report.report_id, newSt) : undefined}
                              onDelete={handleDelete ? () => handleDelete(report.report_id) : undefined}
                              canDelete={Boolean(handleDelete)}
                              canChangeStatus={canUpdateStatus}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <p className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-snug truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {report.title}
                        </p>

                        {/* Image Thumbnail (if photo attached) */}
                        {report.attachment_url && report.attachment_url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
                          <div className="mb-1.5 rounded-md overflow-hidden h-20 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                            <img 
                              src={report.attachment_url} 
                              alt="Issue photo" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                            />
                          </div>
                        )}

                        {/* Evacuation Center */}
                        {report.center?.name && (
                          <div className="flex items-center gap-0.5 text-[9px] text-slate-500 dark:text-slate-400 truncate mb-2">
                            <MapPin size={9} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{report.center.name}</span>
                          </div>
                        )}

                        {/* Bottom: ID + Reporter + Advance Controls */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-[#263047]">
                          <span className="font-mono text-[9px] font-bold text-slate-400">
                            {shortId}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Avatar */}
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0" title={`Reported by: ${reporterName}`}>
                              {initials}
                            </div>

                            {/* Move Controls */}
                            {canUpdateStatus && (
                              <>
                                {prevStatus && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(report.report_id, prevStatus)}
                                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                    title={`Back to ${prevStatus}`}
                                  >
                                    <ArrowLeft size={11} />
                                  </button>
                                )}
                                {nextStatus && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(report.report_id, nextStatus)}
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
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:white hover:bg-slate-200/60 dark:hover:bg-[#1e2a3d] rounded-b-xl transition-colors border-t border-slate-200/70 dark:border-[#1e2a3d]"
                >
                  <Plus size={13} />
                  <span>Report Issue</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
