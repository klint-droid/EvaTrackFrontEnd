import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home, HelpCircle, Radio, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export default function ServerError() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-white transition-colors duration-200">
      {/* Top bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-10">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-amber-950 to-slate-800 dark:from-white dark:via-amber-200 dark:to-slate-300">
              EvaTrack
            </span>
            <span className="text-[10px] block font-semibold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
              System Health
            </span>
          </div>
        </Link>

        <Link
          to="/portal"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Public Portal</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center relative">
          {/* Ambient amber glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-800/60 shadow-lg shadow-amber-500/10 text-amber-600 dark:text-amber-400 mb-6 group transition-transform hover:scale-110">
            <ServerCrash className="w-10 h-10 stroke-[1.75]" />
          </div>

          {/* Status Badge */}
          <div className="inline-block mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
              Error 500 • Internal System Disruption
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            System Hiccup
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Our disaster coordination server encountered an unexpected error while processing this request. Incident telemetry has been logged.
          </p>

          {/* Status checklist */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto mb-8 text-left space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Database cluster & replication status: Active</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Offline caching & local data integrity: Preserved</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Backend service retry: Recommended</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-600/25 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying Connection...' : 'Retry Connection'}</span>
            </button>

            <Link
              to={user ? '/dashboard' : '/'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>{user ? 'Return to Dashboard' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/60">
        EvaTrack Systems Status & Diagnostics
      </footer>
    </div>
  );
}
