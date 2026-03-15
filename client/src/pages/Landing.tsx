import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Building2, ChevronRight, Lock, HeadphonesIcon, CreditCard, Users, QrCode, FileText, type LucideIcon } from 'lucide-react';
import HeroShaders from '../components/ui/hero-demo';
import { BeamsBackground } from '../components/ui/beams-background';
import { BackgroundPaths } from '../components/ui/background-paths';
import { ShaderAnimation } from '../components/ui/shader-animation';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: LucideIcon, title: string, description: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
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
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    className="flex gap-6 relative"
  >
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-2 border-gold bg-base flex items-center justify-center text-gold font-bold font-heading z-10">
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-base min-h-screen selection:bg-gold selection:text-base overflow-x-hidden relative">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
        isScrolled 
          ? 'bg-base/60 backdrop-blur-xl border-b border-white/5' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold to-amber rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Building2 size={20} className="text-base" strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold text-xl text-white tracking-tight">Urbanest</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-muted hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link to="/signup" className="text-sm font-semibold bg-white text-base hover:bg-gold px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section with WebGL Shaders */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden bg-base">
        <div className="absolute inset-0 z-0">
          <HeroShaders />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base/80" />
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
            className="text-6xl md:text-8xl lg:text-[7.5rem] font-heading font-extrabold text-white tracking-tighter leading-[1.05] mb-8"
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
            <Link to="/signup" className="w-full sm:w-auto h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-base font-extrabold px-10 rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
              Create Workspace <ChevronRight size={18} />
            </Link>
            <a href="#overview" className="w-full sm:w-auto h-14 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 border border-white/10 hover:border-gold/30 font-bold px-10 rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95">
              Discover Features
            </a>
          </motion.div>
        </motion.div>
        
      </section>

      {/* Problem / Solution Overview - BackgroundPaths section */}
      <BackgroundPaths className="py-32 px-6 relative z-20" id="overview">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
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
                  <div className="w-12 h-12 rounded-full bg-emerald/20 flex items-center justify-center text-emerald">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Instant Sync</h4>
                    <p className="text-sm text-muted">Across all executive dashboards</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Strict RBAC</h4>
                    <p className="text-sm text-muted">Role-based security isolation</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center text-amber">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Predictable UX</h4>
                    <p className="text-sm text-muted">Zero learning curve for residents</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </BackgroundPaths>

      {/* How It Works - The Workflows */}
      <section className="py-32 px-6 relative z-20 bg-base overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-gold/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight">Seamless Operations</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">See how Urbanest connects the dots between residents, security, and administration in real-time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Users className="text-gold" /> The Resident
              </h3>
              <FlowStep number="1" title="Pre-approve Visitors" description="Generate a secure, one-time QR pass directly from the dashboard and share it via WhatsApp." />
              <FlowStep number="2" title="Track Dues" description="Always know exactly what maintenance or ad-hoc fees are pending with the visual ledger." />
              <FlowStep number="3" title="Raise Complaints" description="Log helpdesk tickets with categorized severity and track live resolution status." />
            </div>
            
            <div className="pt-12 md:pt-0">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <ShieldCheck className="text-emerald" /> The Security
              </h3>
              <FlowStep number="1" title="Scan QR Pass" description="Use the built-in HTML5 camera scanner to instantly validate visitor QR codes at the gate." />
              <FlowStep number="2" title="Instant Logging" description="Entry is recorded automatically. The resident is notified without making a single phone call." />
              <FlowStep number="3" title="Strict Isolation" description="Security personnel only see the visitor log. Financial and personal data is strictly isolated." />
            </div>

            <div className="pt-12 md:pt-0">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Building2 className="text-amber" /> The Admin
              </h3>
              <FlowStep number="1" title="Bird's Eye View" description="Monitor real-time KPIs covering financials, active visitors, and urgent helpdesk tickets." />
              <FlowStep number="2" title="Manage Ledger" description="Generate invoices, record payments, and track defaulters across all residential blocks." />
              <FlowStep number="3" title="Broadcast Notices" description="Push urgent updates or AGM meeting links to all resident dashboards simultaneously." />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Enterprise Infrastructure */}
      <section className="relative min-h-screen py-32 px-6 z-20 overflow-hidden">
        <div className="absolute inset-0 z-0 text-gold-dim">
            <ShaderAnimation />
            <div className="absolute inset-0 bg-base/85" />
            <div className="absolute inset-0 bg-gradient-to-b from-base via-transparent to-base" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-left mb-20">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight">Enterprise Infrastructure.</h2>
            <p className="text-xl text-muted max-w-2xl">Everything required to run a massive residential complex, embedded into one meticulously crafted application.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={QrCode} 
              title="HTML5 QR Scanning" 
              description="Zero-friction visitor entry. Launch the native camera directly from the web app to validate encrypted guest passes in milliseconds."
              delay={0.1}
            />
            <FeatureCard 
              icon={CreditCard} 
              title="Automated Financials" 
              description="Generate block-wise invoices, track arrears, and maintain a crystal-clear digital ledger accessible by both management and flat owners."
              delay={0.2}
            />
            <FeatureCard 
              icon={HeadphonesIcon} 
              title="Centralized Helpdesk" 
              description="SLA-driven complaint tracking. Route structural or electrical issues instantly to maintenance teams with rich priority tagging."
              delay={0.3}
            />
            <FeatureCard 
              icon={Lock} 
              title="Strict RBAC Matrix" 
              description="Granular permission matrices mathematically isolate Admin, Security, and Resident views to guarantee data privacy."
              delay={0.4}
            />
            <FeatureCard 
              icon={FileText} 
              title="Notice Board Broadcast" 
              description="Publish rich-text notices. Eliminate scattered circulars and ensure critical information reaches the centralized resident feed."
              delay={0.5}
            />
            <FeatureCard 
              icon={Zap} 
              title="Zustand State Engine" 
              description="Experience zero-latency updates. An action taken at the security gate immediately paints onto the admin's live overview."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 overflow-hidden border-t border-white/5">
        <BeamsBackground intensity="medium">
          <div className="max-w-4xl mx-auto text-center relative z-10 py-32 px-6">
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8 tracking-tight">Upgrade your society today.</h2>
            <p className="text-2xl text-muted mb-12 font-light">Join the vanguard of modern residential management.</p>
            <Link to="/signup" className="inline-flex items-center justify-center gap-3 bg-white text-base hover:bg-gold hover:text-black font-bold px-12 py-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(234,179,8,0.4)] text-lg">
              Start Free Trial <ChevronRight size={24} />
            </Link>
          </div>
        </BeamsBackground>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-base">
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
