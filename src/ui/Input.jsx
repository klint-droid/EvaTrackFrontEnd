export const Input = ({ label, id, error, icon: Icon, rightAction, className = "", inputClassName = "", ...props }) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />}
                <input
                    id={id}
                    className={`block h-12 w-full rounded-xl border border-slate-200 bg-white ${Icon ? 'pl-11' : 'pl-4'} ${rightAction ? 'pr-12' : 'pr-4'} text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 text-left ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""} ${inputClassName}`}
                    {...props}
                />
                {rightAction && (
                    <div className="absolute inset-y-0 right-3.5 flex items-center">
                        {rightAction}
                    </div>
                )}
            </div>
            {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
        </div>
    );
};
