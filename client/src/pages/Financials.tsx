import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Transaction } from '../store/useStore';
import { 
  ArrowUpRight, Download, Receipt, Wallet, Activity, CheckCircle2, AlertCircle, RefreshCw, X, QrCode, CreditCard, Smartphone 
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Helper: Generate and download a bill as a PDF ──────────────────────
function downloadBill(transaction: { id: string; title?: string; amount: string; date: string; status: string; flat?: string; type?: string }) {
  const doc = new jsPDF();
  const flatId = transaction.flat || 'A-101';
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(234, 179, 8); // Gold color
  doc.text('URBANEST SOCIETY', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('OFFICIAL INVOICE / RECEIPT', 105, 30, { align: 'center' });
  
  // Details
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice No: ${transaction.id}`, 20, 50);
  doc.text(`Date: ${transaction.date}`, 20, 60);
  doc.text(`Flat No: ${flatId}`, 20, 70);
  doc.text(`Status: ${transaction.status}`, 140, 50);
  doc.text(`Payment Mode: UPI / Online`, 140, 60);

  const description = transaction.title || transaction.type || 'Maintenance Dues';

  // Table
  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Amount']],
    body: [
      [description, 'Rs. ' + transaction.amount],
    ],
    foot: [['TOTAL', 'Rs. ' + transaction.amount]],
    theme: 'grid',
    headStyles: { fillColor: [234, 179, 8] },
    footStyles: { fillColor: [30, 30, 30] }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Urbanest Society Management Committee', 20, finalY + 30);
  doc.text('Tower A, Urbanest Residences, Mumbai 400001', 20, finalY + 36);
  doc.text('Email: accounts@urbanest.in', 20, finalY + 42);
  
  doc.setFontSize(9);
  doc.text('This is a computer-generated document. No signature required.', 105, finalY + 60, { align: 'center' });

  doc.save(`Urbanest_Receipt_${transaction.id}.pdf`);
  toast.success(`Receipt ${transaction.id} downloaded as PDF`);
}

// ── Payment Modal Component ──────────────────────────────────────────────────
function PaymentModal({ 
  isOpen, 
  onClose,
  onSuccess,
  amount, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
  amount: string; 
  title: string; 
}) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      onSuccess(); // ← update store immediately
      toast.success('Payment successful! Receipt sent to your email.');
    }, 2500);
  };

  const handleClose = () => {
    setIsPaid(false);
    setIsProcessing(false);
    setPaymentMethod('upi');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-surface border border-border-dark rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl shadow-gold/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-dark">
          <div>
            <h3 className="text-xl font-heading font-bold text-white">Make Payment</h3>
            <p className="text-sm text-muted mt-1">{title}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Amount */}
        <div className="p-6 text-center border-b border-border-dark bg-surface-hover/30">
          <p className="text-sm text-muted uppercase tracking-wider font-bold mb-2">Amount Due</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl text-muted font-mono">₹</span>
            <span className="text-5xl font-heading font-black text-white tracking-tighter">{amount}</span>
          </div>
        </div>

        {isPaid ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-emerald" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Payment Successful!</h4>
            <p className="text-muted text-sm mb-6">Transaction ID: TXN-{Date.now().toString().slice(-8)}</p>
            <button onClick={handleClose} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Payment Method Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
                  paymentMethod === 'upi'
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'bg-surface-2 border-white/5 text-muted hover:text-white'
                }`}
              >
                <QrCode size={18} /> UPI / QR Code
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
                  paymentMethod === 'card'
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'bg-surface-2 border-white/5 text-muted hover:text-white'
                }`}
              >
                <CreditCard size={18} /> Card / Netbanking
              </button>
            </div>

            {paymentMethod === 'upi' ? (
              // UPI QR Code View
              <div className="text-center space-y-4">
                {/* Dummy QR Code using SVG */}
                <div className="bg-white rounded-2xl p-6 inline-block mx-auto">
                  <svg viewBox="0 0 200 200" width="180" height="180" className="mx-auto">
                    <rect x="0" y="0" width="200" height="200" fill="white"/>
                    <rect x="10" y="10" width="50" height="50" fill="black"/>
                    <rect x="15" y="15" width="40" height="40" fill="white"/>
                    <rect x="20" y="20" width="30" height="30" fill="black"/>
                    <rect x="140" y="10" width="50" height="50" fill="black"/>
                    <rect x="145" y="15" width="40" height="40" fill="white"/>
                    <rect x="150" y="20" width="30" height="30" fill="black"/>
                    <rect x="10" y="140" width="50" height="50" fill="black"/>
                    <rect x="15" y="145" width="40" height="40" fill="white"/>
                    <rect x="20" y="150" width="30" height="30" fill="black"/>
                    {[70,80,90,100,110,120].map(x => 
                      [10,20,30,40,50,70,80,90,100,110,120,140,150,160,170,180].map(y => (
                        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x+y) % 20 === 0 || (x*y) % 17 < 8 ? "black" : "white"} />
                      ))
                    )}
                    {[10,20,30,40,50,140,150,160,170,180].map(x => 
                      [70,80,90,100,110,120].map(y => (
                        <rect key={`b${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x+y) % 14 === 0 || (x*y) % 13 < 6 ? "black" : "white"} />
                      ))
                    )}
                    {[140,150,160,170,180].map(x => 
                      [140,150,160,170,180].map(y => (
                        <rect key={`c${x}-${y}`} x={x} y={y} width="8" height="8" fill={(x+y) % 18 < 9 ? "black" : "white"} />
                      ))
                    )}
                    <rect x="66" y="10" width="4" height="4" fill="black"/>
                    <rect x="66" y="18" width="4" height="4" fill="black"/>
                    <rect x="66" y="26" width="4" height="4" fill="black"/>
                    <rect x="66" y="34" width="4" height="4" fill="black"/>
                    <rect x="66" y="42" width="4" height="4" fill="black"/>
                    <rect x="66" y="50" width="4" height="4" fill="black"/>
                  </svg>
                </div>

                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">Scan with any UPI app</p>
                  <div className="flex items-center justify-center gap-4 text-muted text-xs">
                    <span>GPay</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>PhonePe</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>Paytm</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>BHIM</span>
                  </div>
                </div>

                <div className="bg-surface-2 rounded-xl p-3 flex items-center gap-3 text-left border border-white/5">
                  <Smartphone size={20} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-bold">UPI ID</p>
                    <p className="text-muted text-xs font-mono">urbanest.society@razorpay</p>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      I have paid ₹{amount}
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Card / Netbanking View
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold/50 font-mono transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY"
                        className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold/50 font-mono transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold/50 font-mono transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{amount}
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-muted-2">
                  Secured by Razorpay. Your card details are encrypted end-to-end.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Branding */}
        {!isPaid && (
          <div className="px-6 py-4 border-t border-border-dark flex items-center justify-center gap-2 text-xs text-muted-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Powered by Razorpay • 256-bit SSL Encrypted
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Financials Component ────────────────────────────────────────────────
export const Financials = () => {
  const { currentUser, transactions, adminInvoices, markTransactionPaid } = useStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Modal state: tracks which transaction is being paid
  const [activePayment, setActivePayment] = useState<{ txnId: string; amount: string; title: string } | null>(null);

  const openPayment = (txnId: string, amount: string, title: string) => {
    setActivePayment({ txnId, amount, title });
  };

  const handlePaymentSuccess = () => {
    if (activePayment) {
      markTransactionPaid(activePayment.txnId);
    }
  };

  // Derived: is there any overdue transaction?
  const hasOverdue = transactions.some(t => t.status === 'OVERDUE');

  // Generate Bills modal (Admin only)
  const [showGenerate, setShowGenerate] = useState(false);
  const [genMonth, setGenMonth] = useState('');
  const [genAmount, setGenAmount] = useState('4500');

  // Sorted data logic
  const parseDate = (dateStr: string) => {
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const sortedTransactions = [...transactions].sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const sortedAdminInvoices = [...adminInvoices].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  return (
    <div className="max-w-[1200px] mx-auto space-y-12">
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={!!activePayment}
        onClose={() => setActivePayment(null)}
        onSuccess={handlePaymentSuccess}
        amount={activePayment?.amount ?? ''}
        title={activePayment?.title ?? ''}
      />

      {/* Generate Bills Modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
          <div className="bg-surface border border-border-dark rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generate Invoices</h3>
              <button onClick={() => setShowGenerate(false)} className="p-2 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast.success(`Bulk invoices generated for ${genMonth} — ₹${genAmount} per flat`); setShowGenerate(false); setGenMonth(''); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Billing Month</label>
                <input type="month" required value={genMonth} onChange={e => setGenMonth(e.target.value)}
                  className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Amount per Flat (₹)</label>
                <input type="number" required value={genAmount} onChange={e => setGenAmount(e.target.value)}
                  className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div className="bg-surface-2 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-muted">This will generate invoices for all <span className="text-white font-bold">450 active flats</span>.</p>
                <p className="text-xs text-muted mt-1">Total amount: <span className="text-emerald font-bold">₹{(parseInt(genAmount || '0') * 450).toLocaleString('en-IN')}</span></p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenerate(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            {isAdmin ? 'Society Ledger' : 'Financial Ledger'}
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            {isAdmin ? 'Manage bulk invoicing, track defaulters, and view global revenue.' : 'Track your maintenance dues, invoices, and payment history.'}
          </p>
        </div>
        
        {isAdmin ? (
          <button 
            onClick={() => setShowGenerate(true)}
            className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Receipt size={18} /> Generate Bills
          </button>
        ) : hasOverdue ? (
          <button 
            onClick={() => {
              const overdue = transactions.find(t => t.status === 'OVERDUE');
              if (overdue) openPayment(overdue.id, overdue.amount, 'Outstanding Dues');
            }}
            className="bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Wallet size={18} /> Pay Outstanding
          </button>
        ) : null}
      </div>

      {isAdmin ? (
        // ADMIN VIEW
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border-dark rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-emerald/5 rounded-bl-full pointer-events-none" />
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Total Collected</h3>
              <div className="text-4xl font-heading font-black text-white">₹45,200</div>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald/10 text-emerald text-xs font-bold rounded-lg">
                <ArrowUpRight size={14} /> +12.5% MTD
              </div>
            </div>

            <div className="bg-surface border border-border-dark rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-crimson/5 rounded-bl-full pointer-events-none" />
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Pending Receivables</h3>
              <div className="text-4xl font-heading font-black text-white">₹12,400</div>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-crimson/10 text-crimson text-xs font-bold rounded-lg border border-crimson/20">
                <AlertCircle size={14} /> 3 Accounts Overdue
              </div>
            </div>

            <div className="bg-surface border border-border-dark rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Cash Reserves</h3>
              <div className="text-4xl font-heading font-black text-white">₹1.2M</div>
              <div className="mt-4 text-xs font-medium text-muted">
                Liquid funds across all society accounts.
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
            <div className="bg-surface border border-border-dark rounded-[2rem] overflow-hidden">
              <div className="divide-y divide-border-dark/50">
                {sortedAdminInvoices.map((inv) => (
                  <div key={inv.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-surface-2 border border-white/5 items-center justify-center text-muted">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm text-gold font-bold">{inv.flat}</span>
                          <span className="text-muted-2 text-xs font-medium uppercase">{inv.id}</span>
                        </div>
                        <h4 className="text-white font-bold">{inv.type}</h4>
                        <p className="text-sm text-muted">{inv.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:justify-end">
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold text-white">₹{inv.amount}</div>
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold ${
                          inv.status === 'Paid' ? 'text-emerald' : 
                          inv.status === 'Pending' ? 'text-amber' : 'text-crimson'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => downloadBill({ id: inv.id, title: inv.type, amount: inv.amount, date: inv.date, status: inv.status, flat: inv.flat })}
                        className="p-3 bg-surface-2 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // RESIDENT VIEW
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 space-y-6">
            {/* Huge Total Balance Card — only shown when overdue */}
            {hasOverdue ? (
              <div className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                
                <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={16} /> Total Outstanding
                </h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl text-muted font-mono font-medium">₹</span>
                  <span className="text-6xl font-heading font-black text-white tracking-tighter">4,500</span>
                  <span className="text-xl text-muted font-mono font-medium">.00</span>
                </div>
                
                <p className="text-sm font-medium text-crimson mb-8">
                  Due immediately. Late fee applies after 15 April.
                </p>

                <button 
                  onClick={() => {
                    const overdue = transactions.find(t => t.status === 'OVERDUE');
                    if (overdue) openPayment(overdue.id, overdue.amount, 'Maintenance Q1 – Full Amount');
                  }}
                  className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:scale-[1.02] text-lg"
                >
                  Pay Full Amount
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={16} /> Account Status
                </h3>
                <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} className="text-emerald" />
                </div>
                <p className="text-center text-white font-bold text-lg mb-1">All Clear!</p>
                <p className="text-center text-muted text-sm">No outstanding dues. You're up to date.</p>
              </div>
            )}

            {/* Auto-Pay Card */}
            <div className="bg-surface border border-border-dark rounded-3xl p-6 relative overflow-hidden group hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    Auto-Pay <span className="bg-emerald/10 text-emerald text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">Safe</span>
                  </h3>
                  <p className="text-sm text-muted">Never miss a maintenance deadline.</p>
                </div>
                <div className="w-12 h-6 bg-surface-2 rounded-full relative cursor-pointer border border-white/10" onClick={() => toast.success('Auto-pay configuration opened')}>
                  <div className="w-4 h-4 bg-muted absolute left-1 top-1 rounded-full transition-transform"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual List Transaction History */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
            
            <div className="space-y-4">
              {sortedTransactions.map((txn: Transaction) => (
                <div key={txn.id} className="bg-surface border border-border-dark rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
                      txn.type === 'credit' 
                        ? 'bg-emerald/10 border-emerald/20 text-emerald' 
                        : 'bg-crimson/10 border-crimson/20 text-crimson'
                    }`}>
                      {txn.type === 'credit' ? <CheckCircle2 size={24} /> : <RefreshCw size={24} />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-0.5">{txn.title}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted">{txn.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="font-mono text-muted-2 text-xs">{txn.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                    <div className="text-left sm:text-right">
                      <div className="font-mono text-xl font-bold text-white">
                        {txn.type === 'debit' ? '-' : '+'}₹{txn.amount}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold ${txn.status === 'PAID' ? 'text-emerald' : 'text-crimson'}`}>
                        {txn.status}
                      </span>
                    </div>
                    {txn.status === 'OVERDUE' ? (
                      <button 
                        onClick={() => openPayment(txn.id, txn.amount, txn.title)}
                        className="px-4 py-3 bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold rounded-xl text-black font-bold transition-all transform hover:scale-[1.02] text-sm flex items-center gap-2"
                      >
                        <Wallet size={16} /> Pay
                      </button>
                    ) : (
                      <button 
                        onClick={() => downloadBill({ id: txn.id, title: txn.title, amount: txn.amount, date: txn.date, status: txn.status })}
                        className="p-3 bg-surface-2 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5"
                        title="Download Receipt"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-4 rounded-2xl border border-border-dark border-dashed text-muted hover:text-white hover:border-white/20 hover:bg-white/5 font-medium transition-all text-sm">
              Load Older Transactions
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
