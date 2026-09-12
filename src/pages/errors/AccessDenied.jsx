import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn, Lock, Radio } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export default function AccessDenied() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const formatRole = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'evac_admin':
        return 'Evacuation Administrator';
      case 'evac_personnel':
        return 'Center Personnel';
      default:
        return role ? role.replace(/_/g, ' ') : 'Guest';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white transition-colors duration-200">
      {/* Top subtle bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-10">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-rose-950 to-slate-800 dark:from-white dark:via-rose-200 dark:to-slate-300">
              EvaTrack
            </span>
            <span className="text-[10px] block font-semibold text-rose-600 dark:text-rose-400 tracking-wider uppercase">
              Access Control
            </span>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{user.name || user.email}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold uppercase">
              {formatRole(user.role)}
            </span>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center relative">
          {/* Ambient red/amber glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/60 shadow-lg shadow-rose-500/10 text-rose-600 dark:text-rose-400 mb-6 group transition-transform hover:scale-110">
            <ShieldAlert className="w-10 h-10 stroke-[1.75]" />
          </div>

          {/* Status Badge */}
          <div className="inline-block mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
              Error 403 • Restricted Clearance
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Access Forbidden
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            You do not possess the required security level or administrative role to access this module or execute this command.
          </p>

          {/* Role info card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto mb-8 text-left flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Current Role: {user ? formatRole(user.role) : 'Unauthenticated Visitor'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                If you need elevated privileges (e.g. Super Admin or Evacuation Administrator), please request an assignment from your municipal administrator.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/25 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Authorized Account</span>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/60">
        EvaTrack Access & Identity Management
      </footer>
    </div>
  );
}
