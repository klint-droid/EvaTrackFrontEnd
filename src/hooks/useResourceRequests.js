import { useEffect, useState } from 'react';
import { getResourceRequests } from '../api/resourceRequests/getResourceRequests';
import { getUrgencyLevels } from '../api/resourceRequests/getUrgencyLevels';
import { createResourceRequest } from '../api/resourceRequests/createResourceRequest';
import { updateResourceRequestStatus } from '../api/resourceRequests/updateResourceRequestStatus';
import { deleteResourceRequest } from '../api/resourceRequests/deleteResourceRequest';
import { getCenters } from '../api/evacuation/getCenters';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

const EMPTY_FORM = {
  request_type: 'resource',
  resource_type: '',
  quantity: 1,
  urgency_id: '',
  description: '',
  target_agency: 'ResQperation',
  evacuation_center_id: '',
};

export const useResourceRequests = () => {
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

  return {
    requests,
    summary,
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
  };
};
