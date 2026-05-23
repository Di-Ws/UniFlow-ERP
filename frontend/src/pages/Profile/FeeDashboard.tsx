import React, { useState } from 'react';
import { CreditCard, History, Download, AlertCircle, X, CheckCircle2, Smartphone, Printer, Loader2 } from 'lucide-react';
import { payFee } from '../../services/studentPortalService';
import { toast } from 'react-hot-toast';

interface Props {
  feeDue: number;
  lastPayment: string | null;
  transactions: any[];
  studentName: string;
  studentId: number;
  onPaymentSuccess: () => void;
}

const FeeDashboard: React.FC<Props> = ({ 
  feeDue, 
  lastPayment, 
  transactions, 
  studentName, 
  studentId, 
  onPaymentSuccess 
}) => {
  // Modal states
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  
  // Payment Form States
  const [paymentTab, setPaymentTab] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // UPI Form States
  const [upiId, setUpiId] = useState('');
  
  // Card Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Form Reset
  const resetForm = () => {
    setUpiId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  // Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (paymentTab === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error("Please enter a valid UPI ID (e.g. name@upi)");
        return;
      }
    } else {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length !== 5) {
        toast.error("Please enter expiry in MM/YY format");
        return;
      }
      if (cardCvv.length !== 3) {
        toast.error("Please enter a 3-digit CVV");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter the cardholder name");
        return;
      }
    }

    try {
      setIsProcessing(true);
      const method = paymentTab === 'card' ? 'Card' : 'UPI';
      await payFee(method);
      
      setPaymentSuccess(true);
      toast.success("Payment completed successfully!");
      onPaymentSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  // Open Receipt Modal
  const openReceipt = (tx: any) => {
    setSelectedTx(tx);
    setIsReceiptModalOpen(true);
  };

  // Format card input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvv(value);
  };

  return (
    <div className="space-y-8">
      {/* Fee Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Outstanding Due</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                ${feeDue.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${feeDue > 0 ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'}`}>
                  {feeDue > 0 ? 'Payment Required' : 'Fully Paid'}
                </span>
                {lastPayment && (
                  <span className="text-[10px] text-slate-400 font-bold">
                    Last Payment: {new Date(lastPayment).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <CreditCard size={24} />
            </div>
          </div>
          
          {feeDue > 0 && (
            <button 
              onClick={() => {
                resetForm();
                setIsPayModalOpen(true);
              }}
              className="w-full mt-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              Pay Now
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Fee Policy & Attendance Gating</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-black text-rose-500">Important:</span> Outstanding fees block your attendance recording in the faculty registry.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Clearing dues immediately unlocks your attendance block. For special considerations, consult the HOD.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Transaction History / Receipts Section */}
      <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <History size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Fee Receipts & Pending History</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-slate-50/20 dark:bg-white/[0.01]">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {/* If outstanding fees exist, show a mock pending row */}
              {feeDue > 0 && (
                <tr className="bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-rose-500">
                    Pending
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900 dark:text-white text-sm">Outstanding Tuition Fees</span>
                  </td>
                  <td className="px-6 py-4 font-black text-rose-500 text-sm">
                    ${feeDue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      UNPAID
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        resetForm();
                        setIsPayModalOpen(true);
                      }}
                      className="text-xs font-black bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl uppercase tracking-widest transition-all"
                    >
                      Pay Due
                    </button>
                  </td>
                </tr>
              )}

              {transactions.length === 0 && feeDue === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No transactions found</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{t.description}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white text-sm">
                      ${t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${t.status === 'SUCCESS' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-500'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openReceipt(t)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-all border border-primary/20"
                        title="View Fee Receipt"
                      >
                        <Download size={14} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT GATEWAY MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Payment Gateway</h3>
                <p className="text-xs text-slate-400 mt-0.5">Secure payment processing</p>
              </div>
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Success screen or Gateway form */}
            {paymentSuccess ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15">
                  <CheckCircle2 size={44} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white">Transaction Success</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Your payment of <strong className="text-primary">${feeDue}</strong> has been received and verified. The attendance block is now lifted.
                  </p>
                </div>
                <button 
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Close Gate
                </button>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit}>
                {/* Amount Due Tag */}
                <div className="mx-6 mt-6 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Amount to pay:</span>
                  <span className="text-xl font-black text-primary">${feeDue.toLocaleString()}</span>
                </div>

                {/* Gateway Tab Select */}
                <div className="mx-6 mt-6 grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-2xl border border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('card')}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      paymentTab === 'card' 
                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm' 
                        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CreditCard size={14} />
                    Credit/Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('upi')}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      paymentTab === 'upi' 
                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm' 
                        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone size={14} />
                    UPI / Scan QR
                  </button>
                </div>

                {/* Gateway Fields */}
                <div className="p-6 space-y-4 min-h-[220px]">
                  {paymentTab === 'card' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Card Number</label>
                        <input 
                          type="text"
                          required
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Expiry Date</label>
                          <input 
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">CVV</label>
                          <input 
                            type="password"
                            required
                            placeholder="•••"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-center"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Cardholder Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="w-full">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">UPI ID (VPA)</label>
                        <input 
                          type="text"
                          placeholder="john@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=uniflow@bank%26pn=UniFlow%2520Academy%26am=${feeDue}`} 
                          alt="UPI Payment QR Code"
                          className="w-32 h-32 bg-white p-2 rounded-xl"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Scan QR to pay instantly</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    🔒 SSL 256-bit Encryption
                  </span>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-3 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Processing...
                      </>
                    ) : (
                      `Pay $${feeDue.toLocaleString()}`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FEE RECEIPT MODAL */}
      {isReceiptModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card rounded-[32px] border border-gray-100 dark:border-white/5 w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02] no-print">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Fee Receipt</h3>
                <p className="text-xs text-slate-400 mt-0.5">Official Tuition Fee Invoice</p>
              </div>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Receipt Content */}
            <div id="printable-receipt" className="p-8 space-y-8 relative">
              {/* PAID stamp */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-emerald-500/30 text-emerald-500/30 text-4xl font-black uppercase tracking-widest px-6 py-2 rounded-xl rotate-12 pointer-events-none select-none">
                PAID & CLEARED
              </div>

              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-primary">UniFlow Academy</h2>
                  <p className="text-xs text-slate-400">100 University Plaza, Tech City</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/10">
                    Official Receipt
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">No: REC-2026-{selectedTx.id}</p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{studentName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student ID</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">#{studentId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Paid</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{new Date(selectedTx.date).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</span>
                  <p className="font-bold text-emerald-500 mt-0.5">{selectedTx.status}</p>
                </div>
              </div>

              {/* Invoice Table */}
              <div className="border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden mt-6">
                <div className="bg-slate-50 dark:bg-white/[0.02] p-4 font-black text-xs text-slate-400 uppercase tracking-widest grid grid-cols-3">
                  <span className="col-span-2">Description</span>
                  <span className="text-right">Amount Paid</span>
                </div>
                <div className="p-4 text-sm grid grid-cols-3 border-t border-slate-100 dark:border-white/5">
                  <span className="col-span-2 font-bold text-slate-900 dark:text-white">{selectedTx.description}</span>
                  <span className="text-right font-black text-slate-900 dark:text-white">${selectedTx.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Total Paid Footer */}
              <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-white/10 pt-6">
                <span className="text-sm font-bold text-slate-500">Net Total Received:</span>
                <span className="text-2xl font-black text-primary">${selectedTx.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex gap-4 no-print">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-xs rounded-xl transition-all text-center"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeDashboard;
