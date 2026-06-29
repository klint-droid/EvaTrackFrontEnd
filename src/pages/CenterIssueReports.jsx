import { AlertTriangle, CheckCircle2, Wrench, HeartPulse, Shield, FileWarning } from 'lucide-react';
import ReportsHeader from '../components/centerIssueReports/ReportsHeader';
import ReportsSummaryCards from '../components/centerIssueReports/ReportsSummaryCards';
import ReportsTable from '../components/centerIssueReports/ReportsTable';
import ReportModal from '../components/centerIssueReports/ReportModal';
import { useCenterIssueReports } from '../hooks/useCenterIssueReports';

const CATEGORY_OPTIONS = [
  { value: 'incident', label: 'Incident' },
  { value: 'facility_issue', label: 'Facility Issue' },
  { value: 'health_issue', label: 'Health Issue' },
  { value: 'safety_issue', label: 'Safety Issue' },
  { value: 'other', label: 'Other' },
];

export default function CenterIssueReports() {
  const {
    centers,
    loading,
    saving,
    modalOpen, setModalOpen,
    editingReport,
    showFilters, setShowFilters,
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
    openCount, inProgressCount, resolvedCount, criticalCount,
    fetchReports, openCreateModal, openEditModal, handleSubmit,
    handleStatusChange, handleDelete, canModifyReport
  } = useCenterIssueReports();

  const getCategoryLabel = (value) => {
    return CATEGORY_OPTIONS.find(item => item.value === value)?.label || value;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'facility_issue': return Wrench;
      case 'health_issue': return HeartPulse;
      case 'safety_issue': return Shield;
      case 'incident': return FileWarning;
      default: return AlertTriangle;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      case 'closed': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <ReportsHeader canCreate={canCreate} openCreateModal={openCreateModal} />

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border ${
            message.type === 'error'
              ? 'bg-red-50 border-red-100 text-red-700'
              : 'bg-green-50 border-green-100 text-green-700'
          }`}
        >
          {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <p className="text-xs font-black uppercase tracking-wide">
            {message.text}
          </p>
        </div>
      )}

      <ReportsSummaryCards
        openCount={openCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        criticalCount={criticalCount}
      />

      <ReportsTable
        search={search}
        setSearch={setSearch}
        fetchReports={fetchReports}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        activeEvents={activeEvents}
        loading={loading}
        displayedReports={displayedReports}
        getCategoryIcon={getCategoryIcon}
        getCategoryLabel={getCategoryLabel}
        getSeverityClass={getSeverityClass}
        getStatusClass={getStatusClass}
        canUpdateStatus={canUpdateStatus}
        handleStatusChange={handleStatusChange}
        formatDateTime={formatDateTime}
        canModifyReport={canModifyReport}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
      />

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
    </div>
  );
}