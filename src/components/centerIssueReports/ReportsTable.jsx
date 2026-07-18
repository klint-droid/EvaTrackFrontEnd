import React from 'react';
import { AlertTriangle, Search, Filter, Edit3, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../ui/Table';

const CATEGORY_OPTIONS = [
  { value: 'incident', label: 'Incident' },
  { value: 'facility_issue', label: 'Facility Issue' },
  { value: 'health_issue', label: 'Health Issue' },
  { value: 'safety_issue', label: 'Safety Issue' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

const RowSkeleton = () => (
  <TableRow className="animate-pulse">
    <TableCell>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-28" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16" />
        </div>
      </div>
    </TableCell>
    <TableCell><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-20" /></TableCell>
    <TableCell><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-16" /></TableCell>
    <TableCell><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-24" /></TableCell>
    <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-24" /></TableCell>
    <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-20" /></TableCell>
    <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-28" /></TableCell>
    <TableCell className="text-right"><div className="h-5 bg-slate-200 rounded w-16 ml-auto" /></TableCell>
  </TableRow>
);

export default function ReportsTable({
  search, setSearch, fetchReports,
  statusFilter, setStatusFilter,
  showFilters, setShowFilters,
  categoryFilter, setCategoryFilter,
  severityFilter, setSeverityFilter,
  selectedEventId, setSelectedEventId,
  activeEvents,
  loading, displayedReports,
  getCategoryIcon, getCategoryLabel,
  getSeverityClass, getStatusClass,
  canUpdateStatus, handleStatusChange,
  formatDateTime, canModifyReport,
  openEditModal, handleDelete, setViewingReport
}) {
  return (
    <>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <AlertTriangle size={17} className="text-blue-500" />
            Evacuation Center Issue Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submitted reports are tracked by center and severity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64 group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchReports();
              }}
              placeholder="Search issue..."
              inputClassName="pl-10"
            />
          </div>

          <div className="flex gap-2 relative">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    (categoryFilter || severityFilter || selectedEventId !== "all") || showFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:bg-slate-800/50'
                }`}
            >
                <Filter size={16} />
                <span className="hidden sm:inline">More Filters</span>
                {(categoryFilter || severityFilter || selectedEventId !== "all") && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">
                        {(categoryFilter ? 1 : 0) + (severityFilter ? 1 : 0) + (selectedEventId !== "all" ? 1 : 0)}
                    </span>
                )}
            </button>

            {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Advanced Filters</h3>
                        {(categoryFilter || severityFilter || selectedEventId !== "all") && (
                            <button 
                                onClick={() => {
                                    setCategoryFilter('');
                                    setSeverityFilter('');
                                    setSelectedEventId('all');
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Categories' },
                                    ...CATEGORY_OPTIONS
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Severity</label>
                            <Select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Severity' },
                                    ...SEVERITY_OPTIONS.map(item => ({ value: item, label: item }))
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Event</label>
                            <Select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Active Events' },
                                    { value: 'all_history', label: 'All Events (Including Ended)' },
                                    ...activeEvents.map(event => ({ value: event.event_id, label: `${event.name} ${event.ended_at ? '(Ended)' : '(Active)'}` }))
                                ]}
                            />
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

        <Table>
          <TableHeader>
            <tr className="border-none">
              {[
                'Issue',
                'Category',
                'Severity',
                'Status',
                'Center',
                'Reported By',
                'Created',
                'Command',
              ].map(header => (
                <TableHead
                  key={header}
                  className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                    header === 'Command' ? 'text-right' : ''
                  }`}
                >
                  {header}
                </TableHead>
              ))}
            </tr>
          </TableHeader>

          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
            ) : displayedReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan="8" className="py-14 text-center text-slate-400 font-bold">
                  No issue reports found.
                </TableCell>
              </TableRow>
            ) : (
              displayedReports.map(report => {
                const CategoryIcon = getCategoryIcon(report.category);

                return (
                  <TableRow key={report.report_id} className="group">
                    <TableCell className="whitespace-normal min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:bg-slate-900 transition-colors flex-shrink-0">
                          <CategoryIcon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 mb-0.5 leading-tight">
                            {report.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                            {report.report_id}
                          </p>
                          {report.description && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-[250px]">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                        <CategoryIcon size={12} />
                        {getCategoryLabel(report.category)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2.5 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest ${getSeverityClass(report.severity)}`}
                      >
                        {report.severity}
                      </span>
                    </TableCell>

                    <TableCell>
                      {canUpdateStatus ? (
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.report_id, e.target.value)}
                          className={`px-2.5 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest outline-none ${getStatusClass(report.status)}`}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest ${getStatusClass(report.status)}`}
                        >
                          {report.status}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-[10px] font-bold text-slate-500 dark:text-slate-400 min-w-[140px] max-w-[200px]" title={report.center?.name}>
                      <span className="block truncate">{report.center?.name || '—'}</span>
                    </TableCell>

                    <TableCell className="text-[10px] font-bold text-slate-500 dark:text-slate-400 min-w-[110px] max-w-[160px]" title={report.reporter?.name || report.reported_by_user?.name}>
                      <span className="block truncate">{report.reporter?.name || report.reported_by_user?.name || '—'}</span>
                    </TableCell>

                    <TableCell className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDateTime(report.created_at)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewingReport(report)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {canModifyReport(report) ? (
                          <button
                            onClick={() => openEditModal(report)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 text-slate-300 dark:text-slate-800 cursor-not-allowed opacity-30"
                            title="Not allowed to edit"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}

                        {canModifyReport(report) && report.status === 'open' ? (
                          <button
                            onClick={() => handleDelete(report.report_id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 text-slate-300 dark:text-slate-800 cursor-not-allowed opacity-30"
                            title="Only open issue reports can be deleted"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 rounded-lg transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </Table>
    </>
  );
}
