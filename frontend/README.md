# Frontend - Sistem Otomatisasi Email & Uji Akses

Frontend aplikasi web modern berbasis React untuk sistem otomatisasi pengiriman email dan manajemen uji akses informasi publik.

## 📋 Daftar Isi

- [Overview](#overview)
- [Teknologi Stack](#teknologi-stack)
- [Fitur Lengkap](#fitur-lengkap)
- [Struktur Project](#struktur-project)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Development](#development)
- [Build & Deploy](#build--deploy)

## 🎯 Overview

Aplikasi frontend ini menyediakan antarmuka pengguna yang intuitif untuk mengelola:
- Otomasi pengiriman email ke badan publik
- Manajemen database badan publik
- Sistem penugasan dan quota management
- Laporan uji akses informasi publik
- Template email yang dapat dikustomisasi
- Real-time monitoring pengiriman email
- Kalender hari libur nasional

## 🛠 Teknologi Stack

### Core Framework
- **React 19** - UI Library dengan hooks dan context API
- **React Router DOM v7** - Client-side routing
- **Vite 7** - Lightning fast build tool dan dev server

### State Management & Data Fetching
- **React Context API** - Global state management (Auth & SMTP)
- **Axios** - HTTP client dengan interceptors
- **EventSource Polyfill** - Server-Sent Events untuk real-time updates

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS preprocessor
- **Custom Components** - Reusable UI components

### Data Processing & Export
- **xlsx** - Excel file generation & parsing
- **jsPDF** - PDF generation
- **CSV Export** - Custom CSV utilities

### Security
- **Cloudflare Turnstile** - Bot protection (CAPTCHA alternative)
- **CSRF Protection** - Cross-Site Request Forgery prevention
- **JWT Authentication** - Access & Refresh tokens via HTTP-only cookies

### Development Tools
- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixes

## ✨ Fitur Lengkap

### 1. 🔐 Authentication & Security

#### Login dengan Turnstile
- Cloudflare Turnstile CAPTCHA integration
- JWT-based authentication dengan refresh tokens
- HTTP-only cookies untuk security
- CSRF token protection
- Automatic token refresh
- Session persistence

#### Role-Based Access Control (RBAC)
- **Admin**: Full access ke semua fitur
- **User**: Limited access, personal data only
- Protected routes dengan middleware
- Role-specific UI rendering

### 2. 📊 Dashboard

#### Overview & Analytics
- **Quick Stats Cards**:
  - Total badan publik dalam database
  - Total user terdaftar (admin only)
  - Email terkirim hari ini
  - Email pending
  - Success rate percentage

- **Real-time Charts**:
  - Email status distribution (Success/Pending/Failed)
  - Trend pengiriman per hari/minggu/bulan
  - User activity monitoring (admin)

- **News Feed**:
  - RSS feed otomatis dari Berita KIP
  - Auto-refresh setiap 30 menit
  - Infinite scroll loading
  - External link integration

- **Quote of the Day**:
  - Random inspirational quotes
  - Kategori: Akuntabilitas, Kolaborasi, Integritas

### 3. 🏢 Data Badan Publik

#### Database Management
- **CRUD Operations**:
  - Create: Form tambah badan publik baru
  - Read: List view dengan pagination
  - Update: Edit data inline atau modal
  - Delete: Single atau bulk delete dengan konfirmasi

- **Data Fields**:
  - Nama badan publik
  - Kategori (Pemerintah, Swasta, dll)
  - Email kontak
  - Website URL
  - Pertanyaan default
  - Status (Pending/Sent/Failed)
  - Thread ID (email tracking)

#### Advanced Features
- **Search & Filter**:
  - Real-time search (nama, email, website)
  - Filter by status (pending/sent/failed/all)
  - Filter by kategori
  - Combined filters support

- **Pagination**:
  - Adjustable page size (10/20/50/100)
  - Server-side pagination
  - Jump to page
  - Total records display

- **Bulk Operations**:
  - Multi-select dengan checkbox
  - Bulk delete
  - Bulk status update
  - Select all/none

- **Import/Export**:
  - Import dari Excel (XLSX) atau CSV
  - Template download untuk import
  - Auto-mapping columns dengan aliases
  - Validation & error reporting
  - Export to Excel dengan formatting
  - Export to CSV
  - Column reordering

#### Email Integration
- **Send Email**:
  - Single email send
  - Bulk email send (selected records)
  - Template selection
  - Custom message override
  - Attachment support (future)

- **Due Date Tracking**:
  - Automatic calculation (14 hari kerja)
  - Holiday consideration
  - Weekend skipping
  - Visual indicators (overdue/upcoming)
  - Status colors

- **Monitoring Map**:
  - Track which records have been monitored
  - Local storage persistence
  - Visual checkbox per record
  - Filter by monitoring status

### 4. 📝 Template Editor

#### Template Management
- **Built-in Templates**:
  - "Permohonan Informasi Publik" (Default)
  - "Permohonan Informasi RTI" 
  - "Notifikasi"
  - "Reminder" dengan variasi waktu (1 hari, 3 hari, 1 minggu)

- **Custom Templates**:
  - Create unlimited custom templates
  - Edit existing templates
  - Duplicate templates
  - Delete custom templates (built-in protected)
  - Role-based template storage

#### Editor Features
- **Rich Editor**:
  - Multi-line text editor untuk email body
  - Subject line editor
  - Template name & description
  - Character/word count
  - Preview mode

- **Variable Placeholders**:
  - `{nama_badan_publik}` - Auto-replaced saat kirim
  - `{website}` - Website URL
  - `{email}` - Email address
  - `{kategori}` - Kategori badan publik
  - Custom variables support

- **Version Control**:
  - Undo/Redo dengan keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - History tracking (10 versions)
  - Restore from version
  - Draft auto-save (800ms debounce)
  - Version timestamps

- **Template Actions**:
  - Save template
  - Reset to default
  - Clear all changes
  - Load draft
  - Export/Import templates (JSON)

#### Advanced Options
- **Permission-based Editing**:
  - Admin: Full edit access
  - User: View only (optional edit)
  - Protected built-in templates

- **Local Storage Sync**:
  - Per-role template storage
  - Cross-tab synchronization
  - Automatic backup
  - Recovery on crash

### 5. 📧 History Log (Real-time Email Monitoring)

#### Real-time Streaming
- **Server-Sent Events (SSE)**:
  - Live email status updates
  - Automatic reconnection on disconnect
  - Connection status indicator
  - Zero polling overhead
  - Instant UI updates

#### Email Log Display
- **Log Details**:
  - Timestamp (sent_at)
  - Recipient name & email
  - Subject & body preview
  - Status (success/failed)
  - Error message (if failed)
  - Sender information (admin only)
  - Thread ID untuk tracking
  - Attachment info

- **Status Indicators**:
  - ✅ Success (green badge)
  - ❌ Failed (red badge)
  - ⏳ Pending (yellow badge)
  - Color-coded rows

#### Filtering & Search
- **Multiple Filters**:
  - Status: All/Success/Failed/Pending
  - Owner: All/Mine/Others (admin)
  - Category: All/Permohonan/Notifikasi/Reminder
  - Date range picker
  - Search by recipient, subject, body

- **Combined Filtering**:
  - Stack multiple filters
  - Real-time filter results
  - Filter count display
  - Clear all filters

#### Actions & Operations
- **Retry Failed Emails**:
  - Single retry
  - Bulk retry (selected)
  - Retry with template override
  - Loading indicators

- **Delete Logs**:
  - Single delete
  - Bulk delete
  - Confirmation dialog
  - Soft delete support

- **View Details**:
  - Expandable log modal
  - Full email body view
  - HTML rendering
  - Copy to clipboard
  - View sender info (admin)

#### Export & Reporting
- **Export Options**:
  - CSV export (filtered results)
  - Excel export dengan formatting
  - PDF report generation
  - Date range selection
  - Include/exclude columns

- **Sender Information** (Admin):
  - View which user sent email
  - SMTP configuration used
  - Sending history per user

### 6. 👥 Manajemen User (Admin Only)

#### User CRUD
- **Add User**:
  - Form tambah user baru
  - Username (unique validation)
  - Password (auto-generated option)
  - Email (optional)
  - Nomor HP (optional)
  - Group/Bagian (optional)
  - Role selection (admin/user)

- **User List**:
  - Sortable table
  - Search by username, email, group
  - Filter by role
  - Pagination
  - Total user count

- **Edit User**:
  - Inline editing
  - Change role (with confirmation)
  - Update contact info
  - Status management

- **Delete User**:
  - Single delete with confirmation
  - Bulk delete
  - Cannot delete self
  - Cascade handling

#### Advanced Features
- **Password Management**:
  - Reset user password (admin)
  - Generate random password
  - Copy password to clipboard
  - Force password change on next login

- **Role Management**:
  - Change user role (user ↔ admin)
  - Confirmation modal
  - Permission validation
  - Audit trail

- **Import Users**:
  - Bulk import dari Excel/CSV
  - Template download
  - Field mapping
  - Duplicate detection
  - Validation errors display
  - Success/fail summary

- **Export Users**:
  - Export to Excel
  - Export to CSV
  - Filtered export
  - Include/exclude columns
  - Custom filename

### 7. 📋 Penugasan & Quota Management (Admin Only)

#### Assignment System
- **User Selection**:
  - Dropdown all users (non-admin)
  - Quick switch between users
  - Current quota display
  - Assignment summary

- **Quota Management**:
  - Set daily quota per user
  - Default quota: 20 emails/day
  - Custom quota input
  - Quota usage tracking
  - Reset quota history

#### Assignment Interface
- **Dual Panel View**:
  - Left: Available badan publik (unassigned)
  - Right: Assigned badan publik
  - Drag & drop support (future)
  - Checkbox multi-select

- **Assignment Actions**:
  - Assign selected items
  - Remove assignment
  - Bulk assign/remove
  - Clear all assignments
  - Confirmation dialogs

#### Quota Request Management
- **Request List**:
  - View all quota requests
  - Requester information
  - Current vs requested quota
  - Reason/justification
  - Request timestamp
  - Status (pending/approved/rejected)

- **Request Actions**:
  - Approve request
  - Reject request (with reason)
  - Bulk approve/reject
  - Auto-notify requester
  - Audit trail

- **Notifications**:
  - Badge count on sidebar
  - Real-time updates
  - Visual indicators
  - Event-driven refresh

#### Assignment Summary
- **Statistics**:
  - Total assigned per user
  - Completion rate
  - Quota utilization
  - Overdue assignments

- **Detailed View**:
  - List assigned badan publik
  - Status of each assignment
  - Progress tracking
  - Due dates

#### Import Assignments
- **Bulk Import**:
  - Import assignment data via Excel/CSV
  - Columns: Badan Publik, User, Deadline, dll
  - Auto-matching existing records
  - Create missing badan publik
  - Validation & error handling

### 8. 📄 Laporan Uji Akses

#### Report Management (User & Admin)
- **My Reports** (`/laporan/uji-akses`):
  - List all personal reports
  - Create new report
  - Edit existing reports
  - Delete reports
  - View report details

#### Create New Report
- **Form Fields**:
  - Nama badan publik (required)
  - Kategori (dropdown)
  - Website (URL validation)
  - Tanggal pengujian (date picker)
  - File upload (PDF, max 5MB)
  - Notes/comments

- **Rubrik Penilaian**:
  - Dynamic question form based on admin-defined questions
  - Checklist items dengan scoring
  - Categories:
    - Keberadaan dan Kelengkapan PPID
    - Website PPID
    - Fitur dan Aksesibilitas
    - Konten Informasi
  - Auto-calculate total score
  - Score validation
  - Save as draft support

#### Report Detail View
- **Display Information**:
  - Badan publik details
  - Testing date
  - Uploaded file link
  - Score breakdown per category
  - Total score & percentage
  - Created by & timestamp
  - Last updated

- **Actions**:
  - Edit report
  - Delete report
  - Download PDF
  - Print report
  - Share report (future)

#### Export Reports
- **Export Options**:
  - Export to CSV (individual or bulk)
  - Export to Excel dengan formatting
  - Export to PDF dengan template
  - Custom column selection
  - Date range filter

- **Report Formats**:
  - Summary view (scores only)
  - Detailed view (all questions)
  - Comparison report (multiple badan publik)

### 9. 📊 Admin: Laporan Uji Akses

#### All Reports View (`/admin/laporan/uji-akses`)
- **Aggregated Data**:
  - View all reports from all users
  - Filter by user
  - Filter by date range
  - Filter by badan publik
  - Filter by score range

- **Advanced Analytics**:
  - Average score per category
  - Best/worst performing badan publik
  - User performance statistics
  - Trend analysis
  - Score distribution charts

#### Detailed Report View
- **Full Access**:
  - View complete report details
  - Uploaded files
  - All answers and scores
  - User who created
  - Edit history/audit trail

- **Admin Actions**:
  - Edit any report
  - Delete any report
  - Approve/reject reports
  - Add comments/feedback
  - Export reports

### 10. ❓ Admin: Pertanyaan Uji Akses

#### Question Bank Management (`/admin/uji-akses/pertanyaan`)
- **CRUD Questions**:
  - Create new questions
  - Edit existing questions
  - Delete questions (with cascade check)
  - Reorder questions (drag & drop)
  - Enable/disable questions

- **Question Properties**:
  - Question text
  - Category/group
  - Score/weight
  - Question type (checkbox/radio/text)
  - Required flag
  - Help text/description

- **Category Management**:
  - Create categories
  - Rename categories
  - Delete categories
  - Reorder categories
  - Color coding

#### Question Templates
- **Default Questions**:
  - Pre-loaded with standard uji akses criteria
  - Based on KIP guidelines
  - Editable by admin
  - Can be reset to defaults

- **Bulk Operations**:
  - Import questions from Excel/CSV
  - Export question bank
  - Duplicate question set
  - Archive old questions

### 11. 📅 Kalender Hari Libur

#### Calendar View
- **Month Navigation**:
  - Previous/next month buttons
  - Jump to current month
  - Month/year display

- **Calendar Grid**:
  - 7-column grid (Sun-Sat)
  - Color-coded holidays (red)
  - Weekend highlighting (gray)
  - Today indicator
  - Event tooltips

#### Holiday Management (Admin)
- **Add Holiday**:
  - Click on date to toggle holiday
  - Pending changes (yellow)
  - Save all changes button
  - Cancel/discard changes

- **Holiday Types**:
  - National holidays (Hari Libur Nasional)
  - Cuti bersama
  - Weekend (automatic)
  - Custom holidays

- **Delete Holiday**:
  - Click again to remove
  - Batch save/delete
  - Confirmation modal

#### Holiday Integration
- **Due Date Calculation**:
  - Used in badan publik module
  - Skips holidays when calculating deadlines
  - 14-day working days default
  - Configurable per instance

- **Holiday API**:
  - Shared with backend
  - RESTful endpoints
  - JSON format
  - Cache support

### 12. ⚙️ Settings (Pengaturan)

#### SMTP Configuration
- **Gmail SMTP Setup**:
  - Email address input
  - App password input
  - Verification button
  - Test email send
  - IMAP verification

- **Configuration Status**:
  - Visual indicator (green/red badge)
  - Navbar status display
  - Error messages
  - Success confirmation

- **Step-by-step Guide**:
  1. Aktifkan 2-Step Verification
  2. Generate App Password
  3. Aktifkan IMAP di Gmail
  4. Input credentials
  5. Test & save

#### Password Change
- **Change Password Form**:
  - Current password (required)
  - New password (required)
  - Confirm password (validation)
  - Strength indicator
  - Show/hide password toggle

- **Validation**:
  - Min 8 characters
  - Match confirmation
  - Current password verification
  - Success/error feedback

### 13. ℹ️ Tentang (About)

#### Application Information
- **System Info**:
  - Application name & version
  - Build date
  - Technology stack
  - Contact information
  - Help documentation

- **Credits**:
  - Development team
  - Third-party libraries
  - License information

### 14. 🎨 UI/UX Features

#### Design System
- **Modern Interface**:
  - Clean, minimalist design
  - Consistent color palette
  - Smooth animations & transitions
  - Responsive layout (mobile-first)
  - Dark mode ready (future)

- **Custom Components**:
  - Toast notifications
  - Confirm dialogs
  - Modal windows
  - Loading spinners
  - Skeleton screens
  - Empty states
  - Error boundaries

#### Navigation
- **Navbar**:
  - User info display
  - SMTP status indicator
  - Notification bell (future)
  - Logout button
  - Responsive hamburger menu

- **Sidebar**:
  - Icon + label navigation
  - Active route highlighting
  - Collapsible on mobile
  - Role-based menu items
  - Badge notifications

#### Interaction Patterns
- **Forms**:
  - Real-time validation
  - Error messages
  - Success feedback
  - Auto-save drafts
  - Keyboard shortcuts

- **Tables**:
  - Sortable columns
  - Resizable columns (future)
  - Fixed headers on scroll
  - Row selection
  - Inline editing
  - Pagination controls

- **Modals**:
  - Backdrop blur
  - Smooth animations
  - Keyboard navigation (ESC to close)
  - Focus trap
  - Scroll lock

#### Accessibility
- **WCAG Compliance**:
  - Semantic HTML
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Color contrast ratio
  - Focus indicators

### 15. 🔔 Real-time Features

#### Server-Sent Events (SSE)
- **Email Log Streaming**:
  - Real-time email status updates
  - New log entries auto-appear
  - Connection status display
  - Auto-reconnect on disconnect
  - Heartbeat monitoring

#### Event Bus
- **Custom Events**:
  - `quota-requests-updated`: Quota request changes
  - `smtp-config-updated`: SMTP config changes
  - `user-updated`: User data changes
  - Cross-component communication

### 16. 🔒 Security Features

#### CSRF Protection
- **Token Management**:
  - Automatic CSRF token fetch
  - Token refresh on expiry
  - Included in all mutations
  - Cookie-based storage

#### XSS Prevention
- **Input Sanitization**:
  - HTML encoding
  - Script tag filtering
  - Safe innerHTML rendering
  - Content Security Policy

#### Authentication Guards
- **Protected Routes**:
  - Login required middleware
  - Role-based access
  - Automatic redirect
  - Session validation

## 📁 Struktur Project

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── assets/                 # Images, icons, fonts
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Generic components (Toast, Modal, etc)
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── badanPublik/       # Badan Publik components
│   │   ├── historyLog/        # History Log components
│   │   ├── templateEditor/    # Template editor components
│   │   ├── addUser/           # User management components
│   │   ├── reports/           # Report components
│   │   ├── import/            # Import/Export components
│   │   ├── Layout.jsx         # Main layout wrapper
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── Sidebar.jsx        # Side navigation menu
│   │   ├── ProtectedRoute.jsx # Auth guard component
│   │   ├── SmtpModal.jsx      # SMTP configuration modal
│   │   └── TurnstileWidget.jsx # Cloudflare Turnstile
│   ├── constants/             # Static data & configs
│   │   ├── quotes.js          # Inspirational quotes
│   │   ├── templates.js       # Email templates
│   │   └── ujiAksesRubric.js  # Uji akses scoring rubric
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── SmtpContext.jsx    # SMTP configuration state
│   ├── hooks/                 # Custom React hooks
│   │   ├── useToast.js        # Toast notification hook
│   │   └── useConfirmDialog.js # Confirm dialog hook
│   ├── pages/                 # Page components (routes)
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BadanPublik.jsx
│   │   ├── HistoryLog.jsx
│   │   ├── TemplateEditor.jsx
│   │   ├── Settings.jsx
│   │   ├── AddUser.jsx
│   │   ├── Penugasan.jsx
│   │   ├── HolidayCalendar.jsx
│   │   ├── UjiAksesReports.jsx
│   │   ├── UjiAksesReportNew.jsx
│   │   ├── UjiAksesReportDetail.jsx
│   │   ├── AdminUjiAksesReports.jsx
│   │   ├── AdminUjiAksesReportDetail.jsx
│   │   ├── UjiAksesQuestionManager.jsx
│   │   └── Tentang.jsx
│   ├── services/              # API service layer
│   │   ├── api.js             # Axios instance & interceptors
│   │   ├── holidays.js        # Holiday API calls
│   │   └── reports.js         # Report API calls
│   ├── utils/                 # Helper functions
│   │   ├── workdays.js        # Working day calculations
│   │   ├── monitoring.js      # Monitoring state helpers
│   │   ├── serverUrl.js       # API URL helpers
│   │   └── ujiAksesReportExport.js # Report export utilities
│   ├── App.jsx                # Main App component
│   ├── App.css                # Global styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind imports
├── .env                        # Environment variables
├── .env.example               # Example env file
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies & scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind configuration
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

## 🚀 Instalasi

### Prerequisites
- **Node.js**: v20.x atau lebih tinggi
- **npm**: v10.x atau lebih tinggi
- **Backend API**: Running di port 5000 (atau sesuai konfigurasi)

### Langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd OTOMATISASI3/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

5. **Akses Aplikasi**
   - Buka browser: http://localhost:5173
   - Login dengan credentials default (lihat backend README)

## ⚙️ Konfigurasi

### Environment Variables

File `.env`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:5000

# Cloudflare Turnstile Site Key
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### API URL Configuration

Aplikasi mendukung multiple environment:

- **Development**: http://localhost:5000
- **Staging**: https://api-staging.yourdomain.com
- **Production**: https://api.yourdomain.com

### Vite Configuration

File `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // Expose to network
    port: 5173,          // Dev server port
    strictPort: true     // Fail if port is busy
  },
  build: {
    outDir: 'dist',
    sourcemap: false,    // Disable for production
    minify: 'terser'     // Minification
  }
})
```

### Tailwind Configuration

File `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',    // Emerald green
        secondary: '#6366f1',  // Indigo
        // ... custom colors
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Lint and auto-fix
npm run lint:fix
```

### Development Tips

#### Hot Module Replacement (HMR)
- Vite HMR otomatis aktif
- Perubahan langsung terlihat tanpa refresh
- State preservation di React components

#### Component Development
- Gunakan React DevTools untuk debugging
- Implement error boundaries untuk graceful errors
- Follow React best practices & hooks rules

#### State Management
- Prefer local state dengan `useState`
- Use Context untuk cross-component state
- Avoid prop drilling dengan composition

#### Styling
- Gunakan Tailwind utility classes
- Custom classes di `index.css` untuk reusable styles
- Responsive design: mobile-first approach

#### API Integration
- Semua API calls via `services/api.js`
- Interceptors handle tokens automatically
- Error handling di catch blocks
- Loading states untuk UX

### Code Style

#### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    rules: {
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]
```

#### Best Practices
- **Components**: One component per file
- **Naming**: PascalCase for components, camelCase for functions
- **Props**: Destructure props in function signature
- **Hooks**: Prefix custom hooks dengan `use`
- **Constants**: UPPER_SNAKE_CASE untuk constants

### Debugging

#### React DevTools
```bash
# Install extension di browser
- Chrome: React Developer Tools
- Firefox: React Developer Tools
```

#### Console Logging
```javascript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

#### Network Debugging
- Chrome DevTools → Network tab
- Filter XHR untuk API calls
- Check request/response headers
- Inspect cookies

## 🏗 Build & Deploy

### Production Build

```bash
# Build optimized production bundle
npm run build

# Output di folder `dist/`
# - Minified JavaScript
# - Optimized CSS
# - Compressed images
# - Source maps (optional)
```

### Build Output

```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS
│   └── [images]            # Optimized images
└── [other static files]
```

### Deployment Options

#### 1. Static Hosting (Recommended)

**Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**GitHub Pages**
```bash
# Add to package.json:
"homepage": "https://yourusername.github.io/repo-name",

# Install gh-pages
npm install --save-dev gh-pages

# Add deploy script
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# Deploy
npm run deploy
```

#### 2. VPS/Self-hosted

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

**Deploy Steps**
```bash
# Build locally
npm run build

# Upload to server
scp -r dist/* user@server:/var/www/frontend/dist/

# Or build on server
ssh user@server
cd /var/www/frontend
git pull
npm ci
npm run build
sudo systemctl reload nginx
```

#### 3. Docker

**Dockerfile**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build & Run**
```bash
docker build -t frontend-app .
docker run -d -p 80:80 frontend-app
```

#### 4. Cloud Platforms

**AWS S3 + CloudFront**
```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Google Cloud Storage**
```bash
# Upload to GCS
gsutil -m rsync -r -d dist/ gs://your-bucket-name
```

### Environment-specific Builds

**Development**
```bash
npm run build -- --mode development
```

**Staging**
```bash
npm run build -- --mode staging
```

**Production**
```bash
npm run build -- --mode production
```

### Performance Optimization

#### Build Optimizations
- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Remove unused code
- **Minification**: Terser for JS, cssnano for CSS
- **Asset Optimization**: Image compression

#### Runtime Optimizations
- **Lazy Loading**: Dynamic imports untuk routes
- **Memoization**: React.memo, useMemo, useCallback
- **Virtual Lists**: Untuk large datasets
- **Debouncing**: Search & input handlers

#### Caching Strategy
```javascript
// Service Worker (future)
// Cache API responses
// Cache static assets
// Offline support
```

## 🧪 Testing (Future)

### Unit Testing
```bash
npm install --save-dev vitest @testing-library/react
npm run test
```

### E2E Testing
```bash
npm install --save-dev cypress
npx cypress open
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- Web Vitals tracking
- Error boundary with logging
- API response time tracking
- User interaction metrics

### Error Tracking
- Integration dengan Sentry (future)
- Console error logging
- Network error handling
- User-friendly error messages

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Review Guidelines
- Follow existing code style
- Add comments untuk complex logic
- Update README jika perlu
- Test di multiple browsers
- Check responsive design

---

**Built with ❤️ using React + Vite + Tailwind CSS + ade7**