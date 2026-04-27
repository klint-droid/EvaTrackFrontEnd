import { useEffect, useState } from 'react';
import {
  Plus,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  X,
  Loader2,
  Trash2,
  ShieldAlert,
  Users,
  Clock,
} from 'lucide-react';

import { getResourceRequests } from '../api/resourceRequests/getResourceRequests';
import { getUrgencyLevels } from '../api/resourceRequests/getUrgencyLevels';
import { createResourceRequest } from '../api/resourceRequests/createResourceRequest';
import { updateResourceRequestStatus } from '../api/resourceRequests/updateResourceRequestStatus';
import { deleteResourceRequest } from '../api/resourceRequests/deleteResourceRequest';

import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

const EMPTY_FORM = {
  request_type: 'resource',
  resource_type: '',
  quantity: 1,
  urgency_id: '',
  description: '',
  target_agency: 'ResQperation',
};

const STATUS_OPTIONS = [
  'pending',
  'acknowledged',
  'approved',
  'rejected',
  'delivered',
];

export default function ResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    acknowledged: 0,
    approved: 0,
    rejected: 0,
    delivered_24h: 0,
  });

  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
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
        setForm(prev => ({
          ...prev,
          urgency_id: levels[0].urgency_id,
        }));
      }
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
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

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

    try {
      setSaving(true);

      await createResourceRequest({
        request_type: form.request_type,
        resource_type: form.resource_type,
        quantity: Number(form.quantity),
        urgency_id: form.urgency_id,
        description: form.description,
        target_agency: form.target_agency || 'ResQperation',
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'acknowledged':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'approved':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getUrgencyClass = (key) => {
    switch (key) {
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
            Resource Requests
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Request and monitor emergency supplies and personnel assistance.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            New Request
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
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <p className="text-xs font-black uppercase tracking-wide">{message.text}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Pending Requests
            </p>
            <p className="text-2xl font-black text-slate-900">{summary.pending || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Acknowledged
            </p>
            <p className="text-2xl font-black text-slate-900">{summary.acknowledged || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Delivered 24h
            </p>
            <p className="text-2xl font-black text-slate-900">{summary.delivered_24h || 0}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Package size={17} className="text-blue-500" />
              Request History
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Submitted requests are routed to ResQperation.
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
                  if (e.key === 'Enter') fetchRequests();
                }}
                placeholder="Search request..."
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="">All Types</option>
              <option value="resource">Resources</option>
              <option value="personnel">Personnel</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              onClick={fetchRequests}
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
                  'Resource Type',
                  'Type',
                  'Quantity',
                  'Urgency',
                  'Status',
                  'Center',
                  'Timestamp',
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
                    Loading resource requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-14 text-center text-slate-400 font-bold">
                    No resource requests found.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.request_id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">
                        {req.resource_type}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {req.request_id}
                      </p>
                      {req.description && (
                        <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                          {req.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-lg border bg-blue-50 text-blue-700 border-blue-100 capitalize">
                        {req.request_type === 'personnel' ? <Users size={12} /> : <Package size={12} />}
                        {req.request_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {req.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${
                          getUrgencyClass(req.urgency?.urgency_key)
                        }`}
                      >
                        {req.urgency?.urgency_label || '—'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {canUpdateStatus ? (
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase outline-none ${getStatusClass(req.status)}`}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${getStatusClass(req.status)}`}
                        >
                          {req.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {req.center?.name || '—'}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDateTime(req.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(req.request_id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Resource Estimation Placeholder */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black">Smart Resource Estimation</h2>
            <p className="text-xs text-slate-400">
              Use center population and request history to estimate needs.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300">
          This section can later compute food packs, water, hygiene kits, blankets, and personnel needs based on current evacuee count.
        </p>
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
                New Resource Request
              </h2>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForm({ ...form, request_type: 'resource' })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    form.request_type === 'resource'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <Package size={20} />
                  <p className="text-xs font-black mt-2">Resources</p>
                  <p className="text-[10px] font-medium opacity-70">Supplies and materials</p>
                </button>

                <button
                  onClick={() => setForm({ ...form, request_type: 'personnel' })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    form.request_type === 'personnel'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <Users size={20} />
                  <p className="text-xs font-black mt-2">Personnel</p>
                  <p className="text-[10px] font-medium opacity-70">Additional responders</p>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {form.request_type === 'resource' ? 'Resource Type' : 'Personnel Need'}
                </label>
                <input
                  value={form.resource_type}
                  onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                  placeholder={form.request_type === 'resource' ? 'e.g. Food Packs, Water, Medicine' : 'e.g. Medical Personnel, Security, Social Worker'}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Urgency
                  </label>
                  <select
                    value={form.urgency_id}
                    onChange={(e) => setForm({ ...form, urgency_id: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  >
                    <option value="">Select urgency</option>
                    {urgencyLevels.map(level => (
                      <option key={level.urgency_id} value={level.urgency_id}>
                        {level.urgency_label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the need, shortage, or personnel support required..."
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Request To
                </label>
                <input
                  value={form.target_agency}
                  onChange={(e) => setForm({ ...form, target_agency: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
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
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}