import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddResidentModal = ({ isOpen, onClose }: Props) => {
  const { register } = useStore();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [flatId, setFlatId]   = useState('');
  const [type, setType]       = useState<'OWNER' | 'TENANT'>('OWNER');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !flatId) return;

    register({
      id: `resident-${Date.now()}`,
      name,
      email,
      password: 'welcome123',
      role: 'RESIDENT',
      flatId,
      society: 'Urbanest Residences',
    });

    toast.success(`${name} added to ${flatId}`);
    setName(''); setEmail(''); setFlatId(''); setType('OWNER');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-dark/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-dark rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add Resident</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Flat Number</label>
            <input
              type="text" required value={flatId} onChange={e => setFlatId(e.target.value)}
              placeholder="e.g. B-204"
              className="w-full bg-app-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Occupancy Type</label>
            <div className="flex gap-3">
              {(['OWNER', 'TENANT'] as const).map(t => (
                <button
                  key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    type === t ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-2 border-white/5 text-muted hover:text-white'
                  }`}
                >
                  {t === 'OWNER' ? 'Owner' : 'Tenant'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-gold hover:bg-amber text-black font-bold rounded-xl transition-all">
              Add Resident
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] text-muted-2 mt-4">
          Default password set to <span className="font-mono text-muted">welcome123</span> — resident should update on first login.
        </p>
      </div>
    </div>
  );
};
