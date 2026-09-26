Entro Cowork

From Workplace Information to Workplace Action

Entro Cowork is an AI-powered workplace action and reconciliation platform that connects an employee's Gmail, Google Chat, Google Drive and enterprise ERP data.

Unlike a traditional AI assistant that primarily answers questions, Entro Cowork understands information scattered across workplace systems, identifies actions and discrepancies, performs reconciliation, recommends the next step, and can execute approved actions.

---

The Problem

Enterprise information is fragmented across multiple systems.

A simple business task may require an employee to:

- Read an email
- Open an attachment
- Search Google Drive
- Check a Google Chat conversation
- Look up an ERP record
- Compare information manually
- Decide what needs to be done
- Send a response
- Track whether the issue was resolved

AI assistants can help employees find and understand information, but the employee still has to connect the systems and complete the workflow.

---

The Entro Cowork Approach

Entro Cowork connects these information sources and turns them into an actionable workflow.

Understand → Retrieve → Reason → Reconcile → Act → Track

For example:

Vendor Email
↓
Invoice Attachment
↓
ERP Purchase Order
↓
AI Reconciliation
↓
Identify Discrepancy
↓
Recommend Action
↓
User Approval
↓
Send Response / Create Task
↓
Track Outcome

---

Example: Invoice Reconciliation

A vendor sends an invoice through Gmail.

Entro Cowork can:

1. Identify the relevant email.
2. Read the invoice information.
3. Retrieve the corresponding ERP record.
4. Compare vendor, PO, invoice, quantity, price and amount.
5. Identify mismatches.
6. Explain the discrepancy.
7. Recommend the next action.
8. Draft a response.
9. Execute the approved action.
10. Maintain an activity trail.

Example Finding

«Quantity mismatch detected
Purchase Order: 100 units
Vendor Invoice: 110 units

Recommended action: Request clarification from the vendor.»

The user remains in control of external actions such as sending an email or responding to a Chat message.

---

Connected Sources

Google Workspace

- Gmail
- Google Drive
- Google Chat

Data is retrieved from the authenticated user's connected Google services using appropriate APIs and permissions.

Enterprise Data

A PostgreSQL / Cloud SQL based ERP dataset represents enterprise transactional information such as:

- Purchase Orders
- Invoices
- Vendors
- Payments
- Goods Receipts

---

AI Layer

Gemini provides reasoning over the retrieved information.

The AI is instructed not to invent missing information.

Every finding can be traced back to its underlying source, such as:

- Gmail message/thread
- Drive document
- Google Chat message
- ERP record

This creates an auditable path from source → reasoning → action.

---

Action Center

Entro Cowork converts information into actionable work.

The Action Center can surface:

- Pending email responses
- Chat follow-ups
- Reconciliation exceptions
- Documents requiring review
- Vendor follow-ups
- Business exceptions

Instead of asking:

"What should I do?"

the employee gets:

"Here is what requires attention, why it matters, and what can be done next."

---

Why Entro Cowork?

Traditional productivity assistants:

Ask → Answer

Entro Cowork:

Observe → Understand → Reconcile → Recommend → Act → Track

The goal is to move AI from being an information assistant to becoming a workflow and action layer across enterprise systems.

---

Prototype

This prototype demonstrates the core concept using:

- Real Google authentication
- Real connected Google Workspace data where API permissions are available
- Application-owned ERP data
- Gemini-powered reasoning
- AI-assisted reconciliation
- User-approved actions
- Activity and audit tracking

Google data is never replaced with fabricated data when an integration is unavailable. The application instead displays the relevant connection or permission state.

---

Vision

Entro Cowork aims to become an AI execution layer for enterprise work — continuously connecting communication, documents and transactional systems to identify what needs attention and help employees resolve it.

Information should not just be searchable.
It should become actionable.

---

Built for BITSoM Vertex AI Builders' Pitch Fest 2026
