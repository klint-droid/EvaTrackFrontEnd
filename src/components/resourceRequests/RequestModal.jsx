import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Users, MapPin, Send, Loader2, Sparkles } from 'lucide-react';

const SUPPLY_PRESETS = [
  'Food Packs / Relief Goods',
  'Drinking Water',
  'Medicines & First Aid Kits',
  'Hygiene & Sanitation Kits',
  'Bedding, Mats & Blankets',
  'Power, Generators & Flashlights',
  'Infant Care & Diapers',
  'Cooking & Kitchen Utensils',
];

const PERSONNEL_PRESETS = [
  'Medical Team (Doctors / Nurses)',
  'Search & Rescue (SAR) Team',
  'Security & Peacekeeping (PNP / Tanod)',
  'Logistics & Transportation Drivers',
  'Relief Distribution Volunteers',
  'Psychosocial & Mental Health Support',
  'Facility Maintenance & Technicians',
];

export default function RequestModal({
  modalOpen, setModalOpen, form, setForm,
  canChooseCenter, canUpdateStatus, centers,
  handleSubmit, saving
}) {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customType, setCustomType] = useState('');

  const currentPresets = form.request_type === 'personnel' ? PERSONNEL_PRESETS : SUPPLY_PRESETS;

  // Synchronize preset and custom input with form.resource_type
  useEffect(() => {
    if (!modalOpen) {
      setSelectedPreset('');
      setCustomType('');
      return;
    }

    if (!form.resource_type) {
      setSelectedPreset('');
      setCustomType('');
    } else if (currentPresets.includes(form.resource_type)) {
      setSelectedPreset(form.resource_type);
      setCustomType('');
    } else {
      setSelectedPreset('OTHER');
      setCustomType(form.resource_type);
    }
  }, [modalOpen, form.request_type]);

  const handleTypeToggle = (key) => {
    setSelectedPreset('');
    setCustomType('');
    setForm({ ...form, request_type: key, resource_type: '' });
  };

  const handlePresetChange = (val) => {
    setSelectedPreset(val);
    if (val === 'OTHER') {
      setForm({ ...form, resource_type: customType });
    } else {
      setCustomType('');
      setForm({ ...form, resource_type: val });
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomType(val);
    setForm({ ...form, resource_type: val });
  };

  if (!modalOpen) return null;

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
                onClick={() => handleTypeToggle(key)}
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

          {/* Resource Type Dropdown + Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {form.request_type === 'resource' ? 'Resource Type' : 'Personnel Type'}
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select {form.request_type === 'resource' ? 'Supply Type' : 'Personnel Type'}...</option>
                {currentPresets.map(preset => (
                  <option key={preset} value={preset}>{preset}</option>
                ))}
                <option value="OTHER">✨ Other (Specify custom)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#263047] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Custom Specification Input when 'OTHER' is selected */}
          {selectedPreset === 'OTHER' && (
            <div className="space-y-1.5 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Specify {form.request_type === 'resource' ? 'Supply' : 'Personnel'} Name</span>
                </label>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Custom Type</span>
              </div>
              <input
                type="text"
                value={customType}
                onChange={handleCustomChange}
                placeholder={form.request_type === 'resource' ? 'e.g. Generator Fuel, Water Filtration Kit' : 'e.g. Structural Engineers, Boat Drivers'}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#0f1623] border border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                autoFocus
              />
            </div>
          )}

          {/* Center (Admin only) */}
          {canChooseCenter && centers.length > 0 && (
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
