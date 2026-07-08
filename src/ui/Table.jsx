export const Table = ({ children, className = "", ...props }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className={`w-full text-left text-sm text-gray-500 ${className}`} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader = ({ children, className = "", ...props }) => {
    return (
        <thead className={`bg-gray-50 text-xs uppercase text-gray-700 ${className}`} {...props}>
            {children}
        </thead>
    );
};

export const TableRow = ({ children, className = "", ...props }) => {
    return (
        <tr className={`border-b border-gray-200 hover:bg-gray-50 ${className}`} {...props}>
            {children}
        </tr>
    );
};

export const TableHead = ({ children, className = "", ...props }) => {
    return (
        <th className={`px-6 py-3 font-medium ${className}`} {...props}>
            {children}
        </th>
    );
};

export const TableCell = ({ children, className = "", ...props }) => {
    return (
        <td className={`px-6 py-4 whitespace-nowrap ${className}`} {...props}>
            {children}
        </td>
    );
};
