import React from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Users, MapPin, Send, Loader2, AlertTriangle, AlertCircle, Minus, ArrowDown } from 'lucide-react';

export default function RequestModal({
  modalOpen, setModalOpen, form, setForm,
  urgencyLevels, canUpdateStatus, centers,
  handleSubmit, saving
}) {
  if (!modalOpen) return null;

  const urgencyIcons = { critical: AlertTriangle, high: AlertCircle, medium: Minus, low: ArrowDown };
  const urgencyColors = {
    critical: 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    high:     'border-orange-400 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    medium:   'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    low:      'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

      <div className="relative bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-[#1e2a3d] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e2a3d]">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">New Resource Request</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Submit a supply or personnel requisition</p>
          </div>
          <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-[#1e2a3d] p-1 rounded-lg gap-1">
            {[{ key: 'resource', label: 'Supplies', Icon: Package }, { key: 'personnel', label: 'Personnel', Icon: Users }].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm({ ...form, request_type: key })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
                  form.request_type === key
                    ? 'bg-white dark:bg-[#0f1623] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-[#263047]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Resource Type + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {form.request_type === 'resource' ? 'Resource Type' : 'Personnel Type'}
              </label>
              <input
                value={form.resource_type}
                onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                placeholder={form.request_type === 'resource' ? 'e.g. Food Packs' : 'e.g. Medical Team'}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Quantity</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Center (Admin only) */}
          {canUpdateStatus && centers.length > 0 && (
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
                {centers.map(c => <option key={c.evacuation_center_id} value={c.evacuation_center_id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Notes (optional)</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Any additional details or special instructions..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none transition-all"
            />
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
            Submit Request
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
