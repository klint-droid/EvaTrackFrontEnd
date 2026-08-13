import { useEffect, useState } from 'react';
import { getResourceRequests } from '../api/resourceRequests/getResourceRequests';
import { getUrgencyLevels } from '../api/resourceRequests/getUrgencyLevels';
import { createResourceRequest } from '../api/resourceRequests/createResourceRequest';
import { updateResourceRequestStatus } from '../api/resourceRequests/updateResourceRequestStatus';
import { deleteResourceRequest } from '../api/resourceRequests/deleteResourceRequest';
import { getCenters } from '../api/evacuation/getCenters';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';
import { useAlert } from '../context/AlertContext';

interface FormState {
  request_type: string;
  resource_type: string;
  quantity: number | string;
  urgency_id: string;
  description: string;
  target_agency: string;
  evacuation_center_id: string;
}

const EMPTY_FORM: FormState = {
  request_type: 'resource',
  resource_type: '',
  quantity: 1,
  urgency_id: '',
  description: '',
  target_agency: 'ResQperation',
  evacuation_center_id: '',
};

export const useResourceRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    pending: 0, acknowledged: 0, approved: 0, rejected: 0, delivered_24h: 0,
    critical: 0, high: 0, medium: 0, low: 0,
  });

  const [urgencyLevels, setUrgencyLevels] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const { showConfirm } = useAlert();

  const canUpdateStatus: boolean = isAdmin() || isSuperAdmin();
  const canCreate: boolean = isAdmin() || isSuperAdmin() || isPersonnel();

  const showMessage = (text: string, type: string = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchUrgencyLevels = async () => {
    try {
      const res = await getUrgencyLevels();
      const levels = res.data || [];
      setUrgencyLevels(levels);
      if (levels.length > 0 && !form.urgency_id) {
        setForm(prev => ({ ...prev, urgency_id: String(levels[0].urgency_id) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCenters = async () => {
    try {
      const res: any = await getCenters();
      setCenters(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveEvents = async () => {
    try {
      const res: any = await getEvents();
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
        status: statusFilter ? (statusFilter as any) : undefined,
        request_type: typeFilter ? (typeFilter as any) : undefined,
      } as any);
      setRequests(res.data || []);
      setSummary(res.summary || {});
    } catch (err: any) {
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

  const displayedRequests = (selectedEventId === "all" || selectedEventId === "all_history" || !selectedEventId)
    ? requests
    : requests.filter(req => {
        const evt = activeEvents.find(e => e.event_id === selectedEventId);
        if (!evt) return true;

        if (req.center?.current_event_id === selectedEventId) return true;

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

  const criticalCount = selectedEventId === "all_history"
    ? summary.critical || 0
    : displayedRequests.filter(r => r.urgency_level?.urgency_key === 'critical').length;

  const highCount = selectedEventId === "all_history"
    ? summary.high || 0
    : displayedRequests.filter(r => r.urgency_level?.urgency_key === 'high').length;

  const mediumCount = selectedEventId === "all_history"
    ? summary.medium || 0
    : displayedRequests.filter(r => r.urgency_level?.urgency_key === 'medium').length;

  const lowCount = selectedEventId === "all_history"
    ? summary.low || 0
    : displayedRequests.filter(r => r.urgency_level?.urgency_key === 'low').length;

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
        urgency_id:    Number(form.urgency_id), // Cast to number if the API expects it
        description:   form.description,
        target_agency: form.target_agency || 'ResQperation',
        ...(form.evacuation_center_id && {
          evacuation_center_id: form.evacuation_center_id
        }),
      } as any);

      showMessage('Resource request submitted successfully.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      fetchRequests();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to submit request.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (requestId: string | number, status: string) => {
    try {
      await updateResourceRequestStatus(String(requestId), status as any);
      showMessage('Request status updated.');
      fetchRequests();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (requestId: string | number) => {
    showConfirm(
      'Delete this resource request?',
      async () => {
        try {
          await deleteResourceRequest(String(requestId));
          showMessage('Request deleted successfully.');
          fetchRequests();
        } catch (err: any) {
          showMessage(err.response?.data?.message || 'Failed to delete request.', 'error');
        }
      },
      'Delete Request',
      'danger',
      'Delete'
    );
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
    criticalCount, highCount, mediumCount, lowCount,
    openModal, handleSubmit, handleStatusChange, handleDelete, fetchRequests,
    viewingRequest, setViewingRequest
  };
};
