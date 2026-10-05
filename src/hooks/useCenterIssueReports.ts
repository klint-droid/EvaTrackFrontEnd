import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCenterIssueReports } from '../api/centerIssueReports/getCenterIssueReports';
import { createCenterIssueReport } from '../api/centerIssueReports/createCenterIssueReport';
import { updateCenterIssueReport } from '../api/centerIssueReports/updateCenterIssueReport';
import { updateCenterIssueReportStatus } from '../api/centerIssueReports/updateCenterIssueReportStatus';
import { deleteCenterIssueReport } from '../api/centerIssueReports/deleteCenterIssueReport';
import { getUser } from '../api/auth/getUser';
import { getCenters } from '../api/evacuation/getCenters';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';
import { useAlert } from '../context/AlertContext';

interface FormState {
  evacuation_center_id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  attachment: File | null;
}

const EMPTY_FORM: FormState = {
  evacuation_center_id: '',
  category: 'incident',
  title: '',
  description: '',
  severity: 'medium',
  attachment: null,
};

export const useCenterIssueReports = () => {
  const queryClient = useQueryClient();
  const { showConfirm } = useAlert();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const canCreate: boolean = isAdmin() || isSuperAdmin() || isPersonnel();
  const canUpdateStatus: boolean = isAdmin() || isSuperAdmin();
  const canChooseCenter: boolean = isAdmin() || isSuperAdmin();

  const showMessage = (text: string, type: string = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const normalizeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  // 1. User Query (Cached)
  const { data: user = null } = useQuery<any>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await getUser();
      return res.data || res;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Centers Query (Cached)
  const { data: centers = [] } = useQuery<any[]>({
    queryKey: ['centers'],
    queryFn: async () => {
      const res = await getCenters();
      return normalizeArray(res);
    },
    enabled: canChooseCenter,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Events Query (Cached)
  const { data: activeEvents = [] } = useQuery<any[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res: any = await getEvents();
      return res.data || res || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // 4. Center Issue Reports Query
  const { 
    data: reportsResponse = { data: [], summary: {} } as any,
    isLoading: loading,
  } = useQuery<any>({
    queryKey: ['centerIssueReports', search, categoryFilter, severityFilter, statusFilter],
    queryFn: async () => {
      const res = await getCenterIssueReports({
        q: search || undefined,
        category: categoryFilter ? (categoryFilter as any) : undefined,
        severity: severityFilter ? (severityFilter as any) : undefined,
        status: statusFilter ? (statusFilter as any) : undefined,
      });
      return res;
    },
  });

  const reports: any[] = reportsResponse?.data || [];
  const summary: any = reportsResponse?.summary || {
    open: 0, in_progress: 0, resolved: 0,
    critical: 0, high: 0, medium: 0, low: 0,
  };

  // Create / Update Mutation
  const saveReportMutation = useMutation({
    mutationFn: async (payloadToSubmit: any) => {
      if (editingReport) {
        return await updateCenterIssueReport(editingReport.report_id, payloadToSubmit);
      } else {
        return await createCenterIssueReport(payloadToSubmit);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centerIssueReports'] });
      showMessage(editingReport ? 'Issue report updated successfully.' : 'Issue report submitted successfully.');
      setModalOpen(false);
      setEditingReport(null);
      setForm(EMPTY_FORM);
    },
    onError: (err: any) => {
      showMessage(err.response?.data?.message || 'Failed to save issue report.', 'error');
    }
  });

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string | number, status: string }) => {
      return await updateCenterIssueReportStatus(reportId as any, status as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centerIssueReports'] });
      showMessage('Issue report status updated.');
    },
    onError: (err: any) => {
      showMessage(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (reportId: string | number) => {
      return await deleteCenterIssueReport(reportId as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centerIssueReports'] });
      showMessage('Issue report deleted successfully.');
    },
    onError: (err: any) => {
      showMessage(err.response?.data?.message || 'Failed to delete issue report.', 'error');
    }
  });

  const fetchReports = () => {
    return queryClient.invalidateQueries({ queryKey: ['centerIssueReports'] });
  };

  const displayedReports = (selectedEventId === "all" || selectedEventId === "all_history" || !selectedEventId)
    ? reports
    : reports.filter((report: any) => {
        const evt = activeEvents.find((e: any) => e.event_id === selectedEventId);
        if (!evt) return true;

        if (report.center?.current_event_id === selectedEventId) return true;

        const reportTime = new Date(report.created_at).getTime();
        const startTime = new Date(evt.started_at).getTime();
        const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
        return reportTime >= startTime && reportTime <= endTime;
      });

  const getStatusKey = (r: any) => typeof r.status === 'object' ? r.status?.status_key : r.status;
  const getSeverityKey = (r: any) => typeof r.severityLevel === 'object' ? r.severityLevel?.severity_key : (typeof r.severity === 'object' ? r.severity?.severity_key : r.severity);

  const openCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.open !== undefined ? summary.open : displayedReports.filter(r => getStatusKey(r) === 'open').length)
    : displayedReports.filter(r => getStatusKey(r) === 'open').length;

  const inProgressCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.in_progress !== undefined ? summary.in_progress : displayedReports.filter(r => getStatusKey(r) === 'in_progress').length)
    : displayedReports.filter(r => getStatusKey(r) === 'in_progress').length;

  const resolvedCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.resolved !== undefined ? summary.resolved : displayedReports.filter(r => getStatusKey(r) === 'resolved').length)
    : displayedReports.filter(r => getStatusKey(r) === 'resolved').length;

  const criticalCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.critical !== undefined ? summary.critical : displayedReports.filter(r => getSeverityKey(r) === 'critical').length)
    : displayedReports.filter(r => getSeverityKey(r) === 'critical').length;

  const highCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.high !== undefined ? summary.high : displayedReports.filter(r => getSeverityKey(r) === 'high').length)
    : displayedReports.filter(r => getSeverityKey(r) === 'high').length;

  const mediumCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.medium !== undefined ? summary.medium : displayedReports.filter(r => getSeverityKey(r) === 'medium').length)
    : displayedReports.filter(r => getSeverityKey(r) === 'medium').length;

  const lowCount = (selectedEventId === "all" || selectedEventId === "all_history")
    ? (summary.low !== undefined ? summary.low : displayedReports.filter(r => getSeverityKey(r) === 'low').length)
    : displayedReports.filter(r => getSeverityKey(r) === 'low').length;

  const openCreateModal = () => {
    setEditingReport(null);
    setForm({
      ...EMPTY_FORM,
      evacuation_center_id: centers[0]?.evacuation_center_id || '',
    });
    setModalOpen(true);
  };

  const openEditModal = (report: any) => {
    setEditingReport(report);
    setForm({
      evacuation_center_id: report.evacuation_center_id || '',
      category: report.category || report.category_key || 'incident',
      title: report.title || '',
      description: report.description || '',
      severity: report.severity || report.severity_key || 'medium',
      attachment: null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.category || !form.title || !form.description || !form.severity) {
      showMessage('Please complete all required fields.', 'error');
      return;
    }

    if (canChooseCenter && !form.evacuation_center_id) {
      showMessage('Please select an evacuation center.', 'error');
      return;
    }

    let payloadToSubmit: any;

    if (form.attachment) {
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('severity', form.severity);
      if (canChooseCenter && form.evacuation_center_id) {
          formData.append('evacuation_center_id', form.evacuation_center_id);
      }
      formData.append('attachment', form.attachment);
      payloadToSubmit = formData;
    } else {
      payloadToSubmit = {
        category: form.category,
        title: form.title,
        description: form.description,
        severity: form.severity,
      };
      if (canChooseCenter) {
        payloadToSubmit.evacuation_center_id = form.evacuation_center_id;
      }
    }

    await saveReportMutation.mutateAsync(payloadToSubmit);
  };

  const handleStatusChange = async (reportId: string | number, status: string) => {
    await updateStatusMutation.mutateAsync({ reportId, status });
  };

  const handleDelete = async (reportId: string | number) => {
    showConfirm(
      'Delete this issue report?',
      async () => {
        await deleteMutation.mutateAsync(reportId);
      },
      'Delete Report',
      'danger',
      'Delete'
    );
  };

  const canModifyReport = (report: any): boolean => {
    if (isAdmin() || isSuperAdmin()) return true;
    if (isPersonnel()) {
      return report.status === 'open' && report.reported_by === user?.user_id;
    }
    return false;
  };

  return {
    user,
    reports,
    centers,
    summary,
    loading,
    saving: saveReportMutation.isPending,
    modalOpen, setModalOpen,
    editingReport, setEditingReport,
    viewingReport, setViewingReport,
    showFilters, setShowFilters,
    form, setForm,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter,
    activeEvents,
    setActiveEvents: () => {},
    selectedEventId, setSelectedEventId,
    message,
    canCreate, canUpdateStatus, canChooseCenter,
    displayedReports,
    openCount, inProgressCount, resolvedCount, criticalCount, highCount, mediumCount, lowCount,
    fetchReports, openCreateModal, openEditModal, handleSubmit,
    handleStatusChange, handleDelete, canModifyReport
  };
};
