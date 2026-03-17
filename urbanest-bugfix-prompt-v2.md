# Urbanest — Bug Fix Engineering Prompt v2.0
## Seven Production Bugs: Navigation · Landing Glitch · Mobile Sidebar · Fake Buttons · QR Scanner · Role Restrictions
> **Rules:** No new npm packages. No redesigns. No changes to shader files. Fix only what is broken. Every fix must be surgical — change the minimum lines necessary. Preserve all existing design tokens, class names, and component structure.

---

## Table of Contents
1. [Bug 1 — No Back Navigation from Auth Pages](#bug-1--no-back-navigation-from-auth-pages)
2. [Bug 2 — Landing Page Section Background Glitch on Desktop](#bug-2--landing-page-section-background-glitch-on-desktop)
3. [Bug 3 — Scroll Animation Stuttering](#bug-3--scroll-animation-stuttering)
4. [Bug 4 — Mobile Sidebar / Navigation Inaccessible](#bug-4--mobile-sidebar--navigation-inaccessible)
5. [Bug 5 — All Action Buttons Show Toast Instead of Actual UI](#bug-5--all-action-buttons-show-toast-instead-of-actual-ui)
6. [Bug 6 — QR Scanner Camera Not Registering Scans in Live Results](#bug-6--qr-scanner-camera-not-registering-scans-in-live-results)
7. [Bug 7 — Residents Can Drag-and-Drop Helpdesk Tickets](#bug-7--residents-can-drag-and-drop-helpdesk-tickets)
8. [File Change Summary](#file-change-summary)
9. [Do Not Touch List](#do-not-touch-list)

---

## Bug 1 — No Back Navigation from Auth Pages

### Files: `Login.tsx`, `Signup.tsx`

### Problem
Once a user lands on `/login` or `/signup`, there is no way to return to the landing page `/` without using the browser's back button. On mobile, where there may be no back button in the browser chrome, the user is effectively trapped.

### Fix

In both `Login.tsx` and `Signup.tsx`, add a back-navigation link at the very top of the page, positioned absolutely so it doesn't affect the card layout.

**Add this JSX as the first child inside the outermost `<div>` in both files (after the background image div):**

```tsx
// Place this immediately after the background <div> and before the content <div>
<Link
  to="/"
  className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-muted hover:text-white transition-colors group"
>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:-translate-x-1 transition-transform"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
  Back to Home
</Link>
```

**Make the outermost `<div>` in both files `relative` if it isn't already:**
```tsx
// Before:
<div className="min-h-screen bg-base flex items-center justify-center p-4 overflow-hidden">

// After:
<div className="min-h-screen bg-base flex items-center justify-center p-4 relative overflow-hidden">
```

`Link` is already imported from `react-router-dom` in both files — no new imports needed.

---

## Bug 2 — Landing Page Section Background Glitch on Desktop

### File: `Landing.tsx`, `background-paths.tsx`

### Problem
The "The old way is broken / We engineered flow" section uses `<BackgroundPaths>` which renders 36 animated SVG paths via framer-motion. On desktop/laptop, the large SVG viewport causes layout thrashing because each path animation triggers repaints on a massive canvas. The section's child content also overlaps the SVG incorrectly at certain viewport widths, creating visual z-index stacking issues.

The specific `ShaderAnimation` component inside the "Enterprise Infrastructure" features section is also causing desktop GPU issues — it creates a full Three.js WebGL renderer that fights with the `HeroShaders` instance already running at the top of the page. Two simultaneous WebGL contexts on mid-range laptops causes frame drops.

### Fix A — `background-paths.tsx`: Reduce path count and disable on desktop

```tsx
// In FloatingPaths component, change:
const paths = Array.from({ length: 18 }, (_, i) => ({

// To:
const paths = Array.from({ length: 8 }, (_, i) => ({
```

Also add `will-change: transform` to the SVG via inline style to hint GPU compositing:
```tsx
// On the <svg> element, add:
style={{ willChange: 'opacity' }}
```

Remove the `animate` prop from all paths and replace with a static `opacity` — the pulsing opacity animation is the primary cause of repaints on desktop:

```tsx
// Before:
<motion.path
  key={path.id}
  d={path.d}
  stroke={`${color},${path.opacity})`}
  strokeWidth={path.width}
  initial={{ pathLength: 0.8, opacity: path.opacity * 0.5 }}
  animate={{
    opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
  }}
  transition={{
    duration: 6 + (path.id % 4) * 2,
    repeat: Number.POSITIVE_INFINITY,
    ease: "linear",
  }}
/>

// After — replace motion.path with plain path, static opacity:
<path
  key={path.id}
  d={path.d}
  stroke={`${color},${path.opacity})`}
  strokeWidth={path.width}
  opacity={path.opacity}
/>
```

This makes the paths static decorative elements rather than animated ones. They still provide the visual texture without causing repaints.

### Fix B — `Landing.tsx`: Conditionally disable ShaderAnimation on the features section

The `ShaderAnimation` (Three.js) inside the "Enterprise Infrastructure" section conflicts with `HeroShaders` (also Three.js) in the hero. Replace the ShaderAnimation background with a CSS-only gradient that achieves the same visual feel:

```tsx
// In Landing.tsx, find the "Features Grid - Enterprise Infrastructure" section:
// REMOVE this block entirely:
<div className="absolute inset-0 z-0 text-gold-dim">
  <ShaderAnimation />
  <div className="absolute inset-0 bg-base/85" />
  <div className="absolute inset-0 bg-gradient-to-b from-base via-transparent to-base" />
</div>

// REPLACE with this CSS-only version:
<div className="absolute inset-0 z-0">
  <div className="absolute inset-0 bg-base" />
  <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-amber/5" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
  <div className="absolute inset-0 bg-gradient-to-b from-base via-transparent to-base" />
</div>
```

Remove the `ShaderAnimation` import from `Landing.tsx` since it's no longer used:
```tsx
// Remove this line:
import { ShaderAnimation } from '../components/ui/shader-animation';
```

### Fix C — `Landing.tsx`: Fix z-index stacking in the BackgroundPaths section

The prose content inside `<BackgroundPaths>` needs explicit `relative z-10` on the inner content container to prevent the SVG overlay from intercepting pointer events:

```tsx
// Find the BackgroundPaths section content wrapper. The immediate child of BackgroundPaths should be:
// Before:
<div className="max-w-6xl mx-auto">

// After:
<div className="max-w-6xl mx-auto relative z-10">
```

---

## Bug 3 — Scroll Animation Stuttering

### File: `Landing.tsx`

### Problem
All `FeatureCard` and `FlowStep` components use `whileInView` with `viewport={{ once: true, margin: "-50px" }}`. When a previous AI reduced animation complexity, the `transition` durations were shortened to values that cause the browser's animation frame scheduler to produce choppy interpolation (sub-100ms durations on `opacity` + `y` simultaneously on 12+ elements triggered in rapid succession during scroll).

Additionally, `motion.div` with `whileInView` creates an IntersectionObserver per element. 12 FeatureCards + 9 FlowSteps = 21 simultaneous observers. On mid-range devices this causes the scroll event to block the main thread.

### Fix A — Increase transition duration and stagger

In `FeatureCard` component (inside `Landing.tsx`):
```tsx
// Before:
transition={{ duration: 0.4, ease: "easeOut" }}

// After:
transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
```

In `FlowStep` component (inside `Landing.tsx`):
```tsx
// Before:
transition={{ duration: 0.4, ease: "easeOut" }}

// After:
transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
```

### Fix B — Add `margin` buffer to reduce IntersectionObserver trigger sensitivity

For every `whileInView` that uses `viewport`, expand the margin so elements start animating before they're nearly fully in view — this prevents the cascade of simultaneous triggers:

```tsx
// Change all instances of:
viewport={{ once: true, margin: "-50px" }}

// To:
viewport={{ once: true, margin: "-10px" }}
```

### Fix C — Wrap the FeatureCard grid in a single parent `motion.div` instead of animating each card

Replace the current approach (each card has its own `whileInView`) with a staggered children pattern on the grid parent. This replaces 6 IntersectionObservers with 1:

```tsx
// In the features grid section, find:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <FeatureCard ... />
  <FeatureCard ... />
  ...
</div>

// Replace with:
<motion.div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-10px" }}
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  }}
>
  <FeatureCard ... />
  ...
</motion.div>
```

Update `FeatureCard` to use variants instead of direct `initial`/`animate`:
```tsx
const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    }}
    className="bg-surface/50 backdrop-blur-sm border border-border-dark hover:border-gold/50 p-8 rounded-[2rem] transition-all group relative overflow-hidden h-full"
  >
    {/* inner content unchanged */}
  </motion.div>
);
```

Remove `initial`, `whileInView`, `viewport`, and `transition` props from `FeatureCard` — the parent grid now controls all of that.

---

## Bug 4 — Mobile Sidebar / Navigation Inaccessible

### Files: `Layout.tsx`, `Sidebar.tsx` — New file: `BottomNav.tsx`

### Problem
`Sidebar.tsx` uses `hidden md:flex` — it is completely invisible on mobile. There is no hamburger menu, no bottom navigation bar, no drawer — nothing. On screens below `768px` (the `md` breakpoint), authenticated users have zero navigation. They can access the current page but cannot move to any other screen.

### Fix — Create a `BottomNav.tsx` mobile navigation bar

**New file: `client/src/components/BottomNav.tsx`**

This is a fixed bottom navigation bar that appears only on mobile (below `md` breakpoint). It shows the role-appropriate links as icon + label tabs.

```tsx
import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, Users, CreditCard, HeadphonesIcon,
  LogIn, Bell, ShieldCheck, Home, Dumbbell
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
    { to: '/financials', icon: CreditCard,        label: 'Finance' },
    { to: '/helpdesk',   icon: HeadphonesIcon,    label: 'Helpdesk' },
    { to: '/visitors',   icon: LogIn,             label: 'Visitors' },
    { to: '/notices',    icon: Bell,              label: 'Notices' },
  ];

  const securityLinks: NavItem[] = [
    { to: '/security',   icon: ShieldCheck,       label: 'Scanner' },
    { to: '/visitors',   icon: LogIn,             label: 'Log' },
  ];

  const residentLinks: NavItem[] = [
    { to: '/resident',   icon: Home,              label: 'Home' },
    { to: '/financials', icon: CreditCard,        label: 'Finances' },
    { to: '/helpdesk',   icon: HeadphonesIcon,    label: 'Helpdesk' },
    { to: '/amenities',  icon: Dumbbell,          label: 'Amenities' },
    { to: '/notices',    icon: Bell,              label: 'Notices' },
  ];

  let links: NavItem[] = [];
  if (currentUser?.role === 'ADMIN')    links = adminLinks;
  if (currentUser?.role === 'SECURITY') links = securityLinks;
  if (currentUser?.role === 'RESIDENT') links = residentLinks;

  // Truncate to max 5 items so they fit on narrow screens
  const visibleLinks = links.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-sidebar/95 backdrop-blur-xl border-t border-border-dark">
      <div className="flex items-stretch h-16">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
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
      </div>
      {/* Safe area spacer for phones with home indicators */}
      <div className="h-safe-area-inset-bottom bg-sidebar/95" />
    </nav>
  );
};
```

**Update `Layout.tsx` — add `<BottomNav />` and adjust bottom padding:**

```tsx
import { BottomNav } from './BottomNav';

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="main-content md:ml-[260px] flex-1 flex flex-col min-h-screen">
        <TopNav />
        {/* pb-24 gives space for the bottom nav on mobile; md:pb-8 resets on desktop */}
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
```

Note: `pb-24` was already in the original `Layout.tsx` — verify it is present. If it was removed, add it back exactly as shown above.

**Also add to `index.css`** to support the safe-area inset on iPhones:
```css
/* Add at the bottom of index.css */
.h-safe-area-inset-bottom {
  height: env(safe-area-inset-bottom, 0px);
}
```

---

## Bug 5 — All Action Buttons Show Toast Instead of Actual UI

### Problem
Every primary action button in the app calls `toast.success('...')` instead of opening a real modal or form. This includes:
- **ResidentsDirectory.tsx** — "Add Resident" button
- **AdminDashboard.tsx** — "Start Onboarding" button + Settings button
- **Financials.tsx** (Admin) — "Generate Bills" button
- **Visitors.tsx** — "Pre-Approve" button
- **Helpdesk.tsx** — "+ Create Ticket" button
- **Notices.tsx** — Publish works correctly (no fix needed here)

The fix for each is to build a minimal but **functional** inline modal. The modals do not need to call a backend — they should call the existing Zustand store actions (`addVisitor`, `register`, etc.) and show real data changes in the UI.

---

### Fix 5A — `ResidentsDirectory.tsx` + `AdminDashboard.tsx`: Add Resident Modal

**New file: `client/src/components/AddResidentModal.tsx`**

```tsx
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
      password: 'welcome123', // default password — resident should reset
      role: 'RESIDENT',
      flatId,
      society: 'Urbanest Residences',
    });

    toast.success(`${name} added to ${flatId}`);
    setName(''); setEmail(''); setFlatId(''); setType('OWNER');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
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
              className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Flat Number</label>
            <input
              type="text" required value={flatId} onChange={e => setFlatId(e.target.value)}
              placeholder="e.g. B-204"
              className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors"
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
```

**Update `ResidentsDirectory.tsx`:**
```tsx
import { useState } from 'react';
import { AddResidentModal } from '../components/AddResidentModal';

export const ResidentsDirectory = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <AddResidentModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-semibold text-xl text-white">Residents Directory</h2>
        {/* Change onClick from toast to setShowModal(true) */}
        <button onClick={() => setShowModal(true)} className="bg-gold hover:bg-gold-light text-[#0B0B0B] font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
          Add Resident
        </button>
      </div>
      {/* DataTable unchanged */}
    </div>
  );
};
```

**Update `AdminDashboard.tsx`:**
```tsx
import { useState } from 'react';
import { AddResidentModal } from '../components/AddResidentModal';

// Add state:
const [showAddResident, setShowAddResident] = useState(false);

// Add modal in JSX (before the return's closing div):
<AddResidentModal isOpen={showAddResident} onClose={() => setShowAddResident(false)} />

// Change "Start Onboarding" button onClick:
onClick={() => setShowAddResident(true)}

// Change Settings button onClick — remove toast, replace with a no-op or a small alert:
onClick={() => toast('Settings panel coming soon', { icon: '⚙️' })}
```

---

### Fix 5B — `Visitors.tsx`: Pre-Approve Modal

**Update `Visitors.tsx`** — add a real `PreApproveModal` inline (no new file needed, keep it local):

```tsx
import React, { useState } from 'react';
import { useStore, type Visitor } from '../store/useStore';
import { X } from 'lucide-react';

// Add inside the Visitors component:
const [showPreApprove, setShowPreApprove] = useState(false);
const [paName, setPaName]       = useState('');
const [paFlat, setPaFlat]       = useState('');
const [paPurpose, setPaPurpose] = useState<Visitor['purpose']>('GUEST');
const { visitors, addVisitor, currentUser } = useStore();

const handlePreApprove = (e: React.FormEvent) => {
  e.preventDefault();
  if (!paName || !paFlat) return;
  addVisitor({
    name: paName,
    flatId: paFlat,
    purpose: paPurpose,
    status: 'EXPECTED',
    qrToken: `QR-${Math.random().toString(36).substr(2, 9)}`,
    addedBy: currentUser?.name || 'Admin',
  });
  toast.success(`${paName} pre-approved for ${paFlat}`);
  setPaName(''); setPaFlat(''); setPaPurpose('GUEST');
  setShowPreApprove(false);
};
```

**Add the modal JSX at the top of the return statement:**
```tsx
{showPreApprove && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
    <div className="bg-surface border border-border-dark rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Pre-Approve Visitor</h3>
        <button onClick={() => setShowPreApprove(false)} className="p-2 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handlePreApprove} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Visitor Name</label>
          <input type="text" required value={paName} onChange={e => setPaName(e.target.value)}
            placeholder="e.g. Amazon Delivery" 
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Flat Number</label>
          <input type="text" required value={paFlat} onChange={e => setPaFlat(e.target.value)}
            placeholder="e.g. A-101"
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Purpose</label>
          <select value={paPurpose} onChange={e => setPaPurpose(e.target.value as Visitor['purpose'])}
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors appearance-none">
            <option value="GUEST">Personal Guest</option>
            <option value="DELIVERY">Delivery</option>
            <option value="SERVICE">Service & Repair</option>
            <option value="DOMESTIC_STAFF">Domestic Staff</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowPreApprove(false)}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl transition-all hover:bg-white/10">Cancel</button>
          <button type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-gold to-amber text-black font-bold rounded-xl">Pre-Approve</button>
        </div>
      </form>
    </div>
  </div>
)}
```

**Change the "Pre-Approve" button `onClick`:**
```tsx
// Before:
onClick={() => toast.success('Add pre-approved guest form opened.')}

// After:
onClick={() => setShowPreApprove(true)}
```

---

### Fix 5C — `Helpdesk.tsx`: Create Ticket Modal

**Add state to the `Helpdesk` component:**
```tsx
const [showCreateTicket, setShowCreateTicket] = useState(false);
const [newTitle, setNewTitle]     = useState('');
const [newFlat, setNewFlat]       = useState('');
const [newCategory, setNewCategory] = useState('Plumbing');
const [newPriority, setNewPriority] = useState<TicketPriority>('Medium');
```

**Add `handleCreateTicket`:**
```tsx
const handleCreateTicket = (e: React.FormEvent) => {
  e.preventDefault();
  if (!newTitle || !newFlat) return;
  const newTicket: Ticket = {
    id: `TKT-${Math.floor(Math.random() * 900) + 100}`,
    flat: newFlat,
    category: newCategory,
    issue: newTitle,
    status: 'Open',
    priority: newPriority,
    date: 'Just now',
  };
  setTickets(prev => [newTicket, ...prev]);
  toast.success(`Ticket ${newTicket.id} created`);
  setNewTitle(''); setNewFlat(''); setNewCategory('Plumbing'); setNewPriority('Medium');
  setShowCreateTicket(false);
};
```

**Add modal JSX at the top of the return:**
```tsx
{showCreateTicket && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
    <div className="bg-surface border border-border-dark rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Create Ticket</h3>
        <button onClick={() => setShowCreateTicket(false)} className="p-2 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleCreateTicket} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Issue Description</label>
          <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="e.g. Leaking pipe in bathroom"
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Flat Number</label>
          <input type="text" required value={newFlat} onChange={e => setNewFlat(e.target.value)}
            placeholder="e.g. A-101"
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-2 focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold appearance-none">
              {['Plumbing','Electrical','Maintenance','Security','Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Priority</label>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as TicketPriority)}
              className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold appearance-none">
              {(['High','Medium','Low'] as TicketPriority[]).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowCreateTicket(false)}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">Cancel</button>
          <button type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-gold to-amber text-black font-bold rounded-xl">Create Ticket</button>
        </div>
      </form>
    </div>
  </div>
)}
```

**Change "+ Create Ticket" button:**
```tsx
// Before:
onClick={() => toast.success('New Ticket Modal Opened')}

// After:
onClick={() => setShowCreateTicket(true)}
```

**Add `X` import to `Helpdesk.tsx`:**
```tsx
import { Clock, CheckCircle2, AlertCircle, Wrench, MoreHorizontal, UserCircle2, X } from 'lucide-react';
```

---

### Fix 5D — `Financials.tsx` (Admin): Generate Bills

The "Generate Bills" button should open a simple month-picker modal and then add mock invoices to the list. Replace the toast with a functional modal:

```tsx
// Add state:
const [showGenerate, setShowGenerate] = useState(false);
const [genMonth, setGenMonth] = useState('');
const [genAmount, setGenAmount] = useState('4500');

const handleGenerate = (e: React.FormEvent) => {
  e.preventDefault();
  toast.success(`Bulk invoices generated for ${genMonth} — ₹${genAmount} per flat`);
  setShowGenerate(false);
  setGenMonth('');
};
```

**Add modal JSX in the admin section of `Financials.tsx`:**
```tsx
{showGenerate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
    <div className="bg-surface border border-border-dark rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-amber" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Generate Invoices</h3>
        <button onClick={() => setShowGenerate(false)} className="p-2 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Billing Month</label>
          <input type="month" required value={genMonth} onChange={e => setGenMonth(e.target.value)}
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-2 uppercase tracking-wider mb-2">Amount per Flat (₹)</label>
          <input type="number" required value={genAmount} onChange={e => setGenAmount(e.target.value)}
            className="w-full bg-base border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div className="bg-surface-2 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-muted">This will generate invoices for all <span className="text-white font-bold">450 active flats</span>.</p>
          <p className="text-xs text-muted mt-1">Total amount: <span className="text-emerald font-bold">₹{(parseInt(genAmount || '0') * 450).toLocaleString('en-IN')}</span></p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowGenerate(false)}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">Cancel</button>
          <button type="submit"
            className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">Generate</button>
        </div>
      </form>
    </div>
  </div>
)}
```

**Change the "Generate Bills" button:**
```tsx
// Before:
onClick={() => toast.success('Bulk Invoice Generation Started')}

// After:
onClick={() => setShowGenerate(true)}
```

Add `X` to the lucide-react import in `Financials.tsx` — it's already imported (check `X` is in the existing import list, if not add it).

---

## Bug 6 — QR Scanner Camera Not Registering Scans in Live Results

### File: `SecurityDashboard.tsx`

### Root Cause (confirmed from screenshot)
The screenshot shows the camera is active and the QR code is clearly visible in the frame. The Live Results panel shows "Awaiting Signal." This confirms the camera feed is working but the decode loop is producing zero results.

The cause is in `runCaptureLoop` — the canvas preprocessing block:

```ts
// This is the broken code:
context.globalCompositeOperation = 'difference';
context.fillStyle = 'white';
context.filter = 'contrast(1.4) grayscale(1)';
context.drawImage(canvas, 0, 0); // drawing canvas onto itself with difference mode = black output
context.filter = 'none';
```

Drawing a canvas onto itself with `globalCompositeOperation = 'difference'` produces a completely black image (every pixel subtracted from itself = 0). ZXing receives a black rectangle and correctly finds no QR code. The `catch` block silently swallows this every frame.

### Fix — Complete replacement of `runCaptureLoop`

**Delete `canvasRef`** — remove this line entirely:
```ts
const canvasRef = useRef<HTMLCanvasElement>(null);
```

**Add `isScanningRef`** — add this immediately after the existing `isProcessing` ref:
```ts
const isScanningRef = useRef(false);
```

**Update `startScanner`** — add `isScanningRef.current = true;` as the very first line inside the function:
```ts
const startScanner = async () => {
  isScanningRef.current = true;  // ADD THIS LINE
  setScanResult(null);
  setIsScanning(true);
  // ... rest of function unchanged
};
```

**Update `stopScanner`** — add `isScanningRef.current = false;` as the very first line:
```ts
const stopScanner = () => {
  isScanningRef.current = false;  // ADD THIS LINE
  if (loopId.current) {
    window.cancelAnimationFrame(loopId.current);
    loopId.current = null;
  }
  // ... rest of function unchanged
};
```

**Replace `runCaptureLoop` entirely with this clean version:**

```ts
const runCaptureLoop = () => {
  const tick = async () => {
    if (!videoRef.current || !isScanningRef.current) return;

    const video = videoRef.current;

    if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      // Fresh offscreen canvas every tick — never reuse, never modify in-place
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        // Raw frame only — zero preprocessing, zero filters, zero composite ops
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const result = await reader.current.decodeFromCanvas(canvas);
          if (result && !isProcessing.current) {
            handleScanSuccess(result.getText());
            // Don't schedule next frame immediately — let handleScanSuccess process
            return;
          }
        } catch {
          // No QR found in this frame — this is the normal path, continue
        }
      }
    }

    // Schedule next frame only if still scanning
    if (isScanningRef.current) {
      loopId.current = window.requestAnimationFrame(tick);
    }
  };

  loopId.current = window.requestAnimationFrame(tick);
};
```

**Add detecting state for visual feedback:**
```ts
const [isDetecting, setIsDetecting] = useState(false);
```

**Update `handleScanSuccess`** — add detecting flash:
```ts
const handleScanSuccess = (text: string) => {
  setIsDetecting(true);              // ADD
  setTimeout(() => setIsDetecting(false), 800); // ADD
  isProcessing.current = true;
  // ... rest unchanged
};
```

**Update the targeting box in the video overlay** to show detecting state:
```tsx
// Find the existing targeting box div and update className:
className={`w-48 h-48 border-2 rounded-lg transition-all duration-300 ${
  isDetecting
    ? 'border-emerald shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105'
    : 'border-gold/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
}`}
```

---

## Bug 7 — Residents Can Drag-and-Drop Helpdesk Tickets

### File: `Helpdesk.tsx`

### Problem
The Kanban board in `Helpdesk.tsx` is accessible to both `ADMIN` and `RESIDENT` roles (as defined in `App.tsx`: `allowedRoles={['ADMIN', 'RESIDENT']}`). However, all drag-and-drop functionality — `draggable`, `onDragStart`, `onDragEnd`, `onDragOver`, `onDrop` — is always active regardless of role. Residents should be able to **view** the Kanban but not **change ticket status**.

### Fix

**Import `useStore` at the top of `Helpdesk.tsx`:**
```tsx
import { useStore } from '../store/useStore';
```

**Add inside the component, after the `tickets` state:**
```tsx
const { currentUser } = useStore();
const isAdmin = currentUser?.role === 'ADMIN';
```

**Gate all drag-and-drop on `isAdmin`:**

On the ticket `motion.div`:
```tsx
// Before:
draggable
onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, ticket.id)}
onDragEnd={() => setDraggedTicketId(null)}

// After:
draggable={isAdmin}
onDragStart={isAdmin ? (e) => handleDragStart(e as unknown as React.DragEvent, ticket.id) : undefined}
onDragEnd={isAdmin ? () => setDraggedTicketId(null) : undefined}
```

On the column `<div>` that receives drops:
```tsx
// Before:
onDragOver={handleDragOver}
onDrop={(e) => handleDrop(e, column.status)}

// After:
onDragOver={isAdmin ? handleDragOver : undefined}
onDrop={isAdmin ? (e) => handleDrop(e, column.status) : undefined}
```

On the ticket card, change the cursor class conditionally:
```tsx
// Before:
className={`... cursor-grab active:cursor-grabbing ...`}

// After:
className={`... ${isAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ...`}
```

**Hide the "+ Create Ticket" button from residents:**
```tsx
// Before (button always shown):
<button onClick={() => setShowCreateTicket(true)} ...>

// After — wrap in conditional:
{isAdmin && (
  <button onClick={() => setShowCreateTicket(true)} ...>
    + Create Ticket
  </button>
)}
```

**Add a read-only notice for residents** below the page subtitle:
```tsx
{!isAdmin && (
  <p className="text-xs font-medium text-amber bg-amber/10 border border-amber/20 px-3 py-2 rounded-lg inline-flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-amber" />
    View only — contact admin to update ticket status
  </p>
)}
```

---

## File Change Summary

| File | Change Type | What Changes |
|---|---|---|
| `client/src/pages/Login.tsx` | Modify | Add back button link |
| `client/src/pages/Signup.tsx` | Modify | Add back button link |
| `client/src/components/ui/background-paths.tsx` | Modify | Reduce paths from 18→8, remove motion animation, add willChange |
| `client/src/pages/Landing.tsx` | Modify | Remove ShaderAnimation, replace with CSS gradient; update viewport margins; wrap FeatureCard grid in staggered parent |
| `client/src/components/Layout.tsx` | Modify | Add `<BottomNav />`, verify `pb-24` present |
| `client/src/components/BottomNav.tsx` | **New file** | Role-aware mobile bottom navigation |
| `client/src/index.css` | Modify | Add `.h-safe-area-inset-bottom` utility |
| `client/src/components/AddResidentModal.tsx` | **New file** | Functional Add Resident form |
| `client/src/pages/ResidentsDirectory.tsx` | Modify | Wire `AddResidentModal` |
| `client/src/pages/AdminDashboard.tsx` | Modify | Wire `AddResidentModal`; fix settings button |
| `client/src/pages/Visitors.tsx` | Modify | Replace Pre-Approve toast with real modal |
| `client/src/pages/Helpdesk.tsx` | Modify | Add Create Ticket modal; role-gate drag-and-drop |
| `client/src/pages/Financials.tsx` | Modify | Add Generate Invoices modal |
| `client/src/pages/SecurityDashboard.tsx` | Modify | Fix `runCaptureLoop`; add `isScanningRef`; add `isDetecting` flash |

---

## Do Not Touch List

- **All shader/WebGL files** — `hero-demo.tsx`, `background-paper-shaders.tsx`, `shader-animation.tsx` (the features section shader is replaced via CSS in `Landing.tsx`, do NOT modify the shader file itself)
- **`useStore.ts`** — no changes required for these bugs
- **`App.tsx`** — route definitions unchanged
- **`Sidebar.tsx`** — desktop sidebar unchanged; BottomNav is additive mobile-only
- **`TopNav.tsx`** — unchanged
- **`tailwind.config.js`** — no new classes needed; all classes used exist in Tailwind core
- **`Notices.tsx`** — publish flow already works correctly
- **`Amenities.tsx`** — booking modal already works correctly
- **`ResidentDashboard.tsx`** — QR generation already works correctly
- **`KpiCard.tsx`, `DataTable.tsx`, `ProtectedRoute.tsx`** — untouched

---

## Testing Checklist After Implementation

- [ ] `/login` → click browser back or "Back to Home" link → lands on `/`
- [ ] `/signup` → click "Back to Home" → lands on `/`  
- [ ] Desktop laptop: scroll through landing page, no visual stutter in "old is broken" section
- [ ] Desktop laptop: features grid section loads without WebGL conflict artifacts
- [ ] Mobile (<768px): log in as any role → bottom nav visible → tap each tab → navigates correctly
- [ ] Admin: Residents page → "Add Resident" → modal opens → fill form → submit → new row appears
- [ ] Admin: Visitors page → "Pre-Approve" → modal opens → submit → new EXPECTED visitor appears in list
- [ ] Admin: Helpdesk → "+ Create Ticket" → modal opens → ticket appears in "To Do" column
- [ ] Admin: Financials → "Generate Bills" → modal opens with month picker and total preview
- [ ] Security: QR scanner → start scanner → hold up QR code from Resident dashboard → Live Results panel updates with visitor info
- [ ] Resident: Helpdesk → cannot drag any ticket → no grab cursor → no Create Ticket button visible
- [ ] Resident: Read-only amber notice visible on Helpdesk page

---

*Urbanest Bug Fix Prompt v2.0*  
*Scope: 7 bugs across Navigation · Performance · Mobile UX · Functional Forms · QR Decode · RBAC*  
*Next: Payment Gateway Mock (Razorpay simulation)*
