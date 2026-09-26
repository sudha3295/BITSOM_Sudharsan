import React from 'react';
import { Database, FileText, Mail, MessageSquare, ExternalLink, X } from 'lucide-react';

export interface SourceReference {
  type: 'GMAIL' | 'CHAT' | 'DRIVE' | 'ERP';
  id: string;
  reference?: string;
  details?: Record<string, any>;
}

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sources: SourceReference[];
}

export const SourcesModal: React.FC<SourcesModalProps> = ({
  isOpen,
  onClose,
  title,
  sources,
}) => {
  if (!isOpen) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'GMAIL':
        return <Mail className="h-4 w-4 text-red-400" />;
      case 'CHAT':
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
      case 'DRIVE':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'ERP':
        return <Database className="h-4 w-4 text-amber-400" />;
      default:
        return <ExternalLink className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div>
            <h3 className="font-semibold text-white text-base">Verified Source References</h3>
            <p className="text-xs text-slate-400 mt-0.5">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400 leading-relaxed">
            Entro Cowork grounds every action and reconciliation strictly in authenticated Google APIs or connected ERP records. No synthetic or invented information is used.
          </div>

          <div className="space-y-3">
            {sources.map((src, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-slate-800/40 p-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 border border-slate-700">
                      {renderIcon(src.type)}
                    </div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {src.type === 'GMAIL' ? 'Gmail Message' : src.type === 'CHAT' ? 'Google Chat' : src.type === 'DRIVE' ? 'Google Drive Document' : 'Connected ERP Database'}
                    </span>
                  </div>
                  <span className="rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
                    Source #{idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">System ID:</span>
                    <span className="text-cyan-400 font-semibold break-all selection:bg-cyan-900">
                      {src.id}
                    </span>
                  </div>
                  {src.reference && (
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">Reference / Title:</span>
                      <span className="text-slate-300 break-all">{src.reference}</span>
                    </div>
                  )}
                </div>

                {src.details && Object.keys(src.details).length > 0 && (
                  <div className="mt-3 rounded bg-slate-950/80 p-2 text-[11px] font-mono text-slate-400 border border-slate-800/60">
                    {JSON.stringify(src.details, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-800 bg-slate-950/80 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
