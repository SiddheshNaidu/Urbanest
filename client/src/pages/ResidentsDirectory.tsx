
import { DataTable } from '../components/DataTable';
import toast from 'react-hot-toast';

const MOCK_RESIDENTS = [
  { id: '1', name: 'Ramesh Sharma', flat: 'A-101', status: 'Active', moveInDate: '12 Jan 2023', type: 'Owner' },
  { id: '2', name: 'Suresh Kumar', flat: 'C-205', status: 'Active', moveInDate: '05 Mar 2024', type: 'Tenant' },
  { id: '3', name: 'Priya Singh', flat: 'B-302', status: 'On Notice', moveInDate: '22 Aug 2022', type: 'Tenant' },
  { id: '4', name: 'Amit Patel', flat: 'D-404', status: 'Active', moveInDate: '15 Nov 2021', type: 'Owner' },
  { id: '5', name: 'Nisha Gupta', flat: 'A-505', status: 'Inactive', moveInDate: '10 Feb 2020', type: 'Owner' },
];

export const ResidentsDirectory = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-semibold text-xl text-white">Residents Directory</h2>
        <button onClick={() => toast.success('Add resident form opened')} className="bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
          Add Resident
        </button>
      </div>

      <DataTable 
        data={MOCK_RESIDENTS}
        columns={[
          { key: 'flat', header: 'Flat No.' },
          { key: 'name', header: 'Resident Name', render: (row) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-dark flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                {row.name.charAt(0)}
              </div>
              <span>{row.name}</span>
            </div>
          )},
          { key: 'type', header: 'Occupancy' },
          { key: 'moveInDate', header: 'Move-in Date' },
          { key: 'status', header: 'Status', render: (row) => (
            <span className={`px-2.5 py-1 rounded border text-[11px] font-medium uppercase tracking-wider
              ${row.status === 'Active' ? 'bg-emerald/10 text-emerald border-emerald/20' : 
                row.status === 'On Notice' ? 'bg-amber/10 text-amber border-amber/20' : 
                'bg-surface-2 text-muted border-border-dark'}
            `}>
              {row.status}
            </span>
          )},
        ]}
      />
    </div>
  );
};
