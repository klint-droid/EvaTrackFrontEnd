import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function CenterModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    capacity: "",
    rooms: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        location: initialData.location || "",
        capacity: initialData.capacity || "",
        rooms: initialData.rooms || "",
      });
    } else {
      setForm({ name: "", location: "", capacity: "", rooms: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
      
      {/* 🌑 DARK OVERLAY */}
      <div 
        className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
        onClick={onClose} 
      />

      {/* 📦 COMPACT MODAL CARD */}
      <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER - Tighter Padding */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            {initialData ? "Update Center" : "New Center"}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* FORM BODY - Reduced Gap & Padding */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Center Name</label>
            <input
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g., Central Gym"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Location</label>
            <input
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g., Brgy. San Jose"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Capacity</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="0"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Rooms</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="0"
                value={form.rooms}
                onChange={(e) => setForm({ ...form, rooms: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* FOOTER - Compact Actions */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-3">
          <button 
            onClick={onClose} 
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-wider"
          >
            {initialData ? "Save" : "Register"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}