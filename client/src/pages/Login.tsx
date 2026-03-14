import { useState, type MouseEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useStore, type Role } from '../store/useStore';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useStore();

  const [isLoading, setIsLoading] = useState(false);

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleMockLogin = (role: Role) => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: `user-${Date.now()}`,
        name: role === 'ADMIN' ? 'Alka (Admin)' : role === 'SECURITY' ? 'Ramesh (Gate)' : 'Suresh (A-101)',
        role,
        flatId: role === 'RESIDENT' ? 'A-101' : undefined
      });
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-8 text-center z-10">
        <div className="w-12 h-12 bg-gold rounded-lg mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="font-heading font-semibold text-3xl text-white tracking-tight">Urbanest</h1>
        <p className="text-muted text-sm mt-2">Executive Command Center</p>
      </div>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full max-w-md z-10"
      >
        <div
          style={{ transform: "translateZ(50px)" }}
          className="bg-surface/80 backdrop-blur-xl border border-border-dark rounded-2xl p-8 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
          
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-2 uppercase tracking-wider mb-2">Workspace Email</label>
              <input 
                type="email" 
                placeholder="admin@urbanest.com" 
                className="w-full bg-surface-2 border border-border-dark rounded-lg px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-2 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-surface-2 border border-border-dark rounded-lg px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                disabled
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border-dark">
            <p className="text-xs text-muted mb-4 text-center">Interactive Prototype — Select a role to continue</p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleMockLogin('ADMIN')}
                disabled={isLoading}
                className="bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                {isLoading ? 'Authenticating...' : 'Login as Admin'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleMockLogin('SECURITY')}
                  disabled={isLoading}
                  className="bg-surface-2 hover:bg-white/10 border border-border-dark text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Security
                </button>
                <button 
                  onClick={() => handleMockLogin('RESIDENT')}
                  disabled={isLoading}
                  className="bg-surface-2 hover:bg-white/10 border border-border-dark text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Resident
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted">
              Don't have an account? <Link to="/signup" className="text-gold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
