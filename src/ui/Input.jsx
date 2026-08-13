export const Input = ({ label, id, error, icon: Icon, rightAction, className = "", inputClassName = "", ...props }) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />}
                <input
                    id={id}
                    className={`block h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${Icon ? 'pl-9' : 'pl-3'} ${rightAction ? 'pr-10' : 'pr-3'} text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 text-left dark:[color-scheme:dark] ${error ? "border-red-500 focus:border-red-500" : ""} ${inputClassName}`}
                    {...props}
                />
                {rightAction && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {rightAction}
                    </div>
                )}
            </div>
            {error && <span className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</span>}
        </div>
    );
};


