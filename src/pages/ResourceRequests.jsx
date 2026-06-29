import { AlertCircle, CheckCircle2 } from 'lucide-react';
import RequestsHeader from '../components/resourceRequests/RequestsHeader';
import RequestsSummaryCards from '../components/resourceRequests/RequestsSummaryCards';
import RequestsTable from '../components/resourceRequests/RequestsTable';
import RequestModal from '../components/resourceRequests/RequestModal';
import { useResourceRequests } from '../hooks/useResourceRequests';

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
    openModal, handleSubmit, handleStatusChange, handleDelete, fetchRequests
  } = useResourceRequests();

  const getStatusClass = (statusKey) => {
    switch (statusKey) {
      case 'pending':      return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'acknowledged': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'approved':     return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'rejected':     return 'bg-red-50 text-red-700 border-red-100';
      case 'delivered':    return 'bg-green-50 text-green-700 border-green-100';
      default:             return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getUrgencyClass = (key) => {
    switch (key) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'high':     return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'medium':   return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low':      return 'bg-slate-50 text-slate-600 border-slate-100';
      default:         return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <RequestsHeader canCreate={canCreate} openModal={openModal} />

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          message.type === 'error'
            ? 'bg-red-50 border-red-100 text-red-700'
            : 'bg-green-50 border-green-100 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <p className="text-xs font-black uppercase tracking-wide">{message.text}</p>
        </div>
      )}

      <RequestsSummaryCards 
        pendingCount={pendingCount} 
        acknowledgedCount={acknowledgedCount} 
        deliveredCount={deliveredCount} 
        loading={loading} 
        requests={requests} 
      />

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
        displayedRequests={displayedRequests}
        canUpdateStatus={canUpdateStatus}
        handleStatusChange={handleStatusChange}
        getStatusClass={getStatusClass}
        getUrgencyClass={getUrgencyClass}
        formatDateTime={formatDateTime}
        handleDelete={handleDelete}
      />

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
    </div>
  );
}