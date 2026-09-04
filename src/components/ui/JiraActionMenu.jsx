import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ExternalLink, Trash2, Edit3 } from 'lucide-react';

export default function JiraActionMenu({
  onView,
  onEdit,
  onDelete,
  canDelete = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={menuRef} onClick={(e) => e.stopPropagation()}>
      
      {/* ── Trigger Button (•••) ── */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`p-1 rounded-md transition-all ${
          isOpen
            ? 'bg-slate-200 dark:bg-[#263047] text-slate-800 dark:text-slate-100 shadow-xs'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d]'
        }`}
        title="More actions"
      >
        <MoreHorizontal size={14} />
      </button>

      {/* ── Jira Context Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#2b384e] rounded-xl shadow-2xl z-[999] py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left text-xs">
          
          {/* View / Open Details */}
          {onView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onView();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#263047] transition-colors font-medium"
            >
              <ExternalLink size={13} className="text-slate-400" />
              <span>View details</span>
            </button>
          )}

          {/* Edit Action */}
          {onEdit && (
            <>
              {onView && <div className="border-t border-slate-100 dark:border-[#2b384e] my-1" />}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#263047] transition-colors font-medium"
              >
                <Edit3 size={13} className="text-slate-400" />
                <span>Edit</span>
              </button>
            </>
          )}

          {/* Divider & Delete Action */}
          {canDelete && onDelete && (
            <>
              {(onView || onEdit) && <div className="border-t border-slate-100 dark:border-[#2b384e] my-1" />}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-semibold"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </>
          )}

        </div>
      )}

    </div>
  );
}

