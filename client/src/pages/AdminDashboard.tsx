import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { ArrowUpRight, Settings, Users, AlertCircle } from 'lucide-react';
import { AddResidentModal } from '../components/AddResidentModal';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { visitors, adminInvoices } = useStore();
  const activeVisitors = visitors.filter(v => v.status === 'ON_CAMPUS').length;
  const [showAddResident, setShowAddResident] = useState(false);
  const [timeRange, setTimeRange] = useState<'6m' | '1y'>('6m');

  const chartData = useMemo(() => {
    // Generate an array of the last 12 months anchored to today
    const months: { month: string; fullDate: Date; revenue: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
         month: d.toLocaleString('default', { month: 'short' }),
         fullDate: d,
         // eslint-disable-next-line react-hooks/purity
         revenue: Math.floor(Math.random() * 20000) + 30000 // Base historical dummy revenue ~30k-50k
      });
    }

    // Merge in real data from store transactions/invoices
    adminInvoices.forEach(inv => {
      if (inv.status === 'Paid') {
        const d = new Date(inv.date);
        const mName = d.toLocaleString('default', { month: 'short' });
        const target = months.find(m => m.month === mName && m.fullDate.getFullYear() === d.getFullYear());
        if (target) {
          target.revenue += parseInt(inv.amount.replace(/,/g, '')) || 0;
        }
      }
    });

    return timeRange === '6m' ? months.slice(6) : months;
  }, [timeRange, adminInvoices]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <AddResidentModal isOpen={showAddResident} onClose={() => setShowAddResident(false)} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Command Center
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            Society operations, financial tracking, and real-time alerts.
          </p>
        </div>
        <button 
          onClick={() => toast('Settings panel coming soon', { icon: '⚙️' })}
          className="p-3 bg-surface-2 hover:bg-white/10 text-white rounded-xl border border-border-dark transition-all"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Top 3 Large KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-surface border border-border-dark rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-emerald/5 rounded-bl-full pointer-events-none group-hover:bg-emerald/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest font-heading">Collection Rate</h3>
            <span className="flex items-center gap-1 text-emerald text-xs font-bold px-2 py-1 bg-emerald/10 rounded-md border border-emerald/20">
              <ArrowUpRight size={12} /> 2.1%
            </span>
          </div>
          <div className="text-5xl font-heading font-black text-white tracking-tighter mb-2">92.4%</div>
          <p className="text-sm font-medium text-muted">₹3.2M collected this month</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface border border-border-dark rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-amber/5 rounded-bl-full pointer-events-none group-hover:bg-amber/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest font-heading">Open Tickets</h3>
            <span className="flex items-center justify-center w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
          </div>
          <div className="text-5xl font-heading font-black text-white tracking-tighter mb-2">14</div>
          <p className="text-sm font-medium text-amber">Avg. resolution time: 2.4 days</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface border border-border-dark rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest font-heading">Active Visitors</h3>
            <span className="flex items-center gap-1 text-blue-400 text-xs font-bold px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
              LIVE
            </span>
          </div>
          <div className="text-5xl font-heading font-black text-white tracking-tighter mb-2">
            {activeVisitors.toString().padStart(2, '0')}
          </div>
          <p className="text-sm font-medium text-muted">{visitors.length} total entries today</p>
        </div>
      </div>

      {/* Middle Row: Analytics & Action Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Performance Analytics & Sparkline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border-dark rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold text-white">Financial Trend</h2>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '6m' | '1y')}
                className="bg-surface-2 border border-border-dark text-muted-2 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none transition-colors hover:text-white"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">This Year</option>
              </select>
            </div>
            
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717A', fontSize: 10, fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717A', fontSize: 10, fontWeight: 'bold' }}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.2)' }}
                    itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    animationDuration={1500}
                    activeDot={{ r: 6, fill: '#10B981', stroke: '#18181B', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Allocation */}
          <div className="bg-surface border border-border-dark rounded-[2rem] p-8">
            <h2 className="text-xl font-heading font-bold text-white mb-6">Occupancy Allocation</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-heading font-black text-white">450</span>
              <span className="text-muted text-sm font-medium uppercase tracking-wider">Total Units</span>
            </div>
            
            {/* Custom Progress Bar */}
            <div className="w-full h-4 rounded-full flex overflow-hidden mb-6 bg-surface-2">
              <div className="bg-gold h-full" style={{ width: '65%' }} title="Owners (65%)"></div>
              <div className="bg-blue-500 h-full" style={{ width: '25%' }} title="Tenants (25%)"></div>
              <div className="bg-surface-2 h-full" style={{ width: '10%' }} title="Vacant (10%)"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm bg-gold"></div>
                  <span className="text-xs text-muted uppercase tracking-wider font-bold">Owners</span>
                </div>
                <span className="text-lg font-bold text-white">292 <span className="text-xs text-muted-2 font-normal">(65%)</span></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                  <span className="text-xs text-muted uppercase tracking-wider font-bold">Tenants</span>
                </div>
                <span className="text-lg font-bold text-white">113 <span className="text-xs text-muted-2 font-normal">(25%)</span></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm bg-surface-2 border border-border-dark"></div>
                  <span className="text-xs text-muted uppercase tracking-wider font-bold">Vacant</span>
                </div>
                <span className="text-lg font-bold text-white">45 <span className="text-xs text-muted-2 font-normal">(10%)</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Required & Critical Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border-dark rounded-[2rem] overflow-hidden">
            <div className="px-6 py-5 border-b border-border-dark bg-crimson/5">
              <h2 className="font-heading font-semibold text-sm text-crimson uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={16} /> Action Required
              </h2>
            </div>
            
            <div className="p-2">
              <Link to="/financials" className="block p-4 m-2 bg-surface-2 border-l-4 border-l-crimson border border-transparent hover:bg-white/5 rounded-xl transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-white">Overdue Invoices</span>
                  <span className="text-[10px] font-mono font-bold text-white bg-crimson px-2 py-0.5 rounded-md">12 Flats</span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">Total outstanding arrears have crossed ₹1.2L.</p>
                <div className="text-[10px] uppercase font-bold text-crimson group-hover:underline flex items-center gap-1">
                  Review Defaulters <ArrowUpRight size={10} />
                </div>
              </Link>

              <Link to="/helpdesk" className="block p-4 m-2 bg-surface-2 border-l-4 border-l-amber border border-transparent hover:bg-white/5 rounded-xl transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-white">Escalated Tickets</span>
                  <span className="text-[10px] font-mono font-bold text-black bg-amber px-2 py-0.5 rounded-md">3 Open</span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">Issues require immediate intervention (Plumbing, Lift).</p>
                <div className="text-[10px] uppercase font-bold text-amber group-hover:underline flex items-center gap-1">
                  Open Helpdesk <ArrowUpRight size={10} />
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface to-surface-2 border border-border-dark rounded-[2rem] p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-bl-full pointer-events-none" />
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/10 rounded-xl text-white">
                 <Users size={18} />
               </div>
               <h3 className="font-bold text-white">Quick Add Resident</h3>
             </div>
             <p className="text-sm text-muted mb-6">Onboard a new homeowner or tenant into the system.</p>
              <button 
                 onClick={() => setShowAddResident(true)}
                 className="w-full py-3 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 transition-colors text-sm"
               >
               Start Onboarding
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};
