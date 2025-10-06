# NexusPay - Secure International Payment Platform

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.2-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-green.svg)](https://vitejs.dev/)

NexusPay is a modern, secure React application for international payment processing through the SWIFT network. Built with enterprise-grade security and user experience in mind.

## ✨ Features

### 🔐 **Security First**
- **Authentication**: JWT Bearer tokens (Authorization header) with refresh handling
- **Input Validation**: Allowlist regex via Zod and shared utils
- **XSS Prevention**: Sanitization and strict MUI input controls
- **Rate Limiting UX**: Friendly messaging from API responses

### 💳 **International Payments**
- **Multi-Step Wizard**: Draft → Beneficiary → Review & Pay → Submit
- **Beneficiary Modes**: Saved, New, or One-time beneficiary
- **Staff Flow**: Pending verification queue, Verified (ready for SWIFT), and Submitted to SWIFT
- **Draft Management**: Delete Draft payments from the Payments page

### 👤 **User Experience**
- **Separate Pages**: `Payments` and `Beneficiaries` routes
- **Dashboard**: Live payment summary + staff analytics (Verified & Submitted)
- **Staff Portal**: Three sections with actions (verify, submit to SWIFT)
- **Profile**: Preferred currency saved to `localStorage` (`np_currency`)
- **Redirects**: After successful payment submit, navigate to `/payments`
- **Theme**: Global MUI fixes to keep labels shrunk and handle autofill

## 🚀 Tech Stack

- React 19 + TypeScript, Vite 7
- React Router v7, TanStack Query v5
- Redux Toolkit for auth/UI state
- Material-UI v7 with Emotion
- React Hook Form + Zod
- Axios client with auth interceptors

## 📱 Application Structure

```
src/
├── app/                 # Layout and nav
├── components/          # Reusable UI
│   └── forms/PaymentWizard
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── staff/           # Staff portal (pending + verified tables)
│   ├── Beneficiaries.tsx
│   ├── Profile.tsx
│   └── payments/        # Payments list and create
├── lib/                 # apiClient, validation
└── theme.ts             # MUI global overrides (label shrink, autofill)
```

## 🔒 Auth & API

- Tokens are kept in memory and initialized from `localStorage` on boot for continuity
- Axios attaches `Authorization: Bearer <accessToken>` automatically
- 401 handling clears token without forced logout in dev; no auto-redirect
- API base URL from `VITE_API_BASE_URL` (e.g. `http://localhost:5118/api/v1`)

## 📋 Key Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Summary table and analytics (customer vs staff views) |
| `/payments` | Payments list with Draft delete |
| `/payments/new` | Payment wizard |
| `/beneficiaries` | Manage beneficiaries (create/delete/list) |
| `/profile` | Preferred currency selection |
| `/staff` | Staff portal: Pending, Verified, Submitted to SWIFT |
| `/staff-login` | Staff login |

## 🧭 Payment Wizard

- Saved beneficiary pre-fills read-only identity fields; address and account number remain editable
- One-time beneficiary supported
- After submit, redirect to `/payments` and show success CTA

## 🎨 UI & Theming

- `theme.ts` enforces `MuiTextField` label shrink and autofill styling to prevent label overlap when pasting
- Clear primary/secondary button usage; beneficiaries CTA clarified on dashboard

## 🔧 Development

### Setup
```bash
cd nexuspay
 npm install
 npm run dev
```

### Env Vars
Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:5118/api/v1
VITE_MOCK_API=false
```

## 🔗 API Endpoints used

- Auth: `/auth/login`, `/auth/register`, `/auth/staff-login`
- Payments: `/payments` (list/create), `/payments/:id/submit`, `/payments/:id/verify`, `/payments/:id/submit-swift`
- Staff: `/payments/staff/queue`, `/payments/staff/verified`, `/payments/staff/swift`
- Beneficiaries: `/beneficiaries` (list/create/delete)

## 🧪 Staff Portal Flow

- Pending queue from `/payments/staff/queue`
- Verified table from `/payments/staff/verified`
- Submitted table from `/payments/staff/swift`
- Actions: Verify → moves to Verified; Submit to SWIFT → moves to Submitted

## 📚 Compliance

Refer to `../TASK_2_COMPLIANCE_ANALYSIS.md` for full Task 2 compliance mapping and security posture.

---

NexusPay delivers a secure, modern UX for international payments with clear customer and staff workflows aligned to Task 2 requirements.