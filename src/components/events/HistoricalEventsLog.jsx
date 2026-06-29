import React from 'react';
import { Archive, Filter, CheckCircle2, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function HistoricalEventsLog({
  historyPagination, showFilters, setShowFilters, filters, setFilters,
  disasterTypes, historyLoading, historicalEvents, fetchHistory, setViewingEvent
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <Archive size={17} className="text-slate-400" />
            Historical Operations Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {historyPagination.total || 0} record{(historyPagination.total || 0) !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex gap-2 relative w-full lg:w-auto justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              (filters.type_id || filters.start_date || filters.end_date) || showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
            {(filters.type_id || filters.start_date || filters.end_date) && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">
                {(filters.type_id ? 1 : 0) + (filters.start_date ? 1 : 0) + (filters.end_date ? 1 : 0)}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3>
                {(filters.type_id || filters.start_date || filters.end_date) && (
                  <button 
                    onClick={() => setFilters({type_id: '', start_date: '', end_date: ''})}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Event Type</label>
                  <select
                    value={filters.type_id}
                    onChange={e => setFilters(prev => ({...prev, type_id: e.target.value}))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    {disasterTypes.map(type => (
                      <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">From</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={e => setFilters(prev => ({...prev, start_date: e.target.value}))}
                    onClick={e => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">To</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={e => setFilters(prev => ({...prev, end_date: e.target.value}))}
                    onClick={e => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {historyLoading ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          Loading historical operations...
        </div>
      ) : historicalEvents.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No historical operations recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900">
                {['Event ID', 'Name', 'Type', 'Severity', 'Duration', 'Status', 'Command'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historicalEvents.map(event => {
                const start = new Date(event.started_at);
                const end = event.ended_at ? new Date(event.ended_at) : null;
                
                let durationStr = "—";
                if (end) {
                  const diffMs = end.getTime() - start.getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  durationStr = diffDays > 0 
                    ? `${diffDays} Day${diffDays > 1 ? 's' : ''}` 
                    : `${diffHours}h`;
                }

                return (
                  <tr key={event.event_id} className="hover:bg-slate-50/20 transition-colors group">
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-400">{event.event_id}</td>
                    <td className="px-6 py-4.5 font-bold text-slate-800">{event.name}</td>
                    <td className="px-6 py-4.5 text-xs text-slate-500">{event.primary_type?.type_name || '—'}</td>
                    <td className="px-6 py-4.5">
                      <SeverityBadge severity={event.severity} />
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-500">{durationStr}</td>
                    <td className="px-6 py-4.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={14} />
                        Closed
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => setViewingEvent(event)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow"
                          title="View Details & Logs"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                      <div className="group-hover:hidden text-slate-300">
                        <MoreHorizontal size={14} className="ml-auto" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Page {historyPagination.current_page || 1} of {historyPagination.last_page || 1}
              {' · '}
              {historyPagination.total || 0} total records
            </p>
            <div className="flex gap-2">
              <button
                disabled={!historyPagination.prev_page_url}
                onClick={() => fetchHistory(historyPagination.current_page - 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={!historyPagination.next_page_url}
                onClick={() => fetchHistory(historyPagination.current_page + 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
