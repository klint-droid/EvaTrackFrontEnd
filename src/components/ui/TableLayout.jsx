import React from "react";
import { Trash2, SlidersHorizontal, Download, Plus } from "lucide-react";

export const TableLayout = ({
  title,
  badgeText,
  subtitle,
  description,
  actions,
  stats,
  tabs,
  children,
  pagination,
  selectedCount = 0,
  onDeleteSelected,
  onFilterClick,
  onExport,
  onAdd,
  addLabel = "Add new CTA",
  className = "",
}) => {
  const desc = subtitle || description;
  const showHeader =
    title ||
    badgeText ||
    desc ||
    actions ||
    onDeleteSelected ||
    onFilterClick ||
    onExport ||
    onAdd;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Stats Cards Section outside main table container */}
      {stats && (
        <div>
          {stats}
        </div>
      )}

      {/* Main Table Card Container */}
      <div className="mx-auto w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {/* Header Section strictly aligned to top matching design spec */}
        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 dark:border-slate-800 px-6 py-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                {title && (
                  <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-slate-100 leading-tight">
                    {title}
                  </h1>
                )}
                {badgeText && (
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    {badgeText}
                  </span>
                )}
              </div>
              {desc && (
                <p className="text-xs sm:text-sm font-normal text-gray-500 dark:text-slate-400 leading-tight">
                  {desc}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:mt-0.5">
              {selectedCount > 0 && onDeleteSelected && (
                <button
                  type="button"
                  onClick={onDeleteSelected}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <Trash2 size={15} />
                  Delete
                  <span className="ml-0.5 rounded-full bg-gray-100 dark:bg-slate-800 px-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                    {selectedCount}
                  </span>
                </button>
              )}

              {onFilterClick && (
                <button
                  type="button"
                  onClick={onFilterClick}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                </button>
              )}

              {((selectedCount > 0 && onDeleteSelected) || onFilterClick) && (onExport || onAdd) && (
                <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-slate-800" />
              )}

              {onExport && (
                <button
                  type="button"
                  onClick={onExport}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download size={15} />
                  Export
                </button>
              )}

              {onAdd && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus size={15} />
                  {addLabel}
                </button>
              )}

              {actions}
            </div>
          </div>
        )}

        {/* Optional Tabs Section */}
        {tabs && (
          <div className="border-b border-gray-100 dark:border-slate-800 px-4">
            {tabs}
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">{children}</div>

        {/* Pagination Footer */}
        {pagination && pagination}
      </div>
    </div>
  );
};

export default TableLayout;
