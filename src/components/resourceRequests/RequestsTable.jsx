import React, { useState, useMemo } from 'react';
import { Truck, Search, Filter, Package, Users } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, RowMenu } from '../../ui/Table';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

const STATUS_OPTIONS = [
  'pending', 'acknowledged', 'approved', 'rejected', 'delivered',
];

export default function RequestsTable({
  search, setSearch, fetchRequests,
  statusFilter, setStatusFilter,
  showFilters, setShowFilters,
  typeFilter, setTypeFilter,
  selectedEventId, setSelectedEventId,
  activeEvents = [], loading, displayedRequests = [],
  canUpdateStatus, handleStatusChange,
  getStatusClass, getUrgencyClass, formatDateTime,
  handleDelete, setViewingRequest
}) {
  const [colFilters, setColFilters] = useState({
    resource: '',
    type: '',
    urgency: '',
    status: '',
    center: '',
  });

  const filteredRequests = useMemo(() => {
    return displayedRequests.filter((req) => {
      const resName = String(req.resource_type || '').toLowerCase();
      const type = String(req.request_type || '').toLowerCase();
      const urgency = String(req.urgency_level?.urgency_key || '').toLowerCase();
      const status = String(req.status?.status_key || '').toLowerCase();
      const center = String(req.center?.name || '').toLowerCase();

      if (colFilters.resource && !resName.includes(colFilters.resource.toLowerCase())) return false;
      if (colFilters.type && type !== colFilters.type.toLowerCase()) return false;
      if (colFilters.urgency && urgency !== colFilters.urgency.toLowerCase()) return false;
      if (colFilters.status && status !== colFilters.status.toLowerCase()) return false;
      if (colFilters.center && !center.includes(colFilters.center.toLowerCase())) return false;

      return true;
    });
  }, [displayedRequests, colFilters]);

  return (
    <>

      <Table>
        <TableHeader>
          <tr className="border-b border-gray-100 dark:border-slate-800">
            <TableHead
              filterable
              filterValue={colFilters.resource}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, resource: v }))}
            >
              Resource
            </TableHead>
            <TableHead
              filterable
              filterValue={colFilters.type}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, type: v }))}
              filterOptions={[
                { value: 'resource', label: 'Resource' },
                { value: 'personnel', label: 'Personnel' },
              ]}
            >
              Type
            </TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead
              filterable
              filterValue={colFilters.urgency}
              onFilterChange={(v) => setColFilters((prev) => ({ ...prev, urgency: v }))}
              filterOptions={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            >
              Urgency
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
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>

        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="animate-pulse">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex-shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
                      <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-16"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-lg w-20"></div></TableCell>
                <TableCell className="text-center"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-8 mx-auto"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-lg w-16"></div></TableCell>
                <TableCell><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-24"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-32"></div></TableCell>
                <TableCell className="text-right"><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></TableCell>
              </TableRow>
            ))
          ) : filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan="8" className="py-14 text-center text-gray-400 font-medium">
                No resource requests found.
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map(req => (
              <TableRow key={req.request_id}>
                <TableCell className="whitespace-normal min-w-[200px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 flex-shrink-0">
                      {req.request_type === 'personnel' ? <Users size={14} /> : <Package size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 leading-tight">{req.resource_type}</p>
                      <p className="text-[10px] text-gray-400 font-mono leading-none">{req.request_id}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                    {req.request_type === 'personnel' ? <Users size={12} /> : <Package size={12} />}
                    {req.request_type}
                  </span>
                </TableCell>

                <TableCell className="text-center text-sm font-semibold text-gray-700 dark:text-slate-200">{req.quantity}</TableCell>

                <TableCell>
                  <StatusBadge 
                    value={req.urgency_level?.urgency_label || '—'} 
                    color={
                      req.urgency_level?.urgency_key === 'critical' || req.urgency_level?.urgency_key === 'high'
                        ? 'red'
                        : req.urgency_level?.urgency_key === 'medium'
                        ? 'orange'
                        : 'green'
                    } 
                  />
                </TableCell>

                <TableCell>
                  {canUpdateStatus ? (
                    <select
                      value={req.status?.status_key || ''}
                      onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border outline-none cursor-pointer ${
                        getStatusClass(req.status?.status_key)
                      }`}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge value={req.status?.status_label || '—'} />
                  )}
                </TableCell>

                <TableCell className="text-xs font-medium text-gray-500 dark:text-slate-400 min-w-[140px] max-w-[200px]" title={req.center?.name}>
                  <span className="block truncate">{req.center?.name || '—'}</span>
                </TableCell>

                <TableCell className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                  {formatDateTime(req.created_at)}
                </TableCell>

                <TableCell className="text-right">
                  <RowMenu 
                    onView={() => setViewingRequest(req)}
                    onDelete={req.status?.status_key === 'pending' ? () => handleDelete(req.request_id) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
