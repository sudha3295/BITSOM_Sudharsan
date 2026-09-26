/**
 * Entro Cowork Backend API Client
 * Interfaces with the application-owned ERP database, Action Center,
 * AI reasoning engine, and immutable audit logs.
 */

export interface ActionItem {
  id: string;
  title: string;
  actionType:
    | 'REPLY_EMAIL'
    | 'FOLLOW_UP_VENDOR'
    | 'RECONCILE_INVOICE'
    | 'REVIEW_DOCUMENT'
    | 'APPROVE_DISCREPANCY'
    | 'RESPOND_CHAT'
    | 'REVIEW_PAYMENT'
    | 'INVESTIGATE_EXCEPTION';
  source: {
    type: 'GMAIL' | 'CHAT' | 'DRIVE' | 'ERP';
    id: string;
    threadId?: string;
    label?: string;
    reference?: string;
  };
  relatedEntity: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  reason: string;
  recommendedNextStep: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'EXECUTED' | 'DISMISSED';
  proposedPayload?: {
    actionType: 'SEND_EMAIL' | 'SEND_CHAT' | 'UPDATE_ERP' | 'CREATE_TASK';
    to?: string;
    subject?: string;
    body?: string;
    spaceName?: string;
    recordId?: string;
    details?: string;
  };
  createdAt: string;
  executedAt?: string;
  executionResult?: string;
  auditLogId?: string;
}

export interface AuditLogEntry {
  id: string;
  actionId?: string;
  action: string;
  timestamp: string;
  user: string;
  source: string;
  result: string;
  externalId?: string;
  details?: any;
}

export interface ERPDataState {
  vendors: any[];
  purchaseOrders: any[];
  invoices: any[];
  goodsReceipts: any[];
  payments: any[];
  employees: any[];
  customers: any[];
}

export interface DiscrepancyComparisonField {
  fieldName: string;
  sourceValue: string | number;
  erpValue: string | number;
  status: 'MATCH' | 'MISMATCH' | 'MISSING_IN_SOURCE' | 'MISSING_IN_ERP';
  note?: string;
}

export interface ReconciliationResult {
  vendor: { source: string; erp: string; status: 'MATCH' | 'MISMATCH' };
  poNumber: { source: string; erp: string; status: 'MATCH' | 'MISMATCH' | 'MISSING' };
  invoiceNumber: { source: string; erp: string; status: 'MATCH' | 'MISMATCH' | 'MISSING' };
  comparisons: DiscrepancyComparisonField[];
  hasDiscrepancy: boolean;
  aiFinding: string;
  recommendedAction: string;
  suggestedActionType: 'REPLY_EMAIL' | 'FOLLOW_UP_VENDOR' | 'APPROVE_DISCREPANCY' | 'REVIEW_PAYMENT';
  draftEmail?: {
    recipient: string;
    subject: string;
    body: string;
  };
  sources: {
    type: 'GMAIL' | 'DRIVE' | 'ERP';
    id: string;
    reference: string;
  }[];
}

// Fetch all ERP collections
export async function fetchERPData(): Promise<ERPDataState> {
  const [vendors, purchaseOrders, invoices, goodsReceipts, payments, employees, customers] =
    await Promise.all([
      fetch('/api/erp/vendors').then((r) => r.json()),
      fetch('/api/erp/purchase-orders').then((r) => r.json()),
      fetch('/api/erp/invoices').then((r) => r.json()),
      fetch('/api/erp/goods-receipts').then((r) => r.json()),
      fetch('/api/erp/payments').then((r) => r.json()),
      fetch('/api/erp/employees').then((r) => r.json()),
      fetch('/api/erp/customers').then((r) => r.json()),
    ]);

  return {
    vendors,
    purchaseOrders,
    invoices,
    goodsReceipts,
    payments,
    employees,
    customers,
  };
}

export async function fetchActions(params?: {
  status?: string;
  source?: string;
  priority?: string;
}): Promise<ActionItem[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.source) query.set('source', params.source);
  if (params?.priority) query.set('priority', params.priority);

  const res = await fetch(`/api/actions?${query.toString()}`);
  return res.json();
}

export async function createAction(action: Partial<ActionItem>): Promise<ActionItem> {
  const res = await fetch('/api/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  return res.json();
}

export async function updateActionStatus(
  id: string,
  status: ActionItem['status'],
  executionData?: { executionResult?: string; auditLogId?: string }
): Promise<ActionItem> {
  const res = await fetch(`/api/actions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, ...executionData }),
  });
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch('/api/audit-logs');
  return res.json();
}

export async function recordAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
  const res = await fetch('/api/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  return res.json();
}

export async function runAIReconciliation(payload: {
  sourceData: any;
  erpRecord: any;
  autoCreateAction?: boolean;
}): Promise<{ reconciliation: ReconciliationResult; createdAction?: ActionItem }> {
  const res = await fetch('/api/ai/reconcile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run AI reconciliation');
  }
  return res.json();
}

export async function extractActionFromEmail(email: any): Promise<{
  analysis: any;
  actionItem?: ActionItem;
}> {
  const res = await fetch('/api/ai/extract-email-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function extractActionFromChat(message: any): Promise<{
  analysis: any;
  actionItem?: ActionItem;
}> {
  const res = await fetch('/api/ai/extract-chat-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

export async function updateERPInvoiceStatus(id: string, status: string, note?: string) {
  const res = await fetch(`/api/erp/invoices/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  return res.json();
}
