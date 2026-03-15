
import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Users, CreditCard, HeadphonesIcon, LogIn, Bell, ShieldCheck, Home, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SidebarLink {
  to: string;
  icon: LucideIcon;
  label: string;
}

export const Sidebar = () => {
  const { currentUser, logout } = useStore();

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/residents', icon: Users, label: 'Residents' },
    { to: '/financials', icon: CreditCard, label: 'Financials' },
    { to: '/helpdesk', icon: HeadphonesIcon, label: 'Helpdesk' },
    { to: '/visitors', icon: LogIn, label: 'Visitors' },
    { to: '/notices', icon: Bell, label: 'Notice Board' },
    { to: '/amenities', icon: Dumbbell, label: 'Amenities' },
  ];

  const securityLinks = [
    { to: '/security', icon: ShieldCheck, label: 'Scanner' },
    { to: '/visitors', icon: LogIn, label: 'Visitors Log' },
  ];

  const residentLinks = [
    { to: '/resident', icon: Home, label: 'My Dashboard' },
    { to: '/amenities', icon: Dumbbell, label: 'Amenities' },
  ];

  let links: SidebarLink[] = [];
  if (currentUser?.role === 'ADMIN') links = adminLinks;
  if (currentUser?.role === 'SECURITY') links = securityLinks;
  if (currentUser?.role === 'RESIDENT') links = residentLinks;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar border-r border-border-dark hidden md:flex flex-col z-40">
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gold rounded flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="font-heading font-bold text-lg text-white tracking-tight">Urbanest</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-muted-2 uppercase tracking-[0.15em] px-3 mb-3 mt-2">Workspace</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium interactive-element relative ${
                isActive
                  ? 'text-gold bg-gold/10 border border-gold/10'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-full bg-gold rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <link.icon size={16} className={isActive ? "text-gold" : ""} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-dark cursor-pointer" onClick={logout}>
        <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-dark flex items-center justify-center text-xs font-bold text-white uppercase">
            {currentUser?.name.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xs font-medium text-white">{currentUser?.name}</p>
            <p className="text-[10px] text-muted-2">{currentUser?.role} - {currentUser?.flatId || 'Urbanest HQ'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
