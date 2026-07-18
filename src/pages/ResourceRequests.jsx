import { AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import RequestsSummaryCards from '../components/resourceRequests/RequestsSummaryCards';
import RequestsTable from '../components/resourceRequests/RequestsTable';
import RequestModal from '../components/resourceRequests/RequestModal';
import { useResourceRequests } from '../hooks/useResourceRequests';
import ViewRequestDetailsModal from '../components/resourceRequests/ViewRequestDetailsModal';
import { TableLayout } from '../components/ui/TableLayout';
import { TableTabs } from '../components/ui/TableTabs';
import { Pagination } from '../components/ui/Pagination';
import AnimatedFAB from '../components/ui/AnimatedFAB';

export default function ResourceRequests() {
  const {
    requests,
    urgencyLevels,
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
    canUpdateStatus, canCreate,
    displayedRequests,
    pendingCount, acknowledgedCount, deliveredCount,
    openModal, handleSubmit, handleStatusChange, handleDelete, fetchRequests,
    viewingRequest, setViewingRequest
  } = useResourceRequests();

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, search, selectedEventId]);

  const totalEntries = displayedRequests.length;
  const totalPages = Math.ceil(totalEntries / perPage) || 1;
  const paginatedRequests = displayedRequests.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusClass = (statusKey) => {
    switch (statusKey) {
      case 'pending':      return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'acknowledged': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'approved':     return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'rejected':     return 'bg-red-50 text-red-700 border-red-100';
      case 'delivered':    return 'bg-green-50 text-green-700 border-green-100';
      default:             return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  const getUrgencyClass = (key) => {
    switch (key) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'high':     return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'medium':   return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low':      return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
      default:         return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const approvedCount = displayedRequests.filter(r => r.status?.status_key === 'approved' || r.status === 'approved').length;
  const rejectedCount = displayedRequests.filter(r => r.status?.status_key === 'rejected' || r.status === 'rejected').length;

  const stats = (
    <RequestsSummaryCards
      pendingCount={pendingCount}
      acknowledgedCount={acknowledgedCount}
      approvedCount={approvedCount}
      rejectedCount={rejectedCount}
      deliveredCount={deliveredCount}
      loading={loading}
      requests={requests}
    />
  );

  const tabs = (
    <TableTabs
      tabs={[
        { key: "all", label: "All" },
        { key: "pending", label: "Pending" },
        { key: "acknowledged", label: "Acknowledged" },
        { key: "approved", label: "Approved" },
        { key: "rejected", label: "Rejected" },
        { key: "delivered", label: "Delivered" },
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
        <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-4 ${
          message.type === 'error'
            ? 'bg-red-50 border-red-100 text-red-700'
            : 'bg-green-50 border-green-100 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <p className="text-xs font-black uppercase tracking-wide">{message.text}</p>
        </div>
      )}

      <TableLayout
        title="Resource Requests"
        stats={stats}
        tabs={tabs}
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
        <RequestsTable 
          search={search}
          setSearch={setSearch}
          fetchRequests={fetchRequests}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          activeEvents={activeEvents}
          loading={loading}
          displayedRequests={paginatedRequests}
          canUpdateStatus={canUpdateStatus}
          handleStatusChange={handleStatusChange}
          getStatusClass={getStatusClass}
          getUrgencyClass={getUrgencyClass}
          formatDateTime={formatDateTime}
          handleDelete={handleDelete}
          setViewingRequest={setViewingRequest}
        />
      </TableLayout>

      <RequestModal 
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        form={form}
        setForm={setForm}
        urgencyLevels={urgencyLevels}
        canUpdateStatus={canUpdateStatus}
        centers={centers}
        handleSubmit={handleSubmit}
        saving={saving}
      />

      <ViewRequestDetailsModal 
        request={viewingRequest}
        onClose={() => setViewingRequest(null)}
        getUrgencyClass={getUrgencyClass}
        getStatusClass={getStatusClass}
      />

      {/* ─── Floating Action Button ─── */}
      {canCreate && (
        <AnimatedFAB onClick={openModal} icon={Plus} label="New Request" />
      )}
    </div>
  );
}