import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, CheckCircle2, Plus, Inbox, Kanban, List as ListIcon,
  Search, Building2,
  RefreshCw, AlertTriangle, MapPin, Layers, ChevronDown, X, Download
} from 'lucide-react';
import JiraListView from '../components/resourceRequests/JiraListView';
import RequestModal from '../components/resourceRequests/RequestModal';
import KanbanBoard from '../components/resourceRequests/KanbanBoard';
import { useResourceRequests } from '../hooks/useResourceRequests';
import ViewRequestDetailsModal from '../components/resourceRequests/ViewRequestDetailsModal';
import IncomingRequestsModal from '../components/resourceRequests/IncomingRequestsModal';
import { useUserStore } from '../store/useUserStore';

export default function ResourceRequests() {
  const user = useUserStore((state) => state.user);
  const isPersonnel = useUserStore((state) => state.isPersonnel());

  const {
    requests,
    centers,
    activeEvents,
    selectedEventId, setSelectedEventId,
    loading,
    saving,
    modalOpen, setModalOpen,
    showFilters, setShowFilters,
    form, setForm,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    message,
    canChooseCenter,
    canUpdateStatus, canCreate,
    displayedRequests,
    pendingCount, acknowledgedCount, deliveredCount,
    openModal, handleSubmit, handleStatusChange, handleDelete, fetchRequests,
    viewingRequest, setViewingRequest
  } = useResourceRequests();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem('rr_view_mode') || 'kanban');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [incomingModalOpen, setIncomingModalOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const centerRef = useRef(null);
  const perPage = 10;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (centerRef.current && !centerRef.current.contains(e.target)) setCenterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Unique requesters for avatar bubbles
  const uniqueRequesters = Array.from(
    new Map(
      displayedRequests
        .filter(r => r.requester?.name || r.requester?.first_name)
        .map(r => [
          r.requester?.user_id || r.requested_by,
          {
            id: String(r.requester?.user_id || r.requested_by),
            name: r.requester?.name || `${r.requester?.first_name || ''} ${r.requester?.last_name || ''}`.trim(),
            initials: (r.requester?.first_name?.[0] || r.requester?.name?.[0] || 'U').toUpperCase()
          }
        ])
    ).values()
  );

  const AVATAR_COLORS = [
    'bg-cyan-600', 'bg-blue-600', 'bg-indigo-600',
    'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'
  ];

  useEffect(() => {
    localStorage.setItem('rr_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, search, selectedEventId, selectedCenterFilter, selectedUserFilter]);

  // Center-filtered and User-filtered requests
  const filteredRequests = displayedRequests.filter((req) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = (req.resource_type || '').toLowerCase();
      const desc = (req.description || '').toLowerCase();
      const id = (req.request_id || '').toLowerCase();
      const centerName = (req.center?.name || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !id.includes(q) && !centerName.includes(q)) {
        return false;
      }
    }

    // Center Filter
    if (selectedCenterFilter !== 'all') {
      const centerId = req.evacuation_center_id || req.center?.evacuation_center_id;
      if (String(centerId) !== String(selectedCenterFilter)) return false;
    }

    // User / Requester Filter
    if (selectedUserFilter !== 'all') {
      const uid = String(req.requester?.user_id || req.requested_by || '');
      if (uid !== selectedUserFilter) return false;
    }

    return true;
  });

  const totalEntries = filteredRequests.length;
  const totalPages = Math.ceil(totalEntries / perPage) || 1;
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusClass = (statusKey) => {
    switch (statusKey) {
      case 'pending':      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'acknowledged': return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'approved':     return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'rejected':     return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'delivered':    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:             return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };


  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const approvedCount = requests.filter(r => r.status?.status_key === 'approved' || r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status?.status_key === 'rejected' || r.status === 'rejected').length;

  const statusStats = [
    { key: 'all', label: 'All Requests', count: requests.length, color: 'text-slate-800 dark:text-slate-100', bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' },
    { key: 'pending', label: 'Pending Triage', count: pendingCount, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { key: 'acknowledged', label: 'Acknowledged', count: acknowledgedCount, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    { key: 'approved', label: 'Approved', count: approvedCount, color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
    { key: 'delivered', label: 'Delivered', count: deliveredCount, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    { key: 'rejected', label: 'Rejected', count: rejectedCount, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  ];

  const handleStatusFilterToggle = (key) => {
    if (key === 'all' || statusFilter === key) {
      setStatusFilter('');
    } else {
      setStatusFilter(key);
    }
  };

  const handleExportCSV = () => {
    if (!filteredRequests.length) return;

    const headers = ["Request ID", "Center", "Type", "Resource/Personnel", "Quantity", "Status", "Requested By", "Date"];
    const rows = filteredRequests.map(r => [
      `"${r.request_id || ''}"`,
      `"${r.center?.name || r.evacuation_center_id || ''}"`,
      `"${r.request_type || 'resource'}"`,
      `"${(r.resource_type || '').replace(/"/g, '""')}"`,
      r.quantity || 1,
      `"${r.status?.status_key || r.status || ''}"`,
      `"${r.requester?.name || `${r.requester?.first_name || ''} ${r.requester?.last_name || ''}`.trim()}"`,
      `"${r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `resource_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeViewingRequest = viewingRequest
    ? displayedRequests.find((r) => r.request_id === viewingRequest.request_id) || viewingRequest
    : null;

  return (
    <div className="flex items-start min-h-[calc(100vh-3.5rem)] font-sans text-left relative">
      {/* ─── Left Column: Main Content (shifts left when detail panel is open) ─── */}
      <div
        className={`flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-8 space-y-6 transition-all duration-300 ${
          activeViewingRequest ? 'max-w-none' : 'max-w-6xl mx-auto'
        }`}
      >
      
      {/* Toast / Notification Alert */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in zoom-in-95 duration-200 ${
          message.type === 'error'
            ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300'
            : 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300'
        }`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <p className="text-xs font-black uppercase tracking-wide">{message.text}</p>
        </div>
      )}

      {/* ─── Top Header Card with View Mode Toggle ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Resource Requests
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {totalEntries} Total
              </span>
            </div>

            {/* Subtitle & Role Scope info */}
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isPersonnel && user?.assigned_center ? (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <MapPin size={13} />
                  Station: {user.assigned_center.name}
                </span>
              ) : (
                <span>Track, triage, and fulfill emergency supply requests across evacuation centers</span>
              )}
            </div>
          </div>

          {/* Top Actions: Incoming Requests + View Toggle + New Request */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Incoming Requests Inbox Modal Trigger */}
            <button
              type="button"
              onClick={() => setIncomingModalOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
              title="View incoming requests inbox"
            >
              <Inbox size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Inbox</span>
              {pendingCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRequests.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Export filtered requests to CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* View Mode Switcher: Kanban vs Table */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Kanban size={14} />
                <span>Resource Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListIcon size={14} />
                <span>List</span>
              </button>
            </div>

            {/* New Request Button */}
            {canCreate && (
              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                <Plus size={15} />
                <span>New Request</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Jira-Style Filter Toolbar ─── */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">

          {/* Search Input */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search board"
              className="h-8 pl-8 pr-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-40 sm:w-52 transition-all"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Requester Avatar Bubbles */}
          {uniqueRequesters.length > 0 && (
            <div className="flex items-center -space-x-1.5">
              <button
                type="button"
                onClick={() => setSelectedUserFilter('all')}
                title="All Requesters"
                className={`w-7 h-7 rounded-full text-[9px] font-black border-2 z-10 flex items-center justify-center transition-all ${
                  selectedUserFilter === 'all'
                    ? 'border-blue-500 bg-blue-600 text-white scale-105'
                    : 'border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105'
                }`}
              >
                ALL
              </button>
              {uniqueRequesters.slice(0, 5).map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedUserFilter(selectedUserFilter === r.id ? 'all' : r.id)}
                  title={`Filter by: ${r.name}`}
                  className={`w-7 h-7 rounded-full text-[10px] font-black border-2 flex items-center justify-center text-white transition-all ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} ${
                    selectedUserFilter === r.id
                      ? 'border-blue-400 scale-110 z-20 shadow-md'
                      : 'border-white dark:border-slate-900 opacity-90 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {r.initials}
                </button>
              ))}
            </div>
          )}



          {/* By Center Dropdown Button */}
          {canChooseCenter && centers.length > 0 && (
            <div className="relative" ref={centerRef}>
              <button
                type="button"
                onClick={() => setCenterOpen(prev => !prev)}
                className={`h-8 inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-lg border transition-all ${
                  selectedCenterFilter !== 'all'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Filter by evacuation center"
              >
                <Building2 size={13} />
                <span>By Center</span>
                {selectedCenterFilter !== 'all' && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">1</span>
                )}
                <ChevronDown size={12} className={`transition-transform ${centerOpen ? 'rotate-180' : ''}`} />
              </button>

              {centerOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 mb-1">Evacuation Center</p>
                  {[{evacuation_center_id: 'all', name: 'All Centers'}, ...centers].map(c => (
                    <button
                      key={c.evacuation_center_id}
                      type="button"
                      onClick={() => { setSelectedCenterFilter(String(c.evacuation_center_id)); setCenterOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                        String(selectedCenterFilter) === String(c.evacuation_center_id)
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-black'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{c.name}</span>
                      {String(selectedCenterFilter) === String(c.evacuation_center_id) && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active filter badge */}
          {(selectedUserFilter !== 'all' || selectedCenterFilter !== 'all' || search) && (
            <button
              type="button"
              onClick={() => { setSelectedUserFilter('all'); setSelectedCenterFilter('all'); setSearch(''); }}
              className="h-8 inline-flex items-center gap-1 px-2.5 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer"
            >
              <X size={12} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>



      {/* ─── Interactive Status KPI Summary Bar ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {statusStats.map((item) => {
          const isActive = item.key === 'all' ? !statusFilter : statusFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleStatusFilterToggle(item.key)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? `${item.bg} ring-2 ring-blue-500 shadow-sm`
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                  {item.label}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className={`text-xl font-extrabold ${item.color}`}>
                  {item.count}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">requests</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── MAIN CONTENT VIEW (KANBAN BOARD OR DATA TABLE) ─── */}
      {viewMode === 'kanban' ? (
        <div className="animate-in fade-in duration-200">
          <KanbanBoard 
            requests={filteredRequests}
            loading={loading}
            canUpdateStatus={canUpdateStatus}
            canCreate={canCreate}
            openModal={openModal}
            handleStatusChange={handleStatusChange}
            handleDelete={handleDelete}
            viewingRequest={activeViewingRequest}
            setViewingRequest={setViewingRequest}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <JiraListView
            requests={filteredRequests}
            loading={loading}
            canUpdateStatus={canUpdateStatus}
            handleStatusChange={handleStatusChange}
            handleDelete={handleDelete}
            getStatusClass={getStatusClass}
            viewingRequest={activeViewingRequest}
            setViewingRequest={setViewingRequest}
          />
        </div>
      )}
      </div>

      {/* ─── View & Update Details Inline Side Panel (Jira-Style) ─── */}
      <ViewRequestDetailsModal 
        request={activeViewingRequest}
        onClose={() => setViewingRequest(null)}
        getStatusClass={getStatusClass}
        canUpdateStatus={canUpdateStatus}
        handleStatusChange={handleStatusChange}
        handleDelete={handleDelete}
      />

      {/* ─── Incoming Requests List Modal ─── */}
      <IncomingRequestsModal
        isOpen={incomingModalOpen}
        onClose={() => setIncomingModalOpen(false)}
        requests={requests}
        getStatusClass={getStatusClass}
        onSelectRequest={(req) => {
          setViewingRequest(req);
        }}
      />

      {/* ─── Create Request Modal ─── */}
      <RequestModal 
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        form={form}
        setForm={setForm}
        canChooseCenter={canChooseCenter}
        canUpdateStatus={canUpdateStatus}
        centers={centers}
        handleSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}