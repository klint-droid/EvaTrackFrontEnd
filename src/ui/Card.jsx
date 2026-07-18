export const Card = ({ children, className = "", ...props }) => {
    return (
        <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = "", ...props }) => {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardTitle = ({ children, className = "", ...props }) => {
    return (
        <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-50 ${className}`} {...props}>
            {children}
        </h3>
    );
};

export const CardContent = ({ children, className = "", ...props }) => {
    return (
        <div className={`px-6 py-4 ${className}`} {...props}>
            {children}
        </div>
    );
};
