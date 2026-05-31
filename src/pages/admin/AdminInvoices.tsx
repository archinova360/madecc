import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Receipt, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit,
  FileText,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  date: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  items: InvoiceItem[];
}

const mockInvoices: Invoice[] = [
  { 
    id: '1', 
    invoiceNumber: 'INV-2026-001', 
    client: 'Skyline Group', 
    date: '2026-05-01', 
    amount: 15400, 
    status: 'Paid',
    items: [{ description: 'Foundation structural work', quantity: 1, unitPrice: 15400, total: 15400 }]
  },
  { 
    id: '2', 
    invoiceNumber: 'INV-2026-002', 
    client: 'Al-Khaleej Trading', 
    date: '2026-05-05', 
    amount: 8200, 
    status: 'Sent',
    items: [{ description: 'Roofing materials installation', quantity: 1, unitPrice: 8200, total: 8200 }]
  },
  { 
    id: '3', 
    invoiceNumber: 'INV-2026-003', 
    client: 'Residential Unit #42', 
    date: '2026-05-07', 
    amount: 2150, 
    status: 'Overdue',
    items: [{ description: 'Interior plumbing maintenance', quantity: 1, unitPrice: 2150, total: 2150 }]
  },
];

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from server on mount
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const res = await fetch('/api/store/invoices');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setInvoices(data);
        }
      } catch (e) {
        console.warn("Invoicing records sync failed, using defaults", e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadInvoices();
  }, []);

  // Save to server whenever invoices change
  useEffect(() => {
    if (!isInitialized) return;

    const syncInvoices = async () => {
      try {
        await fetch('/api/store/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: invoices }),
        });
      } catch (e) {
        console.error("Critical Invoicing failure: sync failed", e);
      }
    };

    const timeout = setTimeout(syncInvoices, 1000);
    return () => clearTimeout(timeout);
  }, [invoices, isInitialized]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    status: 'Draft' as Invoice['status'],
    date: new Date().toISOString().split('T')[0]
  });

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.text('MADECC CONSTRUCTION', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Engineered Excellence since 1998', 14, 26);
    
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('INVOICE', 160, 20);
    doc.text(`# ${invoice.invoiceNumber}`, 160, 26);
    
    // Line separator
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(1);
    doc.line(14, 32, 196, 32);
    
    // Info sections
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client, 14, 51);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 160, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.date, 160, 51);
    
    // Tables
    const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
    const tableRows = (invoice.items || []).map(item => [
      item.description,
      item.quantity,
      item.unitPrice.toLocaleString() + " FCFA",
      item.total.toLocaleString() + " FCFA"
    ]);

    autoTable(doc, {
      startY: 70, head: [tableColumn], body: tableRows.length > 0 ? tableRows : [["Service provided", 1, `${invoice.amount.toLocaleString()} FCFA`, `${invoice.amount.toLocaleString()} FCFA`]], theme: 'grid', headStyles: { fillColor: [40, 40, 40] }, margin: { top: 70 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL AMOUNT: ${invoice.amount.toLocaleString()} FCFA`, 140, finalY);
    
    // Footer message
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Please make payment within 30 days. Thank you for your business.', 14, 280);
    
    doc.save(`MADECC_Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice #', 'Client', 'Amount', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        `"${inv.client}"`,
        inv.amount,
        inv.date,
        inv.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MADECC_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setFormData({
      client: '',
      amount: '',
      status: 'Draft',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      client: invoice.client,
      amount: invoice.amount.toString(),
      status: invoice.status,
      date: invoice.date
    });
    setIsModalOpen(true);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
    setDeleteConfirmId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvoice) {
      setInvoices(invoices.map(inv => 
        inv.id === editingInvoice.id 
          ? { ...inv, ...formData, amount: parseFloat(formData.amount) } 
          : inv
      ));
    } else {
      const newInvoice: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber: `INV-2026-00${invoices.length + 1}`,
        client: formData.client,
        amount: parseFloat(formData.amount),
        status: formData.status,
        date: formData.date,
        items: [{ description: 'Project Services', quantity: 1, unitPrice: parseFloat(formData.amount), total: parseFloat(formData.amount) }]
      };
      setInvoices([newInvoice, ...invoices]);
    }
    setIsModalOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = (inv.client || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (inv.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic">Annihilate Invoice?</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">This financial record will be completely erased from the construction ledger. This action is irreversible.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all border border-gray-700"
              >
                Abort
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Confirm Erase
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Invoicing Center</h2>
          <p className="text-gray-400 mt-1">Manage billing and export official documentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl font-bold uppercase tracking-widest text-xs hover:text-white transition-all shadow-md active:scale-95"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* ... previous grid ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Total Outstanding</p>
          <p className="text-2xl font-black text-white">
            {invoices.filter(i => i.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} FCFA
          </p>
        </div>
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Paid this month</p>
          <p className="text-2xl font-black text-green-500">
            {invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} FCFA
          </p>
        </div>
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Pending Drafts</p>
          <p className="text-2xl font-black text-orange-600">
            {invoices.filter(i => i.status === 'Draft').length}
          </p>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by client or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 focus:outline-none focus:border-orange-600 transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button className="p-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Invoice #</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Client</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-orange-600/10 group-hover:text-orange-600 transition-colors">
                        <Receipt size={16} />
                      </div>
                      <span className="font-bold text-white tracking-tight">{invoice.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-400">{invoice.client}</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-white">{invoice.amount.toLocaleString()} FCFA</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{invoice.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      invoice.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                      invoice.status === 'Sent' ? 'bg-blue-500/10 text-blue-500' :
                      invoice.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => generatePDF(invoice)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(invoice)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(invoice.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white uppercase italic mb-6">
              {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Client Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                  placeholder="Enter client company name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Amount (FCFA)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Invoice['status'] })}
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors appearance-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Date</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-800 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20"
                >
                  {editingInvoice ? 'Update Invoice' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
