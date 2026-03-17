import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { useStore, type Visitor } from '../store/useStore';
import { KpiCard } from '../components/KpiCard';
import { ExpectedArrivalsPanel } from '../components/ExpectedArrivalsPanel';
import { CheckCircle2, XCircle, KeyboardIcon, Loader2, QrCode, Package, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export const SecurityDashboard = () => {
  const { visitors, updateVisitor } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; visitor?: Visitor } | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  // To prevent multiple scans of same visitor in quick succession
  const isProcessing = useRef(false);
  // Mirrors isScanning state for use inside async closures
  const isScanningRef = useRef(false);

  const activeVisitors = visitors.filter(v => v.status === 'ON_CAMPUS').length;
  const expectedVisitors = visitors.filter(v => v.status === 'EXPECTED').length;

  // Scanner engine refs
  const loopId = useRef<number | null>(null);
  const reader = useRef(new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]])));

  const startScanner = async () => {
    if (!window.isSecureContext) {
      setScanResult({ success: false, message: 'Camera requires HTTPS or localhost (Secure Context).' });
      return;
    }
    
    setScanResult(null);
    isScanningRef.current = true;
    setIsScanning(true);
    setIsInitializing(true);
    console.log('[Scanner] Starting clean capture loop');

    const timeoutId = setTimeout(() => {
      if (isInitializing) {
        setScanResult({ success: false, message: 'Hardware link delayed. Check permissions.' });
        resetScanner();
      }
    }, 15000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

      if (!videoRef.current) throw new Error("DOM missed video ref");

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true'); 
      await videoRef.current.play();
      
      setIsInitializing(false);
      clearTimeout(timeoutId);

      // Start the clean capture loop
      runCaptureLoop();

    } catch (err: any) {
      console.error('[Scanner] Hardware Link Failure:', err);
      clearTimeout(timeoutId);
      setScanResult({ success: false, message: `Hardware Link Error: ${err.message}` });
      resetScanner();
    }
  };

  const runCaptureLoop = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const tick = async () => {
      // Only process if video has actual pixel data
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        loopId.current = window.requestAnimationFrame(tick);
        return;
      }

      // Create a fresh offscreen canvas every frame — never reuse
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        loopId.current = window.requestAnimationFrame(tick);
        return;
      }

      // Draw raw video frame — NO filters, NO composite operations, NO post-processing
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const result = await reader.current.decodeFromCanvas(canvas);
        if (result && !isProcessing.current) {
          handleScanSuccess(result.getText());
        }
      } catch {
        // No QR code in this frame — expected, continue loop
      }

      // Only schedule next frame if still scanning
      if (isScanningRef.current) {
        loopId.current = window.requestAnimationFrame(tick);
      }
    };

    loopId.current = window.requestAnimationFrame(tick);
  };

  const stopScanner = () => {
    console.log('[Scanner] Stopping capture loop...');
    isScanningRef.current = false;
    if (loopId.current) {
      window.cancelAnimationFrame(loopId.current);
      loopId.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setIsInitializing(false);
  };

  const resetScanner = () => {
    stopScanner();
    setScanResult(null);
  };

  const verifyToken = (token: string, payload?: any): { success: boolean; message: string; visitor?: Visitor } => {
    const currentState = useStore.getState();
    const freshVisitors = currentState.visitors;
    
    let visitor = freshVisitors.find(v => v.qrToken === token && v.status === 'EXPECTED');

    if (visitor) {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      updateVisitor(visitor.id, { status: 'ON_CAMPUS', entryTime: now });
      return { 
        success: true, 
        message: 'Pre-Approved Entry Authorized',
        visitor: { ...visitor, status: 'ON_CAMPUS', entryTime: now }
      };
    }

    if (payload && payload.name && payload.flatId) {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newVisitor = currentState.addVisitor({
        name: payload.name,
        flatId: payload.flatId,
        purpose: payload.purpose || 'GUEST',
        status: 'ON_CAMPUS',
        qrToken: token,
        entryTime: now
      });
      return {
        success: true,
        message: 'Ad-hoc Entry Authorized & Logged',
        visitor: { ...newVisitor, entryTime: now }
      };
    }

    const alreadyIn = freshVisitors.find(v => v.qrToken === token && v.status === 'ON_CAMPUS');
    if (alreadyIn) {
      return { success: false, message: `Access Denied: Pass already scanned for ${alreadyIn.name}` };
    }

    return { success: false, message: 'DENIED: Unauthorized or Fake Code' };
  };

  const handleScanSuccess = (text: string) => {
    setIsDetecting(true);
    isProcessing.current = true;
    let token = text.trim();
    let payload = null;

    if (token.startsWith('{')) {
      try {
        payload = JSON.parse(token);
        token = payload.token || payload.qrToken || 'JSON-DATA';
      } catch { }
    }

    const result = verifyToken(token, payload);
    setScanResult(result);

    setTimeout(() => {
      setIsDetecting(false);
    }, 800);

    setTimeout(() => {
      isProcessing.current = false;
    }, 4000);
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setScanResult(verifyToken(manualToken.trim()));
    setManualToken('');
  };

  // Arrival notification: fire a toast when a new EXPECTED visitor is added
  const prevVisitorCount = useRef(visitors.filter(v => v.status === 'EXPECTED').length);

  useEffect(() => {
    const currentExpected = visitors.filter(v => v.status === 'EXPECTED');
    if (currentExpected.length > prevVisitorCount.current) {
      const newest = currentExpected[0];
      toast(
        () => (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 flex-shrink-0">
              <Package size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">New Pre-Approved Arrival</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                <span className="text-yellow-400 font-bold">{newest.name}</span> → Flat {newest.flatId}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{newest.purpose}</p>
            </div>
          </div>
        ),
        {
          duration: 6000,
          style: {
            background: '#18181B',
            border: '1px solid rgba(245,158,11,0.3)',
            padding: '12px',
            borderRadius: '12px',
          },
        }
      );
    }
    prevVisitorCount.current = currentExpected.length;
  }, [visitors]);

  useEffect(() => {
    return () => {
      console.log('[Scanner] Component unmounting, cleaning up...');
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <KpiCard 
          title="Active Visitors"
          value={activeVisitors.toString().padStart(2, '0')}
          subtitle="Inside premises"
          accentColor="emerald"
        />
        <KpiCard 
          title="Expected Today"
          value={expectedVisitors.toString().padStart(2, '0')}
          subtitle="Pre-approved passes"
          accentColor="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-surface border border-border-dark rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center">
            <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Gate Scanner</h2>
            <div className="flex items-center gap-3">
              {isScanning && !isInitializing && (
                <span className="flex items-center gap-2 text-xs font-medium text-emerald">
                  <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span> Continuous Active
                </span>
              )}
              <button 
                onClick={() => { stopScanner(); setShowManualInput(!showManualInput); }}
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors cursor-pointer"
              >
                <KeyboardIcon size={14} />
                {showManualInput ? 'Camera' : 'Manual'}
              </button>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {showManualInput ? (
              <div className="w-full max-w-sm">
                <div className="w-full bg-surface-2 border border-border-dark rounded-xl p-6 text-center mb-6">
                  <KeyboardIcon size={32} className="text-gold mx-auto mb-3" />
                  <p className="text-sm font-medium text-white mb-1">Manual Entry</p>
                  <p className="text-xs text-muted">Paste token for verification.</p>
                </div>
                <form onSubmit={handleManualVerify} className="space-y-4">
                  <input 
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="e.g. QR-abc123def"
                    className="w-full bg-base border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold transition-colors text-sm font-mono"
                  />
                  <button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold py-3 rounded-lg cursor-pointer">
                    Verify
                  </button>
                </form>
              </div>
            ) : isScanning ? (
              <div className="w-full max-w-sm relative rounded-xl overflow-hidden border-2 border-gold shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-black flex items-center justify-center">
                <video ref={videoRef} className={`w-full h-full object-cover ${isInitializing ? 'opacity-0' : 'opacity-100'}`} />
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gold">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p className="text-xs font-medium">Initializing Camera...</p>
                  </div>
                )}

                {!isInitializing && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className={`w-48 h-48 border-2 rounded-lg transition-colors duration-300 ${
                      isDetecting ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]' :
                      isProcessing.current ? 'border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]' :
                      'border-yellow-400/40'
                    }`}></div>
                  </div>
                )}

              </div>
            ) : (
              <div className="w-full max-w-sm aspect-video bg-surface-2 border border-border-dark border-dashed rounded-xl flex items-center justify-center flex-col text-center p-6">
                <div className="w-12 h-12 rounded-full bg-surface border border-border-dark flex items-center justify-center mb-4">
                  <QrCode size={24} className="text-muted" />
                </div>
                <p className="text-sm font-medium text-white mb-1">Scanner Ready</p>
                <p className="text-xs text-muted mb-6">Position QR inside the frame to log visitor entry instantly.</p>
              </div>
            )}

            {!showManualInput && (
              <div className="mt-8 flex gap-4 w-full max-w-sm">
                {!isScanning ? (
                  <button onClick={startScanner} className="flex-1 bg-gold hover:bg-gold-light text-black font-semibold py-3 rounded-lg cursor-pointer">
                    Start Scanner
                  </button>
                ) : (
                  <button onClick={stopScanner} className="flex-1 bg-surface-2 hover:bg-white/10 border border-border-dark text-white font-medium py-3 rounded-lg cursor-pointer">
                    Turn Off
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center">
            <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Live Results</h2>
            {scanResult && (
              <button onClick={() => setScanResult(null)} className="text-[10px] text-muted hover:text-white uppercase tracking-tighter">Clear</button>
            )}
          </div>
          
          <div className="p-0 flex-1 h-[400px]">
            {!scanResult ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden backdrop-blur-sm">
                {/* Scan Line Animation */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gold/30 blur-sm animate-[scan_3s_ease-in-out_infinite]" />
                
                <div className="w-20 h-20 rounded-full border border-white/5 bg-surface-2 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-gold/10 animate-ping" />
                  <QrCode size={32} className="text-muted/40" />
                </div>
                
                <p className="text-sm font-medium text-white/50 mb-1 uppercase tracking-[0.2em]">Awaiting Signal</p>
                <div className="flex items-center gap-2 text-[10px] text-muted opacity-40 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
                  Scanner active • Link established
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {scanResult.success ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">Entry Authorized</h3>
                          <p className="text-[10px] font-bold text-emerald uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                            Security Clearance Confirmed
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setScanResult(null)} className="text-[10px] text-muted hover:text-white uppercase tracking-tighter cursor-pointer">Dismiss</button>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.05] backdrop-blur-md rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-16 bg-emerald/5 rounded-bl-full pointer-events-none group-hover:bg-emerald/10 transition-colors" />
                      
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-base to-surface-2 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                          {scanResult.visitor?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-0.5">Primary Subject</p>
                          <p className="text-2xl font-black text-white tracking-tighter">{scanResult.visitor?.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 relative z-10 font-mono">
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                          <p className="text-[9px] text-muted uppercase mb-1">Residence ID</p>
                          <p className="text-sm font-bold text-gold">{scanResult.visitor?.flatId}</p>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                          <p className="text-[9px] text-muted uppercase mb-1">Objective</p>
                          <p className="text-sm font-bold text-white/90 uppercase">{scanResult.visitor?.purpose}</p>
                        </div>
                        <div className="col-span-2 bg-black/20 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                          <div>
                            <p className="text-[9px] text-muted uppercase mb-0.5">Timestamp</p>
                            <p className="text-xs font-bold text-white/70">{new Date().toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted uppercase mb-0.5">Status</p>
                            <p className="text-[10px] font-black text-emerald uppercase tracking-tighter bg-emerald/10 px-2 py-0.5 rounded">Logged</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold pl-1">System Signature</p>
                       <div className="bg-base rounded-2xl p-4 border border-white/5 font-mono text-[10px] text-muted-2 relative overflow-hidden group">
                         <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                         </div>
                         <pre className="overflow-x-auto whitespace-pre-wrap">
                           {JSON.stringify({
                             id: scanResult.visitor?.id,
                             token: scanResult.visitor?.qrToken?.substring(0, 8) + '...',
                             auth: 'GRANTED_ENCRYPTED'
                           }, null, 2)}
                         </pre>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-14 h-14 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson">
                          <XCircle size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">Access Denied</h3>
                          <p className="text-[10px] font-bold text-crimson uppercase tracking-widest">Unauthorized Signal Detected</p>
                        </div>
                    </div>
                    
                    <div className="bg-crimson/5 border border-crimson/10 rounded-2xl p-6 mb-8 text-left">
                       <p className="text-xs text-crimson/80 leading-relaxed font-mono">
                         [PROTOCOL_VIOLATION]: {scanResult.message}
                       </p>
                    </div>
                    
                    <button 
                      onClick={resetScanner} 
                      className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl border border-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      Restart Protocol
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border-dark rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
          <ExpectedArrivalsPanel />
        </div>

      </div>

      {/* On-Campus Visitors — Checkout Panel */}
      <div className="mt-8">
        <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <LogOut size={16} className="text-gold" /> On-Campus Visitors — Checkout
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitors.filter(v => v.status === 'ON_CAMPUS').length === 0 ? (
            <div className="col-span-full bg-surface border border-border-dark rounded-xl p-8 text-center">
              <p className="text-muted text-sm">No visitors currently on campus.</p>
            </div>
          ) : (
            visitors.filter(v => v.status === 'ON_CAMPUS').map((visitor) => (
              <div key={visitor.id} className="bg-surface border border-border-dark rounded-xl p-5 flex flex-col gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald text-lg font-bold">
                    {visitor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{visitor.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      <span className="text-gold font-mono font-bold">{visitor.flatId}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="uppercase">{visitor.purpose}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                    <span className="text-emerald font-bold">IN</span>
                    <span className="text-muted">since {visitor.entryTime || '—'}</span>
                  </div>
                  <button
                    onClick={() => {
                      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      updateVisitor(visitor.id, { status: 'CHECKED_OUT', exitTime: now });
                      toast.success(`${visitor.name} checked out at ${now}`);
                    }}
                    className="px-4 py-2 bg-crimson/10 hover:bg-crimson/20 border border-crimson/20 hover:border-crimson/40 text-crimson text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <LogOut size={14} /> Check Out
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
