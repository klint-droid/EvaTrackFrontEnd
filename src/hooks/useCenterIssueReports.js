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

const EMPTY_FORM = {
  evacuation_center_id: '',
  category: 'incident',
  title: '',
  description: '',
  severity: 'medium',
};

export const useCenterIssueReports = () => {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [centers, setCenters] = useState([]);

  const [summary, setSummary] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("all");

  const [message, setMessage] = useState(null);

  const canCreate = isAdmin() || isSuperAdmin() || isPersonnel();
  const canUpdateStatus = isAdmin() || isSuperAdmin();
  const canChooseCenter = isAdmin() || isSuperAdmin();

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const normalizeArray = (res) => {
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
      const res = await getEvents();
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
        category: categoryFilter || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      });

      setReports(res.data || []);
      setSummary(res.summary || {});
    } catch (err) {
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

  const openEditModal = (report) => {
    setEditingReport(report);
    setForm({
      evacuation_center_id: report.evacuation_center_id || '',
      category: report.category || report.category_key || 'incident',
      title: report.title || '',
      description: report.description || '',
      severity: report.severity || report.severity_key || 'medium',
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
      const payload = {
        category: form.category,
        title: form.title,
        description: form.description,
        severity: form.severity,
      };

      if (canChooseCenter) {
        payload.evacuation_center_id = form.evacuation_center_id;
      }

      if (editingReport) {
        await updateCenterIssueReport(editingReport.report_id, payload);
        showMessage('Issue report updated successfully.');
      } else {
        await createCenterIssueReport(payload);
        showMessage('Issue report submitted successfully.');
      }

      setModalOpen(false);
      setEditingReport(null);
      setForm(EMPTY_FORM);
      fetchReports();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to save issue report.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (reportId, status) => {
    try {
      await updateCenterIssueReportStatus(reportId, status);
      showMessage('Issue report status updated.');
      fetchReports();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (reportId) => {
    if (!confirm('Delete this issue report?')) return;
    try {
      await deleteCenterIssueReport(reportId);
      showMessage('Issue report deleted successfully.');
      fetchReports();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete issue report.', 'error');
    }
  };

  const canModifyReport = (report) => {
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
