import React from 'react';

const AnimatedFAB = ({ icon: Icon, label, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-10 right-24 z-[100] flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 dark:bg-slate-900 text-white dark:text-blue-400 border border-slate-700 dark:border-blue-500/40 rounded-[15px] font-black text-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.3)] dark:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer ${className}`}
    >
      <Icon className="w-5 h-5 z-10 text-white dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
      <span className="z-10 text-white dark:text-blue-400">{label}</span>
    </button>
  );
};

export default AnimatedFAB;
