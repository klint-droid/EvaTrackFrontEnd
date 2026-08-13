import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({
  page,
  currentPage = 1,
  totalPages = 1,
  totalEntries,
  total,
  startItem,
  endItem,
  perPage = 10,
  onPageChange,
  onPrev,
  onNext,
  className = "",
}) => {
  const activePage = page !== undefined ? page : currentPage;
  const count = totalEntries !== undefined ? totalEntries : total !== undefined ? total : 0;

  const calculatedStart =
    startItem !== undefined
      ? startItem
      : count === 0
      ? 0
      : (activePage - 1) * perPage + 1;
  const calculatedEnd =
    endItem !== undefined
      ? endItem
      : Math.min(activePage * perPage, count);

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else if (onPageChange && activePage > 1) {
      onPageChange(activePage - 1);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (onPageChange && activePage < totalPages) {
      onPageChange(activePage + 1);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl bg-gray-900 dark:bg-slate-950 px-6 py-3 transition-colors ${className}`}
    >
      <span className="text-sm font-medium text-gray-400">
        {count === 0
          ? "0 items"
          : `${calculatedStart} - ${calculatedEnd} of ${count} items`}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activePage <= 1}
          className="flex items-center gap-1 rounded-lg border border-gray-700 dark:border-slate-800 px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800 dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={activePage >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-gray-700 dark:border-slate-800 px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800 dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
