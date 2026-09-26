import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderGit2,
  Inbox,
  Mail,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import { GmailEmail } from '../services/gmailService';
import { ActionItem } from '../services/apiService';

interface InboxViewProps {
  emails: GmailEmail[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onScanEmail: (email: GmailEmail) => Promise<void>;
  onPrepareSendReply: (email: GmailEmail, suggestedReply?: { to: string; subject: string; body: string }) => void;
  onSendToReconciliation: (email: GmailEmail) => void;
  scanningId: string | null;
}

export const InboxView: React.FC<InboxViewProps> = ({
  emails,
  isLoading,
  error,
  onRefresh,
  onScanEmail,
  onPrepareSendReply,
  onSendToReconciliation,
  scanningId,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(emails[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabel, setFilterLabel] = useState('ALL');

  // Filter emails
  const filteredEmails = emails.filter((em) => {
    if (filterLabel === 'UNREAD' && !em.labels.includes('UNREAD')) return false;
    if (filterLabel === 'INVOICE') {
      const text = (em.subject + ' ' + em.snippet).toLowerCase();
      if (!text.includes('invoice') && !text.includes('bill') && !text.includes('payment')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        em.subject.toLowerCase().includes(q) ||
        em.from.toLowerCase().includes(q) ||
        em.snippet.toLowerCase().includes(q) ||
        em.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Gmail Workplace Inbox</h1>
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/30">
              Live Gmail API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real retrieved messages from the authenticated Google account. Zero mock emails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Inbox</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Gmail API Status:</span>
            {error}
          </div>
        </div>
      )}

      {/* Main Mail layout: Left list, Right email viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Email List */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          {/* Search & Filter */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search real emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-500">Filter:</span>
              <button
                onClick={() => setFilterLabel('ALL')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  filterLabel === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({emails.length})
              </button>
              <button
                onClick={() => setFilterLabel('UNREAD')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  filterLabel === 'UNREAD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterLabel('INVOICE')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  filterLabel === 'INVOICE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Invoices / Bills
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[650px]">
            {isLoading && emails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
                <p className="text-xs">Fetching real messages from Gmail API...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No emails found matching your filter criteria.
              </div>
            ) : (
              filteredEmails.map((em) => {
                const isSelected = selectedEmail?.id === em.id;
                const isUnread = em.labels.includes('UNREAD');
                return (
                  <div
                    key={em.id}
                    onClick={() => setSelectedEmail(em)}
                    className={`p-3.5 cursor-pointer transition-colors space-y-1.5 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`truncate max-w-[180px] ${isUnread ? 'font-bold text-white' : 'text-slate-300 font-medium'}`}>
                        {em.from}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(em.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className={`text-xs truncate ${isUnread ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                      {em.subject}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {em.snippet}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono text-[9px] text-slate-600">ID: {em.id.slice(0, 10)}...</span>
                      {em.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300">
                          <Paperclip className="h-2.5 w-2.5" />
                          {em.attachments.length} file(s)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Details & AI Actions */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Email Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {selectedEmail.subject}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>From: <strong className="text-slate-200">{selectedEmail.from}</strong></span>
                      <span>•</span>
                      <span>To: {selectedEmail.to || 'me'}</span>
                      <span>•</span>
                      <span>Date: {new Date(selectedEmail.date).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onScanEmail(selectedEmail)}
                      disabled={scanningId === selectedEmail.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Sparkles className={`h-3.5 w-3.5 ${scanningId === selectedEmail.id ? 'animate-spin' : ''}`} />
                      <span>{scanningId === selectedEmail.id ? 'Analyzing...' : 'AI Action Scan'}</span>
                    </button>
                  </div>
                </div>

                {/* System IDs */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 pt-1">
                  <span className="rounded bg-slate-900 px-2 py-0.5 border border-slate-800">
                    Gmail ID: <span className="text-cyan-400">{selectedEmail.id}</span>
                  </span>
                  <span className="rounded bg-slate-900 px-2 py-0.5 border border-slate-800">
                    Thread ID: <span className="text-slate-300">{selectedEmail.threadId}</span>
                  </span>
                </div>
              </div>

              {/* Action shortcuts banner if invoice or request */}
              <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Available Workplace Operations:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSendToReconciliation(selectedEmail)}
                    className="inline-flex items-center gap-1.5 rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-300 hover:bg-amber-500/20 text-xs font-medium"
                  >
                    <FolderGit2 className="h-3 w-3" />
                    <span>Send to ERP Reconciliation</span>
                  </button>

                  <button
                    onClick={() => onPrepareSendReply(selectedEmail)}
                    className="inline-flex items-center gap-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium"
                  >
                    <Send className="h-3 w-3" />
                    <span>Authorized Reply</span>
                  </button>
                </div>
              </div>

              {/* Attachments Section if present */}
              {selectedEmail.attachments.length > 0 && (
                <div className="p-4 bg-slate-900/80 border-b border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Attachments ({selectedEmail.attachments.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-300"
                      >
                        <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="truncate max-w-[200px]">{att.filename}</span>
                        <span className="text-[10px] text-slate-500">({Math.round(att.size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Body text */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[500px] bg-slate-950/30 font-sans text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedEmail.bodyText || '(No plain text content in this email)'}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Mail className="h-12 w-12 stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-400">Select an email to view real contents</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Real messages fetched via Gmail REST API under your authenticated Google account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
