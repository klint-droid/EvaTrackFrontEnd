import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm dark:shadow-none focus-visible:ring-blue-500',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-slate-650 text-slate-700 dark:text-slate-200 focus-visible:ring-slate-400',
  outline: 'border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm dark:shadow-none focus-visible:ring-rose-500',
  dangerOutline: 'border border-rose-200 dark:border-rose-900/60 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 focus-visible:ring-rose-500',
  ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-slate-400',
  success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm dark:shadow-none focus-visible:ring-emerald-500',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-md font-medium',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg font-semibold',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg font-semibold',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-xl font-bold',
  icon: 'p-2 rounded-lg',
};

export const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    fullWidth = false,
    className = '',
    ...props
  },
  ref
) {
  const baseClasses =
    'inline-flex items-center justify-center transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.md;
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
