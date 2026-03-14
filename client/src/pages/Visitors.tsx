import { useStore } from '../store/useStore';
import { DataTable } from '../components/DataTable';
import toast from 'react-hot-toast';

export const Visitors = () => {
  const { visitors } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-xl text-white">Visitor History Log</h2>
        <button onClick={() => toast.success('CSV Export started')} className="bg-surface-2 hover:bg-white/10 border border-border-dark text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
          Export CSV
        </button>
      </div>

      <DataTable 
        data={visitors}
        emptyMessage="No visitors logged yet."
        columns={[
          { key: 'id', header: 'ID', render: (row) => <span className="font-mono text-[11px] text-muted">{row.id}</span> },
          { key: 'name', header: 'Visitor Name' },
          { key: 'flatId', header: 'Destination Flat' },
          { key: 'purpose', header: 'Purpose', render: (row) => (
             <span className="text-[11px] font-medium text-muted-2 uppercase tracking-wider">{row.purpose}</span>
          )},
          { key: 'status', header: 'Status', render: (row) => (
            <span className={`px-2.5 py-1 rounded border text-[11px] font-medium uppercase tracking-wider
              ${row.status === 'ON_CAMPUS' ? 'bg-emerald/10 text-emerald border-emerald/20' : 
                row.status === 'EXPECTED' ? 'bg-gold/10 text-gold border-gold/20' : 
                'bg-surface-2 text-muted border-border-dark'}
            `}>
              {row.status}
            </span>
          )},
          { key: 'entryTime', header: 'Entry', render: (row) => <span className="font-mono text-xs">{row.entryTime || '-'}</span> },
          { key: 'exitTime', header: 'Exit', render: (row) => <span className="font-mono text-xs">{row.exitTime || '-'}</span> },
        ]}
      />
    </div>
  );
};
