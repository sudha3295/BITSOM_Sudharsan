/**
 * Action & Audit Trail Service
 * Tracks enterprise actions derived from connected data (Gmail, Chat, Drive, ERP)
 * and maintains immutable audit logs for executed write operations.
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
    id: string; // Gmail Message ID, Drive File ID, Chat Message/Space ID, or ERP ID
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

class ActionStore {
  private actions: ActionItem[] = [];
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    // Note: Actions are NOT hardcoded with mock Google data.
    // They are populated dynamically when real Gmail, Chat, Drive, or ERP reconciliation runs.
  }

  public getActions(filters?: { status?: string; source?: string; priority?: string }): ActionItem[] {
    let result = [...this.actions];
    if (filters?.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters?.source) {
      result = result.filter((a) => a.source.type === filters.source);
    }
    if (filters?.priority) {
      result = result.filter((a) => a.priority === filters.priority);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getActionById(id: string): ActionItem | undefined {
    return this.actions.find((a) => a.id === id);
  }

  public addAction(item: Omit<ActionItem, 'id' | 'createdAt' | 'status'> & { status?: ActionItem['status'] }): ActionItem {
    // Check if an action with the exact same source ID and title already exists
    const existing = this.actions.find(
      (a) => a.source.id === item.source.id && a.title === item.title
    );
    if (existing) {
      return existing;
    }

    const newAction: ActionItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: item.status || 'PENDING',
    };
    this.actions.unshift(newAction);
    return newAction;
  }

  public updateActionStatus(
    id: string,
    status: ActionItem['status'],
    executionData?: { executionResult?: string; auditLogId?: string }
  ): ActionItem | null {
    const action = this.actions.find((a) => a.id === id);
    if (!action) return null;
    action.status = status;
    if (status === 'EXECUTED') {
      action.executedAt = new Date().toISOString();
      if (executionData?.executionResult) {
        action.executionResult = executionData.executionResult;
      }
      if (executionData?.auditLogId) {
        action.auditLogId = executionData.auditLogId;
      }
    }
    return action;
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
    return newEntry;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const actionStore = new ActionStore();
