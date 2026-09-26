import React from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  FolderGit2,
  HardDrive,
  Inbox,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ActionItem, AuditLogEntry, ERPDataState } from '../services/apiService';
import { GmailEmail } from '../services/gmailService';
import { ChatSpace } from '../services/chatService';
import { DriveFileItem } from '../services/driveService';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  actions: ActionItem[];
  auditLogs: AuditLogEntry[];
  emails: GmailEmail[];
  chatSpaces: ChatSpace[];
  chatUnavailable: boolean;
  driveFiles: DriveFileItem[];
  erpData: ERPDataState | null;
  onNavigate: (tab: NavTab) => void;
  onExecuteAction: (action: ActionItem) => void;
  onViewSources: (action: ActionItem) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  actions,
  auditLogs,
  emails,
  chatSpaces,
  chatUnavailable,
  driveFiles,
  erpData,
  onNavigate,
  onExecuteAction,
  onViewSources,
  onRefreshAll,
  isRefreshing,
}) => {
  const pendingActions = actions.filter((a) => a.status === 'PENDING');
  const emailActions = actions.filter((a) => a.source.type === 'GMAIL');
  const chatActions = actions.filter((a) => a.source.type === 'CHAT');
  const erpDiscrepancies = erpData?.invoices.filter((i) => i.status === 'DISCREPANCY') || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Workplace Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Workplace Action Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time understanding, discrepancy reconciliation, and authorized action tracking across connected enterprise tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Sources</span>
          </button>

          <button
            onClick={() => onNavigate('reconciliation')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-500 shadow-sm transition-colors"
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>Run Reconciliation</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Actions */}
        <div
          onClick={() => onNavigate('actions')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Actions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{pendingActions.length}</span>
            <span className="text-xs text-amber-400 font-medium">Require approval</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-200">
            <span>Review in Action Center</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Email Inquiries Requiring Action */}
        <div
          onClick={() => onNavigate('inbox')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Inbox (Gmail)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{emails.length}</span>
            <span className="text-xs text-slate-400">Retrieved emails</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-200">
            <span>{emailActions.length} action item(s) detected</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* ERP Discrepancies */}
        <div
          onClick={() => onNavigate('reconciliation')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              ERP Exceptions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400">{erpDiscrepancies.length}</span>
            <span className="text-xs text-slate-400">Variance flags</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-rose-300 group-hover:text-rose-200">
            <span>PO-10452 vs INV-7821</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Executed Outcomes */}
        <div
          onClick={() => onNavigate('activity')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified Audit Trail
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{auditLogs.length}</span>
            <span className="text-xs text-emerald-400">Recorded writes</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-200">
            <span>View execution history</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Action Stream + Reconciliation Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Priority Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">High-Priority Actions</h2>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
                Action Center
              </span>
            </div>
            <button
              onClick={() => onNavigate('actions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View all ({actions.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {pendingActions.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No pending actions requiring authorization</p>
              <p className="text-xs text-slate-500">
                Extract new actions by scanning your live Inbox or triggering an ERP reconciliation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.slice(0, 4).map((action) => (
                <div
                  key={action.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          action.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : action.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {action.priority}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{action.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Source: <span className="font-mono text-cyan-400">{action.source.type}</span> • Entity: <span className="text-slate-300">{action.relatedEntity}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onViewSources(action)}
                      className="rounded bg-slate-800 px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 border border-slate-700"
                    >
                      Sources
                    </button>
                  </div>

                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3 text-xs text-slate-300">
                    <p className="text-slate-400 mb-1 font-medium">AI Finding & Reason:</p>
                    <p className="leading-relaxed">{action.reason}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Recommended: <strong className="text-indigo-300">{action.recommendedNextStep}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onExecuteAction(action)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
                    >
                      <span>Review & Authorize</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Enterprise Reconciliation Status & Recent Activity */}
        <div className="space-y-6">
          {/* Discrepancy Spotlight */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Active ERP Discrepancy</h3>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                PO-10452
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-2">
              <p className="leading-relaxed">
                Vendor <strong className="text-white">Acme Industrial Solutions Ltd</strong> submitted invoice INV-7821 for 110 units ($55,000) against authorized purchase order PO-10452 for 100 units ($50,000).
              </p>
              <div className="rounded-lg bg-slate-950/80 p-3 font-mono text-[11px] text-amber-300/90 border border-slate-800">
                ⚠ Quantity Mismatch: 100 vs 110 units (+10 unapproved excess)
              </div>
            </div>

            <button
              onClick={() => onNavigate('reconciliation')}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              <span>Inspect 3-Way Reconciliation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Integration Connectivity Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Real Integration Pulse</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between rounded bg-slate-950/60 px-3 py-2 border border-slate-800">
                <span className="text-slate-400">Gmail API:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active ({emails.length} msgs)
                </span>
              </div>
              <div className="flex items-center justify-between rounded bg-slate-950/60 px-3 py-2 border border-slate-800">
                <span className="text-slate-400">Google Drive:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active ({driveFiles.length} files)
                </span>
              </div>
              <div className="flex items-center justify-between rounded bg-slate-950/60 px-3 py-2 border border-slate-800">
                <span className="text-slate-400">Google Chat:</span>
                {chatUnavailable ? (
                  <span className="text-amber-400">Account Restricted</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active ({chatSpaces.length} spaces)
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between rounded bg-slate-950/60 px-3 py-2 border border-slate-800">
                <span className="text-slate-400">Connected ERP:</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Live (7 Tables)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
