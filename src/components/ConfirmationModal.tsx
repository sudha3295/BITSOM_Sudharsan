import React from 'react';
import { AlertTriangle, CheckCircle2, Send, ShieldCheck, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  actionType: string;
  recipientOrTarget?: string;
  subjectOrReference?: string;
  bodyPreview?: string;
  isExecuting?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Entro Cowork is ready to perform this action.',
  actionType,
  recipientOrTarget,
  subjectOrReference,
  bodyPreview,
  isExecuting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">User Authorization Required</h3>
              <p className="text-xs text-slate-400">Enterprise write action verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-amber-200/90 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-300">{title}</p>
              <p className="text-xs text-amber-200/70 mt-1">
                This write operation will interact with external services or modify verified enterprise records.
                Review the payload below before authorizing execution.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-800/80 pb-2 text-xs">
              <span className="text-slate-400">Operation:</span>
              <span className="col-span-2 font-mono text-cyan-400 font-semibold">{actionType}</span>
            </div>

            {recipientOrTarget && (
              <div className="grid grid-cols-3 gap-2 border-b border-slate-800/80 pb-2 text-xs">
                <span className="text-slate-400">Target / Recipient:</span>
                <span className="col-span-2 font-mono text-slate-200 break-all">{recipientOrTarget}</span>
              </div>
            )}

            {subjectOrReference && (
              <div className="grid grid-cols-3 gap-2 border-b border-slate-800/80 pb-2 text-xs">
                <span className="text-slate-400">Subject / Ref:</span>
                <span className="col-span-2 text-slate-200 font-medium">{subjectOrReference}</span>
              </div>
            )}

            {bodyPreview && (
              <div className="pt-1">
                <span className="text-xs text-slate-400 block mb-1">Proposed Content:</span>
                <div className="max-h-48 overflow-y-auto rounded bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                  {bodyPreview}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isExecuting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Executing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Approve & Execute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
