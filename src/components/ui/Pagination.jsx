import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({ currentPage = 1, totalPages = 1, totalEntries = 0, perPage = 10, onPageChange }) => {

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push("...");
        }

        // Pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push("...");
        }

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endEntry = Math.min(currentPage * perPage, totalEntries);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div>
                Showing <span className="font-bold text-slate-900 dark:text-slate-50">{startEntry}-{endEntry}</span> of <span className="font-bold text-slate-900 dark:text-slate-50">{totalEntries}</span> entries
            </div>

            <div className="flex items-center gap-1 mt-4 sm:mt-0">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange?.(currentPage - 1)}
                    className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} /> Previous
                </button>

                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        disabled={page === "..."}
                        onClick={() => page !== "..." && onPageChange?.(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                            currentPage === page
                                ? "bg-blue-600 text-white"
                                : page === "..."
                                ? "text-slate-400 cursor-default"
                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange?.(currentPage + 1)}
                    className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
