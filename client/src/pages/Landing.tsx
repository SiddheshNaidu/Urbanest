import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Building2, ChevronRight, Lock, HeadphonesIcon, CreditCard, Users, QrCode, FileText, type LucideIcon } from 'lucide-react';
import Preloader from '../components/ui/preloader';
import { AuroraFlow } from '../components/ui/aurora-flow';
import { EtheralShadow } from '../components/ui/etheral-shadow';
import HeroShaders from '../components/ui/hero-demo';

const FeatureCard = ({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    }}
    className="bg-surface/50 backdrop-blur-sm border border-border-dark hover:border-gold/50 p-8 rounded-[2rem] transition-all group relative overflow-hidden h-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border-dark flex items-center justify-center mb-6 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors duration-500">
        <Icon className="text-gold" size={28} />
      </div>
      <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-muted text-base leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const FlowStep = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-10px" }}
    transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
    className="flex gap-6 relative"
  >
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-2 border-gold bg-app-dark flex items-center justify-center text-gold font-bold font-heading z-10">
        {number}
      </div>
      <div className="w-0.5 h-full bg-gradient-to-b from-gold/50 to-transparent mt-2 absolute top-12 bottom-0" />
    </div>
    <div className="pb-16 pt-2">
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-muted leading-relaxed max-w-md">{description}</p>
    </div>
  </motion.div>
);

export const Landing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'resident' | 'security' | 'admin'>('resident');
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <div className={`bg-app-dark min-h-screen selection:bg-gold selection:text-app-dark overflow-x-hidden relative ${isLoading ? 'h-screen overflow-hidden' : ''}`}>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      {/* Navbar Container */}
      <div 
        className={`fixed left-0 right-0 z-50 flex justify-center pointer-events-none px-4 md:px-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? 'pt-4' : 'pt-0'
        }`}
      >
        <nav 
          className={`pointer-events-auto flex items-center justify-between w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isScrolled 
              ? 'max-w-4xl bg-[#0B0B0B]/85 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]' 
              : 'max-w-7xl bg-transparent border border-transparent rounded-[2rem] px-4 md:px-8 py-5 shadow-none'
          }`}
        >
          <div className="flex items-center gap-3 scale-90 md:scale-100 origin-left">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gold to-amber rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <Building2 className="text-app-dark w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-lg md:text-xl text-white tracking-tight">Urbanest</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/login" className="text-xs md:text-sm font-medium text-muted hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="text-xs md:text-sm font-semibold bg-white text-app-dark hover:bg-gold px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105">
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section with WebGL Shaders */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-32 pb-24 px-4 overflow-hidden bg-app-dark">
        <div className="absolute inset-0 z-0">
          <HeroShaders />
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-app-dark to-transparent pointer-events-none z-0" />
          <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-app-dark to-transparent pointer-events-none z-0" />
        </div>
        
        <motion.div 
          className="max-w-5xl mx-auto text-center relative z-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-2xl"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">The Ultimate Command Center</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-heading font-extrabold text-white tracking-tighter leading-[1.05] mb-8"
          >
            Manage societies with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber">absolute precision.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Urbanest replaces chaos with clarity. Experience friction-less visitor routing, automated ledgers, and a premium portal designed exclusively for modern residential living.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link to="/signup" className="group relative overflow-hidden w-full sm:w-auto h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-amber text-app-dark font-extrabold px-10 rounded-2xl transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)]">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10 flex items-center gap-2">
                Create Workspace 
                <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <a href="#overview" className="w-full sm:w-auto h-14 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 border border-white/10 hover:border-gold/30 font-bold px-10 rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95">
              Discover Features
            </a>
          </motion.div>
        </motion.div>
        
      </section>

      {/* Problem / Solution Overview - Etheral Shadow section */}
      <section className="relative py-32 px-6 z-20 bg-app-dark overflow-hidden" id="overview">
        <EtheralShadow 
          color="rgba(245, 158, 11, 0.25)" 
          sizing="stretch" 
          animation={{ scale: 100, speed: 90 }}
          noise={{ opacity: 0.5, scale: 1.2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-transparent to-[#0B0B0B] pointer-events-none opacity-60" />
        {/* Strong top and bottom fades so the shadow doesn't clip horizontally */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-app-dark to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-app-dark to-transparent pointer-events-none z-0" />
        
        <div className="max-w-6xl mx-auto relative z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
                The old way is <span className="text-crimson">broken.</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-8">
                Paper visitor logs, scattered WhatsApp groups for complaints, and untracked maintenance dues create endless friction for management committees and residents alike.
              </p>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
                We engineered <span className="text-gold">flow.</span>
              </h2>
              <p className="text-lg text-muted leading-relaxed">
                Urbanest centralizes every operational pillar into a single, cohesive ecosystem. Real-time data syncs across roles instantly. No redundant data entry. Absolute transparency.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="bg-black/60 backdrop-blur-sm border border-gold/20 rounded-3xl p-8 shadow-2xl shadow-gold/10 relative z-10">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-emerald/20 flex items-center justify-center text-emerald shrink-0">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Always Updated</h4>
                    <p className="text-sm text-muted leading-relaxed">Everyone sees the exact same real-time data</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Secure Access</h4>
                    <p className="text-sm text-muted leading-relaxed">Complete digital privacy and identity protection</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center text-amber shrink-0">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Simple to Use</h4>
                    <p className="text-sm text-muted leading-relaxed">Anyone can navigate the portal effortlessly</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - The Workflows */}
      <section className="py-32 px-6 relative z-20 bg-app-dark overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-gold/5 via-transparent to-transparent rounded-full blur-xl md:blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight">Seamless Operations</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">See how Urbanest connects the dots between residents, security, and administration in real-time.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            <button 
              onClick={() => setActiveTab('resident')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'resident' ? 'bg-gold text-app-dark shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <Users size={18} /> For Residents
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'security' ? 'bg-emerald text-app-dark shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <ShieldCheck size={18} /> For Guards
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'admin' ? 'bg-amber text-app-dark shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <Building2 size={18} /> For Admins
            </button>
          </div>

          <div className="relative min-h-[360px] max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'resident' && (
                <motion.div key="resident" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FlowStep number="1" title="Invite Guests Easily" description="Create a fast, secure QR pass on your phone and send it directly to your visitors." />
                  <FlowStep number="2" title="Track Payments" description="See exactly what maintenance fees are pending in a simple, easy-to-read dashboard." />
                  <FlowStep number="3" title="Report Issues" description="Log maintenance complaints instantly and see when they are getting fixed." />
                </motion.div>
              )}
              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FlowStep number="1" title="Quick QR Scanner" description="Instantly scan guest passes using any smartphone camera to allow entry." />
                  <FlowStep number="2" title="Auto-Logging" description="Guest entries are recorded automatically. Residents are told without needing a phone call." />
                  <FlowStep number="3" title="Focused Privacy" description="Guards only see the visitor system. Financial and personal information is completely hidden." />
                </motion.div>
              )}
              {activeTab === 'admin' && (
                <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FlowStep number="1" title="Community Overview" description="See how many visitors are active and view urgent helpdesk tickets all on one screen." />
                  <FlowStep number="2" title="Manage Billing" description="Send digital invoices, track late payments, and keep the community's ledger organized." />
                  <FlowStep number="3" title="Send Updates" description="Notify all residents immediately with important announcements or meeting links." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Features Grid - Enterprise Infrastructure & CTA Section */}
      <section className="relative min-h-screen pt-32 z-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-app-dark" />
          <AuroraFlow />
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-amber/5 pointer-events-none" />
          {/* Definitively fade top and bottom bounds of the canvas so it never has a hard line */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-app-dark to-transparent pointer-events-none z-0" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-app-dark to-transparent pointer-events-none z-0" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 px-6">
          <div className="text-left mb-20">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight">Enterprise Infrastructure.</h2>
            <p className="text-xl text-muted max-w-2xl">Everything required to run a massive residential complex, embedded into one meticulously crafted application.</p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            <FeatureCard 
              icon={QrCode} 
              title="Fast Gate Access" 
              description="Guards can scan encrypted guest passes using any mobile device to approve entries instantly."
            />
            <FeatureCard 
              icon={CreditCard} 
              title="Track Dues Easily" 
              description="Manage community payments, view invoices, and keep a clear record of all transactions in one single place."
            />
            <FeatureCard 
              icon={HeadphonesIcon} 
              title="Help is a Tap Away" 
              description="Residents can log maintenance requests, report issues, and follow the progress directly until they are resolved."
            />
            <FeatureCard 
              icon={Lock} 
              title="Total Privacy Control" 
              description="Guards, residents, and admins only see what they strictly need to see. Your personal community data is always secure."
            />
            <FeatureCard 
              icon={Zap} 
              title="Real-Time Updates" 
              description="Information moves at light speed. A payment made by a resident immediately updates the central billing ledger."
            />
            <FeatureCard 
              icon={FileText} 
              title="Simpler Document Storage" 
              description="Host important society meetings, notices, and community policies securely so every resident can easily find them."
            />
          </motion.div>
        </div>

        {/* CTA Section - Merged into Enterprise Infrastructure */}
        <div className="relative z-10 border-t border-white/5 mt-32">
          <div className="max-w-4xl mx-auto text-center relative z-10 py-32 px-6">
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8 tracking-tight">Upgrade your society today.</h2>
            <p className="text-2xl text-muted mb-12 font-light">Join the vanguard of modern residential management.</p>
            <Link to="/signup" className="inline-flex items-center justify-center gap-3 bg-white text-app-dark hover:bg-gold px-12 py-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(234,179,8,0.4)] text-lg">
              Start Free Trial <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-app-dark">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-gold" />
            <span className="font-heading font-bold text-xl text-white tracking-tight">Urbanest</span>
          </div>
          <p className="text-muted-2 text-sm font-medium">© {new Date().getFullYear()} Urbanest Platforms. Crafted with precision.</p>
          <div className="flex gap-8 text-sm text-muted-2 font-medium">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
