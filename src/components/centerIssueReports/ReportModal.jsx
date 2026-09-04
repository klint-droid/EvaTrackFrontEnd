import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Wrench, HeartPulse, Shield, FileWarning, AlertTriangle, 
  MapPin, UploadCloud, Loader2, Send 
} from 'lucide-react';

const CATEGORY_ITEMS = [
  { value: 'facility_issue', label: 'Facility', icon: Wrench },
  { value: 'health_issue',   label: 'Health',   icon: HeartPulse },
  { value: 'safety_issue',   label: 'Safety',   icon: Shield },
  { value: 'incident',       label: 'Incident', icon: FileWarning },
];

const SEVERITY_ITEMS = [
  { value: 'low',      label: 'Low',      color: 'border-slate-300 dark:border-slate-600 text-slate-500' },
  { value: 'medium',   label: 'Medium',   color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold' },
  { value: 'high',     label: 'High',     color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold' },
  { value: 'critical', label: 'Critical', color: 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold' },
];

export default function ReportModal({
  modalOpen, setModalOpen,
  editingReport, form, setForm,
  canChooseCenter, centers,
  handleSubmit, saving
}) {
  if (!modalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

      <div className="relative bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-[#1e2a3d] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e2a3d]">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {editingReport ? 'Update Issue Report' : 'Report Center Issue'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Identify concerns for immediate response</p>
          </div>
          <button 
            onClick={() => setModalOpen(false)} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Category Toggle */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_ITEMS.map(({ value, label, icon: Icon }) => {
                const isSelected = form.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, category: value })}
                    className={`flex flex-col items-center py-2.5 border rounded-lg cursor-pointer transition-all text-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black shadow-xs'
                        : 'border-slate-200 dark:border-[#263047] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:bg-[#1e2a3d]'
                    }`}
                  >
                    <Icon size={16} className="mb-1" />
                    <span className="text-[10px] font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center (Admin only) */}
          {canChooseCenter && centers?.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                <MapPin size={11} /> Evacuation Center
              </label>
              <select
                value={form.evacuation_center_id}
                onChange={(e) => setForm({ ...form, evacuation_center_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select Center</option>
                {centers.map(c => (
                  <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Issue Title
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Water pipe leakage in Hall B"
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Description
            </label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide specific details or immediate assistance required..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none transition-all"
            />
          </div>

          {/* Photo Attachment */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Photo / Document (Optional)
            </label>
            <div
              onClick={() => document.getElementById('report-photo-input')?.click()}
              className="border border-dashed border-slate-300 dark:border-[#263047] rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1e2a3d] transition-colors"
            >
              <input
                id="report-photo-input"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setForm({ ...form, attachment: f });
                }}
              />
              {form.attachment ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[240px]">
                    {form.attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, attachment: null });
                      const inp = document.getElementById('report-photo-input');
                      if (inp) inp.value = '';
                    }}
                    className="text-rose-500 hover:underline font-bold text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <UploadCloud size={16} />
                  <span>Click to attach photo or file</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d]">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1e2a3d] hover:bg-slate-200 dark:hover:bg-[#263047] rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {editingReport ? 'Save Changes' : 'Submit Issue'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
