import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Wrench, HeartPulse, Shield, FileWarning } from 'lucide-react';

import { getCenterIssueReports } from '../api/centerIssueReports/getCenterIssueReports';
import { createCenterIssueReport } from '../api/centerIssueReports/createCenterIssueReport';
import { updateCenterIssueReport } from '../api/centerIssueReports/updateCenterIssueReport';
import { updateCenterIssueReportStatus } from '../api/centerIssueReports/updateCenterIssueReportStatus';
import { deleteCenterIssueReport } from '../api/centerIssueReports/deleteCenterIssueReport';

import { getUser } from '../api/auth/getUser';
import { getCenters } from '../api/evacuation/getCenters';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

import ReportsHeader from '../components/centerIssueReports/ReportsHeader';
import ReportsSummaryCards from '../components/centerIssueReports/ReportsSummaryCards';
import ReportsTable from '../components/centerIssueReports/ReportsTable';
import ReportModal from '../components/centerIssueReports/ReportModal';

const EMPTY_FORM = {
  evacuation_center_id: '',
  category: 'incident',
  title: '',
  description: '',
  severity: 'medium',
};

const CATEGORY_OPTIONS = [
  { value: 'incident', label: 'Incident' },
  { value: 'facility_issue', label: 'Facility Issue' },
  { value: 'health_issue', label: 'Health Issue' },
  { value: 'safety_issue', label: 'Safety Issue' },
  { value: 'other', label: 'Other' },
];

export default function CenterIssueReports() {
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
      case 'low': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      case 'closed': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <ReportsHeader canCreate={canCreate} openCreateModal={openCreateModal} />

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border ${
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

      <ReportsSummaryCards
        openCount={openCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        criticalCount={criticalCount}
      />

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
        displayedReports={displayedReports}
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
      />

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
    </div>
  );
}