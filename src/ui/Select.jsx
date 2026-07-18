export const Select = ({ label, id, error, options = [], className = "", ...props }) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`px-3 py-2 bg-white dark:bg-slate-900 border shadow-sm dark:shadow-none border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-blue-500 block w-full rounded-md sm:text-sm focus:ring-1 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                {...props}
            >
                {options.map((option, index) => {
                    const value = option.value !== undefined ? option.value : option;
                    const displayLabel = option.label !== undefined ? option.label : option;
                    return (
                        <option key={index} value={value}>
                            {displayLabel}
                        </option>
                    );
                })}
            </select>
            {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
    );
};
