import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

export function DeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
      
      {/* 🌑 DARKENED OVERLAY */}
      <div 
        className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
        onClick={onClose} 
      />

      {/* 📦 ULTRA-COMPACT DELETE CARD */}
      <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[280px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Tighter Padding for small look */}
        <div className="p-6 text-center">
          {/* ICON SECTION - Scaled down */}
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100/50">
            <AlertTriangle size={24} />
          </div>
          
          <h2 className="text-lg font-black text-slate-800 mb-1.5 tracking-tight">Delete Center?</h2>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium px-1">
            This facility and its records will be permanently removed.
          </p>
        </div>

        {/* BUTTONS SECTION - Compact Layout */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-2.5 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest"
          >
            Confirm Delete
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full py-1.5 text-[9px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}