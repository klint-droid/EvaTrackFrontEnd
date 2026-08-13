export const Select = ({ label, id, error, options = [], className = "", ...props }) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs focus:outline-none focus:border-blue-500 focus:ring-blue-500 block w-full rounded-md text-xs sm:text-sm transition-colors ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                {...props}
            >
                {options.map((option, index) => {
                    const value = option.value !== undefined ? option.value : option;
                    const displayLabel = option.label !== undefined ? option.label : option;
                    return (
                        <option key={index} value={value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                            {displayLabel}
                        </option>
                    );
                })}
            </select>
            {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
    );
};

