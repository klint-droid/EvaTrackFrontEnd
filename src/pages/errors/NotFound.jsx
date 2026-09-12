import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home, ShieldAlert, Radio, HelpCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export default function NotFound() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const homePath = user ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top subtle bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-10">
        <Link to={homePath} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-300">
              EvaTrack
            </span>
            <span className="text-[10px] block font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              Emergency Response
            </span>
          </div>
        </Link>

        <Link
          to="/portal"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Public Portal</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center relative">
          {/* Ambient decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 shadow-lg shadow-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6 group transition-transform hover:scale-110">
            <Compass className="w-10 h-10 stroke-[1.75] animate-spin-slow" />
          </div>

          {/* Status badge */}
          <div className="inline-block mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/50">
              Error 404 • Lost in Coordinates
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            The evacuation route or resource you are trying to reach does not exist, has been relocated, or is temporarily offline.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <Link
              to={homePath}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>{user ? 'Return to Dashboard' : 'Back to Home'}</span>
            </Link>
          </div>

          {/* Quick links box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Helpful Destinations
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/portal"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                🚨 Public Portal
              </Link>
              <Link
                to="/evacuation-alerts"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                📢 Evacuation Alerts
              </Link>
              <Link
                to="/evacuation-centers"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                🏢 Centers List
              </Link>
              <Link
                to="/login"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                🔑 Admin Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/60">
        EvaTrack Disaster & Evacuation Monitoring System
      </footer>
    </div>
  );
}
