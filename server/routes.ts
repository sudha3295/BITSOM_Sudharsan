import { Router } from 'express';
import { erpDb } from './erpDatabase';
import { actionStore } from './actionService';
import { reconcileInvoiceWithERP, extractActionsFromEmail, extractActionsFromChat } from './geminiService';

export const apiRouter = Router();

// ==================== CONFIG & HEALTH ====================
apiRouter.get('/config', (req, res) => {
  res.json({
    brandName: 'Entro Cowork',
    projectId: 'cohort3track1-507014',
    erpConnected: true,
    aiModel: 'gemini-3.8-flash',
  });
});

// ==================== ERP DATA ENDPOINTS ====================
apiRouter.get('/erp/vendors', (req, res) => {
  res.json(erpDb.vendors);
});

apiRouter.get('/erp/purchase-orders', (req, res) => {
  res.json(erpDb.purchaseOrders);
});

apiRouter.get('/erp/invoices', (req, res) => {
  res.json(erpDb.invoices);
});

apiRouter.get('/erp/goods-receipts', (req, res) => {
  res.json(erpDb.goodsReceipts);
});

apiRouter.get('/erp/payments', (req, res) => {
  res.json(erpDb.payments);
});

apiRouter.get('/erp/employees', (req, res) => {
  res.json(erpDb.employees);
});

apiRouter.get('/erp/customers', (req, res) => {
  res.json(erpDb.customers);
});

apiRouter.get('/erp/query', (req, res) => {
  const { poNumber, invoiceNumber, vendorName } = req.query as {
    poNumber?: string;
    invoiceNumber?: string;
    vendorName?: string;
  };

  const results: any = {};
  if (poNumber) {
    results.purchaseOrder = erpDb.findPO(poNumber);
  }
  if (invoiceNumber) {
    results.invoice = erpDb.findInvoice(invoiceNumber);
  }
  if (vendorName) {
    results.vendor = erpDb.findVendorByNameOrEmail(vendorName);
  }

  res.json(results);
});

apiRouter.post('/erp/invoices/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const inv = erpDb.invoices.find((i) => i.id === id || i.invoiceNumber === id);
  if (!inv) {
    return res.status(404).json({ error: 'ERP Invoice not found' });
  }
  inv.status = status;
  if (note) inv.discrepancyNote = note;
  res.json(inv);
});

// ==================== ACTIONS & AUDIT TRAIL ====================
apiRouter.get('/actions', (req, res) => {
  const { status, source, priority } = req.query as {
    status?: string;
    source?: string;
    priority?: string;
  };
  const actions = actionStore.getActions({ status, source, priority });
  res.json(actions);
});

apiRouter.get('/actions/:id', (req, res) => {
  const action = actionStore.getActionById(req.params.id);
  if (!action) return res.status(404).json({ error: 'Action not found' });
  res.json(action);
});

apiRouter.post('/actions', (req, res) => {
  const created = actionStore.addAction(req.body);
  res.status(201).json(created);
});

apiRouter.patch('/actions/:id/status', (req, res) => {
  const { status, executionResult, auditLogId } = req.body;
  const updated = actionStore.updateActionStatus(req.params.id, status, {
    executionResult,
    auditLogId,
  });
  if (!updated) return res.status(404).json({ error: 'Action not found' });
  res.json(updated);
});

apiRouter.get('/audit-logs', (req, res) => {
  res.json(actionStore.getAuditLogs());
});

apiRouter.post('/audit-logs', (req, res) => {
  const log = actionStore.addAuditLog(req.body);
  res.status(201).json(log);
});

// ==================== AI WORKFLOWS ====================
apiRouter.post('/ai/reconcile', async (req, res) => {
  try {
    const { sourceData, erpRecord, autoCreateAction } = req.body;
    if (!sourceData || !erpRecord) {
      return res.status(400).json({ error: 'Missing sourceData or erpRecord in payload' });
    }

    const reconciliation = await reconcileInvoiceWithERP({ sourceData, erpRecord });

    let createdAction = null;
    if (autoCreateAction && reconciliation.hasDiscrepancy) {
      createdAction = actionStore.addAction({
        title: `Reconciliation Discrepancy: ${erpRecord.poNumber} vs ${sourceData.invoiceNumber || 'Invoice'}`,
        actionType: reconciliation.suggestedActionType || 'FOLLOW_UP_VENDOR',
        source: {
          type: sourceData.sourceType,
          id: sourceData.sourceId,
          reference: sourceData.sourceReference,
        },
        relatedEntity: erpRecord.vendorName,
        priority: 'HIGH',
        reason: reconciliation.aiFinding,
        recommendedNextStep: reconciliation.recommendedAction,
        proposedPayload: reconciliation.draftEmail
          ? {
              actionType: 'SEND_EMAIL',
              to: reconciliation.draftEmail.recipient,
              subject: reconciliation.draftEmail.subject,
              body: reconciliation.draftEmail.body,
            }
          : undefined,
      });
    }

    res.json({ reconciliation, createdAction });
  } catch (err: any) {
    console.error('Reconciliation endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to reconcile invoice' });
  }
});

apiRouter.post('/ai/extract-email-action', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.id) {
      return res.status(400).json({ error: 'Missing email object' });
    }

    const analysis = await extractActionsFromEmail(email);

    let actionItem = null;
    if (analysis.requiresAction && analysis.actionTitle) {
      actionItem = actionStore.addAction({
        title: analysis.actionTitle,
        actionType: analysis.actionType || 'REPLY_EMAIL',
        source: {
          type: 'GMAIL',
          id: email.id,
          threadId: email.threadId,
          label: email.subject,
        },
        relatedEntity: email.from,
        priority: analysis.priority || 'MEDIUM',
        reason: analysis.reason || 'Pending response or verification required.',
        recommendedNextStep: analysis.recommendedNextStep || 'Review email and reply.',
        dueDate: analysis.dueDate || undefined,
        proposedPayload: analysis.suggestedDraftReply
          ? {
              actionType: 'SEND_EMAIL',
              to: analysis.suggestedDraftReply.to,
              subject: analysis.suggestedDraftReply.subject,
              body: analysis.suggestedDraftReply.body,
            }
          : undefined,
      });
    }

    res.json({ analysis, actionItem });
  } catch (err: any) {
    console.error('Extract email action error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract email action' });
  }
});

apiRouter.post('/ai/extract-chat-action', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.id) {
      return res.status(400).json({ error: 'Missing message object' });
    }

    const analysis = await extractActionsFromChat(message);

    let actionItem = null;
    if (analysis.requiresAction && analysis.actionTitle) {
      actionItem = actionStore.addAction({
        title: analysis.actionTitle,
        actionType: 'RESPOND_CHAT',
        source: {
          type: 'CHAT',
          id: message.id,
          label: message.spaceName,
        },
        relatedEntity: message.senderName,
        priority: analysis.priority || 'MEDIUM',
        reason: analysis.reason || 'Chat request requires follow-up.',
        recommendedNextStep: analysis.recommendedNextStep || 'Reply to message.',
        proposedPayload: analysis.suggestedReply
          ? {
              actionType: 'SEND_CHAT',
              spaceName: message.spaceName,
              body: analysis.suggestedReply,
            }
          : undefined,
      });
    }

    res.json({ analysis, actionItem });
  } catch (err: any) {
    console.error('Extract chat action error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract chat action' });
  }
});
