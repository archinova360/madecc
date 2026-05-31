import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  FileCheck,
  Calendar,
  User,
  DollarSign,
  Type,
  QrCode,
  Copy,
  CheckCircle,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import QRCode from 'qrcode';

interface Receipt {
  id: string;
  receiptNo: string;
  date: string;
  receivedFrom: string;
  amount: number;
  amountInWords: string;
  paymentFor: string;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer';
  remainingBalance: number;
}

const mockReceipts: Receipt[] = [
  {
    id: '1',
    receiptNo: 'RCP-2026-001',
    date: '2026-05-10',
    receivedFrom: 'John Smith',
    amount: 1500000,
    amountInWords: 'One Million Five Hundred Thousand CFA',
    paymentFor: 'Foundation Labor Cost',
    paymentMethod: 'Bank Transfer',
    remainingBalance: 500000
  },
  {
    id: '2',
    receiptNo: 'RCP-2026-002',
    date: '2026-05-11',
    receivedFrom: 'Sarah Johnson',
    amount: 750000,
    amountInWords: 'Seven Hundred Fifty Thousand CFA',
    paymentFor: 'Demolition Services',
    paymentMethod: 'Mobile Money',
    remainingBalance: 0
  }
];

export default function AdminReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from server on mount
  useEffect(() => {
    const loadReceipts = async () => {
      try {
        const res = await fetch('/api/store/receipts');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setReceipts(data);
        }
      } catch (e) {
        console.warn("Financial records sync failed, using defaults", e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadReceipts();
  }, []);

  // Save to server whenever receipts change
  useEffect(() => {
    if (!isInitialized) return;

    const syncReceipts = async () => {
      try {
        await fetch('/api/store/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: receipts }),
        });
      } catch (e) {
        console.error("Critical Financial failure: sync failed", e);
      }
    };

    const timeout = setTimeout(syncReceipts, 1000);
    return () => clearTimeout(timeout);
  }, [receipts, isInitialized]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newReceipt, setNewReceipt] = useState<Partial<Receipt>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Bank Transfer',
    remainingBalance: 0
  });

  const [selectedQRReceipt, setSelectedQRReceipt] = useState<Receipt | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrCopied, setQrCopied] = useState(false);

  // Auto-generate on-screen QR Code for instantaneous visual scanning on-site
  useEffect(() => {
    if (selectedQRReceipt) {
      const payload = JSON.stringify({
        receiptNo: selectedQRReceipt.receiptNo,
        amount: `CFA ${selectedQRReceipt.amount.toLocaleString()}`,
        client: selectedQRReceipt.receivedFrom,
        date: selectedQRReceipt.date,
        purpose: selectedQRReceipt.paymentFor,
        method: selectedQRReceipt.paymentMethod,
        remaining: `CFA ${selectedQRReceipt.remainingBalance.toLocaleString()}`,
        verification: "SECURE-LEDGER-V2026-OK"
      }, null, 2);
      
      QRCode.toDataURL(payload, { 
        margin: 2, 
        scale: 10,
        color: {
          dark: '#1e293b', // Deep gray
          light: '#f8fafc' // Light background
        }
      })
      .then(url => setQrUrl(url))
      .catch(err => console.error("QR Code rendering failed", err));
    } else {
      setQrUrl('');
      setQrCopied(false);
    }
  }, [selectedQRReceipt]);

  const filteredReceipts = receipts.filter(r => 
    (r.receivedFrom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.receiptNo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const receipt: Receipt = {
      ...newReceipt as Receipt,
      id: Math.random().toString(36).substring(7).toUpperCase(),
      receiptNo: `RCP-${new Date().getFullYear()}-${(receipts.length + 1).toString().padStart(3, '0')}`
    };
    setReceipts([receipt, ...receipts]);
    setIsModalOpen(false);
    setNewReceipt({
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Bank Transfer',
      remainingBalance: 0
    });
  };

  const generatePDF = async (receipt: Receipt) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    // const pageHeight = doc.internal.pageSize.getHeight();

    // Styles
    const gold = [190, 155, 65]; // Approximated Gold
    const black = [0, 0, 0];

    // Border
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.getHeight() - 10);
    
    // Header
    // Note: In real app, we'd add the actual logo here if available as base64
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('MADECC', 65, 25);
    
    doc.setFontSize(10);
    doc.text('OFFICIAL RECEIPT', pageWidth / 2, 35, { align: 'center' });
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.line(75, 36, pageWidth - 75, 36);

    // Metadata boxes
    doc.setFontSize(9);
    doc.setTextColor(black[0], black[1], black[2]);
    
    // Receipt No
    doc.text('Receipt No:', pageWidth - 60, 20);
    doc.rect(pageWidth - 40, 16, 30, 6);
    doc.text(receipt.receiptNo, pageWidth - 38, 20.5);

    // Date
    doc.text('Date:', pageWidth - 60, 28);
    doc.line(pageWidth - 50, 28, pageWidth - 15, 28);
    doc.text(format(new Date(receipt.date), 'dd/MM/yyyy'), pageWidth - 48, 27.5);

    // Company Info
    doc.setFontSize(8);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('Address: Yaoundé, Cameroun, Carrefour Mbankolo', 40, 42);
    doc.text('Tel: 671 06 35 11 / 683 31 64 86 / 640 19 45 05', 47, 47);

    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFontSize(10);
    
    let y = 60;
    const leftX = 15;
    const lineEndX = pageWidth - 15;

    // Fields
    const renderField = (label: string, value: string, yPos: number) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${label}:`, leftX, yPos);
      doc.line(leftX + doc.getTextWidth(`${label}: `), yPos, lineEndX, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(value, leftX + doc.getTextWidth(`${label}: `) + 2, yPos - 1);
    };

    renderField('Received From', receipt.receivedFrom, y);
    y += 10;
    renderField('Amount (Figures)', `CFA ${receipt.amount.toLocaleString()}`, y);
    y += 10;
    renderField('Amount (In Words)', receipt.amountInWords, y);
    y += 12;

    // Payment For & Method
    doc.setFont('helvetica', 'normal');
    doc.text('Payment For:', leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.paymentFor, leftX + 25, y);
    doc.line(leftX + 25, y, pageWidth / 2 + 10, y);

    doc.setFont('helvetica', 'normal');
    doc.text('Payment Method:', pageWidth / 2 + 20, y);
    const methods = ['Cash', 'Mobile Money', 'Bank Transfer'];
    let mx = pageWidth / 2 + 55;
    methods.forEach(m => {
      doc.rect(mx, y - 3, 3, 3);
      if (receipt.paymentMethod === m) {
        doc.line(mx, y - 3, mx + 3, y);
        doc.line(mx + 3, y - 3, mx, y);
      }
      doc.setFontSize(7);
      doc.text(m, mx + 4, y);
      mx += 22;
    });

    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Remaining Balance:', leftX, y);
    doc.line(leftX + 35, y, pageWidth / 2 + 10, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`CFA ${receipt.remainingBalance.toLocaleString()}`, leftX + 37, y - 1);

    doc.setFont('helvetica', 'normal');
    doc.text('Official Stamp:', pageWidth / 2 + 20, y);
    doc.rect(pageWidth / 2 + 48, y - 5, 45, 12);

    y += 12;
    doc.text('Authorized Signature:', leftX, y);
    doc.line(leftX + 40, y, pageWidth / 2 + 10, y);

    // Dynamically render verification QR code and embed in document bottom-right
    let qrDataUrl = '';
    try {
      const payload = JSON.stringify({
        receiptNo: receipt.receiptNo,
        amount: `CFA ${receipt.amount.toLocaleString()}`,
        client: receipt.receivedFrom,
        date: receipt.date,
        verification: "SECURE-LEDGER-V2026-OK"
      });
      // Generate standard white-backed QR code for perfect crisp contrast in PDF
      qrDataUrl = await QRCode.toDataURL(payload, { margin: 1 });
    } catch(err) {
      console.warn("Failed to generate QR data url for PDF", err);
    }

    if (qrDataUrl) {
      // Draw standard QR code inside margin limit box next to signature/stamp
      doc.addImage(qrDataUrl, 'PNG', pageWidth - 35, y - 26, 22, 22);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('SCAN TO VERIFY INTEGRITY', pageWidth - 36, y - 2);
    }

    // Footer
    y += 15;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });

    doc.save(`MADECC-Receipt-${receipt.receiptNo}.pdf`);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id));
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Client Name', 'Date', 'Amount (CFA)', 'Payment For', 'Method', 'Status'];
    const rows = filteredReceipts.map(r => [
      r.receiptNo,
      `"${r.receivedFrom}"`,
      r.date,
      r.amount.toString(),
      `"${r.paymentFor}"`,
      r.paymentMethod,
      'Dispatched'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MADECC_Receipts_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic">Confirm Deletion</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">This artifact will be purged from the central ledger forever.</p>
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
                Confirm Purge
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Digital Receipts</h2>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold">Protocol: Official Transaction Records</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-600/20"
        >
          <Plus size={18} />
          Create New Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Search by client or receipt sequence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-600 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 text-gray-400 py-4 px-4 rounded-2xl hover:text-white hover:border-gray-700 transition-all uppercase text-[10px] font-black tracking-widest">
            <Filter size={16} />
            Filter
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 text-gray-400 py-4 px-4 rounded-2xl hover:text-white hover:border-gray-700 transition-all uppercase text-[10px] font-black tracking-widest"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <FileCheck size={14} className="text-orange-600" />
                      <span className="font-mono text-xs text-white uppercase">{receipt.receiptNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-gray-300">{receipt.receivedFrom}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs text-gray-500">{format(new Date(receipt.date), 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-white tracking-widest">CFA {receipt.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-green-500/10 text-green-500 border border-green-500/20">
                      Dispatched
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => generatePDF(receipt)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors bg-gray-900 border border-gray-800 rounded-lg group-hover:border-orange-500/30"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => setSelectedQRReceipt(receipt)}
                        className="p-2 text-gray-400 hover:text-orange-400 transition-colors bg-gray-900 border border-gray-800 rounded-lg group-hover:border-orange-400/30"
                        title="Instant On-Site QR Verification"
                      >
                        <QrCode size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(receipt.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-900 border border-gray-800 rounded-lg group-hover:border-red-500/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-wider">New Official Receipt</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Populating Secure Transaction Data</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateReceipt} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} /> Received From
                  </label>
                  <input 
                    required
                    type="text"
                    value={newReceipt.receivedFrom || ''}
                    onChange={(e) => setNewReceipt({...newReceipt, receivedFrom: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors"
                    placeholder="Enter Client Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Date
                  </label>
                  <input 
                    required
                    type="date"
                    value={newReceipt.date || ''}
                    onChange={(e) => setNewReceipt({...newReceipt, date: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={12} /> Amount (Figures)
                  </label>
                  <input 
                    required
                    type="number"
                    value={newReceipt.amount || ''}
                    onChange={(e) => setNewReceipt({...newReceipt, amount: Number(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors"
                    placeholder="e.g. 500000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Type size={12} /> Amount (In Words)
                  </label>
                  <input 
                    required
                    type="text"
                    value={newReceipt.amountInWords || ''}
                    onChange={(e) => setNewReceipt({...newReceipt, amountInWords: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors"
                    placeholder="Five Hundred Thousand CFA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FileCheck size={12} /> Payment For (Services)
                </label>
                <input 
                  required
                  type="text"
                  value={newReceipt.paymentFor || ''}
                  onChange={(e) => setNewReceipt({...newReceipt, paymentFor: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors"
                  placeholder="e.g. Labor Cost / Material Supply"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Method</label>
                  <select 
                    value={newReceipt.paymentMethod}
                    onChange={(e) => setNewReceipt({...newReceipt, paymentMethod: e.target.value as any})}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors appearance-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Remaining Balance</label>
                  <input 
                    type="number"
                    value={newReceipt.remainingBalance || 0}
                    onChange={(e) => setNewReceipt({...newReceipt, remainingBalance: Number(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-orange-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-6 bg-gray-800 rounded-full peer peer-checked:bg-orange-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Apply Authorized Signature</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-6 bg-gray-800 rounded-full peer peer-checked:bg-orange-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Apply Official Stamp</span>
                </label>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-orange-600/20"
                >
                  Confirm & Initialize Receipt Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Instant QR Code Verification Overlay Modal */}
      <AnimatePresence>
        {selectedQRReceipt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Colored layout strip */}
              <div className="h-2 bg-gradient-to-r from-orange-600 to-yellow-500" />
              
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-600/10 text-orange-500">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-md font-black text-white uppercase italic tracking-wide">Verification Shield</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Instant Ledger Verification Protocol</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedQRReceipt(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl relative group">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg shadow-orange-600/35">
                    Live Secure Code
                  </span>
                  {qrUrl ? (
                    <div className="bg-white p-4 rounded-xl shadow-inner max-w-[200px] mx-auto">
                      <img src={qrUrl} alt="Receipt QR Code" className="w-full h-auto" />
                    </div>
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-600 font-mono text-xs">
                      Rendering matrix...
                    </div>
                  )}
                </div>

                <div className="w-full bg-slate-950/80 border border-white/5 rounded-2xl p-5 text-left space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5 bg-transparent">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Sequence Ref:</span>
                    <span className="font-mono text-white font-bold tracking-wider">{selectedQRReceipt.receiptNo}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-transparent">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Gross Valuations:</span>
                    <span className="font-mono text-orange-500 font-black tracking-wider text-sm">CFA {selectedQRReceipt.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-transparent">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Beneficiary Client:</span>
                    <span className="text-gray-300 font-bold max-w-[180px] truncate block text-right">{selectedQRReceipt.receivedFrom}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-transparent">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Audit Milestone:</span>
                    <span className="text-gray-400 text-right text-[11px] truncate max-w-[180px]">{selectedQRReceipt.paymentFor}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-transparent">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Timestamp:</span>
                    <span className="font-mono text-gray-500">{format(new Date(selectedQRReceipt.date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => {
                      const text = `MADECC RECEIPT VERIFICATION\nNo: ${selectedQRReceipt.receiptNo}\nAmount: CFA ${selectedQRReceipt.amount.toLocaleString()}\nClient: ${selectedQRReceipt.receivedFrom}\nDate: ${selectedQRReceipt.date}\nPurpose: ${selectedQRReceipt.paymentFor}\nCheck complete.`;
                      navigator.clipboard.writeText(text);
                      setQrCopied(true);
                      setTimeout(() => setQrCopied(false), 2000);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    {qrCopied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    {qrCopied ? "Copied Data" : "Copy Payload"}
                  </button>
                  <button 
                    onClick={() => generatePDF(selectedQRReceipt)}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10"
                  >
                    <FileDown size={14} />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
