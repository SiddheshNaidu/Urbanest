import { DataTable } from '../components/DataTable';
import { KpiCard } from '../components/KpiCard';
import toast from 'react-hot-toast';

const MOCK_TICKETS = [
  { id: 'TKT-201', flat: 'A-505', category: 'Plumbing', issue: 'Leaking pipe in master bathroom', status: 'In Progress', priority: 'High', date: 'Today, 10:30 AM' },
  { id: 'TKT-202', flat: 'B-302', category: 'Electrical', issue: 'Living room fan not working', status: 'Open', priority: 'Medium', date: 'Yesterday, 4:15 PM' },
  { id: 'TKT-203', flat: 'C-205', category: 'Maintenance', issue: 'Pest control schedule check', status: 'Resolved', priority: 'Low', date: '10 Mar 2024' },
];

export const Helpdesk = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <KpiCard 
          title="Open Tickets"
          value="14"
          subtitle="Tickets requiring attention"
          accentColor="amber"
          pulse={true}
        />
        <KpiCard 
          title="Resolution Time"
          value="24h"
          subtitle="Average time to resolution"
          accentColor="emerald"
        />
      </div>

      <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center">
          <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Service Requests</h2>
          <button onClick={() => toast.success('Helpdesk ticket portal opened')} className="bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm">
            Create Ticket
          </button>
        </div>
        
        <DataTable 
          data={MOCK_TICKETS}
          columns={[
            { key: 'id', header: 'Ticket ID' },
            { key: 'flat', header: 'Flat' },
            { key: 'category', header: 'Category' },
            { key: 'issue', header: 'Description', render: (row) => <div className="max-w-[200px] truncate">{row.issue}</div> },
            { key: 'priority', header: 'Priority', render: (row) => (
               <span className={`text-[11px] font-medium uppercase tracking-wider
                ${row.priority === 'High' ? 'text-crimson' : 
                  row.priority === 'Medium' ? 'text-amber' : 
                  'text-muted-2'}
              `}>
                {row.priority}
              </span>
            )},
            { key: 'status', header: 'Status', render: (row) => (
              <span className={`px-2.5 py-1 rounded border text-[11px] font-medium uppercase tracking-wider
                ${row.status === 'Resolved' ? 'bg-emerald/10 text-emerald border-emerald/20' : 
                  row.status === 'In Progress' ? 'bg-amber/10 text-amber border-amber/20' : 
                  'bg-surface-2 text-white border-border-dark'}
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
