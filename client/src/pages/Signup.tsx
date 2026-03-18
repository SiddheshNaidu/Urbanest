import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useStore, type Role } from '../store/useStore';
import toast from 'react-hot-toast';
import brandingImage from '../assets/login-urbanest.png';

export const Signup = () => {
  const navigate = useNavigate();
  const { register, registeredUsers } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [society, setSociety] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('RESIDENT');
  const [flatId, setFlatId] = useState('');
  const [error, setError] = useState('');

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password || !society) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Check if email already exists
    const existing = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setError('An account with this email already exists. Please sign in instead.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser = {
        id: `user-${Date.now()}`,
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password,
        role,
        flatId: role === 'RESIDENT' ? flatId || undefined : undefined,
        society,
      };

      register(newUser);
      toast.success('Account created successfully! Please sign in.');
      setIsLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 relative overflow-hidden">
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
          <h1 className="font-heading font-bold text-4xl text-white tracking-tight">Join Urbanest</h1>
          <p className="text-muted-2 text-xs uppercase tracking-[0.3em] mt-2 font-bold">New workspace initialization</p>
        </div>

        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="w-full mb-12"
        >
          <div
            style={{ transform: "translateZ(80px)" }}
            className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent pointer-events-none" />
            
            <form onSubmit={handleSignup} className="space-y-5 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setError(''); }}
                    required
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setError(''); }}
                    required
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Society Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prestige Valley"
                  value={society}
                  onChange={(e) => { setSociety(e.target.value); setError(''); }}
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input 
                  type="password" 
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Your Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ADMIN', 'SECURITY', 'RESIDENT'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setError(''); }}
                      className={`py-3 rounded-xl font-bold text-xs transition-all border ${
                        role === r
                          ? 'bg-gold/10 border-gold/30 text-gold'
                          : 'bg-white/5 border-white/5 text-muted hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {r === 'ADMIN' ? 'Admin' : r === 'SECURITY' ? 'Security' : 'Resident'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat ID — only shown for Resident */}
              {role === 'RESIDENT' && (
                <div>
                  <label className="block text-[10px] font-bold text-muted-2 uppercase tracking-widest mb-2 ml-1">Flat Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A-101"
                    value={flatId}
                    onChange={(e) => setFlatId(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-muted-2 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="bg-crimson/10 border border-crimson/20 rounded-xl px-4 py-3 text-crimson text-sm font-medium">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gold hover:bg-gold-light text-[#0B0B0B] font-bold py-4 px-4 rounded-2xl transition-all flex items-center justify-center cursor-pointer mt-6 shadow-lg shadow-gold/10 active:scale-[0.98]"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-8 text-center relative z-10">
              <p className="text-sm text-muted">
                Already have an account? <Link to="/login" className="text-gold font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="text-muted-2 text-[10px] font-bold uppercase tracking-widest">
           ISO 27001 & SOC2 Type II Certified
        </div>
      </div>
    </div>
  );
};
