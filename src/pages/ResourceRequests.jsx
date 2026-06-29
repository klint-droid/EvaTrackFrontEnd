import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { getResourceRequests } from '../api/resourceRequests/getResourceRequests';
import { getUrgencyLevels } from '../api/resourceRequests/getUrgencyLevels';
import { createResourceRequest } from '../api/resourceRequests/createResourceRequest';
import { updateResourceRequestStatus } from '../api/resourceRequests/updateResourceRequestStatus';
import { deleteResourceRequest } from '../api/resourceRequests/deleteResourceRequest';
import { getCenters } from '../api/evacuation/getCenters';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

import RequestsHeader from '../components/resourceRequests/RequestsHeader';
import RequestsSummaryCards from '../components/resourceRequests/RequestsSummaryCards';
import RequestsTable from '../components/resourceRequests/RequestsTable';
import RequestModal from '../components/resourceRequests/RequestModal';

const EMPTY_FORM = {
  request_type: 'resource',
  resource_type: '',
  quantity: 1,
  urgency_id: '',
  description: '',
  target_agency: 'ResQperation',
  evacuation_center_id: '',
};

export default function ResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0, acknowledged: 0, approved: 0, rejected: 0, delivered_24h: 0,
  });

  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [centers, setCenters] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [message, setMessage] = useState(null);

  const canUpdateStatus = isAdmin() || isSuperAdmin();
  const canCreate = isAdmin() || isSuperAdmin() || isPersonnel();

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchUrgencyLevels = async () => {
    try {
      const res = await getUrgencyLevels();
      const levels = res.data || [];
      setUrgencyLevels(levels);
      if (levels.length > 0 && !form.urgency_id) {
        setForm(prev => ({ ...prev, urgency_id: levels[0].urgency_id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCenters = async () => {
    try {
      const res = await getCenters();
      setCenters(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveEvents = async () => {
    try {
      const res = await getEvents();
      const list = res.data || res || [];
      setActiveEvents(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getResourceRequests({
        q: search || undefined,
        status: statusFilter || undefined,
        request_type: typeFilter || undefined,
      });
      setRequests(res.data || []);
      setSummary(res.summary || {});
    } catch (err) {
      console.error(err);
      showMessage(err.response?.data?.message || 'Failed to load resource requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgencyLevels();
    fetchActiveEvents();
    if (canUpdateStatus) fetchCenters();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const activeEventsList = activeEvents.filter(e => !e.ended_at);

  const displayedRequests = selectedEventId === "all_history"
    ? requests
    : selectedEventId === "all"
      ? requests.filter(req => {
          const isCenterAssignedToActiveEvent = req.center?.current_event_id &&
            activeEventsList.some(evt => evt.event_id === req.center.current_event_id);
          if (isCenterAssignedToActiveEvent) return true;

          const reqTime = new Date(req.created_at).getTime();
          return activeEventsList.some(evt => {
            const startTime = new Date(evt.started_at).getTime();
            const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
            return reqTime >= startTime && reqTime <= endTime;
          });
        })
      : requests.filter(req => {
          const evt = activeEvents.find(e => e.event_id === selectedEventId);
          if (!evt) return false;

          if (!evt.ended_at) {
            return req.center?.current_event_id === selectedEventId;
          }

          const reqTime = new Date(req.created_at).getTime();
          const startTime = new Date(evt.started_at).getTime();
          const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
          return reqTime >= startTime && reqTime <= endTime;
        });

  const pendingCount = selectedEventId === "all_history"
    ? summary.pending || 0
    : displayedRequests.filter(r => r.status?.status_key === 'pending' || r.status === 'pending').length;

  const acknowledgedCount = selectedEventId === "all_history"
    ? summary.acknowledged || 0
    : displayedRequests.filter(r => r.status?.status_key === 'acknowledged' || r.status === 'acknowledged').length;

  const deliveredCount = selectedEventId === "all_history"
    ? summary.delivered_24h || 0
    : displayedRequests.filter(r => r.status?.status_key === 'delivered' || r.status === 'delivered').length;

  const openModal = () => {
    setForm({
      ...EMPTY_FORM,
      urgency_id: urgencyLevels[0]?.urgency_id || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.resource_type || !form.quantity || !form.urgency_id) {
      showMessage('Please complete all required fields.', 'error');
      return;
    }

    if (canUpdateStatus && !form.evacuation_center_id) {
      showMessage('Please select an evacuation center.', 'error');
      return;
    }

    try {
      setSaving(true);
      await createResourceRequest({
        request_type:  form.request_type,
        resource_type: form.resource_type,
        quantity:      Number(form.quantity),
        urgency_id:    form.urgency_id,
        description:   form.description,
        target_agency: form.target_agency || 'ResQperation',
        ...(form.evacuation_center_id && {
          evacuation_center_id: form.evacuation_center_id
        }),
      });

      showMessage('Resource request submitted successfully.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to submit request.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (requestId, status) => {
    try {
      await updateResourceRequestStatus(requestId, status);
      showMessage('Request status updated.');
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (requestId) => {
    if (!confirm('Delete this resource request?')) return;
    try {
      await deleteResourceRequest(requestId);
      showMessage('Request deleted successfully.');
      fetchRequests();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete request.', 'error');
    }
  };

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