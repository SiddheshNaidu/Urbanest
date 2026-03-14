import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStore, type Visitor } from '../store/useStore';
import { KpiCard } from '../components/KpiCard';
import { BellRing } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResidentDashboard = () => {
  const { currentUser, addVisitor } = useStore();
  const [visitorName, setVisitorName] = useState('');
  const [purpose, setPurpose] = useState<Visitor['purpose']>('GUEST');
  const [generatedVisitor, setGeneratedVisitor] = useState<Visitor | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.flatId) return;

    const newVisitor = addVisitor({
      name: visitorName,
      flatId: currentUser.flatId,
      purpose,
      status: 'EXPECTED',
      qrToken: `QR-${Math.random().toString(36).substr(2, 9)}`
    });

    setGeneratedVisitor(newVisitor);
    setVisitorName('');
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `visitor-pass-${generatedVisitor?.id}.png`;
      link.href = url;
      link.click();
      toast.success('Visitor Pass downloaded successfully!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Resident Info & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard 
          title="Current Dues"
          value="₹4,500"
          subtitle="Due by 15 April"
          accentColor="crimson"
          pulse={true}
        />
        <KpiCard 
          title="Active Tickets"
          value="1"
          subtitle="Plumbing issue (In Progress)"
          accentColor="amber"
        />
        <KpiCard 
          title="Recent Notice"
          value="AGM Meet"
          subtitle="15 Mar, Clubhouse"
          accentColor="gold"
          badgeIcon={<BellRing size={10} />}
          badgeText="Urgent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-surface border border-border-dark rounded-xl p-6">
            <h2 className="font-heading font-semibold text-xl text-white mb-2">Welcome Home, {currentUser?.name}</h2>
            <p className="text-muted text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
              Flat: {currentUser?.flatId || 'Not Assigned'} • Status: Active
            </p>
          </div>

          {/* QR Generation Form */}
          <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border-dark">
              <h3 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Generate Visitor Pass</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleGeneratePass} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-2 uppercase tracking-wider mb-2">Visitor Name</label>
                  <input 
                    type="text" 
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="e.g. Ramesh" 
                    required
                    className="w-full bg-surface-2 border border-border-dark rounded-lg px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-2 uppercase tracking-wider mb-2">Purpose</label>
                  <select 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as Visitor['purpose'])}
                    className="w-full bg-surface-2 border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="GUEST">Guest</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="SERVICE">Service</option>
                    <option value="DOMESTIC_STAFF">Domestic Staff</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
                >
                  Generate QR Pass
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Display Generated QR */}
        <div className="h-full">
          {generatedVisitor ? (
            <div className="bg-surface border border-border-dark border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 h-full min-h-[400px] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
              <h3 className="font-heading font-semibold text-lg text-white mb-6 relative z-10">Your Visitor Pass</h3>
              <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.15)] mb-6 relative z-10">
                <QRCodeCanvas 
                  value={JSON.stringify({ 
                    visitorId: generatedVisitor.id, 
                    flatId: generatedVisitor.flatId, 
                    token: generatedVisitor.qrToken 
                  })} 
                  size={200} 
                  level="H" 
                  fgColor="#0B0B0B" 
                />
              </div>
              <p className="text-sm font-medium text-white mb-1 relative z-10">{generatedVisitor.name}</p>
              <p className="text-xs text-muted mb-6 uppercase tracking-wider relative z-10">{generatedVisitor.purpose}</p>
              <button 
                onClick={downloadQR}
                className="relative z-10 bg-surface-2 hover:bg-white/10 border border-border-dark text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
              >
                Download Pass
              </button>
            </div>
          ) : (
            <div className="bg-surface/50 border border-border-dark border-dashed rounded-xl flex items-center justify-center p-8 h-full min-h-[400px]">
              <p className="text-muted text-sm text-center max-w-[200px]">Fill the form to generate a secure QR code pass for your visitor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
