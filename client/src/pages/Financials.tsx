import { DataTable } from '../components/DataTable';
import { KpiCard } from '../components/KpiCard';
import { ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_INVOICES = [
  { id: 'INV-1001', flat: 'A-101', type: 'Maintenance Q1', amount: '₹4,500', status: 'Paid', date: '01 Mar 2024' },
  { id: 'INV-1002', flat: 'B-302', type: 'Maintenance Q1', amount: '₹4,500', status: 'Overdue', date: '01 Mar 2024' },
  { id: 'INV-1003', flat: 'C-205', type: 'Clubhouse Booking', amount: '₹1,200', status: 'Pending', date: '12 Mar 2024' },
  { id: 'INV-1004', flat: 'D-404', type: 'Maintenance Q1', amount: '₹4,500', status: 'Paid', date: '05 Mar 2024' },
];

export const Financials = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <KpiCard 
          title="Total Collected"
          value="₹45,200"
          subtitle="March 2024"
          accentColor="emerald"
          badgeText="12% vs last month"
          badgeIcon={<ArrowUpRight size={10} />}
        />
        <KpiCard 
          title="Pending Dues"
          value="₹12,400"
          subtitle="Across 3 flats"
          accentColor="crimson"
          pulse={true}
        />
      </div>

      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center">
          <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Invoices & Ledger</h2>
          <button onClick={() => toast.success('Invoice generation started')} className="bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm">
            Generate Invoice
          </button>
        </div>
        
        <DataTable 
          data={MOCK_INVOICES}
          columns={[
            { key: 'flat', header: 'Flat' },
            { key: 'type', header: 'Description' },
            { key: 'id', header: 'Invoice #' },
            { key: 'date', header: 'Date' },
            { key: 'amount', header: 'Amount' },
            { key: 'status', header: 'Status', render: (row) => (
              <span className={`px-2.5 py-1 rounded border text-[11px] font-medium uppercase tracking-wider
                ${row.status === 'Paid' ? 'bg-emerald/10 text-emerald border-emerald/20' : 
                  row.status === 'Pending' ? 'bg-amber/10 text-amber border-amber/20' : 
                  'bg-crimson/10 text-crimson border-crimson/20'}
              `}>
                {row.status}
              </span>
            )},
          ]}
        />
      </div>
    </div>
  );
};
