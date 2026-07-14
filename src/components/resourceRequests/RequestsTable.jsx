import React from 'react';
import { Truck, Search, Filter, Package, Users, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../ui/Table';
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
  activeEvents, loading, displayedRequests,
  canUpdateStatus, handleStatusChange,
  getStatusClass, getUrgencyClass, formatDateTime,
  handleDelete, setViewingRequest
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <Truck size={17} className="text-blue-500" />
            Resource Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor incoming requests and fulfillment status.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
          <div className="w-full lg:w-64 group">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchRequests();
              }}
              placeholder="Search resources..."
            />
          </div>

          <div className="flex gap-2 relative">
            <div className="w-40">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    ...STATUS_OPTIONS.map(status => ({ value: status, label: status }))
                  ]}
                />
            </div>

            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    (typeFilter || selectedEventId !== "all") || showFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
                <Filter size={16} />
                <span className="hidden sm:inline">More Filters</span>
                {(typeFilter || selectedEventId !== "all") && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">
                        {(typeFilter ? 1 : 0) + (selectedEventId !== "all" ? 1 : 0)}
                    </span>
                )}
            </button>

            {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3>
                        {(typeFilter || selectedEventId !== "all") && (
                            <button 
                                onClick={() => {
                                    setTypeFilter('');
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
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                            <Select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Types' },
                                    { value: 'resource', label: 'Resources' },
                                    { value: 'personnel', label: 'Personnel' },
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
                                    ...activeEvents.map(event => ({
                                        value: event.event_id,
                                        label: `${event.name} ${event.ended_at ? '(Ended)' : '(Active)'}`
                                    }))
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
          <TableHeader className="bg-slate-900 text-white">
            <tr className="border-none">
              {['Resource Type', 'Type', 'Quantity', 'Urgency', 'Status', 'Center', 'Timestamp', 'Action'].map(header => (
                <TableHead key={header} className="text-[10px] font-bold text-white uppercase tracking-wider">
                  {header}
                </TableHead>
              ))}
            </tr>
          </TableHeader>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell>
                    <div className="h-4 bg-slate-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-16"></div>
                  </TableCell>
                  <TableCell><div className="h-5 bg-slate-200 rounded-lg w-20"></div></TableCell>
                  <TableCell><div className="h-4 bg-slate-200 rounded w-8"></div></TableCell>
                  <TableCell><div className="h-5 bg-slate-200 rounded-lg w-16"></div></TableCell>
                  <TableCell><div className="h-6 bg-slate-200 rounded-lg w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-slate-200 rounded w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-32"></div></TableCell>
                  <TableCell><div className="h-5 bg-slate-200 rounded w-5 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : displayedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan="8" className="py-14 text-center text-slate-400 font-bold">
                  No resource requests found.
                </TableCell>
              </TableRow>
            ) : (
              displayedRequests.map(req => (
                <TableRow key={req.request_id} className="group">
                  <TableCell>
                    <p className="text-sm font-black text-slate-800">{req.resource_type}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.request_id}</p>
                    {req.description && (
                      <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">{req.description}</p>
                    )}
                    <button 
                      onClick={() => setViewingRequest(req)}
                      className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View Details
                    </button>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-lg border bg-blue-50 text-blue-700 border-blue-100 capitalize">
                      {req.request_type === 'personnel' ? <Users size={12} /> : <Package size={12} />}
                      {req.request_type}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm font-bold text-slate-700">{req.quantity}</TableCell>

                  <TableCell>
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${
                      getUrgencyClass(req.urgency_level?.urgency_key)
                    }`}>
                      {req.urgency_level?.urgency_label || '—'}
                    </span>
                  </TableCell>

                  <TableCell>
                    {canUpdateStatus ? (
                      <select
                        value={req.status?.status_key || ''}
                        onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase outline-none ${
                          getStatusClass(req.status?.status_key)
                        }`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${
                        getStatusClass(req.status?.status_key)
                      }`}>
                        {req.status?.status_label || '—'}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-bold text-slate-500">
                    {req.center?.name || '—'}
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {formatDateTime(req.created_at)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {req.status?.status_key === 'pending' && (
                        <button
                          onClick={() => handleDelete(req.request_id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
    </div>
  );
}
