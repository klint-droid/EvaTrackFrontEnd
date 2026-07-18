import React from "react";
import { Copy, Printer, Trash2, X } from "lucide-react";

export const BulkActionBar = ({ selectedCount, onClear, onDuplicate, onPrint, onDelete }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50 pr-4 border-r border-slate-200 dark:border-slate-700">
                {selectedCount} Selected
            </span>
            
            <div className="flex items-center gap-2">
                {onDuplicate && (
                    <button onClick={onDuplicate} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Copy size={16} /> Duplicate
                    </button>
                )}
                
                {onPrint && (
                    <button onClick={onPrint} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Printer size={16} /> Print
                    </button>
                )}
                
                {onDelete && (
                    <button onClick={onDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 size={16} /> Delete
                    </button>
                )}
            </div>

            <button onClick={onClear} className="ml-2 p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};
