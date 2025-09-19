# NexusPay - Secure International Payment Platform

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.2-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-green.svg)](https://vitejs.dev/)

NexusPay is a modern, secure React application for international payment processing through the SWIFT network. Built with enterprise-grade security and user experience in mind.

## ✨ Features

### 🔐 **Security First**
- **Input Validation**: RegEx allowlist validation for all user inputs
- **CSRF Protection**: Automatic CSRF token handling for secure requests
- **XSS Prevention**: DOMPurify sanitization and Content Security Policy
- **Authentication**: JWT-based authentication with refresh token rotation
- **Rate Limiting**: Client-side rate limit feedback and progressive delays

### 💳 **International Payments**
- **Multi-Step Wizard**: Intuitive payment creation with progress tracking
- **SWIFT Integration**: Real-time SWIFT/BIC code validation
- **IBAN Support**: Advanced IBAN validation with checksum verification
- **Currency Support**: Multi-currency payments (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, ZAR, SEK)
- **Real-time Validation**: Instant feedback on payment details

### 👤 **User Experience**
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Personalized Dashboard**: Welcome messages based on user status
- **Payment History**: Comprehensive payment tracking and status updates
- **Profile Management**: User account management with conditional logout
- **Dark Mode**: Automatic dark/light theme support

### 🎨 **Design System**
- **Material-UI**: Consistent component library implementation
- **Custom Theme**: Sky Blue (#3B82F6) and Mint Green (#34D399) brand colors
- **Typography**: Inter variable font for optimal readability
- **Accessibility**: WCAG-compliant color contrast and semantic markup

## 🚀 Tech Stack

- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.2 for fast development and optimized builds
- **Routing**: React Router v7 with protected route guards
- **State Management**: Redux Toolkit + React Query for optimal state handling
- **Styling**: Material-UI with Emotion CSS-in-JS
- **Forms**: Zod validation with real-time feedback
- **HTTP Client**: Axios with interceptors for authentication and error handling
- **Icons**: Material Icons with SVG optimization

## 📱 Application Structure

```
src/
├── 📁 app/                 # App layout and configuration
├── 📁 components/          # Reusable UI components
│   ├── 📁 forms/          # Form components and wizards
│   └── 📁 common/         # Shared components
├── 📁 pages/              # Route-based page components
│   ├── 📁 auth/           # Authentication pages
│   ├── 📁 dashboard/      # User dashboard
│   ├── 📁 payments/       # Payment-related pages
│   └── 📁 staff/          # Staff portal
├── 📁 lib/                # Utility libraries
├── 📁 store/              # Redux state management
├── 📁 routes/             # Route guards and configuration
└── 📁 theme/              # Design system and themes
```

## 🛡️ Security Features

### Authentication & Authorization
- JWT access tokens with automatic refresh
- Secure session management with device detection
- Progressive login attempt delays
- Multi-factor authentication support

### Input Security
- Client-side allowlist validation using RegEx patterns
- Server-side validation enforcement
- XSS protection with DOMPurify sanitization
- CSRF token automatic inclusion

### Data Protection
- No sensitive data stored in localStorage
- Account number masking in UI
- PII data protection in transit
- Secure API communication over HTTPS

## 📋 Available Routes

| Route | Description | Access |
|-------|-------------|---------|
| `/` | Landing page with app overview | Public |
| `/login` | User authentication | Public |
| `/register` | New user registration | Public |
| `/dashboard` | User dashboard with personalized welcome | Protected |
| `/payments` | Payment management overview | Protected |
| `/payments/new` | International payment wizard | Protected |
| `/profile` | User profile and account settings | Protected |
| `/staff` | Staff portal for payment verification | Protected (Staff) |

## 🎯 Payment Wizard Features

### Step 1: Payment Details
- Amount validation with currency selection
- Payment reference and purpose
- Real-time input validation

### Step 2: Beneficiary Information
- Beneficiary bank details
- SWIFT/BIC code validation
- IBAN validation with checksum
- International address support

### Step 3: Review & Submit
- Comprehensive payment review
- Data masking for security
- Idempotency key generation
- Clear submission feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES2022 support

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd nexuspay

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5118
VITE_MOCK_API=false
```

## 🏗️ Build & Deployment

### Production Build
```bash
npm run build
```

### Build Features
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Dynamic imports for optimal loading
- **Asset Optimization**: Compressed and optimized static assets
- **TypeScript Compilation**: Full type checking and compilation

### Bundle Analysis
The build process creates an optimized bundle with:
- Efficient chunk splitting for better caching
- Compressed assets for faster loading
- Source maps for debugging (development only)

## 🔧 Development

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **File Organization**: Feature-based directory structure

### State Management
- **Redux Toolkit**: For application state (authentication, UI state)
- **React Query**: For server state management and caching
- **Local State**: React hooks for component-specific state

### Form Handling
- **Zod**: Schema validation with TypeScript inference
- **Real-time Validation**: Instant feedback on user input
- **Error Handling**: Comprehensive error states and messaging

## 🎨 Design System

### Color Palette
- **Primary**: Sky Blue (#3B82F6)
- **Secondary**: Mint Green (#34D399)
- **Background**: Soft White (#F9FAFB)
- **Surface**: Light Gray (#E5E7EB)
- **Text**: Charcoal (#1F2937)

### Typography
- **Font Family**: Inter Variable with system fallbacks
- **Scale**: Harmonious type scale for all UI elements
- **Weight**: Strategic font weights for hierarchy

### Components
- **Material-UI Base**: Consistent component library
- **Custom Theming**: Brand-specific customizations
- **Responsive Design**: Mobile-first approach

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Optimized asset delivery
- **Bundle Size**: Minimized JavaScript bundle
- **Caching**: Efficient browser caching strategies

### Monitoring
- **Error Boundaries**: Graceful error handling
- **Performance Metrics**: Core Web Vitals tracking
- **User Experience**: Optimized loading states

## 🔒 Security Compliance

### Frontend Security
- **Content Security Policy**: Strict CSP headers
- **Input Validation**: RegEx allowlist patterns
- **XSS Prevention**: DOMPurify sanitization
- **CSRF Protection**: Automatic token handling

### Authentication Security
- **Secure Storage**: No sensitive data in localStorage
- **Token Management**: Automatic refresh and rotation
- **Session Security**: Device detection and validation

## 📈 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

Modern browsers with ES2022 support and native ESM.

---

NexusPay represents the next generation of secure, user-friendly international payment platforms, combining enterprise-grade security with exceptional user experience.