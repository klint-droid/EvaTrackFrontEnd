import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, CheckCircle2, Info, X, Loader2 } from "lucide-react";

/**
 * AlertConfirmModal Component
 *
 * Matches the RequestModal / ReportModal design language across EvaTrack:
 * - Compact header with title, subtitle, and close button
 * - Clean body with status badge/icon, message, and optional custom children
 * - Right-aligned footer action buttons
 */
function AlertConfirmModal({
  isOpen,
  title,
  subtitle,
  message,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onClose,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const config = {
    danger: {
      defaultSubtitle: "This action is permanent and cannot be undone",
      iconWrap: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
      cardWrap: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40",
      buttonConfirm: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
      icon: <Trash2 size={16} />,
    },
    warning: {
      defaultSubtitle: "Please review carefully before proceeding",
      iconWrap: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
      cardWrap: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40",
      buttonConfirm: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      icon: <AlertTriangle size={16} />,
    },
    success: {
      defaultSubtitle: "Confirm the details below to complete this action",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
      cardWrap: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40",
      buttonConfirm: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
      icon: <CheckCircle2 size={16} />,
    },
    info: {
      defaultSubtitle: "Review and confirm the details below",
      iconWrap: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
      cardWrap: "bg-slate-50 dark:bg-[#1e2a3d] border-slate-200 dark:border-[#263047]",
      buttonConfirm: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
      icon: <Info size={16} />,
    },
  };

  const activeStyle = config[type] || config.danger;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={!isLoading ? onClose : undefined}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Container (matches RequestModal style) */}
      <div className="relative bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-[#1e2a3d] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-left font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e2a3d]">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${activeStyle.iconWrap}`}>
              {activeStyle.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {title}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {subtitle || activeStyle.defaultSubtitle}
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d] transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {message && (
            <div className={`p-3.5 rounded-lg border text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed ${activeStyle.cardWrap}`}>
              {message}
            </div>
          )}

          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 dark:border-[#1e2a3d]">
          {cancelText && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1e2a3d] hover:bg-slate-200 dark:hover:bg-[#263047] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm?.()}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeStyle.buttonConfirm}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {activeStyle.icon}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default AlertConfirmModal;
