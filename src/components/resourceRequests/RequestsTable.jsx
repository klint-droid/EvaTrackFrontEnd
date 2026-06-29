import React from 'react';
import { Truck, Search, Filter, Package, Users, Trash2 } from 'lucide-react';

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
  handleDelete
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
          <div className="relative flex-1 lg:w-64 group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchRequests();
              }}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-2 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

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
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="">All Types</option>
                                <option value="resource">Resources</option>
                                <option value="personnel">Personnel</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Event</label>
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="all">All Active Events</option>
                                <option value="all_history">All Events (Including Ended)</option>
                                {activeEvents.map(event => (
                                <option key={event.event_id} value={event.event_id}>
                                    {event.name} {event.ended_at ? '(Ended)' : '(Active)'}
                                </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900">
              {['Resource Type', 'Type', 'Quantity', 'Urgency', 'Status', 'Center', 'Timestamp', 'Action'].map(header => (
                <th key={header} className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-slate-50">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-lg w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                  <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-lg w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-lg w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-5 ml-auto"></div></td>
                </tr>
              ))
            ) : displayedRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-14 text-center text-slate-400 font-bold">
                  No resource requests found.
                </td>
              </tr>
            ) : (
              displayedRequests.map(req => (
                <tr key={req.request_id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">{req.resource_type}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.request_id}</p>
                    {req.description && (
                      <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">{req.description}</p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-lg border bg-blue-50 text-blue-700 border-blue-100 capitalize">
                      {req.request_type === 'personnel' ? <Users size={12} /> : <Package size={12} />}
                      {req.request_type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{req.quantity}</td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${
                      getUrgencyClass(req.urgency_level?.urgency_key)
                    }`}>
                      {req.urgency_level?.urgency_label || '—'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
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
                  </td>

                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {req.center?.name || '—'}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {formatDateTime(req.created_at)}
                  </td>

                  <td className="px-6 py-4">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
