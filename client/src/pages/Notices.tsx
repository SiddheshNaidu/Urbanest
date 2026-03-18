import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { 
  BellRing, CalendarDays, Edit3, Image as ImageIcon, Link as LinkIcon, 
  List, Bold, Italic, Send, Users, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Notices = () => {
  const { currentUser, notices, addNotice } = useStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    addNotice({
      title: title.trim(),
      content: content.trim(),
      isUrgent,
      date: today,
      author: currentUser?.name || 'Admin',
    });

    toast.success('Notice published and broadcasted successfully!');
    setTitle('');
    setContent('');
    setIsUrgent(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Notice Board
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            {isAdmin ? 'Broadcast announcements and monitor reach.' : 'Society announcements and important notices.'}
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'xl:grid-cols-12' : 'max-w-4xl mx-auto'} gap-8`}>
        
        {/* Left Column: Notice Feed */}
        <div className={`${isAdmin ? 'xl:col-span-7' : 'w-full'} space-y-6`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <BellRing className="text-gold" size={20} /> Latest Broadcasts
            </h2>
          </div>

          <div className="space-y-4">
            {notices.map((notice, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.1, 0.4) }}
                key={notice.id} 
                className="bg-surface border border-border-dark rounded-3xl p-6 sm:p-8 hover:bg-white/[0.02] transition-colors group relative overflow-hidden"
              >
                {notice.isUrgent && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/5 rounded-bl-full pointer-events-none" />
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border ${
                      notice.isUrgent 
                        ? 'bg-crimson/10 text-crimson border-crimson/20 shadow-crimson/10' 
                        : 'bg-surface-2 text-white border-white/5'
                    }`}>
                      {notice.isUrgent ? <BellRing size={20} /> : <CalendarDays size={20} />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-gold transition-colors">{notice.title}</h3>
                        {notice.isUrgent && (
                          <span className="bg-crimson text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(225,29,72,0.4)]">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted">
                        <span className="text-gold">{notice.author}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{notice.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="leading-relaxed text-sm md:text-base text-white/90">
                    {notice.content}
                  </p>
                </div>

                {/* Read Receipts (Admin Only) */}
                {isAdmin && (
                  <div className="mt-8 pt-6 border-t border-border-dark/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-surface-2 border border-white/5 rounded-lg flex items-center gap-2 text-xs font-bold text-emerald">
                        <Eye size={14} /> {notice.readRatio}% Read
                      </div>
                      <div className="px-2.5 py-1 bg-surface-2 border border-white/5 rounded-lg flex items-center gap-2 text-xs font-bold text-muted">
                        <EyeOff size={14} /> {100 - notice.readRatio}% Unread
                      </div>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="w-full sm:w-48 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald rounded-full transition-all duration-1000" 
                        style={{ width: `${notice.readRatio}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <button className="w-full py-4 rounded-2xl border border-border-dark border-dashed text-muted hover:text-white hover:border-white/20 hover:bg-white/5 font-medium transition-all text-sm">
            Load Archives
          </button>
        </div>

        {/* Right Column: WYSIWYG Editor (Admin Only) */}
        {isAdmin && (
          <div className="xl:col-span-5 relative">
            <div className="sticky top-8">
              <div className="bg-surface border border-border-dark rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-border-dark bg-surface-2/30 flex items-center gap-3">
                  <div className="p-2 bg-gold/10 text-gold rounded-xl">
                    <Edit3 size={20} />
                  </div>
                  <h2 className="font-heading font-bold text-white text-lg">Draft New Notice</h2>
                </div>

                <form onSubmit={handlePublish} className="p-8 space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Subject Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Lift Maintenance Schedule"
                      className="w-full bg-surface-2 border border-border-dark focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-xl px-4 py-3 text-white text-sm transition-all outline-none font-medium placeholder-muted/50"
                    />
                  </div>

                  {/* WYSIWYG Mock Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider">Message Content</label>
                    </div>
                    <div className="border border-border-dark rounded-xl overflow-hidden focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30 transition-all">
                      {/* Toolbar */}
                      <div className="bg-surface-2 px-4 py-2 border-b border-border-dark flex items-center gap-1">
                        <button type="button" className="p-1.5 text-muted hover:text-white hover:bg-white/5 rounded transition-colors"><Bold size={14} /></button>
                        <button type="button" className="p-1.5 text-muted hover:text-white hover:bg-white/5 rounded transition-colors"><Italic size={14} /></button>
                        <div className="w-[1px] h-4 bg-border-dark mx-1"></div>
                        <button type="button" className="p-1.5 text-muted hover:text-white hover:bg-white/5 rounded transition-colors"><List size={14} /></button>
                        <button type="button" className="p-1.5 text-muted hover:text-white hover:bg-white/5 rounded transition-colors"><LinkIcon size={14} /></button>
                        <button type="button" className="p-1.5 text-muted hover:text-white hover:bg-white/5 rounded transition-colors"><ImageIcon size={14} /></button>
                      </div>
                      {/* Textarea */}
                      <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Draft your society announcement here..."
                        className="w-full bg-transparent px-4 py-3 text-white text-sm outline-none resize-none min-h-[200px] placeholder-muted/50"
                      />
                    </div>
                  </div>

                  {/* Options & Submit */}
                  <div className="pt-2 flex items-center justify-between border-t border-border-dark/50">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isUrgent ? 'bg-crimson border-crimson text-white' : 'bg-surface-2 border-border-dark group-hover:border-muted'}`}>
                        {isUrgent && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
                      <span className="text-sm font-bold text-muted group-hover:text-white transition-colors">Mark as Urgent</span>
                    </label>

                    <button 
                      type="submit"
                      disabled={!title.trim() || !content.trim()}
                      className="bg-white hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white text-black font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 transition-all transform hover:scale-[1.02]"
                    >
                      <Send size={16} /> Broadcast
                    </button>
                  </div>
                </form>
              </div>

              {/* Reach Metric Card */}
              <div className="mt-6 bg-surface-2/50 border border-border-dark rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Audience Reach</h4>
                  <p className="text-xs font-medium text-muted">Notice will be broadcasted to <span className="text-white">450</span> active resident apps instantly.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
