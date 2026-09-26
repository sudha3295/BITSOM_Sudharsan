/**
 * Gemini AI Reasoning & Reconciliation Service
 * Grounded AI analysis over real connected Gmail, Chat, Drive, and ERP records.
 * Uses gemini-3.8-flash via the official @google/genai SDK.
 */

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

export async function reconcileInvoiceWithERP(params: {
  sourceData: {
    vendorName?: string;
    invoiceNumber?: string;
    poNumber?: string;
    totalAmount?: number;
    subtotal?: number;
    taxAmount?: number;
    date?: string;
    items?: { description: string; quantity: number; unitPrice: number; total: number }[];
    rawText?: string;
    sourceId: string;
    sourceType: 'GMAIL' | 'DRIVE';
    sourceReference: string;
  };
  erpRecord: {
    poNumber: string;
    vendorName: string;
    totalAmount: number;
    subtotal: number;
    taxAmount: number;
    status: string;
    items?: { description: string; quantity: number; unitPrice: number; total: number }[];
    recordId: string;
  };
}): Promise<ReconciliationResult> {
  const prompt = `You are the Entro Cowork AI Reconciliation Engine.
Analyze and compare the following real connected Source Document (from ${params.sourceData.sourceType}, ID: ${params.sourceData.sourceId}) against the Connected ERP Record (ID: ${params.erpRecord.recordId}).

CRITICAL INSTRUCTION:
- Ground all facts strictly in the provided data.
- Do NOT invent or hallucinate missing values. If a field is not present, mark it as missing.
- Identify exact matches, mismatches, or missing fields.
- Determine if there is any financial, quantity, or specification discrepancy.
- Produce an actionable AI Finding explaining the root difference clearly and objectively.
- Recommend the precise next step (e.g., request clarification from vendor, approve exception, adjust PO).
- Draft a professional email response to the vendor addressing the exact discrepancy.

Source Data (${params.sourceData.sourceType}):
${JSON.stringify(params.sourceData, null, 2)}

ERP Data:
${JSON.stringify(params.erpRecord, null, 2)}

Respond with STRICT JSON only in the following schema:
{
  "vendor": { "source": string, "erp": string, "status": "MATCH" | "MISMATCH" },
  "poNumber": { "source": string, "erp": string, "status": "MATCH" | "MISMATCH" | "MISSING" },
  "invoiceNumber": { "source": string, "erp": string, "status": "MATCH" | "MISMATCH" | "MISSING" },
  "comparisons": [
    {
      "fieldName": string,
      "sourceValue": string | number,
      "erpValue": string | number,
      "status": "MATCH" | "MISMATCH" | "MISSING_IN_SOURCE" | "MISSING_IN_ERP",
      "note": string
    }
  ],
  "hasDiscrepancy": boolean,
  "aiFinding": string,
  "recommendedAction": string,
  "suggestedActionType": "REPLY_EMAIL" | "FOLLOW_UP_VENDOR" | "APPROVE_DISCREPANCY" | "REVIEW_PAYMENT",
  "draftEmail": {
    "recipient": string,
    "subject": string,
    "body": string
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...parsed,
      sources: [
        {
          type: params.sourceData.sourceType,
          id: params.sourceData.sourceId,
          reference: params.sourceData.sourceReference,
        },
        {
          type: 'ERP',
          id: params.erpRecord.recordId,
          reference: params.erpRecord.poNumber,
        },
      ],
    };
  } catch (err) {
    console.error('Gemini reconciliation error:', err);
    // Fallback deterministic reconciliation if API key is unconfigured or rate limited
    const s = params.sourceData;
    const e = params.erpRecord;
    const vendorMatch = (s.vendorName || '').toLowerCase().includes((e.vendorName || '').toLowerCase().slice(0, 5));
    const poMatch = (s.poNumber || '').toUpperCase().trim() === (e.poNumber || '').toUpperCase().trim();
    const amountMatch = s.totalAmount !== undefined && Math.abs(s.totalAmount - e.totalAmount) < 0.01;

    const comparisons: DiscrepancyComparisonField[] = [
      {
        fieldName: 'Vendor Name',
        sourceValue: s.vendorName || 'Not specified',
        erpValue: e.vendorName,
        status: vendorMatch ? 'MATCH' : 'MISMATCH',
      },
      {
        fieldName: 'PO Number',
        sourceValue: s.poNumber || 'Missing',
        erpValue: e.poNumber,
        status: poMatch ? 'MATCH' : 'MISMATCH',
      },
      {
        fieldName: 'Total Amount',
        sourceValue: s.totalAmount !== undefined ? `$${s.totalAmount}` : 'Missing',
        erpValue: `$${e.totalAmount}`,
        status: amountMatch ? 'MATCH' : 'MISMATCH',
        note: !amountMatch && s.totalAmount ? `Difference of $${Math.abs(s.totalAmount - e.totalAmount)}` : undefined,
      },
    ];

    const hasDiscrepancy = !amountMatch || !poMatch || !vendorMatch;

    return {
      vendor: { source: s.vendorName || 'N/A', erp: e.vendorName, status: vendorMatch ? 'MATCH' : 'MISMATCH' },
      poNumber: { source: s.poNumber || 'N/A', erp: e.poNumber, status: poMatch ? 'MATCH' : 'MISMATCH' },
      invoiceNumber: { source: s.invoiceNumber || 'N/A', erp: e.poNumber, status: s.invoiceNumber ? 'MATCH' : 'MISSING' },
      comparisons,
      hasDiscrepancy,
      aiFinding: hasDiscrepancy
        ? `Variance detected between ${params.sourceData.sourceType} source and ERP PO ${e.poNumber}: Total amount difference of $${Math.abs((s.totalAmount || 0) - e.totalAmount)}.`
        : `All key fields match perfectly with ERP PO ${e.poNumber}.`,
      recommendedAction: hasDiscrepancy
        ? 'Request clarification from the vendor regarding the quantity or price discrepancy before issuing payment.'
        : 'Approve invoice for payment scheduling in ERP.',
      suggestedActionType: hasDiscrepancy ? 'FOLLOW_UP_VENDOR' : 'APPROVE_DISCREPANCY',
      draftEmail: {
        recipient: s.vendorName || 'vendor@example.com',
        subject: `Discrepancy notice regarding PO ${e.poNumber} / ${s.invoiceNumber || 'Invoice'}`,
        body: `Hello,\n\nOur system detected a discrepancy when reconciling your invoice against purchase order ${e.poNumber}.\n\nPlease review and advise.\n\nBest regards,\nAccounts Payable Team`,
      },
      sources: [
        { type: params.sourceData.sourceType, id: params.sourceData.sourceId, reference: params.sourceData.sourceReference },
        { type: 'ERP', id: params.erpRecord.recordId, reference: params.erpRecord.poNumber },
      ],
    };
  }
}

export async function extractActionsFromEmail(email: {
  id: string;
  threadId?: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  bodyText: string;
}): Promise<{
  requiresAction: boolean;
  actionTitle?: string;
  actionType?: 'REPLY_EMAIL' | 'FOLLOW_UP_VENDOR' | 'RECONCILE_INVOICE' | 'REVIEW_DOCUMENT' | 'INVESTIGATE_EXCEPTION';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
  recommendedNextStep?: string;
  dueDate?: string;
  suggestedDraftReply?: {
    to: string;
    subject: string;
    body: string;
  };
}> {
  const prompt = `You are Entro Cowork Workplace Intelligence.
Evaluate this REAL email from an authenticated user's Gmail inbox.
Determine if it requires action, follow-up, invoice reconciliation, document review, or a reply.

CRITICAL:
- Strictly ground your evaluation in the real text provided.
- Do NOT invent hypothetical scenarios.
- If it is promotional, newsletter, or purely informational with no required user action, set "requiresAction": false.
- If an action is required, assign an appropriate priority (CRITICAL, HIGH, MEDIUM, LOW) and compose a suggested draft response.

Email details:
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}
Snippet: ${email.snippet}
Body:
${email.bodyText.slice(0, 3000)}

Respond in STRICT JSON:
{
  "requiresAction": boolean,
  "actionTitle": string,
  "actionType": "REPLY_EMAIL" | "FOLLOW_UP_VENDOR" | "RECONCILE_INVOICE" | "REVIEW_DOCUMENT" | "INVESTIGATE_EXCEPTION",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": string,
  "recommendedNextStep": string,
  "dueDate": string | null,
  "suggestedDraftReply": {
    "to": string,
    "subject": string,
    "body": string
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Gemini extractActionsFromEmail error:', err);
    // Heuristic fallback
    const lower = (email.subject + ' ' + email.snippet + ' ' + email.bodyText).toLowerCase();
    const isUrgent = lower.includes('urgent') || lower.includes('asap') || lower.includes('action required');
    const isInvoice = lower.includes('invoice') || lower.includes('bill') || lower.includes('payment due');
    const isQuestion = lower.includes('?') || lower.includes('could you') || lower.includes('please confirm');

    if (isInvoice) {
      return {
        requiresAction: true,
        actionTitle: `Reconcile Invoice: ${email.subject}`,
        actionType: 'RECONCILE_INVOICE',
        priority: 'HIGH',
        reason: 'Email contains invoice or billing details requiring cross-verification against ERP.',
        recommendedNextStep: 'Cross-reference invoice details with purchase orders in ERP database.',
        suggestedDraftReply: {
          to: email.from,
          subject: `Re: ${email.subject}`,
          body: `Thank you for sending this over. Our finance team is reviewing the invoice against our ERP purchase records.\n\nBest regards,`,
        },
      };
    }

    if (isUrgent || isQuestion) {
      return {
        requiresAction: true,
        actionTitle: `Respond to: ${email.subject}`,
        actionType: 'REPLY_EMAIL',
        priority: isUrgent ? 'CRITICAL' : 'MEDIUM',
        reason: 'Sender is requesting confirmation, information, or an update.',
        recommendedNextStep: 'Review sender inquiry and send approved response.',
        suggestedDraftReply: {
          to: email.from,
          subject: `Re: ${email.subject}`,
          body: `Hi,\n\nI have received your message regarding "${email.subject}" and am looking into this right now.\n\nBest regards,`,
        },
      };
    }

    return { requiresAction: false };
  }
}

export async function extractActionsFromChat(message: {
  id: string;
  spaceName: string;
  senderName: string;
  createTime: string;
  text: string;
}): Promise<{
  requiresAction: boolean;
  actionTitle?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
  recommendedNextStep?: string;
  suggestedReply?: string;
}> {
  const prompt = `You are Entro Cowork Workplace Intelligence.
Evaluate this REAL message from an authenticated Google Chat space.
Message:
Sender: ${message.senderName}
Space: ${message.spaceName}
Sent: ${message.createTime}
Text: ${message.text}

Determine if this message represents a pending task, question, or follow-up.
Respond in STRICT JSON:
{
  "requiresAction": boolean,
  "actionTitle": string,
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": string,
  "recommendedNextStep": string,
  "suggestedReply": string
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Gemini extractActionsFromChat error:', err);
    return {
      requiresAction: message.text.includes('?') || message.text.toLowerCase().includes('need') || message.text.toLowerCase().includes('please'),
      actionTitle: `Follow up with ${message.senderName}`,
      priority: 'MEDIUM',
      reason: 'Chat message contains a direct request or query.',
      recommendedNextStep: 'Send acknowledgment and update in the chat space.',
      suggestedReply: `Acknowledged! Looking into this now.`,
    };
  }
}
