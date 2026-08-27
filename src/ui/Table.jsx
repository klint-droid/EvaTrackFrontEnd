import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Check,
  MoreVertical,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";

/**
 * Custom Checkbox component strictly matching the design specification.
 * Supports checked state, indeterminate state, minus/check icons, and accessibility.
 */
export function Checkbox({ checked, indeterminate, onChange, ariaLabel, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel || "Select row"}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(e);
      }}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 ${
        checked || indeterminate
          ? "border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500"
          : "border-gray-300 bg-white hover:border-gray-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
      } ${className}`}
    >
      {indeterminate ? (
        <Minus size={12} strokeWidth={3} className="text-white" />
      ) : checked ? (
        <Check size={12} strokeWidth={3} className="text-white" />
      ) : null}
    </button>
  );
}

/**
 * StatusBadge component with colored dot indicator and pill background.
 */
export function StatusBadge({ value, label, type, color, className = "" }) {
  const text = label || value || type || "";
  const textLower = String(text).toLowerCase();

  let bgClass = "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300";
  let dotClass = "bg-gray-400 dark:bg-slate-500";

  const isGreen =
    color === "green" ||
    ["active", "approved", "resolved", "delivered", "evacuated", "low"].includes(textLower);
  const isRed =
    color === "red" ||
    ["inactive", "rejected", "critical", "failed", "cancelled", "closed", "high"].includes(textLower);
  const isBlue =
    color === "blue" ||
    ["super admin", "admin", "evac personnel", "resource", "open", "in_progress", "pending"].includes(textLower);
  const isAmber =
    color === "orange" ||
    color === "yellow" ||
    ["medium", "acknowledged", "scheduled", "unverified"].includes(textLower);

  if (isGreen) {
    bgClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40";
    dotClass = "bg-emerald-500";
  } else if (isRed) {
    bgClass = "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40";
    dotClass = "bg-rose-500";
  } else if (isBlue) {
    bgClass = "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40";
    dotClass = "bg-blue-500";
  } else if (isAmber) {
    bgClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40";
    dotClass = "bg-amber-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bgClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {text}
    </span>
  );
}

/**
 * SortableHeader button component for column headers.
 */
export function SortableHeader({ label, direction, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors ${className}`}
    >
      {label}
      {direction === "asc" ? (
        <ChevronUp size={13} className="text-gray-700 dark:text-slate-200" />
      ) : direction === "desc" ? (
        <ChevronDown size={13} className="text-gray-700 dark:text-slate-200" />
      ) : (
        <ChevronDown size={13} className="text-gray-300 dark:text-slate-600" />
      )}
    </button>
  );
}

/**
 * RowMenu dropdown component for table row actions.
 */
export function RowMenu({ actions = [], onDelete, onEdit, onDuplicate, onView, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const defaultActions = [];
  if (onView) defaultActions.push({ label: "View Details", onClick: onView });
  if (onEdit) defaultActions.push({ label: "Edit", onClick: onEdit });
  if (onDuplicate) defaultActions.push({ label: "Duplicate", onClick: onDuplicate });
  if (onDelete) defaultActions.push({ label: "Delete", danger: true, onClick: onDelete });

  const allActions = [...defaultActions, ...actions];

  if (allActions.length === 0) return null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Row actions"
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {allActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              disabled={action.disabled}
              className={`block w-full px-3.5 py-1.5 text-left text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                action.danger
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  : "text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                action.onClick?.();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Table container.
 */
export function Table({ children, className = "", ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full min-w-[900px] border-collapse text-left text-sm text-gray-700 dark:text-slate-200 ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * TableHeader container.
 */
export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead
      className={`border-b border-gray-100 bg-gray-50/80 dark:border-slate-800 dark:bg-slate-900/80 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

/**
 * TableRow component.
 */
export function TableRow({ children, className = "", isSelected, ...props }) {
  return (
    <tr
      className={`border-b border-gray-50 text-sm transition-colors last:border-0 dark:border-slate-800/60 ${
        isSelected
          ? "bg-blue-50/40 dark:bg-blue-950/30"
          : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * TableHead component featuring Material UI Popover Column Filtering.
 */
export function TableHead({
  children,
  className = "",
  sortable,
  direction,
  onSort,
  filterable,
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder,
  ...props
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isFilterOpen = Boolean(anchorEl);
  const isFilterActive =
    filterValue !== undefined && filterValue !== null && String(filterValue).trim() !== "";

  const handleFilterClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const columnLabel = typeof children === "string" ? children : "column";

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 whitespace-nowrap ${className}`}
      {...props}
    >
      <div className="inline-flex items-center gap-1.5">
        {sortable ? (
          <SortableHeader label={children} direction={direction} onClick={onSort} />
        ) : (
          <span>{children}</span>
        )}

        {filterable && (
          <>
            <Tooltip title={`Filter by ${columnLabel}`}>
              <button
                type="button"
                onClick={handleFilterClick}
                className={`p-1 rounded-md transition-colors focus:outline-none ${
                  isFilterActive
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 font-bold"
                    : "text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <SlidersHorizontal size={13} className={isFilterActive ? "stroke-[2.5]" : "stroke-2"} />
              </button>
            </Tooltip>

            {/* Material UI Popover for per-column filter control */}
            <Popover
              open={isFilterOpen}
              anchorEl={anchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                className: "bg-white dark:bg-[#1c2128] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 shadow-2xl rounded-xl p-3 font-sans",
                style: {
                  borderRadius: "12px",
                  padding: "12px",
                  width: "240px",
                },
              }}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  borderColor: "rgba(226, 232, 240, 0.8)",
                  ".dark &": {
                    backgroundColor: "#1c2128 !important",
                    color: "#f1f5f9 !important",
                    borderColor: "rgba(51, 65, 85, 0.8) !important",
                  },
                },
              }}
            >
              <div className="space-y-3 font-sans text-left">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Filter {columnLabel}
                  </span>
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange?.("");
                        handleFilterClose();
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <X size={12} /> Clear
                    </button>
                  )}
                </div>

                {filterOptions && filterOptions.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange?.("");
                        handleFilterClose();
                      }}
                      className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        !filterValue
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800/40"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#2d333b]"
                      }`}
                    >
                      All ({columnLabel})
                    </button>
                    {filterOptions.map((opt) => {
                      const val = typeof opt === "object" ? opt.value : opt;
                      const lbl = typeof opt === "object" ? opt.label : opt;
                      const isSelected =
                        String(filterValue).toLowerCase() === String(val).toLowerCase();
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            onFilterChange?.(val);
                            handleFilterClose();
                          }}
                          className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800/40"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#2d333b]"
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={filterValue || ""}
                      onChange={(e) => onFilterChange?.(e.target.value)}
                      placeholder={filterPlaceholder || `Search ${columnLabel}...`}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#161b22] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </Popover>
          </>
        )}
      </div>
    </th>
  );
}

/**
 * TableCell component.
 */
export function TableCell({ children, className = "", isBold, ...props }) {
  return (
    <td
      className={`px-3.5 py-2 text-xs whitespace-nowrap ${
        isBold ? "font-semibold text-gray-900 dark:text-slate-100" : "text-gray-600 dark:text-slate-300"
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export default Table;
