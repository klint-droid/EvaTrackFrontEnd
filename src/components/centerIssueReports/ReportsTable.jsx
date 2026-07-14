import React from 'react';
import { AlertTriangle, Search, Filter, Edit3, Trash2 } from 'lucide-react';
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
    <TableCell className="px-6 py-4 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-5/6 mt-1" />
    </TableCell>
    <TableCell className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-lg w-20" /></TableCell>
    <TableCell className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-lg w-16" /></TableCell>
    <TableCell className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-lg w-24" /></TableCell>
    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></TableCell>
    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></TableCell>
    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28" /></TableCell>
    <TableCell className="px-6 py-4">
      <div className="flex justify-end gap-2">
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
      </div>
    </TableCell>
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
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
            <div className="w-40"><Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                ...STATUS_OPTIONS.map(item => ({ value: item, label: item }))
              ]}
            /></div>

            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    (categoryFilter || severityFilter || selectedEventId !== "all") || showFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3>
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900">
              {[
                'Issue',
                'Category',
                'Severity',
                'Status',
                'Center',
                'Reported By',
                'Created',
                'Action',
              ].map(header => (
                <TableHead
                  key={header}
                  className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
            ) : displayedReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan="8" className="px-6 py-14 text-center text-slate-400 font-bold">
                  No issue reports found.
                </TableCell>
              </TableRow>
            ) : (
              displayedReports.map(report => {
                const CategoryIcon = getCategoryIcon(report.category);

                return (
                  <TableRow key={report.report_id} className="hover:bg-slate-50/20 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">
                        {report.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {report.report_id}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                        {report.description}
                      </p>
                      <button 
                        onClick={() => setViewingReport(report)}
                        className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View Details
                      </button>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-lg border bg-blue-50 text-blue-700 border-blue-100 capitalize">
                        <CategoryIcon size={12} />
                        {getCategoryLabel(report.category)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${getSeverityClass(report.severity)}`}
                      >
                        {report.severity}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      {canUpdateStatus ? (
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.report_id, e.target.value)}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase outline-none ${getStatusClass(report.status)}`}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${getStatusClass(report.status)}`}
                        >
                          {report.status}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs font-bold text-slate-500">
                      {report.center?.name || '—'}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs font-bold text-slate-500">
                      {report.reporter?.name || report.reported_by_user?.name || '—'}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs text-slate-500">
                      {formatDateTime(report.created_at)}
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canModifyReport(report) && (
                          <button
                            onClick={() => openEditModal(report)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {canModifyReport(report) && report.status === 'open' && (
                          <button
                            onClick={() => handleDelete(report.report_id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
