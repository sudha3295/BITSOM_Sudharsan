import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ActionItem } from '../services/apiService';

interface ActionCenterViewProps {
  actions: ActionItem[];
  onExecuteAction: (action: ActionItem) => void;
  onViewSources: (action: ActionItem) => void;
  onUpdateStatus: (actionId: string, status: ActionItem['status']) => void;
  onCreateManualAction?: () => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  actions,
  onExecuteAction,
  onViewSources,
  onUpdateStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredActions = actions.filter((action) => {
    if (statusFilter !== 'ALL' && action.status !== statusFilter) return false;
    if (sourceFilter !== 'ALL' && action.source.type !== sourceFilter) return false;
    if (priorityFilter !== 'ALL' && action.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        action.title.toLowerCase().includes(q) ||
        action.relatedEntity.toLowerCase().includes(q) ||
        action.reason.toLowerCase().includes(q) ||
        action.source.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Action Center</h1>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
              Live Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real tasks and follow-ups synthesized from authenticated Gmail inquiries, Chat requests, and ERP discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1">
            Total: <strong className="text-white">{actions.length}</strong>
          </span>
          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-300">
            Pending: <strong className="text-amber-200">{actions.filter((a) => a.status === 'PENDING').length}</strong>
          </span>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-300">
            Executed: <strong className="text-emerald-200">{actions.filter((a) => a.status === 'EXECUTED').length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search actions by entity, title, or system ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="EXECUTED">Executed (Recorded)</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        {/* Source filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Sources</option>
            <option value="GMAIL">Gmail Inbox</option>
            <option value="CHAT">Google Chat</option>
            <option value="DRIVE">Google Drive</option>
            <option value="ERP">Connected ERP</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto opacity-70" />
          <p className="text-base font-medium text-slate-300">No actions matching your filter</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Scan your authenticated Gmail inbox, inspect Google Chat spaces, or initiate a reconciliation against the Connected ERP database.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => {
            const isExecuted = action.status === 'EXECUTED';
            const isDismissed = action.status === 'DISMISSED';

            return (
              <div
                key={action.id}
                className={`rounded-xl border p-5 transition-all space-y-4 ${
                  isExecuted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : isDismissed
                    ? 'border-slate-800 bg-slate-950/40 opacity-60'
                    : action.priority === 'CRITICAL'
                    ? 'border-rose-500/40 bg-slate-900/90 shadow-md shadow-rose-950/20'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        action.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : action.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {action.priority}
                    </span>

                    <span className="font-mono text-xs text-cyan-400 font-medium">
                      [{action.actionType}]
                    </span>

                    <span className="text-xs text-slate-400">
                      Entity: <strong className="text-slate-200">{action.relatedEntity}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isExecuted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isDismissed
                          ? 'bg-slate-800 text-slate-400'
                          : action.status === 'UNDER_REVIEW'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isExecuted ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>{action.status}</span>
                    </span>

                    <button
                      onClick={() => onViewSources(action)}
                      className="rounded bg-slate-800 px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                    >
                      View Source
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-semibold text-white">{action.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Source: {action.source.type}</span>
                    <span>•</span>
                    <span className="truncate max-w-xs text-slate-500">ID: {action.source.id}</span>
                    {action.dueDate && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">Due: {action.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Reasoning card */}
                <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Identified Reason & Context:</span>
                    <p className="text-slate-300 leading-relaxed">{action.reason}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 font-semibold block mb-0.5">Recommended Next Action:</span>
                    <p className="text-indigo-300 font-medium">{action.recommendedNextStep}</p>
                  </div>
                </div>

                {/* Proposed payload / Execution preview */}
                {action.proposedPayload && !isExecuted && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs font-mono space-y-1">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Prepared Action Payload:</span>
                      <span className="text-cyan-400 font-bold">{action.proposedPayload.actionType}</span>
                    </div>
                    {action.proposedPayload.to && (
                      <div className="text-slate-300">To: {action.proposedPayload.to}</div>
                    )}
                    {action.proposedPayload.subject && (
                      <div className="text-slate-300">Subject: {action.proposedPayload.subject}</div>
                    )}
                  </div>
                )}

                {/* Execution outcome if completed */}
                {isExecuted && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs font-mono text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>✓ Action Completed and Logged to Audit Trail</span>
                    </div>
                    <div className="text-[11px] text-emerald-300/80">
                      Executed at: {action.executedAt || 'Recorded'} • {action.executionResult}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!isExecuted && !isDismissed && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => onUpdateStatus(action.id, 'DISMISSED')}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => onExecuteAction(action)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Approve & Execute</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
