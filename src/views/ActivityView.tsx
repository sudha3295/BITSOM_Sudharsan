import React from 'react';
import { Activity, CheckCircle2, Clock, Database, ExternalLink, ShieldCheck } from 'lucide-react';
import { AuditLogEntry } from '../services/apiService';

interface ActivityViewProps {
  auditLogs: AuditLogEntry[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Enterprise Execution Audit Trail
            </h1>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              Immutable Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Certified log of all authorized external write actions, replies, and ERP resolutions.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-400">
          Recorded Write Events: <strong className="text-white">{auditLogs.length}</strong>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
          <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No write actions executed yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you approve and execute an action (e.g. sending a Gmail reply or creating an authorized ERP exception), the transaction and external ID are immutably logged here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Operation</th>
                  <th className="px-4 py-3">Authorized User</th>
                  <th className="px-4 py-3">Source Channel</th>
                  <th className="px-4 py-3">Result / Status</th>
                  <th className="px-4 py-3">External Message / System ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white font-sans font-semibold">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {log.user}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-semibold">
                      {log.source}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{log.result}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] truncate max-w-xs">
                      {log.externalId || log.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
