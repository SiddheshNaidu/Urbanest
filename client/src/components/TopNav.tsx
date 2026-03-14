
import { useLocation } from 'react-router-dom';

export const TopNav = () => {
  const location = useLocation();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Extremely basic path formatting for breadcrumbs
  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return { subtitle: 'Overview', title: 'Admin Dashboard' };
      case '/security': return { subtitle: 'Scanner', title: 'Security Gate' };
      case '/resident': return { subtitle: 'Home', title: 'My Dashboard' };
      case '/residents': return { subtitle: 'Directory', title: 'Manage Residents' };
      case '/financials': return { subtitle: 'Ledger', title: 'Financials & Invoices' };
      case '/helpdesk': return { subtitle: 'Tickets', title: 'Helpdesk' };
      case '/visitors': return { subtitle: 'Logs', title: 'Visitor History' };
      case '/notices': return { subtitle: 'Broadcast', title: 'Notice Board' };
      default: return { subtitle: 'Overview', title: 'Dashboard' };
    }
  };

  const { subtitle, title } = getHeaderTitle();

  return (
    <header className="px-8 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-dark bg-base/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <p className="text-xs font-semibold text-gold uppercase tracking-[0.15em] mb-1">{subtitle}</p>
        <h1 className="font-heading font-semibold text-3xl text-white tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted bg-surface border border-border-dark px-4 py-2 rounded-md">
          {dateStr}
        </span>
      </div>
    </header>
  );
};
