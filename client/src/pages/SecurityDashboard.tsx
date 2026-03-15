import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { useStore, type Visitor } from '../store/useStore';
import { KpiCard } from '../components/KpiCard';
import { CheckCircle2, XCircle } from 'lucide-react';

export const SecurityDashboard = () => {
  const { visitors, updateVisitor } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [controls, setControls] = useState<IScannerControls | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; visitor?: Visitor } | null>(null);

  const activeVisitors = visitors.filter(v => v.status === 'ON_CAMPUS').length;
  const expectedVisitors = visitors.filter(v => v.status === 'EXPECTED').length;

  const startScanner = async () => {
    setScanResult(null);
    setIsScanning(true);
    const codeReader = new BrowserQRCodeReader();

    try {
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0].deviceId; // Select default camera

      if (videoRef.current) {
        const c = await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
          if (result) {
            handleScanSuccess(result.getText());
          }
        });
        setControls(c);
      }
    } catch (err) {
      console.error(err);
      setScanResult({ success: false, message: 'Could not access camera. Please check permissions.' });
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (controls) {
      controls.stop();
      setControls(null);
    }
    setIsScanning(false);
  };

  // Stop scanner on unmount
  useEffect(() => {
    return () => {
      if (controls) controls.stop();
    };
  }, [controls]);

  const handleScanSuccess = (text: string) => {
    stopScanner();
    try {
      const payload = JSON.parse(text);
      if (payload.visitorId && payload.token) {
        const visitor = visitors.find(v => v.id === payload.visitorId && v.qrToken === payload.token);
        
        if (visitor) {
          if (visitor.status === 'EXPECTED') {
            // Update store
            const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            updateVisitor(visitor.id, { status: 'ON_CAMPUS', entryTime: now });
            
            setScanResult({ 
              success: true, 
              message: 'Access Granted. Visitor logged successfully.',
              visitor: { ...visitor, status: 'ON_CAMPUS', entryTime: now }
            });
          } else {
            setScanResult({ success: false, message: `Visitor pass already used or invalid status: ${visitor.status}` });
          }
        } else {
          setScanResult({ success: false, message: 'Invalid or forged QR Code. No match found.' });
        }
      } else {
        setScanResult({ success: false, message: 'Unrecognized QR format.' });
      }
    } catch {
      setScanResult({ success: false, message: 'Failed to parse QR Code data.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <KpiCard 
          title="Active Visitors"
          value={activeVisitors.toString().padStart(2, '0')}
          subtitle="Currently inside premises"
          accentColor="emerald"
        />
        <KpiCard 
          title="Expected Today"
          value={expectedVisitors.toString().padStart(2, '0')}
          subtitle="Pre-approved passes generated"
          accentColor="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scanner Panel */}
        <div className="bg-surface border border-border-dark rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border-dark flex justify-between items-center">
            <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Gate Scanner</h2>
            {isScanning && (
              <span className="flex items-center gap-2 text-xs font-medium text-emerald">
                <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span> Camera Active
              </span>
            )}
          </div>
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {isScanning ? (
              <div className="w-full max-w-sm relative rounded-xl overflow-hidden border-2 border-gold shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {/* Scanner Target Box Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-gold/50 rounded-lg"></div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-video bg-surface-2 border border-border-dark border-dashed rounded-xl flex items-center justify-center flex-col text-center p-6">
                <div className="w-12 h-12 rounded-full bg-surface border border-border-dark flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="8" y="8" width="8" height="8"/></svg>
                </div>
                <p className="text-sm font-medium text-white mb-1">Camera is off</p>
                <p className="text-xs text-muted mb-6">Click below to activate scanner and read resident QR passes.</p>
              </div>
            )}

            <div className="mt-8 flex gap-4 w-full max-w-sm">
              {!isScanning ? (
                <button 
                  onClick={startScanner}
                  className="flex-1 bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Start Scanner
                </button>
              ) : (
                <button 
                  onClick={stopScanner}
                  className="flex-1 bg-surface-2 hover:bg-white/10 border border-border-dark text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel Scanning
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border-dark">
            <h2 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">Scan Results</h2>
          </div>
          
          <div className="p-8 flex flex-col items-center justify-center h-[400px] text-center">
            {!scanResult ? (
              <div className="text-muted">
                <p className="text-sm">Scan a QR code to view visitor details.</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                {scanResult.success ? (
                  <>
                    <CheckCircle2 size={64} className="text-emerald mb-4" />
                    <h3 className="font-heading font-bold text-2xl text-white mb-2">Access Granted</h3>
                    <p className="text-emerald text-sm font-medium mb-8">{scanResult.message}</p>
                    
                    <div className="w-full bg-surface-2 border border-border-dark rounded-lg p-6 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Visitor Name</p>
                          <p className="text-sm font-medium text-white">{scanResult.visitor?.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Destination Flat</p>
                          <p className="text-sm font-medium text-gold">{scanResult.visitor?.flatId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Purpose</p>
                          <p className="text-sm font-medium text-white">{scanResult.visitor?.purpose}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Entry Logged</p>
                          <p className="text-sm font-mono text-white">{scanResult.visitor?.entryTime}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={64} className="text-crimson mb-4" />
                    <h3 className="font-heading font-bold text-2xl text-white mb-2">Access Denied</h3>
                    <p className="text-crimson text-sm font-medium">{scanResult.message}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
