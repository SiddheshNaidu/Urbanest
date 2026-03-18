import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate a loading sequence that gives time for heavy assets/shaders to initialize
    const duration = 2000; // 2 seconds total loading
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Easing function for progress bar (easeOutExpo-like)
      const newProgress = 100 * (1 - Math.pow(1 - currentStep / steps, 3));
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Small delay to let the 100% state render before triggering unmount
        setTimeout(onComplete, 400); 
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base overflow-hidden"
    >
      {/* Background ambient glow matching the main theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-amber/5 opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          {/* Logo Hexagon/Box with Glowing borders */}
          <div className="relative w-24 h-24 flex items-center justify-center bg-surface border border-white/10 rounded-[2rem] shadow-[0_0_40px_rgba(234,179,8,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent" />
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0], 
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Building2 size={40} className="text-gold relative z-10" strokeWidth={2} />
            </motion.div>
          </div>
          
          {/* Outer rotating dashed ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-gold/30 rounded-full pointer-events-none"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl font-heading font-extrabold text-white tracking-tight mb-2"
        >
          Urbanest
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-muted text-sm font-medium tracking-widest uppercase mb-12"
        >
          Initializing Secure Workspace
        </motion.p>

        {/* Premium Progress Bar */}
        <div className="w-64 h-1.5 bg-surface-2 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-amber to-gold rounded-full"
            style={{ width: `${progress}%` }}
            layout
          />
          {/* Shimmer effect inside the bar */}
          <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
        
        {/* Progress Text */}
        <div className="mt-4 font-mono text-xs text-gold/80 flex items-center gap-2">
          {Math.round(progress)}% <span className="animate-pulse">_</span>
        </div>
      </div>
    </motion.div>
  );
}
