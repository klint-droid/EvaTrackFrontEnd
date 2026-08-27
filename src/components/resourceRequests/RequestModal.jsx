import React from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Users, AlertCircle, AlertTriangle, Minus, ArrowDown, MapPin, ChevronDown, Send, Loader2 } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

export default function RequestModal({
  modalOpen, setModalOpen, form, setForm,
  urgencyLevels, canUpdateStatus, centers,
  handleSubmit, saving
}) {
  if (!modalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed" onClick={() => setModalOpen(false)} />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-start justify-between bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">New Resource Request</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit official requisition for emergency dispatch.</p>
          </div>
          <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-left">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Request Type</label>
            <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/60 p-1 gap-1">
              <button
                onClick={() => setForm({ ...form, request_type: 'resource' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-md transition-all ${
                  form.request_type === 'resource'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/60'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Package size={16} /> Supplies
              </button>
              <button
                onClick={() => setForm({ ...form, request_type: 'personnel' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-md transition-all ${
                  form.request_type === 'personnel'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/60'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Users size={16} /> Personnel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Resource Category</label>
              <Input
                value={form.resource_type}
                onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                placeholder={form.request_type === 'resource' ? 'e.g. Food Packs' : 'e.g. Medical Team'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Quantity / Units</label>
              <Input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Urgency Level</label>
            <div className="grid grid-cols-4 gap-3">
              {urgencyLevels.map(level => {
                const isSelected = form.urgency_id === level.urgency_id;
                const key = level.urgency_key || level.urgency_label.toLowerCase();
                let styling = '';
                let Icon = AlertCircle;
                
                if (key === 'critical') {
                  Icon = AlertTriangle;
                  styling = isSelected ? 'border-red-500 bg-white dark:bg-slate-900 text-red-600 shadow-sm dark:shadow-none shadow-red-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50';
                } else if (key === 'high') {
                  Icon = AlertCircle;
                  styling = isSelected ? 'border-amber-400 bg-amber-400 text-amber-900 shadow-sm dark:shadow-none shadow-amber-400/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50';
                } else if (key === 'medium') {
                  Icon = Minus;
                  styling = isSelected ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm dark:shadow-none' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50';
                } else if (key === 'low') {
                  Icon = ArrowDown;
                  styling = isSelected ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm dark:shadow-none' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800/50';
                }

                return (
                  <div
                    key={level.urgency_id}
                    onClick={() => setForm({ ...form, urgency_id: level.urgency_id })}
                    className={`flex flex-col items-center justify-center py-3 border rounded-lg cursor-pointer transition-all ${styling}`}
                  >
                    <Icon size={18} className="mb-1.5" strokeWidth={isSelected ? 2.5 : 2} />
                    <span className="text-[11px] font-bold tracking-wide capitalize">{level.urgency_label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {canUpdateStatus && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Delivery Destination</label>
              <Select
                icon={MapPin}
                value={form.evacuation_center_id}
                onChange={(e) => setForm({ ...form, evacuation_center_id: e.target.value })}
                options={[
                  { value: '', label: 'Select Active Evacuation Center' },
                  ...centers.map(center => ({
                    value: center.evacuation_center_id,
                    label: center.name
                  }))
                ]}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Description / Additional Notes</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide specific details regarding the request..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none transition-all"
            />
          </div>

        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:text-slate-50 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm dark:shadow-none hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Submit Official Request
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
