import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, ExternalLink, Trash2, Edit3 } from 'lucide-react';

export default function ActionMenu({
  onView,
  onEdit,
  onDelete,
  canDelete = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0, openUpwards: false });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        portalRef.current && !portalRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = (e) => {
      if (portalRef.current && portalRef.current.contains(e.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Only open upwards if space below is limited (< 200px) AND space above has more space
      const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

      setCoords({
        openUpwards: openUp,
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef} onClick={(e) => e.stopPropagation()}>
      
      {/* ── Trigger Button (•••) ── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`p-1 rounded-md transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-200 dark:bg-[#263047] text-slate-800 dark:text-slate-100 shadow-xs'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2a3d]'
        }`}
        title="More actions"
      >
        <MoreHorizontal size={14} />
      </button>

      {/* ── Context Dropdown Menu via Portal ── */}
      {isOpen &&
        createPortal(
          <div
            ref={portalRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : 'auto',
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
              right: `${coords.right}px`,
            }}
            className="w-44 bg-white dark:bg-[#1e2a3d] border border-slate-200 dark:border-[#2b384e] rounded-xl shadow-2xl z-[9999] py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View / Open Details */}
            {onView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onView();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#263047] transition-colors font-medium cursor-pointer"
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#263047] transition-colors font-medium cursor-pointer"
                >
                  <Edit3 size={13} className="text-slate-400" />
                  <span>Edit details</span>
                </button>
              </>
            )}

            {/* Delete Action */}
            {onDelete && canDelete && (
              <>
                {(onView || onEdit) && (
                  <div className="border-t border-slate-100 dark:border-[#2b384e] my-1" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium cursor-pointer"
                >
                  <Trash2 size={13} className="text-red-500 dark:text-red-400" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>,
          document.body
        )}

    </div>
  );
}
