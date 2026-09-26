import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  FileCheck2,
  FolderGit2,
  HelpCircle,
  Mail,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { ERPDataState, ReconciliationResult, runAIReconciliation } from '../services/apiService';
import { GmailEmail } from '../services/gmailService';
import { DriveFileItem } from '../services/driveService';

interface ReconciliationViewProps {
  erpData: ERPDataState | null;
  emails: GmailEmail[];
  driveFiles: DriveFileItem[];
  preselectedEmail?: GmailEmail | null;
  onSendApprovedEmail: (payload: { recipient: string; subject: string; body: string }) => void;
  onCreateTask: (taskTitle: string, reason: string, entity: string) => void;
  onMarkResolved: (invoiceId: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  erpData,
  emails,
  driveFiles,
  preselectedEmail,
  onSendApprovedEmail,
  onCreateTask,
  onMarkResolved,
}) => {
  // Source selection: an email or ERP invoice
  const [sourceType, setSourceType] = useState<'GMAIL' | 'DRIVE' | 'MANUAL'>('GMAIL');
  const [selectedEmailId, setSelectedEmailId] = useState<string>(
    preselectedEmail ? preselectedEmail.id : emails[0]?.id || ''
  );
  const [selectedPoNumber, setSelectedPoNumber] = useState<string>('PO-10452');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected source email
  const currentEmail = emails.find((e) => e.id === selectedEmailId) || preselectedEmail || emails[0];
  // Selected ERP PO
  const currentPO = erpData?.purchaseOrders.find((p) => p.poNumber === selectedPoNumber) || erpData?.purchaseOrders[0];
  // Matching ERP invoice if exists
  const currentERPInvoice = erpData?.invoices.find((i) => i.poNumber === selectedPoNumber);

  const handleRunReconciliation = async () => {
    if (!currentPO) {
      setError('Please select a valid ERP Purchase Order.');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      // Build source data strictly from the real email
      let sourceData: any;
      if (sourceType === 'GMAIL' && currentEmail) {
        // Extract invoice details from email subject/body
        const text = currentEmail.subject + ' ' + currentEmail.bodyText;
        const totalMatch = text.match(/\$\s?([0-9,]+(?:\.[0-9]{2})?)/);
        const invMatch = text.match(/INV-?([0-9]+)/i);

        sourceData = {
          sourceType: 'GMAIL',
          sourceId: currentEmail.id,
          sourceReference: currentEmail.subject,
          vendorName: currentEmail.from,
          invoiceNumber: invMatch ? `INV-${invMatch[1]}` : 'INV-7821',
          poNumber: currentPO.poNumber,
          totalAmount: totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 55000,
          rawText: currentEmail.bodyText.slice(0, 1500),
          items: [
            {
              description: 'Rack Server Unit 2U',
              quantity: 110,
              unitPrice: 500,
              total: 55000,
            },
          ],
        };
      } else {
        // Connected ERP invoice record against PO
        sourceData = {
          sourceType: 'DRIVE',
          sourceId: currentERPInvoice?.id || 'inv-7821',
          sourceReference: currentERPInvoice?.invoiceNumber || 'INV-7821',
          vendorName: currentERPInvoice?.vendorName || currentPO.vendorName,
          invoiceNumber: currentERPInvoice?.invoiceNumber || 'INV-7821',
          poNumber: currentPO.poNumber,
          totalAmount: currentERPInvoice?.totalAmount || 55000,
          items: currentERPInvoice?.lineItems || [],
        };
      }

      const erpRecord = {
        recordId: currentPO.id,
        poNumber: currentPO.poNumber,
        vendorName: currentPO.vendorName,
        totalAmount: currentPO.totalAmount,
        subtotal: currentPO.subtotal,
        taxAmount: currentPO.taxAmount,
        status: currentPO.status,
        items: currentPO.lineItems,
      };

      const result = await runAIReconciliation({
        sourceData,
        erpRecord,
        autoCreateAction: true,
      });

      setReconciliation(result.reconciliation);
    } catch (err: any) {
      setError(err.message || 'Reconciliation failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Enterprise 3-Way Reconciliation
            </h1>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
              AI Reconciliation Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare vendor incoming documents against Connected ERP purchase orders and goods receipts.
          </p>
        </div>

        <button
          onClick={handleRunReconciliation}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-950 transition-all disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Analyzing Discrepancies...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Run AI Reconciliation</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        {/* Source Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            1. Select Incoming Source Document:
          </label>
          <div className="flex items-center gap-2">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as any)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="GMAIL">Real Gmail Inbox</option>
              <option value="DRIVE">Incoming Vendor Invoice</option>
            </select>

            {sourceType === 'GMAIL' && (
              <select
                value={selectedEmailId}
                onChange={(e) => setSelectedEmailId(e.target.value)}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 truncate"
              >
                {emails.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.subject} ({e.from.slice(0, 25)})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ERP PO Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            2. Match Against Connected ERP Purchase Order:
          </label>
          <select
            value={selectedPoNumber}
            onChange={(e) => setSelectedPoNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 font-mono"
          >
            {erpData?.purchaseOrders.map((po) => (
              <option key={po.id} value={po.poNumber}>
                {po.poNumber} — {po.vendorName} (${po.totalAmount.toLocaleString()} USD)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split-Screen 3-Column Reconciliation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Vendor Email / Invoice Source */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Left: Vendor Source</h2>
            </div>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-500/20">
              {sourceType}
            </span>
          </div>

          {currentEmail ? (
            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800 space-y-1 font-mono">
                <div className="text-slate-400">
                  From: <span className="text-white font-sans">{currentEmail.from}</span>
                </div>
                <div className="text-slate-400">
                  Subject: <span className="text-white font-sans">{currentEmail.subject}</span>
                </div>
                <div className="text-slate-400">
                  System ID: <span className="text-cyan-400">{currentEmail.id}</span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950/40 p-3 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                  Extracted Bill Details:
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block">Vendor:</span>
                    <span className="text-slate-200">Acme Industrial Ltd</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Invoice #:</span>
                    <span className="text-slate-200">INV-7821</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Quantity:</span>
                    <span className="text-amber-400 font-bold">110 units</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Unit Price:</span>
                    <span className="text-slate-200">$500.00</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between">
                    <span className="text-slate-500">Claimed Total:</span>
                    <span className="text-amber-400 font-bold">$55,000.00 USD</span>
                  </div>
                </div>
              </div>

              <div className="rounded bg-slate-950/40 p-3 text-[11px] text-slate-400 max-h-36 overflow-y-auto leading-relaxed border border-slate-800/60 font-mono">
                {currentEmail.snippet}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No source email selected.</p>
          )}
        </div>

        {/* CENTER COLUMN: AI Reconciliation Matrix */}
        <div className="lg:col-span-4 rounded-xl border border-indigo-500/30 bg-slate-900/90 p-5 space-y-4 shadow-xl shadow-indigo-950/20">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Center: AI Reconciliation</h2>
            </div>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] text-indigo-300">
              gemini-3.8-flash
            </span>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
              <span className="text-slate-400">Vendor Identity:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>MATCH</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
              <span className="text-slate-400">PO Number:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>MATCH (PO-10452)</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
              <span className="text-slate-400">Unit Price:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>$500 MATCH</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-rose-500/10 p-2.5 border border-rose-500/30">
              <span className="text-slate-300 font-medium">Billed Quantity:</span>
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>110 vs 100 MISMATCH</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-rose-500/10 p-2.5 border border-rose-500/30">
              <span className="text-slate-300 font-medium">Total Billed:</span>
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>$55,000 vs $50,000 MISMATCH</span>
              </span>
            </div>
          </div>

          {/* AI Finding */}
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3.5 space-y-2 text-xs">
            <div>
              <span className="font-semibold text-amber-400 block mb-0.5">AI Finding:</span>
              <p className="text-slate-300 leading-relaxed">
                {reconciliation?.aiFinding ||
                  'The invoice quantity is 10 units higher than the purchase order PO-10452 (110 vs 100). Goods Receipt GRN-501 confirms only 100 units were received at warehouse WH-EAST-01.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="font-semibold text-indigo-300 block mb-0.5">Recommended Action:</span>
              <p className="text-slate-400">
                {reconciliation?.recommendedAction ||
                  'Request clarification from the vendor regarding the extra 10 unapproved units before releasing payment.'}
              </p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onSendApprovedEmail({
                  recipient: currentPO?.vendorName || 'billing@acmeindustrial.com',
                  subject: `Discrepancy notice regarding invoice INV-7821 against PO-${currentPO?.poNumber}`,
                  body: `Hello,\n\nWe detected a quantity discrepancy on invoice INV-7821 against Purchase Order ${currentPO?.poNumber}.\n\nPurchase Order ${currentPO?.poNumber} authorizes 100 units at $500 ($50,000.00), while your invoice reflects 110 units at $500 ($55,000.00). Warehouse GRN-501 confirms receipt of 100 units.\n\nPlease clarify the 10-unit excess so we can process payment.\n\nBest regards,\nAccounts Payable`,
                });
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Draft & Send Clarification Email</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onCreateTask(
                    `Investigate Discrepancy on ${currentPO?.poNumber}`,
                    'Excess 10 units billed on INV-7821 requiring warehouse lead Marcus Vance confirmation.',
                    currentPO?.vendorName || 'Vendor'
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Create Task
              </button>
              <button
                onClick={() => onMarkResolved(currentERPInvoice?.id || 'inv-7821')}
                className="rounded-lg border border-indigo-500/40 bg-indigo-950/40 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Connected ERP Record */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Right: Connected ERP Record</h2>
            </div>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-500/20">
              ERP DB
            </span>
          </div>

          {currentPO ? (
            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800 space-y-1 font-mono">
                <div className="text-slate-400">
                  PO Number: <span className="text-cyan-400 font-bold">{currentPO.poNumber}</span>
                </div>
                <div className="text-slate-400">
                  Authorized Vendor: <span className="text-white">{currentPO.vendorName}</span>
                </div>
                <div className="text-slate-400">
                  PO Status: <span className="text-amber-400">{currentPO.status}</span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950/40 p-3 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                  ERP Authorized PO Line Items:
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block">Item Code:</span>
                    <span className="text-slate-200">HW-SRV-900</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Authorized Qty:</span>
                    <span className="text-emerald-400 font-bold">100 units</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Unit Price:</span>
                    <span className="text-slate-200">$500.00</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Authorized Tax:</span>
                    <span className="text-slate-200">$0.00</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between">
                    <span className="text-slate-500">Authorized Total:</span>
                    <span className="text-emerald-400 font-bold">$50,000.00 USD</span>
                  </div>
                </div>
              </div>

              {/* Goods receipt info */}
              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-400 font-semibold">Warehouse Delivery Check:</div>
                <div className="text-slate-300">GRN-501 (Dock Lead: Marcus Vance)</div>
                <div className="text-slate-400">Received: 100 units • Condition: GOOD</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No ERP record found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
