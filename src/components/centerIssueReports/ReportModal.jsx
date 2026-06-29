import React from 'react';
import { createPortal } from 'react-dom';
import { X, Wrench, HeartPulse, Shield, FileWarning, UploadCloud, Loader2, Send } from 'lucide-react';

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

export default function ReportModal({
  modalOpen, setModalOpen,
  editingReport, form, setForm,
  canChooseCenter, centers,
  handleSubmit, saving
}) {
  if (!modalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed"
        onClick={() => setModalOpen(false)}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-auto">
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-start justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingReport ? 'Update Center Issue' : 'Report Center Issue'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Identify facility, health, or safety concerns for immediate resolution.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Issue Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'facility_issue', label: 'Facility', icon: Wrench },
                { value: 'health_issue', label: 'Health', icon: HeartPulse },
                { value: 'safety_issue', label: 'Safety', icon: Shield },
                { value: 'incident', label: 'Incident', icon: FileWarning },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = form.category === cat.value;
                return (
                  <div
                    key={cat.value}
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/30 shadow-[0_0_0_1px_rgba(59,130,246,1)] text-blue-700'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon size={22} className={isSelected ? "text-blue-600" : "text-slate-400"} strokeWidth={isSelected ? 2.5 : 2} />
                    <span className="mt-2 text-xs font-semibold">{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {canChooseCenter && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Target Center
              </label>
              <select
                value={form.evacuation_center_id}
                onChange={(e) => setForm({ ...form, evacuation_center_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="">Select an evacuation center...</option>
                {centers.map(center => (
                  <option key={center.evacuation_center_id} value={center.evacuation_center_id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Severity Level
            </label>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              {SEVERITY_OPTIONS.map((sev) => {
                const isSelected = form.severity === sev;
                return (
                  <div
                    key={sev}
                    onClick={() => setForm({ ...form, severity: sev })}
                    className={`flex-1 text-center py-2.5 text-xs font-semibold cursor-pointer transition-colors capitalize ${
                      isSelected
                        ? 'bg-slate-200 text-slate-900 shadow-inner'
                        : 'bg-white text-slate-500 hover:bg-slate-50'
                    } ${sev !== SEVERITY_OPTIONS[0] ? 'border-l border-slate-200' : ''}`}
                  >
                    {sev}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Issue Title
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief summary of the issue..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Detailed Description
            </label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide specific context, individuals involved, or immediate needs..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Attach Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
              <UploadCloud size={28} className="text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">PNG, JPG, or PDF up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={() => setModalOpen(false)}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {editingReport ? 'Save Changes' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
