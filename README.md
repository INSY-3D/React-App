# NexusPay Frontend - Secure International Payment Platform

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.2-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-green.svg)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.9.0-purple.svg)](https://redux-toolkit.js.org/)

NexusPay is a modern, enterprise-grade React application for secure international payment processing through the SWIFT network. Built with security, user experience, and compliance in mind.

---

## 🎯 Overview

NexusPay provides a comprehensive solution for managing international payments with separate workflows for customers and staff members. The platform features email-based OTP authentication, real-time payment tracking, PDF receipt generation, and a clean Material Design interface.

---

## ✨ Key Features

### 🔐 Security & Authentication

#### **Multi-Factor Authentication (MFA)**
- **Email-based OTP** - Secure one-time passwords sent via email for customer login
- **10-minute OTP expiry** - Time-limited codes for enhanced security
- **Flexible email handling** - Support for users with or without registered emails
- **Staff bypass** - Staff and admin users can login without OTP for streamlined access
- **JWT tokens** - Secure Bearer token authentication with automatic refresh
- **Session persistence** - Auth state survives page refreshes using localStorage
- **401 handling** - Automatic token refresh and graceful logout on expiry

#### **Input Security**
- **Client-side validation** - Zod schemas with allowlist regex patterns
- **XSS Prevention** - Input sanitization and strict MUI input controls
- **Type-safe forms** - React Hook Form with TypeScript integration
- **CSRF protection** - Token-based request validation

### 💳 International Payments

#### **Multi-Step Payment Wizard**
- **Step 1: Payment Details** - Amount, currency, reference, and purpose
- **Step 2: Beneficiary Selection** - Choose from saved, new, or one-time beneficiaries
- **Step 3: Review & Submit** - Comprehensive review before final submission
- **Draft management** - Save payments as drafts and resume later
- **Back navigation** - Navigate between wizard steps with back/cancel buttons
- **Smart validation** - Real-time form validation with helpful error messages

#### **Payment Tracking**
- **Status progression** - Draft → Pending → Verified → Submitted to SWIFT → Completed
- **Progress indicators** - Visual progress bars showing payment status
- **Timeline view** - Detailed timestamps for each status change
- **Payment details** - Comprehensive view of all payment information
- **PDF receipts** - Download professional, branded payment receipts
- **Search & filter** - Find payments quickly by status, amount, or date

#### **Beneficiary Management**
- **Saved beneficiaries** - Store frequently used beneficiary details
- **Quick selection** - Pre-fill payment forms with saved beneficiary data
- **CRUD operations** - Create, read, update, and delete beneficiaries
- **SWIFT/BIC validation** - Real-time validation of international bank codes
- **IBAN support** - Full support for IBAN account numbers
- **Address management** - Complete beneficiary address information

### 👥 Role-Based Workflows

#### **Customer Portal**
- **Dashboard** - Payment summary with quick stats and recent activity
- **Payment history** - Complete list of all payments with filtering
- **New payment** - Intuitive wizard for creating international payments
- **Beneficiaries** - Manage saved beneficiary accounts
- **Profile** - Update personal information and preferred currency
- **Receipt download** - Generate PDF receipts for completed payments

#### **Staff Portal**
- **Pending queue** - Payments awaiting verification with action buttons
- **Verified payments** - Approved payments ready for SWIFT submission
- **SWIFT submissions** - Payments submitted to the SWIFT network
- **Analytics dashboard** - Staff-specific metrics and statistics
- **Bulk actions** - Efficiently process multiple payments
- **Customer visibility** - View customer names and emails for support

### 📱 User Experience

#### **Modern Material Design**
- **Clean interface** - Google Material Design 3 components
- **Adaptive icons** - Consistent iconography throughout
- **Smooth transitions** - Framer Motion animations
- **Bottom sheets** - Mobile-friendly action panels
- **Responsive layout** - Works seamlessly on desktop, tablet, and mobile
- **Dark mode ready** - Theme switching capability (stored in localStorage)

#### **Navigation & Persistence**
- **Protected routes** - Role-based route guards for security
- **Auth persistence** - Login state survives page refreshes
- **Smart redirects** - Automatic navigation based on user role
- **Breadcrumbs** - Clear navigation hierarchy
- **Back buttons** - Easy navigation between views
- **No refresh loops** - Stable navigation without infinite redirects

#### **Notifications & Feedback**
- **Toast notifications** - Success, error, warning, and info messages
- **Loading states** - Clear loading indicators for async operations
- **Error boundaries** - Graceful error handling with recovery options
- **Form validation** - Real-time feedback on input errors
- **Confirmation dialogs** - Prevent accidental destructive actions

### 📄 PDF Receipt Generation

#### **Professional Receipts**
- **Branded design** - NexusPay logo and color scheme
- **Complete details** - All payment and beneficiary information
- **Transaction timeline** - Status changes with timestamps
- **Security features** - Transaction ID and generation timestamp
- **Professional footer** - Disclaimer and company information
- **Smart naming** - Files named with reference or transaction ID
- **One-click download** - Instant PDF generation and download

---

## 🚀 Tech Stack

### **Core Framework**
- **React 19** - Latest React with concurrent features
- **TypeScript 5.8** - Type-safe development with strict mode
- **Vite 7** - Lightning-fast build tool and dev server

### **UI & Styling**
- **Material-UI v7** - Comprehensive component library
- **Emotion** - CSS-in-JS styling solution
- **Framer Motion 12** - Smooth animations and transitions
- **Inter Font** - Modern, professional typography

### **State Management**
- **Redux Toolkit 2.9** - Global state for auth and UI
- **TanStack Query v5** - Server state management and caching
- **React Hook Form 7** - Performant form state management

### **Routing & Navigation**
- **React Router v7** - Client-side routing with data loading
- **Protected routes** - Role-based access control
- **Public-only routes** - Redirect authenticated users

### **Data & Validation**
- **Zod 4** - TypeScript-first schema validation
- **Axios 1.12** - HTTP client with interceptors
- **DOMPurify 3** - XSS protection and sanitization

### **PDF Generation**
- **jsPDF** - Client-side PDF generation
- **Custom templates** - Branded receipt layouts

---

## 📂 Application Structure

```
nexuspay/
├── src/
│   ├── app/                        # Application shell
│   │   ├── AppLayout.tsx           # Main layout with navigation
│   │   ├── ProtectedRoute.tsx      # Auth-required route wrapper
│   │   └── PublicOnlyRoute.tsx     # Redirect if authenticated
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── AuthProvider.tsx        # Auth state initialization
│   │   ├── ErrorBoundary.tsx       # Error catching and recovery
│   │   ├── NotificationsProvider.tsx # Toast notification system
│   │   └── forms/
│   │       └── PaymentWizard/      # Multi-step payment wizard
│   │           ├── PaymentWizard.tsx
│   │           ├── Step1Payment.tsx
│   │           ├── Step2Beneficiary.tsx
│   │           └── Step3Review.tsx
│   │
│   ├── pages/                      # Page components
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── Login.tsx           # Customer login with OTP
│   │   │   ├── Register.tsx        # Customer registration
│   │   │   └── StaffLogin.tsx      # Staff login (no OTP)
│   │   │
│   │   ├── dashboard/              # Dashboard views
│   │   │   └── Dashboard.tsx       # Role-based dashboard
│   │   │
│   │   ├── payments/               # Payment management
│   │   │   ├── NewPayment.tsx      # Payment wizard container
│   │   │   ├── PaymentDetail.tsx   # Payment details with PDF
│   │   │   └── Payments.tsx        # Payment list
│   │   │
│   │   ├── staff/                  # Staff portal
│   │   │   └── StaffPortal.tsx     # Pending/Verified/SWIFT queues
│   │   │
│   │   ├── Beneficiaries.tsx       # Beneficiary management
│   │   ├── Cards.tsx               # Card management (future)
│   │   ├── Home.tsx                # Landing page
│   │   └── Profile.tsx             # User profile settings
│   │
│   ├── lib/                        # Utility libraries
│   │   ├── apiClient.ts            # Axios instance with auth
│   │   ├── validation.ts           # Shared validation schemas
│   │   └── utils.ts                # Helper functions
│   │
│   ├── store/                      # Redux store
│   │   ├── index.ts                # Store configuration
│   │   └── authSlice.ts            # Auth state slice
│   │
│   ├── routes/                     # Route configuration
│   │   └── guards.tsx              # Route protection logic
│   │
│   ├── theme.ts                    # MUI theme customization
│   ├── main.tsx                    # Application entry point
│   └── App.tsx                     # Root component with routes
│
├── public/                         # Static assets
├── dist/                           # Production build output
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
└── README.md                       # This file
```

---

## 🔧 Development Setup

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm 8+ or yarn 1.22+
- **NexusPay API running** (separate repository - must be started first)

### **Installation**

1. **Navigate to the project directory**
   ```bash
   cd REACT-APP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment configuration**
   
   Create a `.env` file in the `REACT-APP` directory:
   ```env
   # HTTPS API (if API has SSL certificates)
   VITE_API_BASE_URL=https://localhost:5118/api/v1
   VITE_MOCK_API=false
   ```
   
   **OR** use HTTP if API doesn't have certificates:
   ```env
   VITE_API_BASE_URL=http://localhost:5118/api/v1
   VITE_MOCK_API=false
   ```
   
   **See `ENV_SETUP.md` for detailed instructions!**

5. **Start the API server** (in separate terminal)
   ```bash
   # Navigate to API directory
   cd node-API
   
   # Start API server
   npm run dev
   ```
   
   **Important:** 
   - The React app requires the NexusPay API to be running first
   - If API uses HTTPS, visit `https://localhost:5118/health` and accept the certificate
   - See `HTTPS_SETUP.md` for detailed connection guide

6. **Start React development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Build for Production**

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

---

## 🔒 Authentication Flow

### **Customer Login (with OTP)**
1. User enters username/email, account number, and password
2. System validates credentials
3. If valid and user has registered email:
   - OTP sent to registered email
   - User enters OTP to complete login
4. If valid but no registered email:
   - Email input field appears
   - User enters email address
   - OTP sent to provided email
   - User enters OTP to complete login
5. JWT tokens stored in localStorage
6. User redirected to dashboard

### **Staff Login (no OTP)**
1. Staff enters username/email, account number, and password
2. System validates credentials
3. OTP step skipped for staff/admin roles
4. JWT tokens stored in localStorage
5. Staff redirected to staff portal

### **Session Persistence**
- `AuthProvider` checks localStorage on app load
- Validates stored token with API `/auth/me` endpoint
- Restores user session if token valid
- Clears auth data if token invalid/expired
- No infinite refresh loops due to initialization flag

### **Logout**
- Clears Redux auth state
- Removes tokens from localStorage
- Clears API client auth headers
- Redirects to login page

---

## 📋 Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public only | Customer login with email OTP |
| `/register` | Public only | Customer registration |
| `/staff-login` | Public only | Staff login (no OTP required) |
| `/` | Protected | Home/landing page |
| `/dashboard` | Protected | Role-based dashboard with analytics |
| `/payments` | Protected | Payment list with search and filters |
| `/payments/new` | Protected | Multi-step payment creation wizard |
| `/payments/:id` | Protected | Payment details with PDF download |
| `/payments/:id/edit` | Protected | Edit draft payment (reuses wizard) |
| `/beneficiaries` | Protected | Beneficiary management (CRUD) |
| `/profile` | Protected | User profile and settings |
| `/staff` | Staff only | Staff portal with verification queues |
| `/cards` | Protected | Card management (future feature) |
| `/session-timeout` | Public | Session expiry notification |
| `/*` | Public | 404 error page |

---

## 🎨 UI Components & Theming

### **Material-UI Customization**
- **Global theme** - Consistent colors, typography, and spacing
- **TextField overrides** - Automatic label shrinking for autofill compatibility
- **Button variants** - Clear primary/secondary/outlined hierarchy
- **Icon integration** - Material Icons throughout
- **Responsive breakpoints** - Mobile-first responsive design

### **Color Palette**
- **Primary** - Blue (#1976d2) - Actions, links, important elements
- **Secondary** - Gray (#757575) - Labels, helper text
- **Success** - Green - Completed payments, success messages
- **Warning** - Orange - Pending status, warnings
- **Error** - Red - Failed payments, error messages
- **Info** - Light blue - Informational messages

### **Typography**
- **Font family** - Inter Variable (modern, clean, professional)
- **Headings** - Bold, large for clear hierarchy
- **Body text** - Regular weight, comfortable reading size
- **Monospace** - Courier for codes (SWIFT, IBAN, account numbers)

---

## 🔗 API Integration

### **API Client (`lib/apiClient.ts`)**
- Axios instance with base URL from environment
- Automatic `Authorization: Bearer <token>` header injection
- Request interceptors for CSRF tokens
- Response interceptors for 401 handling
- Automatic token refresh on expiry
- Error normalization and logging

### **Endpoints Used**

#### **Authentication**
- `POST /auth/register` - Register new customer account
- `POST /auth/login` - Customer login (triggers OTP)
- `POST /auth/staff-login` - Staff login (no OTP)
- `POST /auth/send-otp` - Manually send OTP to email
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Validate token and get user info
- `POST /auth/logout` - Logout and invalidate tokens

#### **Payments**
- `GET /payments` - List user's payments with pagination
- `POST /payments` - Create draft payment
- `GET /payments/:id` - Get payment details
- `PUT /payments/:id/beneficiary` - Update beneficiary info
- `POST /payments/:id/submit` - Submit payment for verification
- `DELETE /payments/:id` - Delete draft payment
- `GET /payments/staff/queue` - Get pending verification queue (staff)
- `GET /payments/staff/verified` - Get verified payments (staff)
- `GET /payments/staff/swift` - Get SWIFT submissions (staff)
- `POST /payments/:id/verify` - Verify or reject payment (staff)
- `POST /payments/:id/submit-swift` - Submit to SWIFT network (staff)

#### **Beneficiaries**
- `GET /beneficiaries` - List user's saved beneficiaries
- `POST /beneficiaries` - Create new beneficiary
- `DELETE /beneficiaries/:id` - Delete beneficiary

---

## 🧭 Payment Workflow

### **Customer Journey**

1. **Create Payment**
   - Click "New Payment" from dashboard or payments page
   - Enter payment details (amount, currency, reference, purpose)
   - Payment saved as draft after Step 1

2. **Select Beneficiary**
   - Choose from saved beneficiaries (pre-fills fields)
   - Or enter new beneficiary details
   - Or use one-time beneficiary (not saved)
   - Validate SWIFT/BIC and account details

3. **Review & Submit**
   - Review all payment details
   - Make final edits if needed
   - Submit payment for staff verification
   - Receive confirmation and redirect to payments list

4. **Track Status**
   - View payment in payments list
   - Click to see detailed status
   - Download PDF receipt when completed
   - Contact support if issues arise

### **Staff Workflow**

1. **Pending Queue**
   - View all submitted payments awaiting verification
   - Review customer and payment details
   - Verify legitimate payments
   - Reject fraudulent or incorrect payments

2. **Verified Payments**
   - View all verified payments ready for SWIFT
   - Submit payments to SWIFT network
   - Track submission status

3. **SWIFT Submissions**
   - Monitor payments submitted to SWIFT
   - View completion status
   - Handle any SWIFT errors or rejections

---

## 📊 State Management

### **Redux (Global State)**
- **Auth slice** - User authentication state
  - `isAuthenticated` - Boolean authentication status
  - `user` - Current user object (id, name, email, role)
  - `isFirstLogin` - Flag for first-time login flow
- **Persistence** - Auth state persists to localStorage
- **Actions** - loginSuccess, logout, hydrateAuth

### **React Query (Server State)**
- **Automatic caching** - Reduces unnecessary API calls
- **Background refetching** - Keeps data fresh
- **Optimistic updates** - Immediate UI feedback
- **Query keys** - Organized by entity (payments, beneficiaries, etc.)
- **Mutation handling** - Creates, updates, deletes with cache invalidation

### **Local Component State**
- **Form state** - React Hook Form for performance
- **UI state** - Loading, modals, drawer states
- **Temporary data** - Wizard progress, filters, search

---

## 🧪 Testing

### **Manual Testing**
```bash
# Start dev server
npm run dev

# Test customer login with OTP
# Test staff login without OTP
# Create payment through wizard
# Verify payment as staff
# Download PDF receipt
```

### **Test Users** (from seeded database)
```
Customer:
- Email: customer@nexuspay.dev
- Account: 12345678
- Password: Customer123!

Staff:
- Email: staff@nexuspay.dev
- Account: 87654321
- Password: Staff123!

Admin:
- Email: admin@nexuspay.dev
- Account: 11111111
- Password: Admin123!
```

---

## 🚀 Deployment

### **Production Build**
```bash
# Build for production
npm run build

# Output in dist/ directory
# Serve with any static hosting (Netlify, Vercel, AWS S3, etc.)
```

### **Environment Variables for Production**
```env
VITE_API_BASE_URL=https://api.nexuspay.com/api/v1
VITE_MOCK_API=false
```

### **Hosting Options**
- **Vercel** - Automatic deployments from Git
- **Netlify** - Simple drag-and-drop or Git integration
- **AWS S3 + CloudFront** - Scalable CDN hosting
- **Azure Static Web Apps** - Microsoft cloud hosting
- **GitHub Pages** - Free hosting for public repos

### **Pre-Deployment Checklist**
- [ ] Update API base URL to production endpoint
- [ ] Test all authentication flows
- [ ] Verify payment creation and submission
- [ ] Test PDF receipt generation
- [ ] Check responsive design on mobile
- [ ] Validate HTTPS/TLS configuration
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Test performance with Lighthouse
- [ ] Verify accessibility (WCAG compliance)

---

## 📚 Additional Documentation

### Frontend Documentation
- This README - React app setup and features

### Backend Documentation (Separate Repository)
- **API README** - Backend setup and configuration
- **SSL/TLS Setup** - HTTPS certificate generation
- **SMTP Setup** - Email/OTP configuration
- **Compliance Analysis** - Security compliance report

**Note:** The NexusPay API is in a separate repository and must be running for this frontend to work.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow code style** - TypeScript strict mode, ESLint rules
4. **Write tests** - Ensure new features are tested
5. **Commit with clear messages** - Descriptive commit messages
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** - Describe your changes clearly

---

## 📄 License

This project is proprietary software developed for NexusPay. All rights reserved.

---

## 🆘 Support

For help and support:
- **Documentation** - Check this README and related docs
- **Issues** - Create a GitHub issue with details
- **Email** - Contact development team at dev@nexuspay.com
- **Slack** - Join #nexuspay-frontend channel (internal)

---

## 🔄 Changelog

### **v1.3.1** (Latest)
- ✅ **Updated README** - Clarified API dependency and setup
- ✅ **HTTPS support** - Updated to work with API's SSL/TLS certificates
- ✅ **Documentation improvements** - Clearer installation instructions

### **v1.3.0**
- ✅ Added PDF receipt download with professional branding
- ✅ Implemented email-based OTP authentication for customers
- ✅ Added staff OTP bypass for streamlined access
- ✅ Fixed navigation and auth persistence on page refresh
- ✅ Added back buttons to payment wizard and details
- ✅ Improved loading states and error handling

### **v1.2.0**
- ✅ Implemented multi-step payment wizard with draft saving
- ✅ Added beneficiary management (CRUD operations)
- ✅ Created staff portal with verification queues
- ✅ Added dashboard with role-based views
- ✅ Implemented payment status tracking

### **v1.1.0**
- ✅ Built authentication system with JWT
- ✅ Created protected route guards
- ✅ Implemented Material-UI theme
- ✅ Added Redux for state management
- ✅ Set up React Query for API calls

### **v1.0.0**
- ✅ Initial project setup with React 19 + TypeScript + Vite
- ✅ Basic routing with React Router v7
- ✅ Material-UI integration
- ✅ API client configuration

---

**NexusPay** - Delivering secure, modern international payments with exceptional user experience. 🚀
