import { AlertTriangle, Trash2, CheckCircle2, Info, X } from "lucide-react";

/**
 * AlertConfirmModal Component
 * 
 * Replaces standard browser default `window.confirm()` and `window.alert()` dialogs
 * with a high-end, responsive, and highly aesthetic React modal.
 * 
 * Props:
 * - isOpen (boolean): Controls visibility.
 * - title (string): Modal title header.
 * - message (string): Detail message body text.
 * - confirmText (string): Label of the confirm button. Defaults to "Confirm".
 * - cancelText (string): Label of the cancel button. Defaults to "Cancel".
 * - type (string): Visual variant. Values: "danger" | "warning" | "success" | "info". Defaults to "danger".
 * - onConfirm (function): Triggered when confirm button is clicked.
 * - onClose (function): Triggered when cancel/close is clicked.
 * - isLoading (boolean): Disables buttons and shows a spinner on the confirm button.
 */
function AlertConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onClose,
  isLoading = false,
}) {
  if (!isOpen) return null;

  // Configuration map for color styles, icons, and visual tokens
  const config = {
    danger: {
      bgIcon: "bg-red-50 text-red-600 border-red-100",
      buttonConfirm: "bg-red-600 hover:bg-red-500 focus:ring-red-500/20 shadow-red-500/10",
      icon: <Trash2 size={24} className="animate-bounce-short" />,
    },
    warning: {
      bgIcon: "bg-amber-50 text-amber-600 border-amber-100",
      buttonConfirm: "bg-amber-500 hover:bg-amber-400 focus:ring-amber-500/20 shadow-amber-500/10",
      icon: <AlertTriangle size={24} />,
    },
    success: {
      bgIcon: "bg-emerald-50 text-emerald-600 border-emerald-100",
      buttonConfirm: "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500/20 shadow-emerald-500/10",
      icon: <CheckCircle2 size={24} />,
    },
    info: {
      bgIcon: "bg-blue-50 text-blue-600 border-blue-100",
      buttonConfirm: "bg-blue-600 hover:bg-blue-500 focus:ring-blue-500/20 shadow-blue-500/10",
      icon: <Info size={24} />,
    },
  };

  const activeStyle = config[type] || config.danger;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* ── BACKDROP OVERLAY ── */}
      <div 
        onClick={!isLoading ? onClose : undefined} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* ── MODAL BODY CONTAINER ── */}
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 flex flex-col items-center text-center transform scale-100 transition-all duration-300 animate-in zoom-in-95 duration-200">
        
        {/* Close Button top right */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        )}

        {/* Dynamic Visual Status Icon */}
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${activeStyle.bgIcon}`}>
          {activeStyle.icon}
        </div>

        {/* Header Title */}
        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug px-2">
          {title}
        </h3>

        {/* Informational Message */}
        <p className="text-xs text-slate-500 font-bold leading-relaxed mt-2.5 px-2">
          {message}
        </p>

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex items-center gap-3 w-full mt-7">
          {/* Cancel Control */}
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 h-12 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold text-xs transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {cancelText}
          </button>

          {/* Confirm Control */}
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-xl text-white font-bold text-xs transition active:scale-[0.98] shadow-md flex items-center justify-center gap-2 ${activeStyle.buttonConfirm} disabled:opacity-75 disabled:pointer-events-none`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AlertConfirmModal;
