# আমার অনুষ্ঠান (Amar Onushthan) — University Student Event Management System

An enterprise-grade, full-stack **University Student Event Management SaaS Platform** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Lucide Icons**, and **MongoDB (Mongoose)**.

---

## 🌟 Key Platform Features

1. **Role-Based Access Control (RBAC)**:
   - **Student**: Discover events, register with student ID, generate digital QR tickets, view attendance status, download certificates, submit feedback, join clubs.
   - **Event Organizer**: Create events, configure speakers and agendas, live camera & manual QR code check-in scanner, attendee management, CSV export, certificate issuance.
   - **Club Admin**: Club profile management, member rosters, club event scheduling, announcements.
   - **University Admin**: Full control tower, event approval workflow (Approve/Reject with reasons), user moderation & role changes, KPI reports, audit trail inspection.

2. **Smart Event Discovery & Booking Engine**:
   - Multi-facet filters (Category pills, Department, Free/Paid, Upcoming/Popular/Deadline sorting).
   - Real-time seat capacity tracking with progress bars.
   - Priority waitlist management with **automatic waitlist promotion** upon cancellation.

3. **Digital QR Code Ticket Pass & Mobile Payment**:
   - Unique Ticket IDs (`REG-2026-XXXX`) with high-resolution scannable QR codes.
   - Realistic mobile banking checkout simulation for **bKash**, **Nagad**, and **Rocket**.
   - Printable & PDF-ready event passes with celebration confetti.

4. **Live Entrance Scanner & Attendance Manager**:
   - Real-time QR validation preventing duplicate check-ins.
   - Attendee tracking with live attendance rate calculations and CSV export.

5. **Official Certificates & Public Verification**:
   - Automated digital certificate generation for verified attendees.
   - Unique Certificate Numbers (`CERT-UNIV-2026-XXXX`).
   - Public Verification Portal at `/certificates/verify/[certificateNumber]`.

6. **Design Aesthetics & Theming**:
   - Seamless **Dark & Light Mode** toggle.
   - Smooth **Framer Motion** micro-interactions.
   - Bengali & English blended typography (Hind Siliguri / Inter).
   - Fully responsive for mobile, tablet, and desktop viewports.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js 18.17.0+ installed
- MongoDB connection string (already configured in `.env.local`)

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Seed Accounts (Pre-configured)

Use the top navigation bar's **One-Click Role Switcher** or log in manually with the seeded credentials:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **University Admin** | `admin@university.edu` | `password123` | Prof. Dr. Shahidul Islam |
| **Event Organizer** | `organizer@university.edu` | `password123` | Tanvir Ahmed |
| **Club Admin** | `club@university.edu` | `password123` | Sadia Afrin |
| **Student** | `student@university.edu` | `password123` | Imran Hossain (`ID: 2024-1-60-001`) |

> **Tip:** You can click the **"MongoDB সিড করুন"** button on the hero banner or make a `POST /api/seed` request to re-populate the live MongoDB Atlas database with fresh sample events, registrations, certificates, and audit logs.

---

## 📡 REST API Directory

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/seed` | Populate database with realistic university dataset |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT cookie session |
| `POST` | `/api/auth/register` | Register new student account with student profile |
| `GET` | `/api/auth/me` | Fetch active user session profile |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/events` | Filtered event discovery with search, category, dept, fee |
| `POST` | `/api/events` | Create new event (Admin=published, Organizer=pending approval) |
| `PUT` | `/api/events/[id]/status` | Approve, reject with reason, cancel, or publish event |
| `GET` | `/api/registrations` | Get student registrations or event attendee roster |
| `POST` | `/api/registrations` | Register student, check capacity, generate QR pass |
| `DELETE` | `/api/registrations/[id]` | Cancel registration & auto-promote next waitlisted student |
| `GET` | `/api/attendance` | Attendee statistics & live check-in list |
| `POST` | `/api/attendance/verify-qr` | Scan & verify student QR code pass at entrance |
| `GET` | `/api/certificates` | Get certificates or batch issue for event |
| `GET` | `/api/certificates/verify/[number]` | Public tamper-proof certificate authenticity verification |
| `GET` | `/api/clubs` | Student clubs directory |
| `GET` | `/api/admin/users` | Admin user moderation & role switcher |
| `GET` | `/api/admin/reports` | KPI statistics & department demographic charts |
| `GET` | `/api/admin/audit-logs` | Security audit trail |

---

## 🛡️ Security & Architecture

- **Password Security**: Passwords hashed with `bcryptjs` with salt rounds.
- **Role Verification**: Server-side authorization checks on all mutating API routes.
- **Tamper-proof Passes**: QR passes contain encoded reference tokens without exposing sensitive credentials.
- **Duplicate Prevention**: Database indexes and pre-check validation prevent duplicate registrations and check-ins.
- **Audit Logging**: All critical events (approvals, role adjustments, check-ins) are recorded in the `AuditLog` collection.
