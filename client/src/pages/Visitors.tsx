import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore, type Visitor } from '../store/useStore';
import { 
  Users, ShieldCheck, Clock, Download, Plus, Video, Radio, Package, Wrench, User, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Visitors = () => {
  const { visitors, addVisitor, currentUser } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Pre-Approve modal state
  const [showPreApprove, setShowPreApprove] = useState(false);
  const [paName, setPaName]       = useState('');
  const [paFlat, setPaFlat]       = useState('');
  const [paPurpose, setPaPurpose] = useState<Visitor['purpose']>('GUEST');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const totalExpected = visitors.filter(v => v.status === 'EXPECTED').length;
  const totalOnCampus = visitors.filter(v => v.status === 'ON_CAMPUS').length;
  const totalDaily = visitors.length; // Mock daily total

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'DELIVERY': return <Package size={16} className="text-amber" />;
      case 'SERVICE': return <Wrench size={16} className="text-blue-400" />;
      case 'GUEST': return <User size={16} className="text-emerald" />;
      default: return <Users size={16} className="text-muted" />;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Pre-Approve Modal */}
      {showPreApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
          <div className="bg-surface border border-border-dark rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Pre-Approve Visitor</h3>
              <button onClick={() => setShowPreApprove(false)} className="p-2 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!paName || !paFlat) return;
              addVisitor({
                name: paName,
                flatId: paFlat,
                purpose: paPurpose,
                status: 'EXPECTED',
                qrToken: `QR-${Math.random().toString(36).substr(2, 9)}`,
                addedBy: currentUser?.name || 'Admin',
              });
              toast.success(`${paName} pre-approved for ${paFlat}`);
              setPaName(''); setPaFlat(''); setPaPurpose('GUEST');
              setShowPreApprove(false);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Visitor Name</label>
                <input type="text" required value={paName} onChange={e => setPaName(e.target.value)}
                  placeholder="e.g. Amazon Delivery" 
                  className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Flat Number</label>
                <input type="text" required value={paFlat} onChange={e => setPaFlat(e.target.value)}
                  placeholder="e.g. A-101"
                  className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Purpose</label>
                <select value={paPurpose} onChange={e => setPaPurpose(e.target.value as Visitor['purpose'])}
                  className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none">
                  <option value="GUEST">Personal Guest</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="SERVICE">Service & Repair</option>
                  <option value="DOMESTIC_STAFF">Domestic Staff</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPreApprove(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl transition-all hover:bg-white/10">Cancel</button>
                <button type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-gold to-amber text-black font-bold rounded-xl">Pre-Approve</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Visitor Log
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            Real-time feed of gate entries, deliveries, and expected guests.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowPreApprove(true)}
            className="bg-surface-2 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-border-dark transition-all transform hover:scale-[1.02]"
          >
            <Plus size={18} /> Pre-Approve
          </button>
          <button 
            onClick={() => toast.success('CSV Export downloaded.')}
            className="bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Download size={18} /> Export Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: System Status & Camera */}
        <div className="xl:col-span-4 space-y-6">
          <h2 className="text-xl font-heading font-bold text-white mb-4">System Status</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="bg-surface p-6 rounded-3xl border border-border-dark flex items-center gap-5">
              <div className="p-4 bg-emerald/10 text-emerald rounded-2xl border border-emerald/20">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Daily Visitors</p>
                <h3 className="text-3xl font-heading font-black text-white">{totalDaily}</h3>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-3xl border border-border-dark flex items-center gap-5">
              <div className="p-4 bg-gold/10 text-gold rounded-2xl border border-gold/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">On-Premise</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-heading font-black text-white">{totalOnCampus}</h3>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-3xl border border-border-dark flex items-center gap-5">
              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Expected Arrivals</p>
                <h3 className="text-3xl font-heading font-black text-white">{totalExpected}</h3>
              </div>
            </div>
          </div>

          {/* Today's Memo */}
          <div className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark rounded-3xl p-6 relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 p-16 bg-amber/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Today's Memo</h3>
            <p className="text-sm text-white italic font-medium leading-relaxed mb-4">
              "Expect maintenance crew from 15:00 for the rooftop pool filter system. They have pre-cleared access for Gate 3."
            </p>
            <div className="flex items-center gap-2 border-t border-border-dark/50 pt-4">
              <div className="w-6 h-6 rounded-full bg-gold text-black flex items-center justify-center text-[10px] font-bold">
                SJ
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sarah Jenkins</p>
                <p className="text-[10px] text-muted uppercase">Admin Manager</p>
              </div>
            </div>
          </div>

          {/* Property View Camera Placeholder */}
          <div className="mt-8 rounded-3xl overflow-hidden border border-border-dark bg-black relative group aspect-video xl:aspect-square">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Video size={64} className="text-muted" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-2 py-1 bg-crimson/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5">
                <Radio size={12} className="animate-pulse" /> LIVE
              </div>
              <div className="px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-mono rounded">
                {"CAM-04 MAIN GATE"}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-white text-[10px] font-mono opacity-60">
              URBANEST SECURITY SYNC • {currentDate.toLocaleTimeString()}
            </div>
          </div>

        </div>

        {/* Right Column: Real-Time Activity Feed */}
        <div className="xl:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
              <Radio className="text-emerald animate-pulse" size={20} /> Real-Time Activity
            </h2>
            <div className="text-sm font-medium text-muted">
              Monitoring Main Gate & Service Entrance
            </div>
          </div>

          <div className="bg-surface border border-border-dark rounded-[2.5rem] overflow-hidden">
            <div className="divide-y divide-border-dark/50">
              {visitors.length === 0 ? (
                <div className="p-12 text-center text-muted font-medium">No activity today.</div>
              ) : (
                visitors.map((visitor, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={visitor.id} 
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors gap-4"
                  >
                    <div className="flex items-start gap-5">
                      <div className={`p-3 rounded-2xl border ${
                        visitor.status === 'EXPECTED' ? 'bg-surface-2 border-border-dark' :
                        visitor.status === 'ON_CAMPUS' ? 'bg-gold/10 border-gold/20' :
                        'bg-emerald/10 border-emerald/20'
                     }`}>
                        {getPurposeIcon(visitor.purpose)}
                      </div>
                      
                      <div>
                        <h4 className="text-white font-bold text-lg">{visitor.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                          <span className="text-muted-2 uppercase tracking-wide text-xs font-semibold">{visitor.purpose}</span>
                          <span className="text-muted text-xs">•</span>
                          <span className="text-muted font-medium">Visiting <span className="text-gold font-bold">{visitor.flatId}</span></span>
                          <span className="text-muted text-xs">•</span>
                          <span className="text-muted font-medium flex items-center gap-1">
                            <Clock size={12} /> {visitor.entryTime || 'Expected'} {visitor.exitTime && `- ${visitor.exitTime}`}
                          </span>
                        </div>
                        {visitor.addedBy && (
                          <span className="text-xs text-muted-2 flex items-center gap-1 mt-1">
                            Pre-approved by {visitor.addedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-end shrink-0">
                      <span className={`px-4 py-1.5 rounded-lg border text-xs font-extrabold uppercase tracking-widest ${
                        visitor.status === 'ON_CAMPUS' ? 'bg-gold/10 text-gold border-gold/20' : 
                        visitor.status === 'EXPECTED' ? 'bg-surface-2 text-muted border-border-dark' : 
                        'bg-emerald/10 text-emerald border-emerald/20'
                      }`}>
                        {visitor.status.replace('_', ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {visitors.length > 0 && (
              <button className="w-full p-4 border-t border-border-dark bg-surface-2 hover:bg-white/5 text-xs text-white font-bold uppercase tracking-widest transition-colors">
                Load Older Activity
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
