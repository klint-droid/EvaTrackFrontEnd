import { ArrowUpDown } from "lucide-react";

export const Table = ({ children, className = "", ...props }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className={`w-full text-left text-[13px] text-slate-800 dark:text-slate-200 border-collapse ${className}`} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader = ({ children, className = "", ...props }) => {
    return (
        <thead className={`bg-transparent border-b border-slate-200 dark:border-slate-800 ${className}`} {...props}>
            {children}
        </thead>
    );
};

export const TableRow = ({ children, className = "", isSelected, ...props }) => {
    return (
        <tr className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50'} ${className}`} {...props}>
            {children}
        </tr>
    );
};

export const TableHead = ({ children, className = "", sortable, ...props }) => {
    return (
        <th className={`px-4 py-3 font-medium text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ${className}`} {...props}>
            <div className="flex items-center gap-1.5">
                {children}
                {sortable && <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600 dark:text-slate-400" />}
            </div>
        </th>
    );
};

export const TableCell = ({ children, className = "", ...props }) => {
    return (
        <td className={`px-4 py-3.5 whitespace-nowrap ${className}`} {...props}>
            {children}
        </td>
    );
};
