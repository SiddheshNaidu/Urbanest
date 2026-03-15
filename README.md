# Urbanest — Intelligent Society Management

Urbanest is a premium, high-performance society management system designed to streamline residential operations. Built with a focus on **Visual Excellence**, **Interactive Engineering**, and **Industrial-Grade Reliability**, it provides a seamless experience for Admins, Residents, and Security personnel.

---

## ✨ Project Highlights

- **Premium Aesthetics**: Dark-mode primary UI with glassmorphism, smooth gradients, and curated typography.
- **Dynamic Interactions**: Scroll-driven storytelling, spring-physics micro-animations, and GPU-accelerated motion using Framer Motion and GSAP.
- **Highly Modular**: Component-driven architecture using React 19 and Tailwind CSS.
- **Type-Safe Core**: Robust data structures defined with TypeScript for maximum reliability.

---

## 🚀 Key Features

### 🏛️ Admin Dashboard

- **Real-time Analytics**: KPI cards for financial health, maintenance collection, and active complaints.
- **Resident Directory**: Centralized management of resident profiles, flat allocation, and KYC status.
- **Financial Oversight**: Batch invoice generation and automated payment tracking.

### 🏠 Resident Experience

- **Digital Health Card**: Unique QR-based identity for secure campus access.
- **Financial Portal**: View invoices and make secure maintenance payments via Razorpay.
- **Amenity Booking**: Interactive calendar for reserving clubhouse facilities, sports courts, and more.
- **Helpdesk**: Raise tickets for plumbing, electrical, and security issues with image upload support.

### 🛡️ Security & Visitors

- **Visitor Log**: Real-time tracking of entries and exits.
- **QR Pre-Approval**: Seamless guest entry via resident-generated QR codes.
- **Security Dashboard**: Specialized mobile-optimized view for gate operations.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)
- **3D Visualization**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Backend (Spec)**: Node.js, Express, PostgreSQL, Prisma (Planned)

---

## 📂 Project Structure

```text
Urbanest/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Atoms & Molecules
│   │   ├── pages/          # Feature Pages (Dashboard, Residents, etc.)
│   │   ├── store/          # Zustand State Management & Mock Data
│   │   └── assets/         # Static Media & 3D Models
│   └── public/             # Public Assets
├── stitch_output/          # Design Documentation & Specs
└── Urbanest-Technical-Spec.md # Backend & API Architecture Spec
```

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Urbanest.git
   cd Urbanest
   ```
2. **Install Client Dependencies:**

   ```bash
   cd client
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 🗺️ Roadmap

- [x] High-fidelity UI Scaffolding
- [x] Secure Auth Flow (Login/Signup)
- [x] Interactive Resident Directory
- [ ] Backend Server Implementation (Node.js/Express)
- [ ] PostgreSQL Database Integration
- [ ] Razorpay Production Integration
- [ ] Real-time Notifications Setup

---

Developed by the Antigravity Team for Siddhesh.
