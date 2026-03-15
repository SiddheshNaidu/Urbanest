import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'ADMIN' | 'SECURITY' | 'RESIDENT';

export interface User {
  id: string;
  name: string;
  role: Role;
  flatId?: string; // e.g. "A-101" for residents
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  flatId?: string;
  society?: string;
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

export interface Amenity {
  id: string;
  name: string;
  category: 'SPORTS' | 'WELLNESS' | 'CLUBHOUSE' | 'OTHER';
  status: 'AVAILABLE' | 'MAINTENANCE';
  capacity: number;
}

export interface Booking {
  id: string;
  amenityId: string;
  residentName: string;
  flatId: string;
  date: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'CANCELLED';
}

interface AppState {
  currentUser: User | null;
  registeredUsers: RegisteredUser[];
  visitors: Visitor[];
  login: (user: User) => void;
  logout: () => void;
  register: (user: RegisteredUser) => void;
  findUser: (email: string, password: string) => RegisteredUser | null;
  addVisitor: (visitor: Omit<Visitor, 'id'>) => Visitor;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;
  amenities: Amenity[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  updateAmenityStatus: (id: string, status: 'AVAILABLE' | 'MAINTENANCE') => void;
}

// Initial mock data
const MOCK_VISITORS: Visitor[] = [
  { id: 'v1', name: 'Ramesh (Electrician)', flatId: 'A-101', purpose: 'SERVICE', status: 'ON_CAMPUS', entryTime: '10:00 AM' },
  { id: 'v2', name: 'Swiggy Delivery', flatId: 'B-302', purpose: 'DELIVERY', status: 'CHECKED_OUT', entryTime: '11:15 AM', exitTime: '11:30 AM' },
  { id: 'v3', name: 'Suresh Kumar', flatId: 'C-205', purpose: 'GUEST', status: 'EXPECTED', qrToken: 'mock-qr-token-123' },
];

const MOCK_AMENITIES: Amenity[] = [
  { id: 'a1', name: 'Grand Swimming Pool', category: 'WELLNESS', status: 'AVAILABLE', capacity: 20 },
  { id: 'a2', name: 'Tennis Court A', category: 'SPORTS', status: 'AVAILABLE', capacity: 4 },
  { id: 'a3', name: 'Premium Spa', category: 'WELLNESS', status: 'MAINTENANCE', capacity: 6 },
  { id: 'a4', name: 'Clubhouse Banquet', category: 'CLUBHOUSE', status: 'AVAILABLE', capacity: 100 },
  { id: 'a5', name: 'Yoga Studio', category: 'WELLNESS', status: 'AVAILABLE', capacity: 15 },
];

const MOCK_BOOKINGS: Booking[] = [
  { id: 'b1', amenityId: 'a2', residentName: 'Arthur Pendragon', flatId: '402', date: '2024-11-20', timeSlot: '08:00 AM - 09:00 AM', status: 'CONFIRMED' },
  { id: 'b2', amenityId: 'a1', residentName: 'Julian Vane', flatId: 'NORTH-402', date: '2024-11-21', timeSlot: '06:00 AM - 07:00 AM', status: 'CONFIRMED' },
];

// Pre-seeded demo accounts so users can sign in immediately
const SEED_USERS: RegisteredUser[] = [
  { id: 'seed-admin', name: 'Alka Sharma', email: 'admin@urbanest.com', password: 'admin123', role: 'ADMIN', society: 'Urbanest Residences' },
  { id: 'seed-security', name: 'Ramesh Patil', email: 'security@urbanest.com', password: 'security123', role: 'SECURITY', society: 'Urbanest Residences' },
  { id: 'seed-resident', name: 'Suresh Mehra', email: 'resident@urbanest.com', password: 'resident123', role: 'RESIDENT', flatId: 'A-101', society: 'Urbanest Residences' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      registeredUsers: SEED_USERS,
      visitors: MOCK_VISITORS,
      amenities: MOCK_AMENITIES,
      bookings: MOCK_BOOKINGS,
      
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      
      register: (user) => set((state) => ({
        registeredUsers: [...state.registeredUsers, user]
      })),

      findUser: (email, password) => {
        const users = get().registeredUsers;
        return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password) || null;
      },
      
      addVisitor: (visitorData) => {
        const newVisitor = { ...visitorData, id: `v${Date.now()}` };
        set((state) => ({ visitors: [newVisitor, ...state.visitors] }));
        return newVisitor;
      },
      
      updateVisitor: (id, updates) => set((state) => ({
        visitors: state.visitors.map(v => v.id === id ? { ...v, ...updates } : v)
      })),
      
      addBooking: (bookingData) => {
        const newBooking = { ...bookingData, id: `b${Date.now()}` };
        set((state) => ({ bookings: [newBooking, ...state.bookings] }));
        return newBooking;
      },
      
      updateAmenityStatus: (id, status) => set((state) => ({
        amenities: state.amenities.map(a => a.id === id ? { ...a, status } : a)
      })),
    }),
    {
      name: 'urbanest-storage',
    }
  )
);
