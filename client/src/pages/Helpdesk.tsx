import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, Wrench, MoreHorizontal, UserCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
type TicketPriority = 'High' | 'Medium' | 'Low';

interface Ticket {
  id: string;
  flat: string;
  category: string;
  issue: string;
  status: TicketStatus;
  priority: TicketPriority;
  date: string;
  assigneeInitials?: string;
}

const INITIAL_TICKETS: Ticket[] = [
  { id: 'TKT-201', flat: 'A-505', category: 'Plumbing', issue: 'Leaking pipe in master bathroom', status: 'In Progress', priority: 'High', date: 'Today, 10:30 AM', assigneeInitials: 'JD' },
  { id: 'TKT-202', flat: 'B-302', category: 'Electrical', issue: 'Living room fan not working', status: 'Open', priority: 'Medium', date: 'Yesterday, 4:15 PM' },
  { id: 'TKT-203', flat: 'C-205', category: 'Maintenance', issue: 'Pest control schedule check', status: 'Resolved', priority: 'Low', date: '10 Mar 2024', assigneeInitials: 'SV' },
  { id: 'TKT-204', flat: 'A-101', category: 'Security', issue: 'Main door access card issue', status: 'Open', priority: 'High', date: 'Today, 08:00 AM' },
  { id: 'TKT-205', flat: 'D-404', category: 'Plumbing', issue: 'Low water pressure', status: 'In Progress', priority: 'Medium', date: '11 Mar 2024', assigneeInitials: 'JD' },
];

export const Helpdesk = () => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  const columns: { title: string; status: TicketStatus; icon: React.ReactNode; colorClass: string; bgClass: string }[] = [
    { title: 'To Do', status: 'Open', icon: <AlertCircle size={18} />, colorClass: 'text-amber', bgClass: 'bg-amber/10 border-amber/20' },
    { title: 'In Progress', status: 'In Progress', icon: <Wrench size={18} />, colorClass: 'text-gold', bgClass: 'bg-gold/10 border-gold/20' },
    { title: 'Resolved', status: 'Resolved', icon: <CheckCircle2 size={18} />, colorClass: 'text-emerald', bgClass: 'bg-emerald/10 border-emerald/20' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTicketId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image hack for smoother UX
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TicketStatus) => {
    e.preventDefault();
    if (!draggedTicketId) return;

    setTickets(prev => prev.map(t => {
      if (t.id === draggedTicketId && t.status !== newStatus) {
        toast.success(`Ticket ${t.id} moved to ${newStatus}`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
    setDraggedTicketId(null);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto min-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Helpdesk
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            Drag and drop tickets across columns to update their resolution status in real-time.
          </p>
        </div>
        <button 
          onClick={() => toast.success('New Ticket Modal Opened')}
          className="bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)] transform hover:scale-[1.02] transition-all whitespace-nowrap"
        >
          + Create Ticket
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-8 overflow-x-auto snap-x">
        {columns.map(column => {
          const columnTickets = tickets.filter(t => t.status === column.status);
          
          return (
            <div 
              key={column.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
              className="flex-1 min-w-[320px] bg-surface/50 border border-border-dark rounded-[2rem] p-6 flex flex-col snap-center"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${column.bgClass} ${column.colorClass}`}>
                    {column.icon}
                  </div>
                  <h3 className="font-heading font-bold text-white">{column.title}</h3>
                </div>
                <div className="bg-surface-2 border border-white/5 text-muted-2 text-xs font-bold px-3 py-1 rounded-full">
                  {columnTickets.length}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {columnTickets.map(ticket => (
                  <motion.div
                    layout
                    layoutId={ticket.id}
                    key={ticket.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, ticket.id)}
                    onDragEnd={() => setDraggedTicketId(null)}
                    className={`bg-surface border border-border-dark p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-white/10 transition-colors ${
                      draggedTicketId === ticket.id ? 'opacity-50 scale-95' : 'opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-muted bg-surface-2 px-2.5 py-1 rounded-md border border-white/5">
                        {ticket.id}
                      </span>
                      <button className="text-muted hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    
                    <h4 className="text-white font-bold mb-1 line-clamp-2">{ticket.issue}</h4>
                    <p className="text-sm text-muted mb-4">{ticket.flat} • {ticket.category}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-dark/50">
                      <div className="flex items-center gap-2">
                        {ticket.assigneeInitials ? (
                          <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-dark flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                            {ticket.assigneeInitials}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface/50 border border-border-dark border-dashed flex items-center justify-center text-muted shadow-inner">
                            <UserCircle2 size={16} />
                          </div>
                        )}
                        <span className="text-xs font-medium flex items-center gap-1.5 text-muted-2">
                          <Clock size={12} /> {ticket.date.split(',')[0]}
                        </span>
                      </div>
                      
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md border ${
                        ticket.priority === 'High' ? 'text-crimson bg-crimson/10 border-crimson/20' :
                        ticket.priority === 'Medium' ? 'text-amber bg-amber/10 border-amber/20' :
                        'text-emerald bg-emerald/10 border-emerald/20'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {columnTickets.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-border-dark rounded-2xl flex items-center justify-center text-muted text-sm font-medium">
                    Drop tickets here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
