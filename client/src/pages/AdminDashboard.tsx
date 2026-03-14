import { Link } from 'react-router-dom';
import { KpiCard } from '../components/KpiCard';
import { useStore } from '../store/useStore';
import { ArrowUpRight, Wrench, Package, Plus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { visitors } = useStore();
  const activeVisitors = visitors.filter(v => v.status === 'ON_CAMPUS').length;

  return (
    <>
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <KpiCard 
          title="Collection Rate"
          value="92.4%"
          subtitle="₹3.2M collected this month"
          accentColor="emerald"
          badgeText="2.1%"
          badgeIcon={<ArrowUpRight size={10} />}
        />
        <KpiCard 
          title="Open Tickets"
          value="14"
          subtitle="Avg. resolution time: 2.4 days"
          accentColor="amber"
          badgeText="3 Urgent"
          pulse={true}
        />
        <KpiCard 
          title="Active Visitors"
          value={activeVisitors.toString().padStart(2, '0')}
          subtitle={`${visitors.length} total entries today`}
          accentColor="gold"
          badgeText="Live"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center bg-surface-2/30">
            <h3 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Quick Actions</h3>
            <button onClick={() => toast.success('Settings opened')} className="text-muted hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button onClick={() => toast.success('Add resident form opened')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border-dark bg-surface-2 hover:bg-white/5 hover:border-muted-2 transition-all group">
              <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium text-white">Add Resident</span>
            </button>
            <button onClick={() => toast.success('Broadcast notice form opened')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border-dark bg-surface-2 hover:bg-white/5 hover:border-muted-2 transition-all group">
              <div className="w-10 h-10 rounded-full bg-emerald/10 text-emerald flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium text-white">Broadcast Notice</span>
            </button>
          </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center">
              <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Recent Activity</h2>
              <button className="text-xs text-gold font-medium hover:underline">View Log</button>
            </div>
            
            <div className="divide-y divide-border-dark">
              <div className="px-6 py-4 flex gap-4 interactive-row">
                <div className="w-8 h-8 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center flex-shrink-0 text-emerald mt-1">
                  <ArrowUpRight size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-0.5">Maintenance Dues Cleared</p>
                  <p className="text-xs text-muted leading-relaxed">Flat B-302 has cleared their outstanding maintenance invoice of ₹4,500.</p>
                  <span className="text-[11px] font-mono text-muted-2 mt-2 block">12 mins ago</span>
                </div>
              </div>

              <div className="px-6 py-4 flex gap-4 interactive-row">
                <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center flex-shrink-0 text-amber mt-1">
                  <Wrench size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-0.5">Plumbing Issue Escalated</p>
                  <p className="text-xs text-muted leading-relaxed">Ticket T-1045 (Tower A) has been escalated to URGENT by Facility Manager.</p>
                  <span className="text-[11px] font-mono text-muted-2 mt-2 block">2 hours ago</span>
                </div>
              </div>
              
              <div className="px-6 py-4 flex gap-4 interactive-row">
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-dark flex items-center justify-center flex-shrink-0 text-white mt-1">
                  <Package size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-0.5">Visitor Pre-Approval</p>
                  <p className="text-xs text-muted leading-relaxed">Resident in C-101 has generated a pre-approval pass for Swiggy Delivery.</p>
                  <span className="text-[11px] font-mono text-muted-2 mt-2 block">3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-dark">
              <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-crimson animate-pulse"></span> Action Required
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <Link to="/financials" className="block p-3 bg-surface-2 border border-border-dark hover:border-gray-600 rounded-lg interactive-element group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-crimson uppercase tracking-wider">Overdue Dues</span>
                  <span className="text-[11px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded">12 Flats</span>
                </div>
                <p className="text-sm text-white mb-2 leading-relaxed">Total outstanding arrears have crossed ₹1.2L.</p>
                <span className="text-[11px] text-gold font-medium group-hover:underline">Review Defaulters &rarr;</span>
              </Link>

              <Link to="/helpdesk" className="block p-3 bg-surface-2 border border-border-dark hover:border-gray-600 rounded-lg interactive-element group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-amber uppercase tracking-wider">Urgent Tickets</span>
                  <span className="text-[11px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded">3 Open</span>
                </div>
                <p className="text-sm text-white mb-2 leading-relaxed">Escalated issues require immediate intervention.</p>
                <span className="text-[11px] text-gold font-medium group-hover:underline">Open Helpdesk &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
