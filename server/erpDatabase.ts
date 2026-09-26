/**
 * Connected ERP Database
 * Represents the enterprise's internal ERP system (e.g. SAP/NetSuite/Odoo).
 * Application-owned relational data seeded with standard demonstration records.
 */

export interface Vendor {
  id: string;
  code: string;
  name: string;
  contactEmail: string;
  phone: string;
  paymentTerms: string; // e.g. "Net 30"
  taxId: string;
  currency: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  issueDate: string;
  deliveryDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'OPEN' | 'PARTIALLY_RECEIVED' | 'FULFILLED' | 'CANCELLED';
  lineItems: {
    itemCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface ERPInvoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'APPROVED' | 'DISCREPANCY' | 'PAID';
  discrepancyNote?: string;
  lineItems: {
    itemCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  poNumber: string;
  receivedDate: string;
  warehouseCode: string;
  receivedBy: string;
  itemsReceived: {
    itemCode: string;
    description: string;
    orderedQuantity: number;
    receivedQuantity: number;
    condition: 'GOOD' | 'DAMAGED' | 'SHORTAGE';
  }[];
}

export interface Payment {
  id: string;
  paymentRef: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  method: 'ACH' | 'WIRE' | 'CHECK';
  status: 'SCHEDULED' | 'PROCESSED' | 'PENDING_APPROVAL';
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export interface Customer {
  id: string;
  accountNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  creditLimit: number;
  currency: string;
}

// In-Memory Relational ERP Storage with Initial Connected Enterprise Records
class ERPDatabase {
  public vendors: Vendor[] = [
    {
      id: 'vnd-101',
      code: 'VND-ACME',
      name: 'Acme Industrial Solutions Ltd',
      contactEmail: 'billing@acmeindustrial.com',
      phone: '+1 (555) 234-8901',
      paymentTerms: 'Net 30',
      taxId: 'US-849201934',
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'vnd-102',
      code: 'VND-NEXUS',
      name: 'Nexus Cloud Technologies',
      contactEmail: 'invoicing@nexuscloud.io',
      phone: '+1 (555) 891-2345',
      paymentTerms: 'Net 15',
      taxId: 'US-992384712',
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'vnd-103',
      code: 'VND-LOGIX',
      name: 'Logix Global Logistics Corp',
      contactEmail: 'accounts@logixglobal.com',
      phone: '+1 (555) 443-1289',
      paymentTerms: 'Net 45',
      taxId: 'US-771239841',
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'vnd-104',
      code: 'VND-CYBER',
      name: 'CyberShield Security Systems',
      contactEmail: 'finance@cybershield.net',
      phone: '+1 (555) 602-3311',
      paymentTerms: 'Net 30',
      taxId: 'US-661294801',
      currency: 'USD',
      status: 'ACTIVE',
    },
  ];

  public purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-10452',
      poNumber: 'PO-10452',
      vendorId: 'vnd-101',
      vendorName: 'Acme Industrial Solutions Ltd',
      issueDate: '2026-09-10',
      deliveryDate: '2026-09-25',
      currency: 'USD',
      subtotal: 50000,
      taxAmount: 0,
      totalAmount: 50000,
      status: 'PARTIALLY_RECEIVED',
      lineItems: [
        {
          itemCode: 'HW-SRV-900',
          description: 'High Performance Rack Server Unit 2U',
          quantity: 100,
          unitPrice: 500,
          total: 50000,
        },
      ],
    },
    {
      id: 'po-10453',
      poNumber: 'PO-10453',
      vendorId: 'vnd-102',
      vendorName: 'Nexus Cloud Technologies',
      issueDate: '2026-09-15',
      deliveryDate: '2026-10-01',
      currency: 'USD',
      subtotal: 12500,
      taxAmount: 1000,
      totalAmount: 13500,
      status: 'OPEN',
      lineItems: [
        {
          itemCode: 'SW-SUB-ENT',
          description: 'Enterprise Cloud Infrastructure Annual Tier-1',
          quantity: 1,
          unitPrice: 12500,
          total: 12500,
        },
      ],
    },
    {
      id: 'po-10454',
      poNumber: 'PO-10454',
      vendorId: 'vnd-103',
      vendorName: 'Logix Global Logistics Corp',
      issueDate: '2026-09-18',
      deliveryDate: '2026-09-22',
      currency: 'USD',
      subtotal: 8200,
      taxAmount: 656,
      totalAmount: 8856,
      status: 'FULFILLED',
      lineItems: [
        {
          itemCode: 'FRT-EXP-01',
          description: 'Expedited Cross-Country Freight Container Transit',
          quantity: 2,
          unitPrice: 4100,
          total: 8200,
        },
      ],
    },
  ];

  public invoices: ERPInvoice[] = [
    {
      id: 'inv-7821',
      invoiceNumber: 'INV-7821',
      poNumber: 'PO-10452',
      vendorId: 'vnd-101',
      vendorName: 'Acme Industrial Solutions Ltd',
      invoiceDate: '2026-09-24',
      dueDate: '2026-10-24',
      currency: 'USD',
      subtotal: 55000,
      taxAmount: 0,
      totalAmount: 55000,
      status: 'DISCREPANCY',
      discrepancyNote: 'Invoice quantity is 110 units ($55,000) vs PO-10452 authorized 100 units ($50,000). Excess 10 units not pre-authorized.',
      lineItems: [
        {
          itemCode: 'HW-SRV-900',
          description: 'High Performance Rack Server Unit 2U',
          quantity: 110,
          unitPrice: 500,
          total: 55000,
        },
      ],
    },
    {
      id: 'inv-8902',
      invoiceNumber: 'INV-8902',
      poNumber: 'PO-10454',
      vendorId: 'vnd-103',
      vendorName: 'Logix Global Logistics Corp',
      invoiceDate: '2026-09-22',
      dueDate: '2026-11-06',
      currency: 'USD',
      subtotal: 8200,
      taxAmount: 656,
      totalAmount: 8856,
      status: 'APPROVED',
      lineItems: [
        {
          itemCode: 'FRT-EXP-01',
          description: 'Expedited Cross-Country Freight Container Transit',
          quantity: 2,
          unitPrice: 4100,
          total: 8200,
        },
      ],
    },
  ];

  public goodsReceipts: GoodsReceipt[] = [
    {
      id: 'grn-501',
      grnNumber: 'GRN-501',
      poNumber: 'PO-10452',
      receivedDate: '2026-09-24',
      warehouseCode: 'WH-EAST-01',
      receivedBy: 'Marcus Vance (Warehouse Lead)',
      itemsReceived: [
        {
          itemCode: 'HW-SRV-900',
          description: 'High Performance Rack Server Unit 2U',
          orderedQuantity: 100,
          receivedQuantity: 100,
          condition: 'GOOD',
        },
      ],
    },
    {
      id: 'grn-502',
      grnNumber: 'GRN-502',
      poNumber: 'PO-10454',
      receivedDate: '2026-09-22',
      warehouseCode: 'WH-WEST-02',
      receivedBy: 'Elena Gomez (Dock Manager)',
      itemsReceived: [
        {
          itemCode: 'FRT-EXP-01',
          description: 'Expedited Cross-Country Freight Container Transit',
          orderedQuantity: 2,
          receivedQuantity: 2,
          condition: 'GOOD',
        },
      ],
    },
  ];

  public payments: Payment[] = [
    {
      id: 'pay-301',
      paymentRef: 'PAY-2026-089',
      invoiceId: 'inv-8902',
      invoiceNumber: 'INV-8902',
      vendorName: 'Logix Global Logistics Corp',
      amount: 8856,
      currency: 'USD',
      paymentDate: '2026-10-05',
      method: 'ACH',
      status: 'SCHEDULED',
    },
  ];

  public employees: Employee[] = [
    {
      id: 'emp-01',
      employeeCode: 'EMP-1001',
      name: 'Sarah Jenkins',
      email: 's.jenkins@entro-enterprise.com',
      department: 'Finance & Procurement',
      role: 'Accounts Payable Manager',
    },
    {
      id: 'emp-02',
      employeeCode: 'EMP-1002',
      name: 'David Zhao',
      email: 'd.zhao@entro-enterprise.com',
      department: 'Supply Chain Operations',
      role: 'Procurement Director',
    },
  ];

  public customers: Customer[] = [
    {
      id: 'cust-01',
      accountNumber: 'CUST-8001',
      companyName: 'Apex Health Systems',
      contactName: 'Rachel Miller',
      email: 'rmiller@apexhealth.org',
      creditLimit: 250000,
      currency: 'USD',
    },
  ];

  public findPO(poNumber: string) {
    const clean = poNumber.trim().toUpperCase();
    return this.purchaseOrders.find(
      (p) => p.poNumber.toUpperCase() === clean || p.id.toUpperCase() === clean
    );
  }

  public findInvoice(invoiceNumber: string) {
    const clean = invoiceNumber.trim().toUpperCase();
    return this.invoices.find(
      (i) => i.invoiceNumber.toUpperCase() === clean || i.id.toUpperCase() === clean
    );
  }

  public findVendorByNameOrEmail(query: string) {
    const q = query.toLowerCase().trim();
    return this.vendors.find(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.contactEmail.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q)
    );
  }
}

export const erpDb = new ERPDatabase();
