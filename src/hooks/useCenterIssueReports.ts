import { useEffect, useState } from 'react';
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
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);

  const [summary, setSummary] = useState<any>({
    open: 0,
    in_progress: 0,
    resolved: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const { showConfirm } = useAlert();

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

  const fetchUser = async () => {
    try {
      const res = await getUser();
      setUser(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCenters = async () => {
    if (!canChooseCenter) return;

    try {
      const res = await getCenters();
      setCenters(normalizeArray(res));
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getCenterIssueReports({
        q: search || undefined,
        category: categoryFilter ? (categoryFilter as any) : undefined,
        severity: severityFilter ? (severityFilter as any) : undefined,
        status: statusFilter ? (statusFilter as any) : undefined,
      });

      setReports(res.data || []);
      setSummary(res.summary || {});
    } catch (err: any) {
      console.error(err);
      showMessage(err.response?.data?.message || 'Failed to load center issue reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCenters();
    fetchActiveEvents();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, severityFilter, statusFilter]);

  const activeEventsList = activeEvents.filter(e => !e.ended_at);

  const displayedReports = selectedEventId === "all_history"
    ? reports
    : selectedEventId === "all"
      ? reports.filter(report => {
          const isCenterAssignedToActiveEvent = report.center?.current_event_id &&
            activeEventsList.some(evt => evt.event_id === report.center.current_event_id);
          if (isCenterAssignedToActiveEvent) return true;

          const reportTime = new Date(report.created_at).getTime();
          return activeEventsList.some(evt => {
            const startTime = new Date(evt.started_at).getTime();
            const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
            return reportTime >= startTime && reportTime <= endTime;
          });
        })
      : reports.filter(report => {
          const evt = activeEvents.find(e => e.event_id === selectedEventId);
          if (!evt) return false;

          if (!evt.ended_at) {
            return report.center?.current_event_id === selectedEventId;
          }

          const reportTime = new Date(report.created_at).getTime();
          const startTime = new Date(evt.started_at).getTime();
          const endTime = evt.ended_at ? new Date(evt.ended_at).getTime() : Infinity;
          return reportTime >= startTime && reportTime <= endTime;
        });

  const openCount = selectedEventId === "all_history"
    ? summary.open || 0
    : displayedReports.filter(r => r.status === 'open').length;

  const inProgressCount = selectedEventId === "all_history"
    ? summary.in_progress || 0
    : displayedReports.filter(r => r.status === 'in_progress').length;

  const resolvedCount = selectedEventId === "all_history"
    ? summary.resolved || 0
    : displayedReports.filter(r => r.status === 'resolved').length;

  const criticalCount = selectedEventId === "all_history"
    ? summary.critical || 0
    : displayedReports.filter(r => r.severity === 'critical').length;

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

    try {
      setSaving(true);
      
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

      if (editingReport) {
        await updateCenterIssueReport(editingReport.report_id, payloadToSubmit);
        showMessage('Issue report updated successfully.');
      } else {
        await createCenterIssueReport(payloadToSubmit);
        showMessage('Issue report submitted successfully.');
      }

      setModalOpen(false);
      setEditingReport(null);
      setForm(EMPTY_FORM);
      fetchReports();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to save issue report.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (reportId: string | number, status: string) => {
    try {
      await updateCenterIssueReportStatus(reportId as any, status as any);
      showMessage('Issue report status updated.');
      fetchReports();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (reportId: string | number) => {
    showConfirm(
      'Delete this issue report?',
      async () => {
        try {
          await deleteCenterIssueReport(reportId as any);
          showMessage('Issue report deleted successfully.');
          fetchReports();
        } catch (err: any) {
          showMessage(err.response?.data?.message || 'Failed to delete issue report.', 'error');
        }
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
    saving,
    modalOpen, setModalOpen,
    editingReport, setEditingReport,
    viewingReport, setViewingReport,
    showFilters, setShowFilters,
    form, setForm,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    severityFilter, setSeverityFilter,
    statusFilter, setStatusFilter,
    activeEvents, setActiveEvents,
    selectedEventId, setSelectedEventId,
    message,
    canCreate, canUpdateStatus, canChooseCenter,
    displayedReports,
    openCount, inProgressCount, resolvedCount, criticalCount,
    fetchReports, openCreateModal, openEditModal, handleSubmit,
    handleStatusChange, handleDelete, canModifyReport
  };
};
