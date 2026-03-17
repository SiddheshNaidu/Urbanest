import { useStore, type Visitor } from '../store/useStore';
import { Package, User, Wrench, Users, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PURPOSE_CONFIG = {
  DELIVERY:       { icon: Package,  color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Delivery' },
  GUEST:          { icon: User,     color: 'text-emerald-400',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Guest' },
  SERVICE:        { icon: Wrench,   color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'Service' },
  DOMESTIC_STAFF: { icon: Users,    color: 'text-zinc-400',   bg: 'bg-white/5',        border: 'border-white/10',       label: 'Staff' },
};

export const ExpectedArrivalsPanel = () => {
  const { visitors, updateVisitor } = useStore();

  const expected = visitors.filter(v => v.status === 'EXPECTED');

  const handleArrive = (visitor: Visitor) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    updateVisitor(visitor.id, { status: 'ON_CAMPUS', entryTime: now });
    toast.success(`${visitor.name} marked as arrived`);
  };

  const handleDeny = (visitor: Visitor) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    updateVisitor(visitor.id, { status: 'CHECKED_OUT', exitTime: now });
    toast.error(`${visitor.name} entry denied`);
  };

  return (
    <div className="bg-surface border border-border-dark rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border-dark flex items-center justify-between">
        <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">
          Expected Arrivals
        </h2>
        {expected.length > 0 ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {expected.length} Pending
          </span>
        ) : (
          <span className="text-xs font-medium text-zinc-500">All clear</span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-dark/50">
        {expected.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6">
            <CheckCircle2 size={32} className="text-emerald-500/30 mb-3" />
            <p className="text-sm font-medium text-zinc-500">No pending arrivals</p>
            <p className="text-xs text-zinc-600 mt-1">
              Residents can pre-approve visitors from their dashboard
            </p>
          </div>
        ) : (
          expected.map((visitor) => {
            const config = PURPOSE_CONFIG[visitor.purpose];
            const Icon = config.icon;
            return (
              <div key={visitor.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                {/* Top row: purpose badge + flat */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${config.color} ${config.bg} ${config.border}`}>
                    <Icon size={12} />
                    {config.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-400">{visitor.flatId}</span>
                </div>

                {/* Visitor name */}
                <p className="text-base font-bold text-white mb-1">{visitor.name}</p>

                {/* Added by */}
                {visitor.addedBy && (
                  <p className="text-xs text-zinc-500 mb-4">
                    Pre-approved by <span className="text-zinc-400 font-medium">{visitor.addedBy}</span>
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleArrive(visitor)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Mark Arrived
                  </button>
                  <button
                    onClick={() => handleDeny(visitor)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
