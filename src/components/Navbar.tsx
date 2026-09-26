import React from 'react';
import { type User } from 'firebase/auth';
import {
  Activity,
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  erpConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, erpConnected = true }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur-md">
      {/* Brand logo & Workplace Assistant Tag */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950 font-bold text-lg tracking-wider">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-base">Entro Cowork</span>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                Enterprise AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Workplace Action & Reconciliation</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-6 border-l border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Workspace Authenticated</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-2.5 py-1 text-cyan-400 border border-cyan-500/20 font-medium">
            <Database className="h-3.5 w-3.5" />
            <span>Connected ERP Active</span>
          </div>
        </div>
      </div>

      {/* User profile & Session */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 py-1.5 px-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Authenticated User'}
                  className="h-7 w-7 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-900/60 font-semibold text-xs text-indigo-200 border border-indigo-700">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.displayName || 'Authorized User'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono leading-tight">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out of Session"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
