# Urbanest — Technical Specification
## Architecture, Stack & API Reference · v1.0

> This document is a technical annex to the Urbanest PRD v1.1. Read alongside it.

---

## Table of Contents
1. [Tech Stack](#1-tech-stack)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Integrations](#5-integrations)
6. [Project Structure](#6-project-structure)
7. [Environment & Deployment](#7-environment--deployment)

---

## 1. Tech Stack

### Why This Stack

Urbanest is built on a **full-JavaScript stack** — the same language runs on the frontend, backend, and in configuration files. This is the single most important decision for a beginner team: you only need to learn one language deeply instead of two.

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast dev server, massive ecosystem, component reuse across all 6 screens |
| **Styling** | Tailwind CSS v3 | Matches the PRD design tokens exactly; utility-first means no separate CSS files |
| **Backend** | Node.js + Express | Minimal boilerplate, same JS as frontend, thousands of tutorials |
| **Database** | PostgreSQL | Free, reliable, used in production by real companies; not a toy DB |
| **ORM** | Prisma | Writes SQL for you; auto-generates types; beginner-friendly migrations |
| **Auth** | JWT (jsonwebtoken) | Stateless, simple to implement, no session management needed |
| **QR Codes** | `qrcode` npm package | 3 lines of code to generate a QR PNG/SVG |
| **Payments** | Razorpay Node SDK | Official SDK, well-documented, test mode available |
| **Hosting** | Render.com | Free tier for both backend + PostgreSQL; no AWS/DevOps knowledge needed |
| **Version Control** | GitHub | Free, integrates with Render for auto-deploy on push |

### What You Are NOT Using (and Why)

| Skipped | Reason |
|---|---|
| Next.js | Adds complexity (SSR, routing conventions) that's unnecessary for an admin dashboard |
| MongoDB | Relational data (residents → invoices → payments) fits SQL far better |
| Docker | No prod infra requirement; adds setup overhead for beginners |
| Redis / queues | Overkill for MVP scale (< 500 residents per society) |
| TypeScript | Optional upgrade post-MVP; adds type safety but learning overhead now |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│                                                          │
│   React App (Vite)          Resident Mobile View         │
│   Admin Dashboard           (same React app, /resident   │
│   localhost:5173 / CDN      route, future scope)         │
└────────────────────┬────────────────────────────────────┘
                     │  HTTP/REST (JSON)
                     │  Authorization: Bearer <JWT>
┌────────────────────▼────────────────────────────────────┐
│                    API LAYER (Express)                   │
│                                                          │
│   /api/auth          /api/residents    /api/invoices     │
│   /api/complaints    /api/visitors     /api/notices      │
│   /api/payments      /api/qr                            │
│                                                          │
│   Middleware: authMiddleware, roleCheck, errorHandler    │
└────────────────────┬────────────────────────────────────┘
                     │  Prisma Client (ORM)
┌────────────────────▼────────────────────────────────────┐
│                  DATABASE LAYER                          │
│                                                          │
│   PostgreSQL (Render free tier)                         │
│   Tables: User, Flat, Resident, Invoice, Payment,       │
│           Complaint, Visitor, Notice                     │
└─────────────────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
┌─────────▼──────┐   ┌─────────▼───────────┐
│   Razorpay API │   │  qrcode (local pkg)  │
│   (payments)   │   │  (no external call)  │
└────────────────┘   └─────────────────────┘
```

### Request Lifecycle (example: Admin generates invoices)

```
1. Admin clicks "Generate Batch Invoices" in React UI
2. React sends: POST /api/invoices/generate  { month, baseAmount, dueDate }
   with header: Authorization: Bearer <admin_jwt_token>
3. Express authMiddleware verifies JWT → extracts { userId, role: "ADMIN" }
4. roleCheck confirms role === "ADMIN" (residents cannot hit this endpoint)
5. Invoice controller queries Prisma: find all active Flats for this society
6. Loop: create one Invoice record per flat, status = "UNPAID"
7. Return: { success: true, invoicesCreated: 148, totalAmount: 740000 }
8. React updates Dashboard KPI "Collection Rate" from the response
```

### User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full access to all screens and write operations |
| `SECURITY` | Visitor Log only (read + create entries) |
| `RESIDENT` | Future scope — read own invoices, raise complaints |

---

## 3. Database Schema

> Defined using Prisma Schema Language. Run `npx prisma migrate dev` to apply.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── USERS (Admin, Security, Resident accounts) ──────────────
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String   // bcrypt hash — never store plain text
  role       Role     @default(RESIDENT)
  name       String
  phone      String?
  createdAt  DateTime @default(now())

  resident   Resident?
  notices    Notice[]
}

enum Role {
  ADMIN
  SECURITY
  RESIDENT
}

// ── FLAT (the physical unit in the society) ──────────────────
model Flat {
  id         String    @id @default(uuid())
  number     String    @unique  // e.g. "A-101"
  floor      Int
  building   String              // e.g. "A Wing"
  isOccupied Boolean   @default(false)

  residents  Resident[]
  invoices   Invoice[]
  complaints Complaint[]
  visitors   Visitor[]
}

// ── RESIDENT (person living in a flat) ───────────────────────
model Resident {
  id         String       @id @default(uuid())
  userId     String       @unique
  user       User         @relation(fields: [userId], references: [id])
  flatId     String
  flat       Flat         @relation(fields: [flatId], references: [id])
  type       ResidentType @default(OWNER)
  moveInDate DateTime
  isActive   Boolean      @default(true)
  kycStatus  KycStatus    @default(PENDING)
}

enum ResidentType { OWNER  TENANT }
enum KycStatus    { PENDING VERIFIED }

// ── INVOICE (monthly maintenance bill per flat) ───────────────
model Invoice {
  id            String        @id @default(uuid())
  flatId        String
  flat          Flat          @relation(fields: [flatId], references: [id])
  month         String        // "2024-03" (YYYY-MM)
  baseAmount    Float
  lateFee       Float         @default(0)
  totalAmount   Float
  dueDate       DateTime
  status        InvoiceStatus @default(UNPAID)
  createdAt     DateTime      @default(now())

  payment       Payment?
}

enum InvoiceStatus { UNPAID  PENDING  PAID  OVERDUE }

// ── PAYMENT (Razorpay transaction record) ────────────────────
model Payment {
  id                String   @id @default(uuid())
  invoiceId         String   @unique
  invoice           Invoice  @relation(fields: [invoiceId], references: [id])
  razorpayOrderId   String   @unique
  razorpayPaymentId String?
  amount            Float
  status            String   @default("created")  // created | paid | failed
  paidAt            DateTime?
  createdAt         DateTime @default(now())
}

// ── COMPLAINT (helpdesk ticket) ──────────────────────────────
model Complaint {
  id          String          @id @default(uuid())
  flatId      String
  flat        Flat            @relation(fields: [flatId], references: [id])
  title       String
  description String
  category    ComplaintCategory
  priority    Priority        @default(MEDIUM)
  status      ComplaintStatus @default(OPEN)
  assignedTo  String?         // free text — vendor/staff name for MVP
  photoUrls   String[]        // array of image URLs
  notes       String?
  createdAt   DateTime        @default(now())
  resolvedAt  DateTime?
}

enum ComplaintCategory { PLUMBING  ELECTRICAL  HOUSEKEEPING  SECURITY  OTHER }
enum Priority          { LOW  MEDIUM  HIGH  URGENT }
enum ComplaintStatus   { OPEN  IN_PROGRESS  RESOLVED }

// ── VISITOR ──────────────────────────────────────────────────
model Visitor {
  id             String      @id @default(uuid())
  flatId         String
  flat           Flat        @relation(fields: [flatId], references: [id])
  name           String
  phone          String
  purpose        VisitorType
  qrToken        String?     @unique  // UUID used to generate QR
  isPreApproved  Boolean     @default(false)
  entryTime      DateTime?
  exitTime       DateTime?
  status         VisitStatus @default(EXPECTED)
  createdAt      DateTime    @default(now())
}

enum VisitorType { GUEST  DELIVERY  SERVICE  DOMESTIC_STAFF }
enum VisitStatus { EXPECTED  ON_CAMPUS  CHECKED_OUT  EXPIRED }

// ── NOTICE ───────────────────────────────────────────────────
model Notice {
  id          String         @id @default(uuid())
  authorId    String
  author      User           @relation(fields: [authorId], references: [id])
  title       String
  body        String
  category    NoticeCategory
  targetBlock String?        // null = all residents
  publishedAt DateTime       @default(now())
  viewCount   Int            @default(0)
  totalFlats  Int            @default(0)  // snapshot at publish time
}

enum NoticeCategory { GENERAL  MAINTENANCE  EVENT  EMERGENCY }
```

---

## 4. API Endpoints

> **Base URL:** `http://localhost:4000/api` (dev) · `https://urbanest-api.onrender.com/api` (prod)
>
> **Auth header required** on all routes except `/auth/*`:
> `Authorization: Bearer <token>`

---

### 4.1 Auth

| Method | Endpoint | Body | Response | Notes |
|---|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `{ token, user: { id, name, role } }` | Returns JWT |
| `POST` | `/auth/logout` | — | `{ success: true }` | Client deletes token |
| `GET` | `/auth/me` | — | `{ id, name, email, role }` | Verify current session |

---

### 4.2 Residents

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/residents` | `?search=&type=&building=` | `[Resident + User + Flat]` | Powers Resident Directory table |
| `GET` | `/residents/:id` | — | `{ resident, flat, complaints[], invoices[] }` | Slide-over panel data |
| `POST` | `/residents` | `{ name, email, phone, flatId, type, moveInDate }` | `{ resident }` | Creates User + Resident in one call |
| `PUT` | `/residents/:id` | `{ name, phone, type, kycStatus }` | `{ resident }` | Edit profile |
| `DELETE` | `/residents/:id` | — | `{ success: true }` | Soft delete — sets isActive = false |

---

### 4.3 Flats

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/flats` | `?building=&occupied=` | `[Flat + currentResident]` | Used in dropdowns |
| `GET` | `/flats/:id` | — | `{ flat, residents[], invoices[] }` | Flat detail |
| `POST` | `/flats` | `{ number, floor, building }` | `{ flat }` | Admin only |

---

### 4.4 Invoices

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/invoices` | `?month=&status=&flatId=` | `[Invoice + Flat + Resident]` | Finance table |
| `GET` | `/invoices/summary` | `?month=` | `{ totalExpected, totalCollected, unpaidCount, overdueCount }` | Dashboard KPI source |
| `GET` | `/invoices/:id` | — | `{ invoice, flat, payment }` | PDF preview data |
| `POST` | `/invoices/generate` | `{ month, baseAmount, dueDate, lateFeePercent }` | `{ invoicesCreated, totalAmount }` | **Bulk generate** — admin only |
| `PUT` | `/invoices/:id/status` | `{ status }` | `{ invoice }` | Manual status override |
| `POST` | `/invoices/:id/remind` | — | `{ success: true }` | Logs reminder (email/SMS in Phase 2) |

---

### 4.5 Payments (Razorpay)

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `POST` | `/payments/create-order` | `{ invoiceId }` | `{ razorpayOrderId, amount, currency, keyId }` | Step 1 — creates Razorpay order |
| `POST` | `/payments/verify` | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }` | `{ success, invoiceId }` | Step 2 — verify signature, mark invoice PAID |
| `GET` | `/payments/:invoiceId` | — | `{ payment }` | Get payment status for an invoice |

**Razorpay Payment Flow (detailed):**

```
Frontend                          Backend                       Razorpay
────────                          ───────                       ────────
Click "Pay Now"
  │
  ├──POST /payments/create-order──►
  │    { invoiceId }               Create order in Razorpay ──► POST /v1/orders
  │                                Store in Payment table    ◄── { order_id }
  │◄── { orderId, amount, keyId }
  │
  Open Razorpay Checkout modal
  (Razorpay's own UI — handles UPI,
   cards, netbanking automatically)
  │
  ◄── User completes payment ─────────────────────────────── Razorpay callback
  │   { razorpayPaymentId,
  │     razorpaySignature }
  │
  ├──POST /payments/verify ────────►
  │   { orderId, paymentId,         Verify HMAC signature
  │     signature }                 Update Invoice → PAID    ◄── Confirmed
  │◄── { success: true }
  │
  Refresh invoice list / KPI
```

---

### 4.6 Complaints

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/complaints` | `?status=&category=&priority=` | `[Complaint + Flat]` | Kanban + list data |
| `GET` | `/complaints/summary` | — | `{ openCount, inProgressCount, resolvedCount }` | Dashboard KPI |
| `GET` | `/complaints/:id` | — | `{ complaint, flat, resident }` | Ticket detail drawer |
| `POST` | `/complaints` | `{ flatId, title, description, category, priority, photoUrls[] }` | `{ complaint }` | Raise a ticket |
| `PUT` | `/complaints/:id` | `{ status, assignedTo, notes }` | `{ complaint }` | Update — drag-drop or drawer |

---

### 4.7 Visitors & QR

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/visitors` | `?status=&date=` | `[Visitor + Flat]` | Live log feed |
| `GET` | `/visitors/summary` | — | `{ onCampus, expectedToday, preApproved }` | Dashboard KPI |
| `POST` | `/visitors` | `{ flatId, name, phone, purpose, isPreApproved, expectedTime }` | `{ visitor, qrToken }` | Creates visitor + generates QR token |
| `GET` | `/visitors/qr/:qrToken` | — | `{ visitor + flat }` | Security scans QR → fetches details |
| `PUT` | `/visitors/:id/entry` | — | `{ visitor }` | Mark entry — sets entryTime + status = ON_CAMPUS |
| `PUT` | `/visitors/:id/exit` | — | `{ visitor }` | Mark exit — sets exitTime + status = CHECKED_OUT |
| `GET` | `/visitors/qr-image/:qrToken` | — | PNG image buffer | Returns scannable QR as a PNG — use as `<img src="...">` |

**QR Code Generation Flow:**

```
1. POST /visitors  →  backend creates Visitor record with a unique qrToken (UUID)
2. Backend returns { qrToken: "a1b2c3d4-..." }
3. Frontend calls: GET /visitors/qr-image/:qrToken
4. Backend uses the 'qrcode' npm package:
     const qr = require('qrcode')
     const imageBuffer = await qr.toBuffer(qrToken)
     res.set('Content-Type', 'image/png')
     res.send(imageBuffer)
5. Frontend renders it as: <img src="/api/visitors/qr-image/a1b2c3d4" />
6. Resident shares this QR image with their guest via WhatsApp
7. At gate: Security opens app → Scan tab → camera reads QR
8. App sends: GET /visitors/qr/a1b2c3d4  →  gets visitor info
9. Security taps "Confirm Entry" → PUT /visitors/:id/entry
```

---

### 4.8 Notices

| Method | Endpoint | Body / Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/notices` | `?category=` | `[Notice + author]` | Notice list panel |
| `GET` | `/notices/:id` | — | `{ notice, viewCount, totalFlats }` | Read receipt data |
| `POST` | `/notices` | `{ title, body, category, targetBlock }` | `{ notice }` | Publish — admin only |
| `PUT` | `/notices/:id/view` | — | `{ viewCount }` | Increment view count (called on open) |

---

## 5. Integrations

### 5.1 Razorpay Setup

**Step 1 — Create account:**
Go to [razorpay.com](https://razorpay.com) → Sign up → Dashboard → Settings → API Keys → Generate Test Keys.

**Step 2 — Install SDK:**
```bash
npm install razorpay
```

**Step 3 — Initialize in backend:**
```js
// src/config/razorpay.js
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,      // rzp_test_XXXX
  key_secret: process.env.RAZORPAY_KEY_SECRET,  // your secret
})

module.exports = razorpay
```

**Step 4 — Create an order (backend):**
```js
// src/controllers/payment.controller.js
const razorpay = require('../config/razorpay')
const crypto   = require('crypto')

exports.createOrder = async (req, res) => {
  const { invoiceId } = req.body
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })

  const order = await razorpay.orders.create({
    amount:   invoice.totalAmount * 100, // Razorpay uses paise (1 INR = 100 paise)
    currency: 'INR',
    receipt:  invoiceId,
  })

  await prisma.payment.create({
    data: { invoiceId, razorpayOrderId: order.id, amount: invoice.totalAmount }
  })

  res.json({ razorpayOrderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID })
}

exports.verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  // Verify the payment signature to confirm it came from Razorpay (not forged)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ error: 'Payment verification failed' })
  }

  // Signature valid — mark invoice as PAID
  const payment = await prisma.payment.update({
    where:  { razorpayOrderId },
    data:   { razorpayPaymentId, status: 'paid', paidAt: new Date() }
  })
  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data:  { status: 'PAID' }
  })

  res.json({ success: true, invoiceId: payment.invoiceId })
}
```

**Step 5 — Razorpay Checkout on frontend:**
```jsx
// src/components/PayInvoiceButton.jsx
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const loadRazorpay = () =>
  new Promise(resolve => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    document.body.appendChild(script)
  })

export default function PayInvoiceButton({ invoice }) {
  const { token } = useContext(AuthContext) // JWT from login, stored in AuthContext
  const handlePay = async () => {
    await loadRazorpay()

    // Step 1: get order from our backend
    const { razorpayOrderId, amount, keyId } = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ invoiceId: invoice.id }),
    }).then(r => r.json())

    // Step 2: open Razorpay modal (Razorpay handles all payment UI)
    const rzp = new window.Razorpay({
      key:         keyId,
      amount,
      currency:    'INR',
      order_id:    razorpayOrderId,
      name:        'Urbanest Society',
      description: `Maintenance – ${invoice.month}`,
      handler: async ({ razorpay_payment_id, razorpay_signature }) => {
        // Step 3: verify with our backend
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ razorpayOrderId, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }),
        })
        alert('Payment successful!')
      },
    })
    rzp.open()
  }

  return <button onClick={handlePay}>Pay ₹{invoice.totalAmount}</button>
}
```

> **Test Cards:** In Razorpay test mode, use card `4111 1111 1111 1111`, any future date, any CVV.

---

### 5.2 QR Code Generation

**Install:**
```bash
npm install qrcode
```

**Backend — QR image endpoint:**
```js
// src/routes/visitor.routes.js
const QRCode = require('qrcode')

router.get('/qr-image/:qrToken', async (req, res) => {
  const { qrToken } = req.params

  // Verify token exists in DB
  const visitor = await prisma.visitor.findUnique({ where: { qrToken } })
  if (!visitor) return res.status(404).json({ error: 'Invalid QR token' })

  // Generate QR as PNG buffer and stream it
  const buffer = await QRCode.toBuffer(qrToken, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#0F172A', light: '#FFFFFF' }
  })

  res.set('Content-Type', 'image/png')
  res.set('Cache-Control', 'public, max-age=86400') // cache for 1 day
  res.send(buffer)
})
```

**Frontend — display QR in visitor log:**
```jsx
// The img src directly hits the QR endpoint — the browser renders the PNG
<img
  src={`/api/visitors/qr-image/${visitor.qrToken}`}
  alt={`Entry QR for ${visitor.name}`}
  className="w-40 h-40 rounded-lg border border-slate-200"
/>
```

---

## 6. Project Structure

```
urbanest/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/            # Reusable UI (KpiCard, Badge, Table, Drawer)
│   │   ├── pages/                 # One file per screen
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Residents.jsx
│   │   │   ├── Finance.jsx
│   │   │   ├── Helpdesk.jsx
│   │   │   ├── VisitorLog.jsx
│   │   │   └── NoticeBoard.jsx
│   │   ├── hooks/                 # useAuth, useFetch
│   │   ├── context/               # AuthContext (stores JWT token)
│   │   ├── App.jsx                # Route definitions
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
└── server/                        # Express backend
    ├── src/
    │   ├── controllers/           # Logic per resource
    │   │   ├── auth.controller.js
    │   │   ├── resident.controller.js
    │   │   ├── invoice.controller.js
    │   │   ├── payment.controller.js
    │   │   ├── complaint.controller.js
    │   │   ├── visitor.controller.js
    │   │   └── notice.controller.js
    │   ├── routes/                # Express routers
    │   ├── middleware/
    │   │   ├── auth.middleware.js  # Verify JWT
    │   │   └── role.middleware.js  # Check ADMIN / SECURITY
    │   ├── config/
    │   │   └── razorpay.js
    │   └── index.js               # App entry — sets up Express, routes
    ├── prisma/
    │   ├── schema.prisma          # DB schema (Section 3)
    │   └── seed.js                # Sample data for development
    ├── .env                       # Secrets — never commit this
    └── package.json
```

---

## 7. Environment & Deployment

### Local Development Setup

```bash
# 1. Clone and install
git clone https://github.com/your-team/urbanest
cd urbanest/server && npm install
cd ../client && npm install

# 2. Set up environment variables
cp server/.env.example server/.env
# Fill in the values below

# 3. Run database migrations
cd server
npx prisma migrate dev --name init
npx prisma db seed       # loads sample society data

# 4. Start both servers (two terminals)
# Terminal 1 — Backend
cd server && npm run dev    # runs on localhost:4000

# Terminal 2 — Frontend
cd client && npm run dev    # runs on localhost:5173
```

### Environment Variables (`server/.env`)

```env
# Database (get from Render after creating a free PostgreSQL instance)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/urbanest"

# JWT — generate a random string: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_random_64_char_secret_here"
JWT_EXPIRES_IN="7d"

# Razorpay (from razorpay.com Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# App
PORT=4000
NODE_ENV=development
```

### Deploying to Render (Free Tier)

```
1. Push code to GitHub

2. Go to render.com → New → PostgreSQL
   → Name: urbanest-db
   → Copy the "External Database URL" into your .env

3. Go to render.com → New → Web Service
   → Connect GitHub repo → select /server folder
   → Build Command:  npm install && npx prisma migrate deploy
   → Start Command:  node src/index.js
   → Add environment variables (same as .env above)

4. Go to render.com → New → Static Site
   → Connect same GitHub repo → select /client folder
   → Build Command:  npm run build
   → Publish Directory: dist
   → Set VITE_API_URL env var to your backend Render URL

5. Done — both frontend and backend live on free Render URLs
   Total monthly cost: ₹0
```

### Package.json Scripts

```json
// server/package.json
{
  "scripts": {
    "dev":   "nodemon src/index.js",
    "start": "node src/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed":    "node prisma/seed.js",
    "db:studio":  "prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "razorpay": "^2.9.2",
    "qrcode": "^1.5.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "prisma": "^5.0.0"
  }
}
```

---

*Technical Spec: Urbanest v1.0*
*Paired with: Urbanest PRD v1.1*
*Stack: React + Node/Express + PostgreSQL + Prisma*
