# VestLedger UI

Next.js application for VestLedger platform with subdomain-based architecture for optimal performance.

## Quick Start

### Prerequisites
- Node.js 20+ and pnpm installed
- Access to `/etc/hosts` file for local subdomain setup

### Using Docker Compose (nginx)

If you start the stack from the repo root with `docker compose up`, the UI is
served via nginx:
- Public UI: `https://vestledger.local`
- App UI: `https://app.vestledger.local`

The steps below are for running the UI directly with Next.js.

### 1. Configure Local Domains (One-Time Setup)

```bash
# Edit your hosts file
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 vestledger.local
127.0.0.1 app.vestledger.local

# Save and exit (Ctrl+X, Y, Enter)
```

### 2. Install Dependencies & Start Server

```bash
# From repo root
pnpm install

# Start development server (use 3001 if API runs on 3000)
pnpm --filter vestledger-ui dev -- --hostname 0.0.0.0 --port 3001
```

### 3. Access the Application

- **Public Pages**: http://vestledger.local:3001
- **Login Page**: http://app.vestledger.local:3001/login
- **Dashboard**: http://app.vestledger.local:3001/dashboard

### 4. Test the Full Flow

1. Visit http://vestledger.local:3001
2. Click "Login" → Should redirect to `app.vestledger.local:3001/login`
3. Enter the demo credentials from env:
   - `NEXT_PUBLIC_DEMO_EMAIL`
   - `NEXT_PUBLIC_DEMO_PASSWORD`
4. Click "Sign In" → Should redirect to dashboard
5. Click logout → Should redirect to public homepage

### Common Troubleshooting

**Issue:** Cannot access `vestledger.local`

```bash
# Check /etc/hosts configuration
cat /etc/hosts | grep vestledger

# Should show:
# 127.0.0.1 vestledger.local
# 127.0.0.1 app.vestledger.local

# Flush DNS cache (macOS)
dscacheutil -flushcache
```

**Issue:** Middleware not working
- Restart dev server
- Clear browser cache
- Verify `middleware.ts` exists in app root

**Issue:** Theme not working
- Check both providers include `NextThemesProvider`
- Verify `suppressHydrationWarning` on `<html>` tag
- Clear localStorage and cookies

---

## Architecture Overview

### Subdomain Structure

VestLedger uses a **subdomain-based architecture** with **route-specific provider stacks** for optimal performance:

```
┌──────────────────────────────────────────────────────────────┐
│                     vestledger.com                            │
│                  (Public Marketing)                           │
├──────────────────────────────────────────────────────────────┤
│  Route Group: app/(public)                                    │
│  Provider: PublicProviders                                    │
│  Bundle: ~2 KB (Theme only)                                   │
│                                                               │
│  Routes:                                                      │
│  ├─ / (homepage)                                             │
│  ├─ /features                                                │
│  ├─ /about                                                   │
│  ├─ /security                                                │
│  ├─ /how-it-works                                            │
│  └─ /eoi                                                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  app.vestledger.com                           │
│              (Application + Login)                            │
├──────────────────────────────────────────────────────────────┤
│  Route Group: app/(dashboard)                                 │
│  Provider: AppProviders                                       │
│  Bundle: ~277 KB (Full stack)                                │
│                                                               │
│  Routes:                                                      │
│  ├─ /login ⭐ (Authentication page)                          │
│  ├─ /dashboard                                               │
│  ├─ /portfolio                                               │
│  ├─ /analytics                                               │
│  ├─ /pipeline                                                │
│  └─ ... (all dashboard routes)                               │
└──────────────────────────────────────────────────────────────┘
```

### Provider Architecture

**PublicProviders** (`app/providers-public.tsx`) - Used on `vestledger.com`:
```typescript
<NextThemesProvider>  // Theme only (~2 KB)
  {children}
</NextThemesProvider>
```

- ✅ Theme (dark/light mode)
- ❌ Redux (no state management needed)
- ❌ NextUI (uses StaticCard/StaticButton instead)
- ❌ AuthProvider (no auth on public pages)

**AppProviders** (`app/providers-app.tsx`) - Used on `app.vestledger.com`:
```typescript
<Provider store={store}>          // Redux
  <NextUIProvider>                // NextUI components
    <NextThemesProvider>          // Theme (shared)
      <AuthProvider>              // Authentication
        <FundProvider>            // Fund context
          {children}
        </FundProvider>
      </AuthProvider>
    </NextThemesProvider>
  </NextUIProvider>
</Provider>
```

**Performance Benefits:**

| Domain | Provider | Bundle Size | Performance |
|--------|----------|-------------|-------------|
| **vestledger.com** | PublicProviders | ~2 KB | LCP < 2.5s |
| **app.vestledger.com** | AppProviders | ~277 KB | Full SPA |

**Savings on public pages:** ~275 KB (-99%)

### Middleware Routing

**Middleware** (`middleware.ts`) enforces subdomain boundaries:

**Rules:**
1. **Public domain** (`vestledger.com`) → Serves ONLY `(public)` routes
2. **App domain** (`app.vestledger.com`) → Serves ONLY `(dashboard)` routes + `/login`
3. Unauthenticated `app.vestledger.com/dashboard` → Redirect to `/login`
4. Authenticated `app.vestledger.com/login` → Client-side redirect
5. Root `app.vestledger.com/` → Redirect to `/login` (unauth) or `/dashboard` (auth)

**Root Layout Provider Selection** (`app/layout.tsx`):
```typescript
const headersList = headers();
const hostname = headersList.get('host') || '';
const isApp = hostname.startsWith('app.') || hostname.includes('app.vestledger');

const Providers = isApp ? AppProviders : PublicProviders;
```

### Authentication Flow

**Scope:** Only on `app.vestledger.com`

**Storage:**
- localStorage: `isAuthenticated`, `user`
- Cookies: `isAuthenticated`, `user` (for middleware)

**Flow:**
```
vestledger.com → Click "Login"
           ↓
app.vestledger.com/login → Enter credentials
           ↓
app.vestledger.com/dashboard → Full SPA
           ↓
Click "Logout"
           ↓
vestledger.com → Public homepage
```

**Demo Login (local/dev):**
- Set `NEXT_PUBLIC_DEMO_EMAIL` and `NEXT_PUBLIC_DEMO_PASSWORD` to enable the demo user.
- If those are not set, login attempts are validated only via the API.

### Theme Persistence

**Implementation:** `next-themes` with localStorage

**Storage:** `localStorage.setItem('theme', 'dark' | 'light')`

**Scope:** Global across both domains

**How it works:**
1. User toggles theme on `vestledger.com` → stored in localStorage
2. User navigates to `app.vestledger.com` → theme persists
3. Both `PublicProviders` and `AppProviders` include `NextThemesProvider`
4. Theme preference is preserved across subdomain navigation

---

## Project Structure

### File Structure

```
apps/vestledger-ui/
├── app/
│   ├── layout.tsx                    # Root - selects provider based on subdomain
│   ├── providers-public.tsx          # Minimal (theme only)
│   ├── providers-app.tsx             # Full stack (redux + nextui + auth)
│   │
│   ├── (public)/                     # Route group for vestledger.com
│   │   ├── layout.tsx                # Public header/footer
│   │   ├── page.tsx                  # Homepage
│   │   ├── features/page.tsx
│   │   ├── about/page.tsx
│   │   └── ...
│   │
│   └── (dashboard)/                  # Route group for app.vestledger.com
│       ├── layout.tsx                # Dashboard chrome (sidebar, topbar)
│       ├── login/page.tsx            # ⭐ Login (needs AppProviders)
│       ├── dashboard/page.tsx
│       ├── portfolio/page.tsx
│       └── ...
│
├── middleware.ts                     # Subdomain routing + auth protection
├── src/
│   ├── components/                   # React components
│   │   ├── public/                   # Public page components
│   │   ├── dashboard/                # Dashboard components
│   │   └── ui/                       # UI component library
│   ├── ui/static/                    # Static server components
│   │   ├── StaticButton.tsx          # Server-rendered button
│   │   └── StaticCard.tsx            # Server-rendered card
│   ├── store/                        # Redux store
│   ├── contexts/                     # React contexts
│   └── hooks/                        # Custom hooks
│
└── public/                           # Static assets
```

### Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Subdomain routing with authentication protection |
| `app/layout.tsx` | Root layout - selects provider based on subdomain |
| `app/providers-public.tsx` | Minimal ThemeProvider only (~2 KB) |
| `app/providers-app.tsx` | Full stack (Redux + NextUI ~105 KB) |
| `app/(public)/layout.tsx` | Public header/footer layout |
| `app/(dashboard)/layout.tsx` | Dashboard chrome with sidebar |
| `src/ui/static/` | Pure server components for public pages |
| `src/components/login-form.tsx` | Login form with redirect support |
| `src/store/sagas/authSaga.ts` | Auth saga with cookie sync |

---

## Key Architectural Decisions

### ✅ Why login is in (dashboard) route group:
- Login needs AuthProvider
- Login needs full app providers
- Login is accessed on `app.vestledger.com`
- Consistent with dashboard architecture

### ✅ Why theme is in BOTH provider stacks:
- Theme must persist across domains
- User expects consistent dark/light mode
- `next-themes` uses localStorage (cross-domain)

### ✅ Why auth is ONLY in AppProviders:
- Public pages have no login/logout
- Public pages just link to `app.vestledger.com/login`
- Auth state only relevant on app subdomain

### ✅ Why middleware enforces subdomain boundaries:
- Prevents accidental cross-domain rendering
- Ensures correct provider stack is used
- Enables performance optimization (public pages stay lightweight)

---

## Additional Documentation

For deployment, performance optimization details, and other technical documentation, see:

- **Deployment Guide:** `/docs/ui/DEPLOYMENT.md`
- **Performance Documentation:** `/docs/ui/PERFORMANCE.md`

---

## Summary

This architecture provides:
- ✅ **Performance**: Public pages are lightweight SSG (~2 KB)
- ✅ **Separation**: Clear boundary between public and app
- ✅ **Theme persistence**: Consistent UX across domains
- ✅ **Auth isolation**: Auth only where needed
- ✅ **Type safety**: Single codebase, shared types
- ✅ **Maintainability**: Clear provider responsibilities

The key insight: **Route groups + subdomain detection + middleware enforcement = optimal performance without code duplication**.
