import { create } from 'zustand';

export type Role = 'ADMIN' | 'SECURITY' | 'RESIDENT';

export interface User {
  id: string;
  name: string;
  role: Role;
  flatId?: string; // e.g. "A-101" for residents
}

export interface Visitor {
  id: string;
  name: string;
  flatId: string;
  purpose: 'GUEST' | 'DELIVERY' | 'SERVICE' | 'DOMESTIC_STAFF';
  status: 'EXPECTED' | 'ON_CAMPUS' | 'CHECKED_OUT';
  entryTime?: string;
  exitTime?: string;
  qrToken?: string; 
}

interface AppState {
  currentUser: User | null;
  visitors: Visitor[];
  login: (user: User) => void;
  logout: () => void;
  addVisitor: (visitor: Omit<Visitor, 'id'>) => Visitor;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;
}

// Initial mock data
const MOCK_VISITORS: Visitor[] = [
  { id: 'v1', name: 'Ramesh (Electrician)', flatId: 'A-101', purpose: 'SERVICE', status: 'ON_CAMPUS', entryTime: '10:00 AM' },
  { id: 'v2', name: 'Swiggy Delivery', flatId: 'B-302', purpose: 'DELIVERY', status: 'CHECKED_OUT', entryTime: '11:15 AM', exitTime: '11:30 AM' },
  { id: 'v3', name: 'Suresh Kumar', flatId: 'C-205', purpose: 'GUEST', status: 'EXPECTED', qrToken: 'mock-qr-token-123' },
];

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  visitors: MOCK_VISITORS,
  
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  
  addVisitor: (visitorData) => {
    const newVisitor = { ...visitorData, id: `v${Date.now()}` };
    set((state) => ({ visitors: [newVisitor, ...state.visitors] }));
    return newVisitor;
  },
  
  updateVisitor: (id, updates) => set((state) => ({
    visitors: state.visitors.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
}));
