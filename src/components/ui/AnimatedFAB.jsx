import React from 'react';

const AnimatedFAB = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-10 right-24 z-[100] flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-slate-50 dark:bg-slate-800/50 text-white dark:text-slate-900 dark:text-slate-50 border border-slate-700 dark:border-slate-300 rounded-[15px] font-[900] text-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
    >
      <Icon className="w-5 h-5 z-10 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
      <span className="z-10">{label}</span>
    </button>
  );
};

export default AnimatedFAB;
