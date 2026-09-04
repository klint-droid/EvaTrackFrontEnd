import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, CheckCircle2, Plus, Kanban, List as ListIcon,
  Search, SlidersHorizontal, Building2, Wrench, HeartPulse, Shield, 
  FileWarning, Download, RefreshCw, AlertTriangle, MapPin, ChevronDown, X
} from 'lucide-react';
import IssuesKanbanBoard from '../components/centerIssueReports/IssuesKanbanBoard';
import IssuesListView from '../components/centerIssueReports/IssuesListView';
import ReportModal from '../components/centerIssueReports/ReportModal';
import ViewDetailsModal from '../components/centerIssueReports/ViewDetailsModal';
import { useCenterIssueReports } from '../hooks/useCenterIssueReports';
import AnimatedFAB from '../components/ui/AnimatedFAB';
import { useUserStore } from '../store/useUserStore';

const AVATAR_COLORS = [
  'bg-cyan-600', 'bg-blue-600', 'bg-indigo-600',
  'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'
];

export default function CenterIssueReports() {
  const user = useUserStore((state) => state.user);
  const isPersonnel = useUserStore((state) => state.isPersonnel());

  const {
    centers,
    loading,
    saving,
    modalOpen, setModalOpen,
    editingReport,
    form, setForm,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter,
    activeEvents,
    selectedEventId, setSelectedEventId,
    message,
    canCreate, canUpdateStatus, canChooseCenter,
    displayedReports,
    fetchReports, openCreateModal, openEditModal, handleSubmit,
    handleStatusChange, handleDelete, canModifyReport,
    viewingReport, setViewingReport
  } = useCenterIssueReports();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem('cir_view_mode') || 'kanban');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const filterRef = useRef(null);
  const centerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('cir_view_mode', viewMode);
  }, [viewMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (centerRef.current && !centerRef.current.contains(e.target)) setCenterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Unique reporters for avatar bubbles
  const uniqueReporters = Array.from(
    new Map(
      displayedReports
        .filter(r => (r.reporter || r.reported_by_user))
        .map(r => {
          const rep = r.reporter || r.reported_by_user;
          const uid = String(rep.user_id || r.reported_by);
          const name = rep.name || `${rep.first_name || ''} ${rep.last_name || ''}`.trim() || 'Officer';
          return [
            uid,
            {
              id: uid,
              name,
              initials: (rep.first_name?.[0] || rep.name?.[0] || 'U').toUpperCase()
            }
          ];
        })
    ).values()
  );

  // Filtered reports calculation
  const filteredReports = displayedReports.filter((rep) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = (rep.title || '').toLowerCase();
      const desc = (rep.description || '').toLowerCase();
      const id = (rep.report_id || '').toLowerCase();
      const centerName = (rep.center?.name || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !id.includes(q) && !centerName.includes(q)) {
        return false;
      }
    }

    // Center Filter
    if (selectedCenterFilter !== 'all') {
      const centerId = rep.evacuation_center_id || rep.center?.evacuation_center_id;
      if (String(centerId) !== String(selectedCenterFilter)) return false;
    }

    // User / Reporter Filter
    if (selectedUserFilter !== 'all') {
      const uid = String(rep.reporter?.user_id || rep.reported_by_user?.user_id || rep.reported_by || '');
      if (uid !== selectedUserFilter) return false;
    }

    // Quick Filters
    if (quickFilter === 'critical') {
      const sev = (typeof rep.severity === 'object' ? rep.severity?.severity_key : rep.severity);
      return sev === 'critical';
    }
    if (quickFilter === 'facility') return rep.category === 'facility_issue';
    if (quickFilter === 'health') return rep.category === 'health_issue';
    if (quickFilter === 'safety') return rep.category === 'safety_issue';
    if (quickFilter === 'incident') return rep.category === 'incident';

    return true;
  });

  const totalEntries = filteredReports.length;

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'high':     return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium':   return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'low':      return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800';
      default:         return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open':        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'in_progress': return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'resolved':    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'closed':      return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      default:            return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const handleExportCSV = () => {
    const csvHeader = "Report ID,Title,Category,Severity,Status,Center,Reported At\n";
    const csvRows = filteredReports
      .map((r) => `${r.report_id},"${r.title || ''}",${r.category || ''},${r.severity || ''},${r.status || ''},"${r.center?.name || ''}","${r.created_at || ''}"`)
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "center_issues.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen font-sans text-left pb-24 relative space-y-6">
      
      {/* Toast Notification Alert */}
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
                Center Issue Reports
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
                <span>Track, triage, and resolve evacuation center facility, health, and safety incidents</span>
              )}
            </div>
          </div>

          {/* Top Actions: View Toggle + Export + Report Issue */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* View Mode Switcher: Issue Board vs List */}
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
                <span>Issue Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListIcon size={14} />
                <span>List</span>
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all"
              title="Export CSV"
            >
              <Download size={14} />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Report Issue Button */}
            {canCreate && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                <Plus size={15} />
                <span>Report Issue</span>
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
              placeholder="Search issues"
              className="h-8 pl-8 pr-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-40 sm:w-52 transition-all"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Reporter Avatar Bubbles */}
          {uniqueReporters.length > 0 && (
            <div className="flex items-center -space-x-1.5">
              <button
                type="button"
                onClick={() => setSelectedUserFilter('all')}
                title="All Reporters"
                className={`w-7 h-7 rounded-full text-[9px] font-black border-2 z-10 flex items-center justify-center transition-all ${
                  selectedUserFilter === 'all'
                    ? 'border-blue-500 bg-blue-600 text-white scale-105'
                    : 'border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105'
                }`}
              >
                ALL
              </button>
              {uniqueReporters.slice(0, 5).map((r, idx) => (
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

          {/* Filter Dropdown Button */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(prev => !prev)}
              className={`h-8 inline-flex items-center gap-1.5 px-3 text-xs font-bold rounded-lg border transition-all ${
                quickFilter !== 'all'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filter</span>
              {quickFilter !== 'all' && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">1</span>
              )}
              <ChevronDown size={12} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown Panel */}
            {filterOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 mb-1">By Category</p>

                {[
                  { key: 'all',      label: 'All Issues',      cls: 'text-slate-600 dark:text-slate-300' },
                  { key: 'facility', label: '🔧 Facility',      cls: 'text-blue-600 dark:text-blue-400' },
                  { key: 'health',   label: '❤️ Health',        cls: 'text-emerald-600 dark:text-emerald-400' },
                  { key: 'safety',   label: '🛡️ Safety',        cls: 'text-orange-600 dark:text-orange-400' },
                  { key: 'incident', label: '⚠️ Incident',      cls: 'text-rose-600 dark:text-rose-400' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setQuickFilter(opt.key); setFilterOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                      quickFilter === opt.key
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-black'
                        : `hover:bg-slate-50 dark:hover:bg-slate-800 ${opt.cls}`
                    }`}
                  >
                    <span>{opt.label}</span>
                    {quickFilter === opt.key && <span className="ml-auto text-blue-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* By Center Dropdown Button (For Admins) */}
          {canChooseCenter && centers?.length > 0 && (
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
                  {[{ evacuation_center_id: 'all', name: 'All Centers' }, ...centers].map(c => (
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
          {(quickFilter !== 'all' || selectedUserFilter !== 'all' || selectedCenterFilter !== 'all') && (
            <button
              type="button"
              onClick={() => { 
                setQuickFilter('all'); 
                setSelectedUserFilter('all'); 
                setSelectedCenterFilter('all'); 
                setSearch(''); 
              }}
              className="h-8 inline-flex items-center gap-1 px-2.5 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all"
            >
              <X size={12} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── MAIN CONTENT VIEW (KANBAN BOARD OR LIST) ─── */}
      {viewMode === 'kanban' ? (
        <div className="animate-in fade-in duration-200">
          <IssuesKanbanBoard
            reports={filteredReports}
            loading={loading}
            canUpdateStatus={canUpdateStatus}
            canCreate={canCreate}
            openCreateModal={openCreateModal}
            handleStatusChange={handleStatusChange}
            handleDelete={handleDelete}
            getSeverityClass={getSeverityClass}
            setViewingReport={setViewingReport}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <IssuesListView
            reports={filteredReports}
            loading={loading}
            canUpdateStatus={canUpdateStatus}
            handleStatusChange={handleStatusChange}
            handleDelete={handleDelete}
            getSeverityClass={getSeverityClass}
            getStatusClass={getStatusClass}
            setViewingReport={setViewingReport}
          />
        </div>
      )}

      {/* ─── Create / Edit Issue Modal ─── */}
      <ReportModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        editingReport={editingReport}
        form={form}
        setForm={setForm}
        canChooseCenter={canChooseCenter}
        centers={centers}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      {/* ─── View & Update Details Side Drawer ─── */}
      <ViewDetailsModal
        report={viewingReport}
        onClose={() => setViewingReport(null)}
        canUpdateStatus={canUpdateStatus}
        handleStatusChange={handleStatusChange}
        handleDelete={handleDelete}
        openEditModal={openEditModal}
      />

      {/* ─── Floating Action Button ─── */}
      {canCreate && (
        <AnimatedFAB onClick={openCreateModal} icon={Plus} label="Report Issue" />
      )}
    </div>
  );
}