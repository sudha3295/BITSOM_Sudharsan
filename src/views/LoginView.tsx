import React from 'react';
import {
  CheckCircle2,
  Database,
  FileCheck2,
  HardDrive,
  Inbox,
  Lock,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: () => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  isLoading,
  errorMessage,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-950 font-bold text-2xl tracking-wider mb-4 border border-indigo-400/20">
            E
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Entro Cowork
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            AI-powered enterprise workplace action & reconciliation assistant connecting Gmail, Drive, Chat, and ERP.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-8 backdrop-blur-xl">
          <div className="mb-6 pb-6 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Google Workspace Authentication</h2>
            <p className="mt-1 text-xs text-slate-400">
              Sign in with your authorized Google Account in project <span className="font-mono text-cyan-400 font-semibold">cohort3track1</span> to connect your workplace data.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
              <span className="font-semibold block mb-1">Authentication Error:</span>
              {errorMessage}
            </div>
          )}

          {/* Integration Capabilities list */}
          <div className="space-y-3 mb-8">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Connected Workplace Capabilities:
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-slate-300">
                <Inbox className="h-4 w-4 text-red-400 shrink-0" />
                <div>
                  <div className="font-medium text-white">Gmail</div>
                  <div className="text-[10px] text-slate-400">Inbox, search & verified replies</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-slate-300">
                <HardDrive className="h-4 w-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-medium text-white">Google Drive</div>
                  <div className="text-[10px] text-slate-400">Document browsing & search</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-slate-300">
                <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-medium text-white">Google Chat</div>
                  <div className="text-[10px] text-slate-400">Spaces, threads & messages</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-slate-300">
                <Database className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-medium text-white">Connected ERP</div>
                  <div className="text-[10px] text-slate-400">POs, invoices & reconciliation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Google Sign In Button */}
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              onClick={onLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-600 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-slate-100 active:bg-slate-200 transition-all disabled:opacity-50"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>{isLoading ? 'Authorizing with Google...' : 'Sign in with Google'}</span>
            </button>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tokens cached securely in memory. Zero mock data.</span>
            </div>
          </div>
        </div>

        {/* Security & Strict Real Data Notice */}
        <div className="mt-8 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400 text-center leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1">Strict Real Data Policy</p>
          Entro Cowork enforces real user data only. If an integration or scope is missing, the application clearly indicates the connection state rather than substituting fabricated data.
        </div>
      </div>
    </div>
  );
};
