import { AlertTriangle, CheckCircle2, Wrench, HeartPulse, Shield, FileWarning, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReportsSummaryCards from '../components/centerIssueReports/ReportsSummaryCards';
import ReportsTable from '../components/centerIssueReports/ReportsTable';
import ReportModal from '../components/centerIssueReports/ReportModal';
import ViewDetailsModal from '../components/centerIssueReports/ViewDetailsModal';
import { useCenterIssueReports } from '../hooks/useCenterIssueReports';
import { TableLayout } from '../components/ui/TableLayout';
import { TableTabs } from '../components/ui/TableTabs';
import { Pagination } from '../components/ui/Pagination';
import AnimatedFAB from '../components/ui/AnimatedFAB';

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
    openCount, inProgressCount, resolvedCount, criticalCount, highCount, mediumCount, lowCount,
    fetchReports, openCreateModal, openEditModal, handleSubmit,
    handleStatusChange, handleDelete, canModifyReport,
    viewingReport, setViewingReport
  } = useCenterIssueReports();

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, severityFilter, statusFilter, search, selectedEventId]);

  const totalEntries = displayedReports.length;
  const totalPages = Math.ceil(totalEntries / perPage) || 1;
  const paginatedReports = displayedReports.slice((currentPage - 1) * perPage, currentPage * perPage);

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
      case 'low': return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
      default: return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      case 'closed': return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
      default: return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const closedCount = displayedReports.filter(r => r.status === 'closed').length;

  const stats = (
    <ReportsSummaryCards
      openCount={openCount}
      inProgressCount={inProgressCount}
      resolvedCount={resolvedCount}
      closedCount={closedCount}
      criticalCount={criticalCount}
      highCount={highCount}
      mediumCount={mediumCount}
      lowCount={lowCount}
    />
  );

  const tabs = (
    <TableTabs
      tabs={[
        { key: "all", label: "All" },
        { key: "open", label: "Open" },
        { key: "in_progress", label: "In Progress" },
        { key: "resolved", label: "Resolved" },
        { key: "closed", label: "Closed" },
      ]}
      activeTab={statusFilter || "all"}
      onChange={(key) => {
        setStatusFilter(key === "all" ? "" : key);
      }}
    />
  );

  return (
    <div className="min-h-screen font-sans text-left pb-24 relative">
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border mb-4 ${
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

      <TableLayout
        title="Evacuation Center Issues"
        badgeText={`${totalEntries} Reports`}
        subtitle="Track and resolve evacuation center facility, health, and safety incidents"
        onExport={() => {
          const csvHeader = "Report ID,Title,Category,Severity,Status,Center,Reported By\n";
          const csvRows = displayedReports
            .map((r) => `${r.report_id},"${r.title || ''}",${r.category || ''},${r.severity || ''},${r.status || ''},"${r.center?.name || ''}","${r.reporter?.name || r.reported_by_user?.name || ''}"`)
            .join("\n");
          const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "issue_reports.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        onAdd={canCreate ? openCreateModal : undefined}
        addLabel="Report Issue"
        stats={stats}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={totalEntries}
            perPage={perPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        }
      >
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
          displayedReports={paginatedReports}
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
          setViewingReport={setViewingReport}
        />
      </TableLayout>

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

      <ViewDetailsModal
        report={viewingReport}
        onClose={() => setViewingReport(null)}
        getCategoryIcon={getCategoryIcon}
        getCategoryLabel={getCategoryLabel}
        getSeverityClass={getSeverityClass}
        getStatusClass={getStatusClass}
      />

      {/* ─── Floating Action Button ─── */}
      {canCreate && (
        <AnimatedFAB onClick={openCreateModal} icon={Plus} label="Report Issue" />
      )}
    </div>
  );
}