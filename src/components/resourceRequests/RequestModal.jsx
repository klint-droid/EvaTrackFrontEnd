import React from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Users, AlertCircle, AlertTriangle, Minus, ArrowDown, MapPin, ChevronDown, Send, Loader2 } from 'lucide-react';

export default function RequestModal({
  modalOpen, setModalOpen, form, setForm,
  urgencyLevels, canUpdateStatus, centers,
  handleSubmit, saving
}) {
  if (!modalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm fixed" onClick={() => setModalOpen(false)} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-auto">
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-start justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900">New Resource Request</h2>
            <p className="text-xs text-slate-500 mt-1">Submit official requisition for emergency dispatch.</p>
          </div>
          <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-left">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Request Type</label>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 p-1 gap-1">
              <button
                onClick={() => setForm({ ...form, request_type: 'resource' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-md transition-all ${
                  form.request_type === 'resource'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Package size={16} /> Supplies
              </button>
              <button
                onClick={() => setForm({ ...form, request_type: 'personnel' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-md transition-all ${
                  form.request_type === 'personnel'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Users size={16} /> Personnel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Resource Category</label>
              <input
                value={form.resource_type}
                onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                placeholder={form.request_type === 'resource' ? 'e.g. Food Packs' : 'e.g. Medical Team'}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Quantity / Units</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 500"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Urgency Level</label>
            <div className="grid grid-cols-4 gap-3">
              {urgencyLevels.map(level => {
                const isSelected = form.urgency_id === level.urgency_id;
                const key = level.urgency_key || level.urgency_label.toLowerCase();
                let styling = '';
                let Icon = AlertCircle;
                
                if (key === 'critical') {
                  Icon = AlertTriangle;
                  styling = isSelected ? 'border-red-500 bg-white text-red-600 shadow-sm shadow-red-500/20' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
                } else if (key === 'high') {
                  Icon = AlertCircle;
                  styling = isSelected ? 'border-amber-400 bg-amber-400 text-amber-900 shadow-sm shadow-amber-400/30' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
                } else if (key === 'medium') {
                  Icon = Minus;
                  styling = isSelected ? 'border-slate-300 bg-white text-slate-900 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
                } else if (key === 'low') {
                  Icon = ArrowDown;
                  styling = isSelected ? 'border-slate-300 bg-white text-slate-900 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50';
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
              <label className="text-xs font-bold text-slate-700">Delivery Destination</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.evacuation_center_id}
                  onChange={(e) => setForm({ ...form, evacuation_center_id: e.target.value })}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all cursor-pointer appearance-none"
                >
                  <option value="">Select Active Evacuation Center</option>
                  {centers.map(center => (
                    <option key={center.evacuation_center_id} value={center.evacuation_center_id}>
                      {center.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Description / Additional Notes</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide specific details regarding the request..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none transition-all"
            />
          </div>

        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm">
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
            Submit Official Request
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
