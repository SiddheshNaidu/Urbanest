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
  addedBy?: string; // name of the resident who pre-approved — e.g. "Suresh Mehra (A-101)"
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

// ── Financials ────────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  title: string;
  amount: string;
  status: 'PAID' | 'OVERDUE';
  date: string;
  type: 'debit' | 'credit';
}

export interface AdminInvoice {
  id: string;
  flat: string;
  type: string;
  amount: string;
  status: 'Paid' | 'Overdue' | 'Pending';
  date: string;
}

// ── Helpdesk ─────────────────────────────────────────────────────────────────
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketPriority = 'High' | 'Medium' | 'Low';

export interface Ticket {
  id: string;
  flat: string;
  category: string;
  issue: string;
  status: TicketStatus;
  priority: TicketPriority;
  date: string;
  assigneeInitials?: string;
}

// ── Notices ──────────────────────────────────────────────────────────────────
export interface Notice {
  id: number;
  title: string;
  isUrgent: boolean;
  date: string;
  author: string;
  content: string;
  readRatio: number;
}

interface AppState {
  // Auth
  currentUser: User | null;
  registeredUsers: RegisteredUser[];
  login: (user: User) => void;
  logout: () => void;
  register: (user: RegisteredUser) => void;
  findUser: (email: string, password: string) => RegisteredUser | null;

  // Visitors
  visitors: Visitor[];
  addVisitor: (visitor: Omit<Visitor, 'id'>) => Visitor;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;

  // Amenities & Bookings
  amenities: Amenity[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  updateAmenityStatus: (id: string, status: 'AVAILABLE' | 'MAINTENANCE') => void;

  // Financials
  transactions: Transaction[];
  adminInvoices: AdminInvoice[];
  markTransactionPaid: (id: string) => void;
  updateInvoiceStatus: (id: string, status: AdminInvoice['status']) => void;

  // Helpdesk
  tickets: Ticket[];
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  addTicket: (ticket: Omit<Ticket, 'id'>) => void;

  // Notices
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'readRatio'>) => void;
}

// ── Seed data ─────────────────────────────────────────────────────────────────
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
  { id: 'b1', amenityId: 'a2', residentName: 'Arthur Pendragon', flatId: '402', date: '2026-11-20', timeSlot: '08:00 AM - 09:00 AM', status: 'CONFIRMED' },
  { id: 'b2', amenityId: 'a1', residentName: 'Julian Vane', flatId: 'NORTH-402', date: '2026-11-21', timeSlot: '06:00 AM - 07:00 AM', status: 'CONFIRMED' },
];

const SEED_USERS: RegisteredUser[] = [
  { id: 'seed-admin', name: 'Alka Sharma', email: 'admin@urbanest.com', password: 'admin123', role: 'ADMIN', society: 'Urbanest Residences' },
  { id: 'seed-security', name: 'Ramesh Patil', email: 'security@urbanest.com', password: 'security123', role: 'SECURITY', society: 'Urbanest Residences' },
  { id: 'seed-resident', name: 'Suresh Mehra', email: 'resident@urbanest.com', password: 'resident123', role: 'RESIDENT', flatId: 'A-101', society: 'Urbanest Residences' },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-9091', title: 'Maintenance Q1', amount: '4,500.00', status: 'OVERDUE', date: '01 Mar 2026', type: 'debit' },
  { id: 'TXN-9092', title: 'Clubhouse Booking', amount: '1,200.00', status: 'PAID', date: '12 Feb 2026', type: 'credit' },
  { id: 'TXN-9093', title: 'Maintenance Q4', amount: '4,500.00', status: 'PAID', date: '01 Dec 2025', type: 'credit' },
  { id: 'TXN-9094', title: 'Plumbing Service', amount: '350.00', status: 'PAID', date: '15 Nov 2025', type: 'credit' },
];

const SEED_ADMIN_INVOICES: AdminInvoice[] = [
  { id: 'INV-1001', flat: 'A-101', type: 'Maintenance Q1', amount: '4,500', status: 'Paid', date: '01 Mar 2026' },
  { id: 'INV-1002', flat: 'B-302', type: 'Maintenance Q1', amount: '4,500', status: 'Overdue', date: '01 Mar 2026' },
  { id: 'INV-1003', flat: 'C-205', type: 'Clubhouse Booking', amount: '1,200', status: 'Pending', date: '12 Mar 2026' },
  { id: 'INV-1004', flat: 'D-404', type: 'Maintenance Q1', amount: '4,500', status: 'Paid', date: '05 Mar 2026' },
];

const SEED_TICKETS: Ticket[] = [
  { id: 'TKT-201', flat: 'A-505', category: 'Plumbing', issue: 'Leaking pipe in master bathroom', status: 'In Progress', priority: 'High', date: 'Today, 10:30 AM', assigneeInitials: 'JD' },
  { id: 'TKT-202', flat: 'B-302', category: 'Electrical', issue: 'Living room fan not working', status: 'Open', priority: 'Medium', date: 'Yesterday, 4:15 PM' },
  { id: 'TKT-203', flat: 'C-205', category: 'Maintenance', issue: 'Pest control schedule check', status: 'Resolved', priority: 'Low', date: '10 Mar 2026', assigneeInitials: 'SV' },
  { id: 'TKT-204', flat: 'A-101', category: 'Security', issue: 'Main door access card issue', status: 'Open', priority: 'High', date: 'Today, 08:00 AM' },
  { id: 'TKT-205', flat: 'D-404', category: 'Plumbing', issue: 'Low water pressure', status: 'In Progress', priority: 'Medium', date: '11 Mar 2026', assigneeInitials: 'JD' },
];

const SEED_NOTICES: Notice[] = [
  {
    id: 1,
    title: 'Annual General Body Meeting',
    isUrgent: true,
    date: '15 Mar 2026',
    author: 'Secretary',
    content: 'The AGM for the current financial year will be held in the clubhouse. All owners are requested to attend. The agenda includes budget approvals and new committee elections.',
    readRatio: 85,
  },
  {
    id: 2,
    title: 'Swimming Pool Maintenance',
    isUrgent: false,
    date: '12 Mar 2026',
    author: 'Facility Manager',
    content: 'The swimming pool will be closed for routine maintenance and deep cleaning this weekend from 8 AM to 6 PM. We apologize for the inconvenience.',
    readRatio: 62,
  },
  {
    id: 3,
    title: 'Lift B Out of Service',
    isUrgent: true,
    date: '10 Mar 2026',
    author: 'Maintenance Dept',
    content: 'Lift B in Tower 2 is currently undergoing mandatory compliance testing and repairs. It will be out of service until tomorrow morning 09:00 AM.',
    readRatio: 94,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────────────────────
      currentUser: null,
      registeredUsers: SEED_USERS,

      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      register: (user) => set((state) => ({
        registeredUsers: [...state.registeredUsers, user],
      })),

      findUser: (email, password) => {
        const users = get().registeredUsers;
        return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password) || null;
      },

      // ── Visitors ─────────────────────────────────────────────────────────────
      visitors: MOCK_VISITORS,

      addVisitor: (visitorData) => {
        const newVisitor = { ...visitorData, id: `v${Date.now()}` };
        set((state) => ({ visitors: [newVisitor, ...state.visitors] }));
        return newVisitor;
      },

      updateVisitor: (id, updates) => set((state) => ({
        visitors: state.visitors.map(v => v.id === id ? { ...v, ...updates } : v),
      })),

      // ── Amenities & Bookings ─────────────────────────────────────────────────
      amenities: MOCK_AMENITIES,
      bookings: MOCK_BOOKINGS,

      addBooking: (bookingData) => {
        const newBooking = { ...bookingData, id: `b${Date.now()}` };
        set((state) => ({ bookings: [newBooking, ...state.bookings] }));
        return newBooking;
      },

      updateAmenityStatus: (id, status) => set((state) => ({
        amenities: state.amenities.map(a => a.id === id ? { ...a, status } : a),
      })),

      // ── Financials ────────────────────────────────────────────────────────────
      transactions: SEED_TRANSACTIONS,
      adminInvoices: SEED_ADMIN_INVOICES,

      markTransactionPaid: (id) => set((state) => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, status: 'PAID', type: 'credit' } : t
        ),
      })),

      updateInvoiceStatus: (id, status) => set((state) => ({
        adminInvoices: state.adminInvoices.map(inv =>
          inv.id === id ? { ...inv, status } : inv
        ),
      })),

      // ── Helpdesk ──────────────────────────────────────────────────────────────
      tickets: SEED_TICKETS,

      updateTicketStatus: (id, status) => set((state) => ({
        tickets: state.tickets.map(t => t.id === id ? { ...t, status } : t),
      })),

      addTicket: (ticketData) => set((state) => ({
        tickets: [{ ...ticketData, id: `TKT-${Date.now()}` }, ...state.tickets],
      })),

      // ── Notices ───────────────────────────────────────────────────────────────
      notices: SEED_NOTICES,

      addNotice: (noticeData) => set((state) => ({
        notices: [
          {
            ...noticeData,
            id: Date.now(),
            readRatio: 0,
          },
          ...state.notices,
        ],
      })),
    }),
    {
      name: 'urbanest-storage-v2',
    }
  )
);
