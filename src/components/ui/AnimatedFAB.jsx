import React from 'react';

const AnimatedFAB = ({ icon: Icon, label, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-10 right-24 z-[100] flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold text-[14px] shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group cursor-pointer ${className}`}
    >
      <Icon className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" strokeWidth={2.5} />
      <span className="text-white tracking-wide">{label}</span>
    </button>
  );
};

export default AnimatedFAB;
