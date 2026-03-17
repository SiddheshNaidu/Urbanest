import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Visitor, type Notice } from '../store/useStore';
import { 
  CloudSun, Clock as ClockIcon, QrCode, CreditCard, Dumbbell, HeadphonesIcon, 
  ChevronRight, CalendarClock, ShieldCheck, BellRing
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const ResidentDashboard = () => {
  const { currentUser, addVisitor, visitors, bookings, notices } = useStore();
  const navigate = useNavigate();
  
  // Real-time clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // QR Modal State
  const [isVisitorModalOpen, setVisitorModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [purpose, setPurpose] = useState<Visitor['purpose']>('GUEST');
  const [generatedVisitor, setGeneratedVisitor] = useState<Visitor | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const flatId = currentUser?.flatId || 'Not Assigned';
  
  const myNextVisitor = visitors.find(v => v.flatId === flatId && v.status === 'EXPECTED');
  const myNextBooking = bookings.find(b => b.residentName === currentUser?.name && b.status === 'CONFIRMED');

  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.flatId) return;

    const newVisitor = addVisitor({
      name: visitorName,
      flatId: currentUser.flatId,
      purpose,
      status: 'EXPECTED',
      qrToken: `QR-${Math.random().toString(36).substr(2, 9)}`,
      addedBy: `${currentUser.name} (${currentUser.flatId})`
    });

    setGeneratedVisitor(newVisitor);
    setVisitorName('');
  };

  const downloadQR = () => {
    if (!qrRef.current || !generatedVisitor) return;
    const qrCanvas = qrRef.current.querySelector('canvas') as HTMLCanvasElement | null;
    if (!qrCanvas) {
      toast.error('Could not capture QR code. Please try again.');
      return;
    }

    // Create a composite canvas to add text below QR
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const margin = 40;
    canvas.width = qrCanvas.width + margin * 2;
    canvas.height = qrCanvas.height + margin * 2 + 80;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR
    ctx.drawImage(qrCanvas, margin, margin);

    // Draw Token Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TOKEN: ${generatedVisitor.qrToken}`, canvas.width / 2, canvas.height - 50);
    
    // Draw Name
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(generatedVisitor.name, canvas.width / 2, canvas.height - 25);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `visitor-pass-${generatedVisitor.name}.png`;
    link.href = url;
    link.click();
    
    toast.success('Visitor Pass saved with Token!');
    setVisitorModalOpen(false);
    setGeneratedVisitor(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header - ELITERES Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-dark pb-6 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold tracking-widest uppercase border border-gold/20">
              ELITERES
            </span>
            <span className="text-muted text-sm font-medium tracking-wide uppercase">
              Residence {flatId}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Welcome Home,<br/>
            <span className="text-muted-2">{currentUser?.name}</span>
          </h1>
        </div>
        
        {/* Weather & Time Widgets */}
        <div className="flex gap-4">
          <div className="bg-surface-2 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <CloudSun className="text-gold" size={32} />
            <div>
              <p className="text-sm font-bold text-white">28°C</p>
              <p className="text-xs text-muted uppercase tracking-wider">Partly Cloudy</p>
            </div>
          </div>
          <div className="bg-surface-2 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <ClockIcon className="text-emerald" size={32} />
            <div>
              <p className="text-sm font-bold text-white">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-muted uppercase tracking-wider">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Content - Concierge Grid */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-heading font-bold text-white">Concierge Services</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visitor Pass Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setVisitorModalOpen(true)}
              className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark p-6 rounded-3xl cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl w-fit mb-4">
                <QrCode className="text-gold" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Visitor Pass <ChevronRight size={18} className="text-muted group-hover:text-gold transition-colors" />
              </h3>
              <p className="text-sm text-muted">Generate instant QR entry codes for guests and deliveries.</p>
            </motion.div>

            {/* Dues & Fees */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/financials')}
              className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark p-6 rounded-3xl cursor-pointer group relative overflow-hidden"
            >
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl w-fit mb-4">
                <CreditCard className="text-emerald" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Dues & Fees <ChevronRight size={18} className="text-muted group-hover:text-emerald transition-colors" />
              </h3>
              <p className="text-sm text-muted">View upcoming maintenance and clear outstanding balances.</p>
            </motion.div>

            {/* Amenities */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/amenities')}
              className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark p-6 rounded-3xl cursor-pointer group relative overflow-hidden"
            >
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl w-fit mb-4">
                <Dumbbell className="text-amber" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Amenities <ChevronRight size={18} className="text-muted group-hover:text-amber transition-colors" />
              </h3>
              <p className="text-sm text-muted">Book the clubhouse, spa, or sports courts seamlessly.</p>
            </motion.div>

            {/* Service Request */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/helpdesk')}
              className="bg-gradient-to-br from-surface to-surface-hover border border-border-dark p-6 rounded-3xl cursor-pointer group relative overflow-hidden"
            >
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl w-fit mb-4">
                <HeadphonesIcon className="text-crimson" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Service Request <ChevronRight size={18} className="text-muted group-hover:text-crimson transition-colors" />
              </h3>
              <p className="text-sm text-muted">Raise tickets for plumbing, electrical, or other issues.</p>
            </motion.div>
          </div>
        </div>

        {/* Sidebar Blocks */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Financial Overview */}
          <div className="bg-surface border border-border-dark rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-crimson/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Financial Overview</h3>
            <div className="mb-4">
              <span className="text-3xl font-heading font-black text-white">₹4,500</span>
              <span className="text-muted ml-2">Due</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-crimson mb-6">
              <span className="w-2 h-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(225,29,72,0.4)]"></span>
              Payment pending by 15 April
            </div>
            <button 
              onClick={() => navigate('/financials')}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
            >
              Pay Now
            </button>
          </div>

          {/* Next Visitor / Booking */}
          <div className="bg-surface border border-border-dark rounded-3xl p-6">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-6">Upcoming Agenda</h3>
            
            <div className="space-y-4">
              {myNextVisitor ? (
                <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                  <div className="p-2 bg-emerald/10 text-emerald rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{myNextVisitor.name}</p>
                    <p className="text-xs text-muted">{myNextVisitor.purpose} • Expected Today</p>
                  </div>
                </div>
              ) : (
                <div className="pb-4 border-b border-white/5 text-sm text-muted">No visitors expected today.</div>
              )}

              {myNextBooking ? (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber/10 text-amber rounded-lg">
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Amenity Session</p>
                    <p className="text-xs text-muted">{myNextBooking.date} • {myNextBooking.timeSlot}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted">No facility sessions booked.</div>
              )}
            </div>
          </div>

          {/* Latest Notices Preview */}
          <div className="bg-surface border border-border-dark rounded-3xl p-6">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <BellRing size={16} className="text-gold" /> Latest Notices
            </h3>
            <div className="space-y-4">
              {notices.slice(0, 2).map((notice: Notice) => (
                <div key={notice.id} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${notice.isUrgent ? 'bg-crimson/10 text-crimson' : 'bg-surface-2 text-white/60'}`}>
                      <BellRing size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{notice.title}</p>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{notice.content}</p>
                      <p className="text-[10px] text-muted mt-1">{notice.date}</p>
                    </div>
                  </div>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-sm text-muted">No notices posted yet.</p>
              )}
            </div>
            <button
              onClick={() => navigate('/notices')}
              className="w-full mt-4 py-2.5 text-xs font-bold text-gold uppercase tracking-wider bg-gold/5 hover:bg-gold/10 border border-gold/10 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              View All Notices <ChevronRight size={14} />
            </button>
          </div>
          
        </div>
      </div>

      {/* Visitor Pass Modal (QR Generator) */}
      <AnimatePresence>
        {isVisitorModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface border border-border-dark rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              {!generatedVisitor ? (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Generate Pass</h3>
                    <button onClick={() => setVisitorModalOpen(false)} className="text-muted hover:text-white">&times;</button>
                  </div>
                  
                  <form onSubmit={handleGeneratePass} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-muted-2 mb-2">Visitor Name</label>
                      <input 
                        type="text" 
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="e.g. Amazon Delivery" 
                        required
                        className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-2 mb-2">Purpose</label>
                      <select 
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value as Visitor['purpose'])}
                        className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none"
                      >
                        <option value="GUEST">Personal Guest</option>
                        <option value="DELIVERY">Delivery</option>
                        <option value="SERVICE">Service & Repair</option>
                        <option value="DOMESTIC_STAFF">Domestic Staff</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-3 mt-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] transform hover:scale-[1.02]"
                    >
                      Create QR Code
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <h3 className="font-heading font-bold text-2xl text-white mb-2">Pass Ready</h3>
                  <p className="text-muted text-sm mb-8">Show this code at the security gate.</p>
                  
                  <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] inline-block mb-6 mx-auto">
                    <QRCodeCanvas 
                      value={JSON.stringify({
                        token: generatedVisitor.qrToken,
                        name: generatedVisitor.name,
                        flatId: generatedVisitor.flatId,
                        purpose: generatedVisitor.purpose
                      })} 
                      size={240} 
                      level="H" 
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  
                  <div className="bg-base rounded-xl p-4 mb-6">
                    <p className="text-lg font-bold text-white">{generatedVisitor.name}</p>
                    <p className="text-sm text-gold font-medium uppercase tracking-widest mb-3">{generatedVisitor.purpose}</p>
                    <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2 border border-white/5">
                      <p className="text-xs text-muted font-mono flex-1 select-all">{generatedVisitor.qrToken}</p>
                      <button 
                        onClick={() => { 
                          navigator.clipboard.writeText(generatedVisitor.qrToken || '');
                          toast.success('Token copied!');
                        }}
                        className="text-[10px] text-gold hover:text-amber font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setVisitorModalOpen(false); setGeneratedVisitor(null); }}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
                    >
                      Close
                    </button>
                    <button 
                      onClick={downloadQR}
                      className="flex-1 py-3 bg-gold hover:bg-amber text-black font-bold rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all"
                    >
                      Save to Phone
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
