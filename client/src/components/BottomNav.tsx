import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, Users, CreditCard, HeadphonesIcon,
  LogIn, Bell, ShieldCheck, Home, Dumbbell, LogOut
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

export const BottomNav = () => {
  const { currentUser, logout } = useStore();

  const adminLinks: NavItem[] = [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Home' },
    { to: '/residents',  icon: Users,            label: 'Residents' },
    { to: '/financials', icon: CreditCard,       label: 'Finance' },
    { to: '/helpdesk',   icon: HeadphonesIcon,   label: 'Helpdesk' },
    { to: '/notices',    icon: Bell,             label: 'Notices' },
  ];

  const securityLinks: NavItem[] = [
    { to: '/security',   icon: ShieldCheck,      label: 'Scanner' },
    { to: '/visitors',   icon: LogIn,            label: 'Log' },
  ];

  const residentLinks: NavItem[] = [
    { to: '/resident',   icon: Home,             label: 'Home' },
    { to: '/financials', icon: CreditCard,       label: 'Finances' },
    { to: '/helpdesk',   icon: HeadphonesIcon,   label: 'Helpdesk' },
    { to: '/amenities',  icon: Dumbbell,         label: 'Amenities' },
    { to: '/notices',    icon: Bell,             label: 'Notices' },
  ];

  let links: NavItem[] = [];
  if (currentUser?.role === 'ADMIN')    links = adminLinks;
  if (currentUser?.role === 'SECURITY') links = securityLinks;
  if (currentUser?.role === 'RESIDENT') links = residentLinks;

  // Max 4 items to fit on narrow screens, reserving 5th slot for Logout
  const visibleLinks = links.slice(0, 4);

  if (visibleLinks.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-sidebar/95 backdrop-blur-xl border-t border-border-dark">
      <div className="flex items-stretch h-14 sm:h-16">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-gold' : 'text-muted hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={20} className={isActive ? 'text-gold' : ''} />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* Explicit Logout Button for Mobile */}
        <button
          onClick={logout}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors text-muted hover:text-crimson"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
      {/* Safe area spacer for phones with home indicators */}
      <div className="h-safe-area-inset-bottom bg-sidebar/95" />
    </nav>
  );
};
