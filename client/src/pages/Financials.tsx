import { useStore } from '../store/useStore';
import { 
  ArrowUpRight, Download, Receipt, Wallet, Activity, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_TRANSACTIONS = [
  { id: 'TXN-9091', title: 'Maintenance Q1', amount: '4,500.00', status: 'OVERDUE', date: '01 Mar 2024', type: 'debit' },
  { id: 'TXN-9092', title: 'Clubhouse Booking', amount: '1,200.00', status: 'PAID', date: '12 Feb 2024', type: 'credit' },
  { id: 'TXN-9093', title: 'Maintenance Q4', amount: '4,500.00', status: 'PAID', date: '01 Dec 2023', type: 'credit' },
  { id: 'TXN-9094', title: 'Plumbing Service', amount: '350.00', status: 'PAID', date: '15 Nov 2023', type: 'credit' },
];

const MOCK_ADMIN_INVOICES = [
  { id: 'INV-1001', flat: 'A-101', type: 'Maintenance Q1', amount: '4,500', status: 'Paid', date: '01 Mar 2024' },
  { id: 'INV-1002', flat: 'B-302', type: 'Maintenance Q1', amount: '4,500', status: 'Overdue', date: '01 Mar 2024' },
  { id: 'INV-1003', flat: 'C-205', type: 'Clubhouse Booking', amount: '1,200', status: 'Pending', date: '12 Mar 2024' },
  { id: 'INV-1004', flat: 'D-404', type: 'Maintenance Q1', amount: '4,500', status: 'Paid', date: '05 Mar 2024' },
];

export const Financials = () => {
  const { currentUser } = useStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="max-w-[1200px] mx-auto space-y-12">
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
            onClick={() => toast.success('Bulk Invoice Generation Started')}
            className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Receipt size={18} /> Generate Bills
          </button>
        ) : (
          <button 
            onClick={() => toast.success('Processing payment securely...')}
            className="bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Wallet size={18} /> Pay Outstanding
          </button>
        )}
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
                {MOCK_ADMIN_INVOICES.map((inv) => (
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
                      <button className="p-3 bg-surface-2 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5">
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
            {/* Huge Total Balance Card */}
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
                Due immmediately. Late fee applies after 15 April.
              </p>

              <button 
                onClick={() => toast.success('Processing payment securely...')}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:scale-[1.02] text-lg"
              >
                Pay Full Amount
              </button>
            </div>

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
              {MOCK_TRANSACTIONS.map((txn) => (
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
                    <button className="p-3 bg-surface-2 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5">
                      <Download size={18} />
                    </button>
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
