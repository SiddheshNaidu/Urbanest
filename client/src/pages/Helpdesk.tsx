import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { TicketStatus, TicketPriority } from '../store/useStore';
import { Clock, CheckCircle2, AlertCircle, Wrench, MoreHorizontal, UserCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

// ── New Ticket Modal ────────────────────────────────────────────────────────
function NewTicketModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser, addTicket } = useStore();

  const [category, setCategory] = useState('Plumbing');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;

    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    addTicket({
      flat: currentUser?.flatId || currentUser?.name?.substring(0, 5) || 'GEN',
      category,
      issue: issue.trim(),
      status: 'Open',
      priority,
      date: `Today, ${now}`,
    });

    toast.success('Ticket raised successfully! Our team will respond shortly.');
    setIssue('');
    setCategory('Plumbing');
    setPriority('Medium');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-surface border border-border-dark rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
        <div className="flex items-center justify-between px-7 pt-8 pb-5">
          <div>
            <h3 className="text-xl font-heading font-bold text-white">Raise a Ticket</h3>
            <p className="text-sm text-muted mt-0.5">Describe the issue and we'll assign someone.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Reporting From</label>
            <div className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-muted-2 text-sm font-mono select-none">
              {currentUser?.flatId ? `Flat ${currentUser.flatId}` : currentUser?.name || 'Staff / Security'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none">
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Maintenance</option>
              <option>Security</option>
              <option>Housekeeping</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Priority</label>
            <div className="flex gap-3">
              {(['High', 'Medium', 'Low'] as TicketPriority[]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    priority === p
                      ? p === 'High' ? 'bg-crimson/20 border-crimson/40 text-crimson'
                        : p === 'Medium' ? 'bg-amber/20 border-amber/40 text-amber'
                        : 'bg-emerald/20 border-emerald/40 text-emerald'
                      : 'bg-surface-2 border-white/5 text-muted hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Issue Description</label>
            <textarea value={issue} onChange={e => setIssue(e.target.value)} required
              placeholder="Describe the problem in detail..." rows={4}
              className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all transform hover:scale-[1.02]">
              Submit Ticket
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Helpdesk Page ──────────────────────────────────────────────────────
export const Helpdesk = () => {
  const { currentUser, tickets, updateTicketStatus } = useStore();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);

  const columns: { title: string; status: TicketStatus; icon: React.ReactNode; colorClass: string; bgClass: string }[] = [
    { title: 'To Do', status: 'Open', icon: <AlertCircle size={18} />, colorClass: 'text-amber', bgClass: 'bg-amber/10 border-amber/20' },
    { title: 'In Progress', status: 'In Progress', icon: <Wrench size={18} />, colorClass: 'text-gold', bgClass: 'bg-gold/10 border-gold/20' },
    { title: 'Resolved', status: 'Resolved', icon: <CheckCircle2 size={18} />, colorClass: 'text-emerald', bgClass: 'bg-emerald/10 border-emerald/20' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTicketId(id);
    e.dataTransfer.effectAllowed = 'move';
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
    const ticket = tickets.find(t => t.id === draggedTicketId);
    if (ticket && ticket.status !== newStatus) {
      updateTicketStatus(draggedTicketId, newStatus);
      toast.success(`Ticket ${ticket.id} moved to ${newStatus}`);
    }
    setDraggedTicketId(null);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto min-h-[calc(100vh-120px)] flex flex-col">
      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && <NewTicketModal isOpen={showNewTicket} onClose={() => setShowNewTicket(false)} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Helpdesk
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            {isAdmin
              ? 'Drag and drop tickets across columns to update their resolution status in real-time.'
              : 'View the status of your helpdesk tickets.'}
          </p>
          {!isAdmin && (
            <p className="text-xs font-medium text-amber bg-amber/10 border border-amber/20 px-3 py-2 rounded-lg inline-flex items-center gap-2 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              View only — contact admin to update ticket status
            </p>
          )}
        </div>
        {/* Residents CAN raise tickets, only drag is blocked */}
        <button
          onClick={() => setShowNewTicket(true)}
          className="bg-gradient-to-r from-gold to-amber hover:from-amber hover:to-gold text-black font-bold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)] transform hover:scale-[1.02] transition-all whitespace-nowrap"
        >
          + {isAdmin ? 'Create Ticket' : 'Raise Ticket'}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-8 overflow-x-auto snap-x">
        {columns.map(column => {
          const columnTickets = tickets.filter(t => t.status === column.status);

          return (
            <div
              key={column.status}
              onDragOver={isAdmin ? handleDragOver : undefined}
              onDrop={isAdmin ? (e) => handleDrop(e, column.status) : undefined}
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
                    draggable={isAdmin}
                    onDragStart={isAdmin ? (e) => handleDragStart(e as unknown as React.DragEvent, ticket.id) : undefined}
                    onDragEnd={isAdmin ? () => setDraggedTicketId(null) : undefined}
                    className={`bg-surface border border-border-dark p-5 rounded-2xl ${isAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} hover:border-white/10 transition-colors ${
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
                    {isAdmin ? 'Drop tickets here' : 'No tickets'}
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
