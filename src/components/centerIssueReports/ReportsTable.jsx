import React, { useState, useMemo } from 'react';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, RowMenu } from '../../ui/Table';

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
  activeEvents = [],
  loading, displayedReports = [],
  getCategoryIcon, getCategoryLabel,
  getSeverityClass, getStatusClass,
  canUpdateStatus, handleStatusChange,
  formatDateTime, canModifyReport,
  openEditModal, handleDelete, setViewingReport
}) {
  const [colFilters, setColFilters] = useState({
    issue: '',
    category: '',
    severity: '',
    status: '',
    center: '',
    reporter: '',
  });

  const filteredReports = useMemo(() => {
    return displayedReports.filter((rep) => {
      const issueTitle = String(rep.title || '').toLowerCase();
      const category = String(rep.category || '').toLowerCase();
      const severity = String(rep.severity || '').toLowerCase();
      const status = String(rep.status || '').toLowerCase();
      const center = String(rep.center?.name || '').toLowerCase();
      const reporter = String(rep.reporter?.name || rep.reported_by_user?.name || '').toLowerCase();

      if (colFilters.issue && !issueTitle.includes(colFilters.issue.toLowerCase())) return false;
      if (colFilters.category && category !== colFilters.category.toLowerCase()) return false;
      if (colFilters.severity && severity !== colFilters.severity.toLowerCase()) return false;
      if (colFilters.status && status !== colFilters.status.toLowerCase()) return false;
      if (colFilters.center && !center.includes(colFilters.center.toLowerCase())) return false;
      if (colFilters.reporter && !reporter.includes(colFilters.reporter.toLowerCase())) return false;

      return true;
    });
  }, [displayedReports, colFilters]);

  return (
    <>

      <Table>
        <TableHeader>
          <tr className="border-b border-gray-100 dark:border-slate-800">
            <TableHead
              filterable
              filterValue={colFilters.issue}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, issue: v }))}
            >
              Issue
            </TableHead>
            <TableHead
              filterable
              filterValue={colFilters.category}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, category: v }))}
              filterOptions={CATEGORY_OPTIONS}
            >
              Category
            </TableHead>
            <TableHead
              filterable
              filterValue={colFilters.severity}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, severity: v }))}
              filterOptions={SEVERITY_OPTIONS.map((s) => ({ value: s, label: s }))}
            >
              Severity
            </TableHead>
            <TableHead
              filterable
              filterValue={colFilters.status}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, status: v }))}
              filterOptions={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            >
              Status
            </TableHead>
            <TableHead
              filterable
              filterValue={colFilters.center}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, center: v }))}
            >
              Center
            </TableHead>
            <TableHead
              filterable
              filterValue={colFilters.reporter}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, reporter: v }))}
            >
              Reported By
            </TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>

        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
          ) : filteredReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan="8" className="py-14 text-center text-gray-400 font-medium">
                No issue reports found.
              </TableCell>
            </TableRow>
          ) : (
            filteredReports.map(report => {
              const CategoryIcon = getCategoryIcon(report.category);

              return (
                <TableRow key={report.report_id}>
                  <TableCell className="whitespace-normal min-w-[200px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 flex-shrink-0">
                        <CategoryIcon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                          {report.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono leading-none">
                          {report.report_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                      <CategoryIcon size={12} />
                      {getCategoryLabel(report.category)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      value={report.severity}
                      color={
                        report.severity === 'critical' || report.severity === 'high'
                          ? 'red'
                          : report.severity === 'medium'
                          ? 'orange'
                          : 'green'
                      }
                    />
                  </TableCell>

                  <TableCell>
                    {canUpdateStatus ? (
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.report_id, e.target.value)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border outline-none cursor-pointer ${getStatusClass(report.status)}`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge value={report.status} />
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-medium text-gray-500 dark:text-slate-400 min-w-[140px] max-w-[200px]" title={report.center?.name}>
                    <span className="block truncate">{report.center?.name || '—'}</span>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-gray-500 dark:text-slate-400 min-w-[110px] max-w-[160px]" title={report.reporter?.name || report.reported_by_user?.name}>
                    <span className="block truncate">{report.reporter?.name || report.reported_by_user?.name || '—'}</span>
                  </TableCell>

                  <TableCell className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateTime(report.created_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    <RowMenu
                      onView={() => setViewingReport(report)}
                      onEdit={canModifyReport(report) ? () => openEditModal(report) : undefined}
                      onDelete={canModifyReport(report) && report.status === 'open' ? () => handleDelete(report.report_id) : undefined}
                    />
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
