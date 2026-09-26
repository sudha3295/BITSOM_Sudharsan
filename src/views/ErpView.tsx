import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Database,
  FileCheck2,
  FileText,
  Package,
  Receipt,
  Search,
  ShieldAlert,
  Truck,
  Users,
} from 'lucide-react';
import { ERPDataState } from '../services/apiService';

interface ErpViewProps {
  erpData: ERPDataState | null;
}

export const ErpView: React.FC<ErpViewProps> = ({ erpData }) => {
  const [activeTab, setActiveTab] = useState<
    'purchaseOrders' | 'invoices' | 'goodsReceipts' | 'vendors' | 'payments' | 'employees' | 'customers'
  >('purchaseOrders');
  const [search, setSearch] = useState('');

  if (!erpData) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Database className="h-8 w-8 animate-pulse text-indigo-400 mx-auto mb-2" />
        <p className="text-sm">Connecting to ERP Database...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'purchaseOrders', label: 'Purchase Orders', count: erpData.purchaseOrders.length, icon: FileText },
    { id: 'invoices', label: 'Invoices', count: erpData.invoices.length, icon: Receipt },
    { id: 'goodsReceipts', label: 'Goods Receipts', count: erpData.goodsReceipts.length, icon: Truck },
    { id: 'vendors', label: 'Vendors', count: erpData.vendors.length, icon: Building2 },
    { id: 'payments', label: 'Payments', count: erpData.payments.length, icon: FileCheck2 },
    { id: 'employees', label: 'Employees', count: erpData.employees.length, icon: Users },
    { id: 'customers', label: 'Customers', count: erpData.customers.length, icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Connected ERP Data</h1>
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              Relational DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Application-owned relational enterprise database queried for three-way cross reconciliation.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-400">
          Status: <span className="text-emerald-400 font-semibold">Active & Synced</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Display */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {/* PURCHASE ORDERS */}
        {activeTab === 'purchaseOrders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Authorized Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Line Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{po.poNumber}</td>
                    <td className="px-4 py-3 font-sans text-white">{po.vendorName}</td>
                    <td className="px-4 py-3 text-slate-400">{po.issueDate}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">
                      ${po.totalAmount.toLocaleString()} {po.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400">
                      {po.lineItems.map((li: any) => `${li.description} (${li.quantity}x)`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INVOICES */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Related PO</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Discrepancy Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{inv.poNumber}</td>
                    <td className="px-4 py-3 font-sans text-white">{inv.vendorName}</td>
                    <td className="px-4 py-3 text-slate-400">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      ${inv.totalAmount.toLocaleString()} {inv.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === 'DISCREPANCY'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-amber-300 max-w-xs truncate">
                      {inv.discrepancyNote || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GOODS RECEIPTS */}
        {activeTab === 'goodsReceipts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">GRN #</th>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Received Date</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Received By</th>
                  <th className="px-4 py-3">Receipt Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.goodsReceipts.map((gr) => (
                  <tr key={gr.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{gr.grnNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{gr.poNumber}</td>
                    <td className="px-4 py-3 text-slate-400">{gr.receivedDate}</td>
                    <td className="px-4 py-3 text-slate-300">{gr.warehouseCode}</td>
                    <td className="px-4 py-3 font-sans text-slate-200">{gr.receivedBy}</td>
                    <td className="px-4 py-3 text-[11px] text-emerald-400">
                      {gr.itemsReceived
                        .map((i: any) => `${i.receivedQuantity}/${i.orderedQuantity} rcvd (${i.condition})`)
                        .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Vendor Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3">Payment Terms</th>
                  <th className="px-4 py-3">Tax ID</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{v.code}</td>
                    <td className="px-4 py-3 font-sans text-white font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-slate-300">{v.contactEmail}</td>
                    <td className="px-4 py-3 text-slate-400">{v.paymentTerms}</td>
                    <td className="px-4 py-3 text-slate-400">{v.taxId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Payment Ref</th>
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{p.paymentRef}</td>
                    <td className="px-4 py-3 text-slate-300">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 font-sans text-white">{p.vendorName}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">${p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-slate-300">{p.method}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPLOYEES */}
        {activeTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Employee Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{emp.employeeCode}</td>
                    <td className="px-4 py-3 font-sans text-white font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-300">{emp.email}</td>
                    <td className="px-4 py-3 text-slate-400">{emp.department}</td>
                    <td className="px-4 py-3 text-indigo-300">{emp.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Account #</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Credit Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {erpData.customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-cyan-400 font-bold">{c.accountNumber}</td>
                    <td className="px-4 py-3 font-sans text-white font-medium">{c.companyName}</td>
                    <td className="px-4 py-3 font-sans text-slate-300">{c.contactName}</td>
                    <td className="px-4 py-3 text-slate-400">{c.email}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">${c.creditLimit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
