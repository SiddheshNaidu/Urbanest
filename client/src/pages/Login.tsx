import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useStore, type Role } from '../store/useStore';
import toast from 'react-hot-toast';
import brandingImage from '../assets/login-urbanest.png';

export const Login = () => {
  const navigate = useNavigate();
  const { login, findUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const user = findUser(email, password);
      if (user) {
        login({
          id: user.id,
          name: user.name,
          role: user.role,
          flatId: user.flatId,
        });
        toast.success(`Welcome back, ${user.name}!`);
        // Navigate based on role
        if (user.role === 'ADMIN') navigate('/dashboard');
        else if (user.role === 'SECURITY') navigate('/security');
        else navigate('/resident');
      } else {
        setError('Invalid email or password. Please try again.');
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 600);
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
      if (role === 'ADMIN') navigate('/dashboard');
      else if (role === 'SECURITY') navigate('/security');
      else navigate('/resident');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-app-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Full-page Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={brandingImage} 
          alt="Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,11,11,0.8)_100%)]" />
      </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-muted hover:text-white transition-colors group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-gold rounded-xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="font-heading font-bold text-4xl text-white tracking-tight">Urbanest</h1>
          <p className="text-muted-2 text-xs uppercase tracking-[0.3em] mt-2 font-bold">Executive workstation</p>
        </div>

        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="w-full"
        >
          <div
            style={{ transform: "translateZ(80px)" }}
            className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center lg:text-left">
              <h2 className="text-2xl font-heading font-bold text-white mb-2">Welcome back</h2>
              <p className="text-muted text-sm mb-8">Sign in with your registered credentials</p>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="admin@urbanest.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-crimson/10 border border-crimson/20 rounded-xl px-4 py-3 text-crimson text-sm font-medium">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gold hover:bg-gold-light text-[#0B0B0B] font-bold py-4 px-4 rounded-2xl transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-gold/10 hover:shadow-gold/20 active:scale-[0.98]"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-3 text-center">Demo Accounts</p>
                <div className="space-y-2 text-xs text-muted">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-white/70">admin@urbanest.com</span>
                    <span className="font-mono text-muted-2">admin123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-white/70">security@urbanest.com</span>
                    <span className="font-mono text-muted-2">security123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-white/70">resident@urbanest.com</span>
                    <span className="font-mono text-muted-2">resident123</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-4 text-center">Quick Access — Select Role</p>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleMockLogin('ADMIN')}
                    disabled={isLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-3 px-2 rounded-2xl transition-all text-xs cursor-pointer active:scale-[0.98]"
                  >
                    Admin
                  </button>
                  <button 
                    onClick={() => handleMockLogin('SECURITY')}
                    disabled={isLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-3 px-2 rounded-2xl transition-all text-xs cursor-pointer active:scale-[0.98]"
                  >
                    Security
                  </button>
                  <button 
                    onClick={() => handleMockLogin('RESIDENT')}
                    disabled={isLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-3 px-2 rounded-2xl transition-all text-xs cursor-pointer active:scale-[0.98]"
                  >
                    Resident
                  </button>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted">
                  Don't have an account? <Link to="/signup" className="text-gold font-bold hover:underline">Register workspace</Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-12 text-muted-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           Secure Cloud Architecture v2.4
        </div>
      </div>
    </div>
  );
};
