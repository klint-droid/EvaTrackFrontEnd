import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Loader2,
  X,
  Edit3,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Wrench,
  HeartPulse,
  Shield,
  FileWarning,
} from 'lucide-react';

import { getCenterIssueReports } from '../api/centerIssueReports/getCenterIssueReports';
import { createCenterIssueReport } from '../api/centerIssueReports/createCenterIssueReport';
import { updateCenterIssueReport } from '../api/centerIssueReports/updateCenterIssueReport';
import { updateCenterIssueReportStatus } from '../api/centerIssueReports/updateCenterIssueReportStatus';
import { deleteCenterIssueReport } from '../api/centerIssueReports/deleteCenterIssueReport';

import { getUser } from '../api/auth/getUser';
import { getCenters } from '../api/evacuation/getCenters';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

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

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

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
  const [form, setForm] = useState(EMPTY_FORM);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
  }, []);

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, severityFilter, statusFilter]);

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
      category: report.category || 'incident',
      title: report.title || '',
      description: report.description || '',
      severity: report.severity || 'medium',
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
      case 'facility_issue':
        return Wrench;
      case 'health_issue':
        return HeartPulse;
      case 'safety_issue':
        return Shield;
      case 'incident':
        return FileWarning;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'low':
        return 'bg-slate-50 text-slate-600 border-slate-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'closed':
        return 'bg-slate-50 text-slate-600 border-slate-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Center Issue Reports
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Report and monitor incidents, facility problems, health issues, and safety concerns inside evacuation centers.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            New Issue Report
          </button>
        )}
      </div>

      {/* Message */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open</p>
            <p className="text-2xl font-black text-slate-900">{summary.open || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Progress</p>
            <p className="text-2xl font-black text-slate-900">{summary.in_progress || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolved</p>
            <p className="text-2xl font-black text-slate-900">{summary.resolved || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical</p>
            <p className="text-2xl font-black text-slate-900">{summary.critical || 0}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <AlertTriangle size={17} className="text-blue-500" />
              Issue Report Log
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Submitted reports are tracked by center and severity.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchReports();
                }}
                placeholder="Search issue..."
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="">All Severity</option>
              {SEVERITY_OPTIONS.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              onClick={fetchReports}
              className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {[
                  'Issue',
                  'Category',
                  'Severity',
                  'Status',
                  'Center',
                  'Reported By',
                  'Created',
                  'Action',
                ].map(header => (
                  <th
                    key={header}
                    className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading issue reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-14 text-center text-slate-400 font-bold">
                    No issue reports found.
                  </td>
                </tr>
              ) : (
                reports.map(report => {
                  const CategoryIcon = getCategoryIcon(report.category);

                  return (
                    <tr key={report.report_id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">
                          {report.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {report.report_id}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                          {report.description}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-lg border bg-blue-50 text-blue-700 border-blue-100 capitalize">
                          <CategoryIcon size={12} />
                          {getCategoryLabel(report.category)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${getSeverityClass(report.severity)}`}
                        >
                          {report.severity}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {canUpdateStatus ? (
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.report_id, e.target.value)}
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase outline-none ${getStatusClass(report.status)}`}
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${getStatusClass(report.status)}`}
                          >
                            {report.status}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {report.center?.name || '—'}
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {report.reported_by?.name || '—'}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDateTime(report.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canModifyReport(report) && (
                            <button
                              onClick={() => openEditModal(report)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {canModifyReport(report) && report.status === 'open' && (
                            <button
                              onClick={() => handleDelete(report.report_id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                {editingReport ? 'Edit Issue Report' : 'New Issue Report'}
              </h2>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {canChooseCenter && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Evacuation Center
                  </label>
                  <select
                    value={form.evacuation_center_id}
                    onChange={(e) => setForm({ ...form, evacuation_center_id: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  >
                    <option value="">Select center</option>
                    {centers.map(center => (
                      <option key={center.evacuation_center_id} value={center.evacuation_center_id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  {CATEGORY_OPTIONS.map(item => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Severity
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  {SEVERITY_OPTIONS.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Comfort room water supply problem"
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the incident, issue, or concern..."
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-slate-400"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingReport ? 'Save Changes' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}