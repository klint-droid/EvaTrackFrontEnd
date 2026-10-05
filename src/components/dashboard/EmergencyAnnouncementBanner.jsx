import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EmergencyAnnouncementBanner({ activeEvents = [] }) {
  const ongoingEvents = activeEvents.filter(e => !e.ended_at);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (ongoingEvents.length === 0) return null;

  const safeIndex = currentIndex < ongoingEvents.length ? currentIndex : 0;
  const currentEvent = ongoingEvents[safeIndex];

  const severityName = typeof currentEvent.severity === 'object' 
    ? currentEvent.severity?.severity_name || currentEvent.severity?.severity_label || 'High Severity'
    : currentEvent.severity || 'Active Emergency';

  const typeName = currentEvent.primary_type?.type_name || 'Disaster Event';

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? ongoingEvents.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === ongoingEvents.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Icon, Badge & Summary */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
            <Megaphone className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0 text-xs sm:text-sm">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200">
              Notice
            </span>

            <span className="font-bold text-slate-900 dark:text-slate-100">
              {currentEvent.name}
            </span>

            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>

            <span className="text-slate-600 dark:text-slate-300">
              {typeName} ({severityName}) — City-wide response active across all centers
            </span>
          </div>
        </div>

        {/* Right: Pager (if multiple) & Action Link */}
        <div className="flex items-center gap-2.5 shrink-0 pl-11 sm:pl-0">
          {ongoingEvents.length > 1 && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Previous announcement"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-medium select-none">
                {safeIndex + 1}/{ongoingEvents.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Next announcement"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-xs transition-colors"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
