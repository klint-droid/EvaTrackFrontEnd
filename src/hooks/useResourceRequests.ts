import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResourceRequests } from '../api/resourceRequests/getResourceRequests';
import { createResourceRequest } from '../api/resourceRequests/createResourceRequest';
import { updateResourceRequestStatus } from '../api/resourceRequests/updateResourceRequestStatus';
import { deleteResourceRequest } from '../api/resourceRequests/deleteResourceRequest';
import { getCenters } from '../api/evacuation/getCenters';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isPersonnel } from '../utils/roles';
import { useAlert } from '../context/AlertContext';

interface FormState {
  request_type: string;
  resource_type: string;
  quantity: number | string;
  description: string;
  target_agency: string;
  evacuation_center_id: string;
}

const EMPTY_FORM: FormState = {
  request_type: 'resource',
  resource_type: '',
  quantity: 1,
  description: '',
  target_agency: 'ResQperation',
  evacuation_center_id: '',
};

export const useResourceRequests = () => {
  const queryClient = useQueryClient();
  const { showConfirm } = useAlert();

  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [viewingRequest, setViewingRequest] = useState<any>(null);

  const canChooseCenter: boolean = isAdmin();
  const canUpdateStatus: boolean = false; // Admins cannot update status; handled by external system
  const canCreate: boolean = isAdmin() || isPersonnel();

  const showMessage = (text: string, type: string = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  // 2. Centers query (shared cache with UserManagement)
  const { data: centers = [] } = useQuery<any[]>({
    queryKey: ['centers'],
    queryFn: async () => {
      const res: any = await getCenters();
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
    enabled: canChooseCenter,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Events query (shared cache with EventManagement)
  const { data: activeEvents = [] } = useQuery<any[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res: any = await getEvents();
      return res.data || res || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // 4. Resource requests query
  const { 
    data: resourceRequestsData = { data: [], summary: {} } as any,
    isLoading: loading,
  } = useQuery<any>({
    queryKey: ['resourceRequests', search, statusFilter, typeFilter],
    queryFn: async () => {
      const res = await getResourceRequests({
        q: search || undefined,
        status: statusFilter ? (statusFilter as any) : undefined,
        request_type: typeFilter ? (typeFilter as any) : undefined,
      } as any);
      return res;
    },
    staleTime: 1000 * 30, // 30 seconds navigation cache
  });

  const requests: any[] = resourceRequestsData?.data || [];
  const summary: any = resourceRequestsData?.summary || {
    pending: 0, acknowledged: 0, approved: 0, rejected: 0, delivered_24h: 0,
    critical: 0, high: 0, medium: 0, low: 0,
  };

  // Create Request Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await createResourceRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resourceRequests'] });
      showMessage('Resource request submitted successfully.');
      setModalOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err: any) => {
      showMessage(err.response?.data?.message || 'Failed to submit request.', 'error');
    }
  });

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string | number, status: string }) => {
      return await updateResourceRequestStatus(String(requestId), status as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resourceRequests'] });
      showMessage('Request status updated.');
    },
    onError: (err: any) => {
      showMessage(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (requestId: string | number) => {
      return await deleteResourceRequest(String(requestId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resourceRequests'] });
      showMessage('Request deleted successfully.');
    },
    onError: (err: any) => {
      showMessage(err.response?.data?.message || 'Failed to delete request.', 'error');
    }
  });

  const fetchRequests = () => {
    return queryClient.invalidateQueries({ queryKey: ['resourceRequests'] });
  };

  const displayedRequests = (selectedEventId === "all" || selectedEventId === "all_history" || !selectedEventId)
    ? requests
    : requests.filter((req: any) => {
        const evt = activeEvents.find((e: any) => e.event_id === selectedEventId);
        if (!evt) return true;

        if (req.center?.current_event_id === selectedEventId) return true;

        const reqTime = new Date(req.created_at).getTime();
        const startTime = new Date(evt.started_at).getTime();
        const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
        return reqTime >= startTime && reqTime <= endTime;
      });

  const pendingCount = selectedEventId === "all_history"
    ? summary.pending || 0
    : displayedRequests.filter((r: any) => r.status?.status_key === 'pending' || r.status === 'pending').length;

  const acknowledgedCount = selectedEventId === "all_history"
    ? summary.acknowledged || 0
    : displayedRequests.filter((r: any) => r.status?.status_key === 'acknowledged' || r.status === 'acknowledged').length;

  const deliveredCount = selectedEventId === "all_history"
    ? summary.delivered_24h || 0
    : displayedRequests.filter((r: any) => r.status?.status_key === 'delivered' || r.status === 'delivered').length;

  const openModal = () => {
    setForm({
      ...EMPTY_FORM,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.resource_type || !form.quantity) {
      showMessage('Please complete all required fields.', 'error');
      return;
    }

    if (canChooseCenter && !form.evacuation_center_id) {
      showMessage('Please select an evacuation center.', 'error');
      return;
    }

    await createMutation.mutateAsync({
      request_type:  form.request_type,
      resource_type: form.resource_type,
      quantity:      Number(form.quantity),
      description:   form.description,
      target_agency: form.target_agency || 'ResQperation',
      ...(form.evacuation_center_id && {
        evacuation_center_id: form.evacuation_center_id
      }),
    } as any);
  };

  const handleStatusChange = async (requestId: string | number, status: string) => {
    await updateStatusMutation.mutateAsync({ requestId, status });
  };

  const handleDelete = async (requestId: string | number) => {
    showConfirm(
      'Delete this resource request?',
      async () => {
        await deleteMutation.mutateAsync(requestId);
      },
      'Delete Request',
      'danger',
      'Delete'
    );
  };

  return {
    requests,
    summary,
    centers,
    activeEvents,
    selectedEventId, setSelectedEventId,
    loading,
    saving: createMutation.isPending,
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
  };
};
