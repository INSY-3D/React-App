# 💻 NexusPay Frontend — Secure International Payment Platform

# Members

* Dean ST10326084
* Matthew ST10257002
* Musa ST10293362
* Fortune ST10187287


### 📘 About This Project

NexusPay Frontend is a **React + TypeScript web application** that connects to the secure NexusPay API to simulate international payment processing. It demonstrates strong **security**, **usability**, and **Task 2 compliance** by providing a realistic front-end banking experience.

It uses **Material UI**, **Redux Toolkit**, and **Vite** for a clean, fast, and modern interface.

---

## 🎯 Purpose

This web app simulates how customers and staff members would interact with a secure payment system. The goal is to demonstrate:

* Proper frontend authentication (JWT, session persistence)
* Multi-step payment creation and verification
* Clear role separation (customer vs staff)
* A polished, user-friendly interface for marking and testing

---

## ✨ Main Features (Simplified)

### 🔐 Secure Authentication

| Feature                 | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| **JWT Login**           | Login with email, account number, and password         |
| **Session Persistence** | Keeps user logged in via localStorage                  |
| **Protected Routes**    | Only accessible with valid tokens                      |
| **Auto Logout**         | Logs out on token expiry or API failure                |
| **Input Validation**    | Prevents XSS or malformed inputs using Zod + DOMPurify |

### 💳 Payment Management

| Step                            | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| 1️⃣ **Create Draft**            | Enter payment details (amount, currency, purpose)  |
| 2️⃣ **Add Beneficiary**         | Select or add recipient details                    |
| 3️⃣ **Submit for Verification** | Customer sends payment for staff approval          |
| 4️⃣ **Staff Review**            | Approve or reject pending payments                 |
| 5️⃣ **Completion**              | Payment marked as completed after SWIFT submission |

### 👥 Role-Based Dashboards

* **Customers** can: create, track, and view payments.
* **Staff** can: view pending, verified, and SWIFT-submitted payments.
* **Admins** can: monitor all transactions.

### 🧾 PDF Receipts

* Generates branded payment receipts.
* Includes transaction details, dates, and security tags.
* Ready for download or print.

---

## ⚙️ Setup Instructions (Step-by-Step)

### 🪜 Step 1 — Prerequisites

* Node.js 18+ (LTS)
* npm or yarn
* NexusPay API running locally

### 🪜 Step 2 — Installation

```bash
cd nexuspay
npm install
```

### 🪜 Step 3 — Configure Environment

```bash
cp .env.example .env
```

Edit the `.env` file (HTTPS recommended; matches backend SSL setup in `node-API/SETUP_SSL_DEV.md`):

```env
# For HTTPS API (recommended for development)
VITE_API_BASE_URL=https://localhost:5118/api/v1

# For HTTP API (if not using SSL)
VITE_API_BASE_URL=http://localhost:5118/api/v1

VITE_MOCK_API=false
```

**📌 Note:** If using HTTPS (recommended), ensure you generated and trusted the dev SSL certs in the backend. Otherwise you will see `ERR_CERT_AUTHORITY_INVALID` until the CA is trusted.

### 🪜 Step 4 — Run Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:5173
```

### 🪜 Step 5 — Build for Production

```bash
npm run build
npm run preview
```

---

## 🧭 Navigation Overview

| Section          | Role     | Description                   |
| ---------------- | -------- | ----------------------------- |
| `/login`         | Customer | Login with credentials        |
| `/register`      | Customer | Register new user             |
| `/staff-login`   | Staff    | Staff login (no OTP)          |
| `/admin-login`   | Admin    | Admin login (no OTP)          |
| `/dashboard`     | All      | Role-based dashboards         |
| `/payments`      | Customer | Payment history               |
| `/payments/new`  | Customer | New payment wizard            |
| `/staff`         | Staff    | Pending/verified/SWIFT queues |
| `/admin`         | Admin    | Staff management dashboard    |
| `/beneficiaries` | Customer | Manage saved recipients       |
| `/profile`       | All      | Update personal info          |

---

## 🧠 How It Works (Simplified Logic)

### 1️⃣ Authentication Flow

* Login → JWT created → Stored in localStorage.
* On refresh → `AuthProvider` validates token via `/auth/me`.
* Expired tokens → auto logout + redirect to login.

### 2️⃣ Payment Flow

```
Draft → Pending → Verified → Submitted to SWIFT → Completed
```

Customers see progress visually; staff control verification.

### 3️⃣ PDF Generation

* jsPDF renders receipts with NexusPay branding.
* Automatically includes timestamps and transaction IDs.

---

## 🎨 Design Principles

* **Material Design 3 (MUI)** — clean, professional interface.
* **Responsive Layout** — adapts for desktop, tablet, and mobile.
* **Light/Dark Mode** — theme stored in localStorage.
* **Accessible Typography** — Inter font for clear readability.
* **Visual Feedback** — Toasts, modals, and loading states for every action.

---

## 📊 Tech Stack

| Category             | Tools                                      |
| -------------------- | ------------------------------------------ |
| **Framework**        | React 19, TypeScript 5.8, Vite 7           |
| **UI/UX**            | Material-UI v7, Framer Motion, Emotion CSS |
| **State Management** | Redux Toolkit 2.9, React Query 5           |
| **Routing**          | React Router v7                            |
| **Validation**       | Zod + DOMPurify                            |
| **PDF**              | jsPDF (client-side receipts)               |

---

## 📂 Folder Structure (Simplified)

```
nexuspay/
├── src/
│   ├── app/              # App layout & routing
│   ├── pages/            # Page components
│   ├── components/       # Reusable UI elements
│   ├── lib/              # API clients and utilities
│   ├── store/            # Redux slices
│   ├── theme.ts          # MUI theming
│   ├── main.tsx          # Entry point
│   └── App.tsx           # Root component
└── public/               # Static assets
```

---

## 🧪 Test Users (from backend seed)

```
Customer: test@nexuspay.dev   / TestPass123!
Staff:    staff@nexuspay.dev  / StaffPass123!
Admin:    admin@nexuspay.dev  / AdminPass123!
```

Use these credentials to log in and explore the full app flow.

---

## 🔒 Security Overview (for Markers)

| Principle              | Implementation                   |
| ---------------------- | -------------------------------- |
| **Authentication**     | JWT tokens with refresh handling |
| **Transport Security** | HTTPS via API TLS 1.3 connection |
| **Data Validation**    | Client-side schema validation    |
| **Input Protection**   | DOMPurify + MUI field controls   |
| **Error Handling**     | Global error boundaries & toasts |
| **Access Control**     | Role-based protected routes      |

---

## 🚀 Deployment Options

```bash
# Build production-ready app
npm run build

# Serve locally
npm run preview
```

Can be hosted on **Vercel**, **Netlify**, or any static host. Update `VITE_API_BASE_URL` to the live API endpoint.

---

## 🧾 Summary for Markers

This frontend:

* Demonstrates **secure, role-based payment workflows**
* Follows **Task 2 security and UX requirements**
* Integrates cleanly with the NexusPay backend
* Offers a clear, testable structure for marking

All major security and usability features are present and functional.

