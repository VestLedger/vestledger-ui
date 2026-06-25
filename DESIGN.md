# VestLedger Design System

Portable visual specification for VestLedger and related products. Describes **what** the design system is — colors, type, spacing, components, and behavior — without tying to any single codebase or framework.

Copy this document (and the token appendix at the end) into sibling projects to keep a consistent design language.

---

## 1. Design Philosophy

### Overall aesthetic
Enterprise **fintech / venture-capital productivity** interface with **AI-native** positioning. Data-dense dashboards, structured workflows, and institutional trust cues.

### Brand palette
**Blue & Gold** — deep blue for primary actions and trust; rich gold for premium accents, achievements, and compliance highlights.

### Personality
- **Authoritative** — structured navigation, clear hierarchy, status semantics
- **Premium** — subtle gradients, glow effects, gold on trust surfaces
- **Intelligent** — sparkles motif for AI, summaries, copilot, predictive workflows
- **Operational** — compact information density by default; tables, KPI chips, lane headers

### Density
Default app UI uses **compact** density. A **comfortable** mode increases shell dimensions, padding, and type scale. Marketing pages use generous whitespace; mobile marketing compresses hero scale ~40–50%.

### Tone
Professional, calm, confident. Warm stone neutrals in the default app; cooler slate blues in the dashboard home skin; editorial warmth on public marketing.

### Intended user perception
Fund professionals (GPs, analysts, fund admins, LPs) should perceive the product as a **credible institutional tool** — not playful consumer UI, not brutalist. Public marketing is more **editorial and aspirational** with glass panels and display typography.

---

## 2. Color System

Four layered contexts share a common Blue & Gold identity:

| Context | Where used |
|---------|------------|
| **Default App** | Authenticated dashboard, login, most product UI |
| **Dashboard Home Skin** | Primary dashboard shell — cooler blue-slate override |
| **Public Marketing** | Public website — warm cream, glass, display type |
| **Light / Dark** | All contexts; dark mode inverts foundations, brightens brand |

---

### 2.1 Default App — Light

#### Foundations
| Token | Hex |
|-------|-----|
| Background | `#fafaf9` |
| Surface | `#ffffff` |
| Surface 2 | `#f5f5f4` |
| Surface Hover | `#e7e5e4` |

#### Borders
| Token | Hex |
|-------|-----|
| Border | `#d6d3d1` |
| Border Subtle | `#e7e5e4` |
| Border Strong | `#a8a29e` |

#### Text
| Token | Hex |
|-------|-----|
| Text | `#1c1917` |
| Text Muted | `#57534e` |
| Text Subtle | `#78716c` |

#### Brand
| Token | Hex |
|-------|-----|
| Primary | `#1e40af` |
| Primary Hover | `#1d4ed8` |
| Primary Light | `#dbeafe` |
| Primary Background (10%) | `rgba(30, 64, 175, 0.1)` |
| Secondary (Gold) | `#d4a332` |
| Secondary Hover | `#b8922a` |
| Secondary Light | `#fef3c7` |
| Secondary Background (10%) | `rgba(212, 163, 50, 0.1)` |
| Accent | `#2563eb` |
| Accent Hover | `#1d4ed8` |
| Accent Light | `#dbeafe` |
| Accent Background (10%) | `rgba(37, 99, 235, 0.1)` |
| Link | `#1e40af` |
| Link Hover | `#1d4ed8` |

#### Status
| Token | Hex | Tint background |
|-------|-----|-----------------|
| Success | `#16a34a` | `#dcfce7` |
| Warning | `#d97706` | `#fef3c7` |
| Danger | `#dc2626` | `#fee2e2` |
| Info | `#0891b2` | `#cffafe` |
| Neutral | `#6b7280` | `#f3f4f6` |

#### Semantic usage
- **Primary** — CTAs, active nav, links, focus rings, chart series 1
- **Secondary** — gold highlights, premium cards, chart series 2
- **Success** — completed, positive trends
- **Warning** — pending risk, partial states
- **Danger** — errors, overdue, blocked
- **Info** — informational badges, queued states
- **Neutral** — cancelled, disconnected, muted

Status surfaces use **10% opacity** tint of the semantic color on light backgrounds.

---

### 2.2 Default App — Dark

#### Foundations
| Token | Hex |
|-------|-----|
| Background | `#0c0a09` |
| Surface | `#1c1917` |
| Surface 2 | `#292524` |
| Surface Hover | `#44403c` |

#### Borders
| Token | Hex |
|-------|-----|
| Border | `#44403c` |
| Border Subtle | `#292524` |
| Border Strong | `#57534e` |

#### Text
| Token | Hex |
|-------|-----|
| Text | `#fafaf9` |
| Text Muted | `#a8a29e` |
| Text Subtle | `#78716c` |

#### Brand
| Token | Hex |
|-------|-----|
| Primary | `#3b82f6` |
| Primary Hover | `#60a5fa` |
| Primary Light | `rgba(59, 130, 246, 0.15)` |
| Primary Background | `rgba(59, 130, 246, 0.15)` |
| Secondary | `#fbbf24` |
| Secondary Hover | `#fcd34d` |
| Secondary Light | `rgba(251, 191, 36, 0.15)` |
| Secondary Background | `rgba(251, 191, 36, 0.15)` |
| Accent | `#60a5fa` |
| Accent Hover | `#93c5fd` |
| Accent Light | `rgba(96, 165, 250, 0.15)` |
| Link | `#3b82f6` |
| Link Hover | `#60a5fa` |

#### Status
| Token | Hex |
|-------|-----|
| Success | `#22c55e` |
| Warning | `#f59e0b` |
| Danger | `#ef4444` |
| Info | `#06b6d4` |
| Neutral | `#9ca3af` |

Status surfaces use **15% opacity** tint on dark backgrounds.

---

### 2.3 Dashboard Home Skin

Cooler, more saturated palette for the main dashboard shell. Overrides default app tokens when this skin is active.

#### Light
| Token | Hex |
|-------|-----|
| Background | `#f4f6fb` |
| Surface | `#ffffff` |
| Surface 2 | `#f3f6fc` |
| Surface Hover | `#eef3fb` |
| Border | `#d7e0ef` |
| Border Subtle | `#e7edf8` |
| Border Strong | `#b6c4df` |
| Text | `#0f172a` |
| Text Muted | `#475569` |
| Text Subtle | `#64748b` |
| Primary | `#2563eb` |
| Primary Hover | `#1d4ed8` |
| Primary Background | `rgba(37, 99, 235, 0.12)` |
| Secondary | `#f59e0b` |
| Success | `#10b981` |
| Danger | `#f43f5e` |
| Info | `#3b82f6` |

**Page background:** layered radial gradients — blue at 12% top-left, green at 8% top-right — over `linear-gradient(180deg, #f4f6fb, #f2f5fb)`.

#### Dark
| Token | Hex |
|-------|-----|
| Background | `#0b1220` |
| Surface | `#111a2e` |
| Surface 2 | `#16223d` |
| Surface Hover | `#1f2f4d` |
| Border | `#294067` |
| Text | `#e6edf8` |
| Text Muted | `#b1c3df` |
| Primary | `#60a5fa` |
| Secondary | `#fbbf24` |
| Success | `#34d399` |
| Danger | `#fb7185` |

**Page background:** radial blue + green gradients over `linear-gradient(180deg, #0b1220, #0d1627)`.

---

### 2.4 Public Marketing

Warm editorial palette with glass surfaces. Scoped to public/marketing pages only.

#### Light — key tokens
| Token | Value |
|-------|-------|
| Contrast Text | `#0b1324` |
| Contrast Muted | `#445268` |
| Contrast Subtle | `#6a7589` |
| Shell Background | `rgba(252, 248, 242, 0.84)` |
| Panel Shadow | `0 28px 90px rgba(12, 23, 42, 0.12), 0 10px 24px rgba(12, 23, 42, 0.08)` |
| Glow Blue | `rgba(59, 130, 246, 0.18)` |
| Glow Gold | `rgba(212, 163, 50, 0.16)` |
| Glow Cyan | `rgba(34, 211, 238, 0.14)` |
| Kicker Text | `#10203a` |
| Footer Text | `#0b1324` |

**Page background:** radial gold, blue, and cyan orbs over `linear-gradient(180deg, #f7f3ec, #f7fbff)`.

#### Dark — key tokens
| Token | Value |
|-------|-------|
| Contrast Text | `#f8fafc` |
| Contrast Muted | `#cbd5e1` |
| Contrast Subtle | `#94a3b8` |
| Shell Background | `rgba(4, 10, 20, 0.78)` |
| Panel Shadow | `0 32px 90px rgba(2, 6, 17, 0.56), 0 12px 28px rgba(2, 6, 17, 0.36)` |
| Footer Background | `#050b16` |

#### Marketing glass surfaces
- Shell controls: `backdrop-filter: blur(18px)`
- Panels: `blur(24px)`, border-radius **24px**
- Cards: `blur(22px)`, border-radius **20px**, semi-transparent fill
- Card hover: `translateY(-2px)`, stronger shadow + subtle blue glow

---

### 2.5 Gradients

| Name | Light values | Use |
|------|--------------|-----|
| Brand text | `#1e40af → #3b82f6 → #60a5fa` at 135° | Hero headlines, brand emphasis |
| Brand text (dark) | `#3b82f6 → #60a5fa → #93c5fd` | Dark mode brand text |
| Gold text | `#d4a332 → #f0c45a → #d4a332` | Premium/trust highlights |
| Brand-gold text | `#1e40af → #3b82f6 → #d4a332` | Premium brand moments |
| Primary button | `#1e40af → #2563eb → #3b82f6` at 135°, 200% size | Marketing CTAs |
| Hero background | Radial blue ellipses on page background | Landing heroes |
| Topbar wash | Transparent → primary 10% → transparent | Sticky app header |
| Timeline connector | Blue → cyan → gold vertical | Marketing process timelines |
| Icon gold container | `#d4a332 → #f0c45a` | Trust/compliance badges |

---

### 2.6 Chart colors

**Series order (repeat cyclically):**
1. Primary
2. Secondary (gold)
3. Accent
4. Info
5. Success
6. Warning

**Chart chrome:**
- Axis tick labels: Text Subtle, **11px**
- Axis lines: Border color
- Grid: Border color at low opacity
- Tooltip: Surface background, Border, **12px** radius, Text color
- Area fill: semantic color gradient from **35%** opacity at top to **2%** at bottom
- Line stroke: **3px** for primary series; dots **3px** radius, active **4px**

Positive trend lines default to **Success** green.

---

## 3. Typography

### Font families

| Context | Family | Fallback | Weights |
|---------|--------|----------|---------|
| App / Dashboard | System UI stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | 400–700 |
| Public body | **Manrope** | Segoe UI, sans-serif | 400, 500, 600, 700, 800 |
| Public display | **Space Grotesk** | Segoe UI, sans-serif | 500, 600, 700 |
| Monospace | ui-monospace | SF Mono, Menlo, monospace | 400 |

### Base
Root font size: **16px**.

### Heading scale (responsive)

| Level | Mobile | Desktop (≥1024px) | Weight |
|-------|--------|-------------------|--------|
| H1 | 36px | 60px | 700 |
| H2 | 30px | 48px | 700 |
| H3 | 24px | 36px | 600 |
| H4 | 20px | 30px | 600 |
| H5 | 18px | 24px | 500 |
| H6 | 16px | 20px | 500 |

### Page titles (dashboard)

| Density | Size | Weight |
|---------|------|--------|
| Compact | 24px (28px at ≥1024px) | 700 |
| Comfortable | 30px | 700 |

### Body scale

| Name | Size | Line height (typical) |
|------|------|------------------------|
| xs | 12px | 1.5 |
| sm | 14px | 1.5 |
| base | 16px | 1.5 |
| lg | 18px | 1.6 |
| xl | 20px | 1.6 |

### Specialized patterns

| Pattern | Spec |
|---------|------|
| KPI / micro label | 10px, semibold, uppercase, letter-spacing **0.14em** |
| Lane / section badge | 10px, semibold, uppercase, letter-spacing **0.12em** |
| Table header | 14px, medium weight, Text Muted |
| Marketing kicker | 12px, semibold, uppercase, letter-spacing **0.12em** |
| Marketing prose body | 15px, line-height **1.85** |
| Marketing prose H2 | 24px, bold, display family, letter-spacing **-0.04em** |
| Public display headings | Display family, letter-spacing **-0.04em** |

### Capitalization
- Status badges: kebab-case values → Title Case per word (`in-progress` → `In Progress`)
- Section kickers and KPI labels: ALL CAPS
- Command palette group labels: uppercase, letter-spacing **0.5px**

### Truncation
Sidebar and dense nav labels truncate with ellipsis when space is constrained.

---

## 4. Spacing System

Base unit: **4px**. All spacing should snap to multiples of 4 unless noted.

### Common scale
| Step | px |
|------|-----|
| 0 | 0 |
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 8 | 32 |
| 10 | 40 |
| 12 | 48 |
| 14 | 56 |
| 16 | 64 |

### Stack / gap tokens
| Name | px |
|------|-----|
| xs | 4 |
| sm | 8 |
| md | 16 |
| lg | 24 |
| xl | 32 |

### Dashboard density — Compact (default)

| Area | Value |
|------|-------|
| Page padding | 8px → 12px (≥640px) → 16px (≥1024px) |
| Section vertical gap | 16px |
| Block gap | 12px |
| Card padding (md) | 12px |
| Metrics grid gap | 10px → 12px (≥640px) |
| Table cell padding | 8px vertical, 10px horizontal |
| Page header bottom margin | 16px |

### Dashboard density — Comfortable

| Area | Value |
|------|-------|
| Page padding | 12px → 16px → 24px |
| Section vertical gap | 20px |
| Card padding (md) | 16px |
| Metrics grid gap | 12px |
| Table cell padding | 10px vertical, 12px horizontal |
| Page header bottom margin | 24px |

### Card padding variants
| Variant | Compact | Comfortable |
|---------|---------|-------------|
| none | 0 | 0 |
| sm | 10px | 12px |
| md | 12px | 16px |
| lg | 16px | 24px |

### Container max widths
| Name | px |
|------|-----|
| narrow | 1200 |
| default | 1600 |
| wide | 1920 |
| marketing xl | 1280 (with 16–32px horizontal gutter) |

### Shell dimensions

| Element | Compact | Comfortable |
|---------|---------|-------------|
| Top bar height | 60 | 69 |
| Left sidebar expanded | 224 | 256 |
| Left sidebar collapsed | 64 | 64 |
| Right copilot panel | 320 | 384 |
| Admin aside | 256 | 256 |

---

## 5. Layout Principles

### Page templates

1. **Dashboard shell** — left sidebar + sticky top bar + scrollable main + optional right AI panel
2. **Page scaffold** — skip link → breadcrumb → page header (title, description, actions, tabs) → optional toolbar → content
3. **Public marketing** — fixed header, flexible main, footer
4. **Admin console** — fixed 256px left nav + header bar + scrollable main
5. **Fullscreen AI** — no chrome; copilot occupies full viewport

### Sidebar
- Grouped sections, some always expanded
- Collapses to 64px icon rail
- Active item: **2px** left border in Primary, Surface Hover background, Primary icon color
- Row height: **36px** (compact) / **40px** (comfortable)
- Item border-radius: **8px**
- Hover: scale **1.02**; tap: scale **0.98**
- Keyboard: **⌘B** toggles left sidebar; **⌘/** toggles right panel

### Top bar
- Sticky, z-index **30**
- Subtle horizontal gradient: transparent → Primary 10% → transparent
- Contains: AI search, notifications, theme toggle, profile, context selectors

### Cards
- Default: Surface fill, **1px** Border, **8px** radius
- Chart sections: **16px** radius
- Premium / brand cards: **16px** radius + glow
- Marketing panels: **24px** radius + glass blur

### Content width
Main content centered (`max-width` + auto margins). Tables may span full width with horizontal scroll.

### Breakpoints

| Name | Min width |
|------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

**Mobile marketing (≤639px):** hide secondary CTAs; reduce hero type ~35%; tighten section padding; disable decorative ambient animations.

---

## 6. Shapes

### Border radius

| Token | px | Usage |
|-------|-----|-------|
| sm | 4 | Keyboard hints, small chips |
| md | 8 | Cards, inputs, nav items, icon containers |
| lg | 8 | Same as md — standard app corner |
| xl | 12 | Marketing buttons, chart tooltips, command palette |
| 2xl | 16 | Premium cards, chart containers, KPI chips |
| 3xl | 20–24 | Marketing cards (20), panels (24) |
| full | 9999px | Pills, FAB, kickers, status badges, step circles |

### Icon containers
- **Square rounded (8px):** 32 / 40 / 48px — tinted semantic background + centered icon
- **Page header icon:** gradient Primary 10% → Accent 5%, Primary 20% border, 8–12px radius
- **Workflow step:** 40px circle

---

## 7. Elevation

### Shadows — Light mode

| Token | Value |
|-------|-------|
| shadow-1 | `0 1px 3px rgba(28,25,23,0.1), 0 4px 12px rgba(28,25,23,0.08)` |
| shadow-2 | `0 4px 8px rgba(28,25,23,0.12), 0 12px 32px rgba(28,25,23,0.1)` |
| shadow-sm | `0 1px 2px rgba(0,0,0,0.05)` |
| shadow-md | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` |
| shadow-lg | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` |
| shadow-xl | `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` |
| shadow-glow | `0 0 40px rgba(30,64,175,0.15)` |
| brand-glow | `0 0 60px rgba(59,130,246,0.3)` |
| brand-glow-subtle | `0 0 30px rgba(59,130,246,0.15)` |
| gold-glow | `0 0 40px rgba(212,163,50,0.25)` |
| gold-glow-subtle | `0 0 20px rgba(212,163,50,0.12)` |

Dark mode: increase black opacity in shadows to **0.3–0.5**.

### Focus ring
`0 0 0 2px <background>, 0 0 0 4px rgba(<primary-rgb>, 0.4)` — light uses page background in the inner ring; dark uses dark background.

### Z-index scale

| Layer | Value |
|-------|-------|
| Sticky topbar | 30 |
| Drawer / overlay scrim | 40 |
| Dropdowns, toasts, modals, FAB | 50 |
| Mobile marketing menu | 60 |
| Command palette | 100 |

### Overlays
- Modal / drawer scrim: **50%** black
- Command palette scrim: `rgba(0,0,0,0.5)` + **4px** backdrop blur

### Card elevation philosophy
Default cards are **flat bordered** (no shadow). Reserve shadow-md+ for hover states, marketing glass, tooltips, and floating UI.

---

## 8. Components

### Buttons

#### App button (primary interactive)
| Property | Default |
|----------|---------|
| Variant | solid fill |
| Color | primary |
| Size | medium |
| Border radius | 8px (library default) |

**Variants:** solid, bordered, light, flat, faded, shadow, ghost  
**Colors:** default, primary, secondary, success, warning, danger  
**Sizes:** small, medium, large

#### Marketing button (CSS-style)
| Variant | Appearance |
|---------|------------|
| Primary | Blue gradient 135°, white text, 12px radius, 600 weight, 14px, shadow-md + blue glow; hover: lift -1px, stronger glow |
| Secondary | Transparent, 1px border, hover → primary border + primary tint bg |
| Tertiary | Ghost, muted text, hover → surface hover bg |

| Size | Padding | Radius | Font |
|------|---------|--------|------|
| sm | 8×16px | 10px | 13px |
| md | 12×24px | 12px | 14px |
| lg | 16×32px | 14px | 16px |

**States:** disabled = **60%** opacity, no transform; loading = inline spinner.

#### Icon button
Icon-only; default light variant on default color. **Requires accessible label.**

#### Floating action button
Fixed position; **full** radius; shadow-lg; hover scale **1.05**; one per screen max.

| Size | Min size |
|------|----------|
| sm | 48×48px |
| md | 56×56px |
| lg | 64×64px |

#### Toggle button group
Bordered container (8px radius, 4px inner padding). Selected = solid primary; unselected = transparent. Min touch target **44px** wide.

#### Dropdown button
Standard button + chevron + anchored menu below.

---

### Inputs

| Property | Value |
|----------|-------|
| Default style | bordered |
| Background | Surface Hover |
| Border | Border Subtle |
| Size | medium (default) |

**Marketing input:** 14px radius, glass background, focus border Primary + `0 0 0 3px rgba(59,130,246,0.15)`.

**Textarea:** same wrapper treatment as input.

---

### Select
Bordered trigger matching input styling. Used in filters, pagination, toolbars.

---

### Checkbox / Radio / Switch
Default color primary, size medium. Used in forms, tables, task lists.

---

### Cards

| Variant | Spec |
|---------|------|
| Standard | Surface, 1px border, 8px radius, density-based padding |
| Elevated | shadow-md; hover shadow-xl + translateY(-2px) + primary border |
| Premium | Gold-tinted border `rgba(212,163,50,0.3)`, gold-glow-subtle, 16px radius |
| Brand | Blue gradient wash top, primary border 20% opacity, brand-glow-subtle |
| Marketing glass | 20px radius, blur 22px, semi-transparent white/dark fill, inset top highlight |

---

### Tables

| Element | Spec |
|---------|------|
| Container | Card wrapper, no padding, horizontal scroll |
| Header row | Surface Hover bg, bottom border, 14px medium muted text |
| Header cell padding | 12px vertical, 16px horizontal |
| Body row | Bottom border; hover Surface Hover when clickable |
| Body cell padding | 12px vertical, 16px horizontal |
| Empty state | Centered, 48px vertical padding, muted text |
| Sort icon | 12px; active sort uses Primary color |

**Toolbar:** search field, result count badge, export action, column visibility control.  
**Pagination:** rows-per-page control + prev/next.

---

### Badges / Chips

#### Standard badge
Flat variant, default color, medium size. Built on pill/chip primitive.

#### Status badge
Pill shape; 10–15% semantic background tint; semantic text color.

| Size | Padding | Text | Icon |
|------|---------|------|------|
| sm | 8×4px | 12px | 12px |
| md | 10×4px | 14px | 14px |
| lg | 12×6px | 16px | 16px |

#### KPI chip
12px radius; bordered; 10px uppercase label; 14px semibold value; optional delta with arrow icon.

#### Marketing kicker
Pill; uppercase 12px; border + soft shadow.  
#### Marketing chip
Pill; 12px; glass blur background.

---

### Status color mapping

Apply **10%** bg / semantic text (light) or **15%** bg (dark).

| Status | Color |
|--------|-------|
| completed, confirmed, current, active, paid, approved, published, sent, filed, received, connected, settled, applied, released, exercised, distributed | success |
| in-progress, pending-approval, processing, running, syncing, review, draft, due-soon, expiring-soon, partial, on-hold, held, returned, amended, under-review | warning |
| pending, pending-review, queued, submitted, upcoming, scheduled, calculated, reviewed, approved (fund-admin) | info |
| overdue, failed, error, rejected, blocked, expired, at-risk | danger |
| cancelled, disconnected, exited, optional, coming-soon | neutral |
| available | primary |

Domain-specific overrides exist for compliance, tax, fund-admin, CRM, integrations, portfolio, documents, reports, and deal-intelligence — but all resolve to the same six semantic presets above.

---

### Alerts

| Property | Value |
|----------|-------|
| Layout | Left **4px** border accent + icon + content |
| Radius | 8px |
| Padding | 16px |
| Background | Semantic color at 10–15% |
| Icon | 20px |
| Title | Medium weight, semantic color |
| Body | 14px, default text color |

Variants: info, success, warning, danger. Optional dismiss control.

---

### Dialogs / Modals

| Property | Value |
|----------|-------|
| Default width | medium |
| Sizes | xs, sm, md, lg, xl, 2xl, full |
| Structure | header → body → footer |
| Scrim | 50% black |

**Side drawer:** slides from left or right; same scrim; shadow-2xl.  
**Command palette:** centered, max **640×640px**, 12px radius, z-index **100**.

---

### Navigation

| Element | Spec |
|---------|------|
| Breadcrumb | 14px, muted links → primary on hover, chevron separators |
| Tabs (page level) | Underlined; active tab Primary text + primary underline; optional count badge on tab |
| Nav group | Section label + collapsible items |
| AI nav suggestion | Sparkles icon + tooltip card on hover |

---

### Tooltips / popovers
Hover-triggered panels: 8px radius, shadow-xl, Surface bg, Border, min-width **280–320px**, **150ms** transition. Prefer a dedicated accessible tooltip primitive in new work.

---

### Empty / Loading / Error states

| State | Spec |
|-------|------|
| Empty | Centered; min-height **300px**; 48px icon at **50%** opacity; 18px title |
| Loading | Centered; min-height **400px**; spinning brand mark in Primary; muted message |
| Error | Card with large padding; danger icon 48px; 18px title; 14px message; optional retry CTA |
| Skeleton | 8px radius; Surface Hover shimmer pulse |

---

### Toasts

| Property | Value |
|----------|-------|
| Position | Fixed top-right |
| Width | 320px |
| Stack gap | 12px |
| Duration | 4000ms default |
| Style | 8px radius, border, shadow-lg, semantic tint bg |
| a11y | `aria-live` assertive for error/warning; polite for info/success |

---

### Charts
- Fill available width/height responsively
- Use semantic token colors for series
- Tooltip: 12px radius, surface + border
- Section header above chart: compact lane header pattern (title 14px semibold, optional uppercase badge)

---

### Icons

**Style:** Lucide-compatible outline/stroke icons (no filled set except workflow current-step dot).

| Size | px |
|------|-----|
| xs | 12 |
| sm | 16 |
| md | 20 |
| lg | 24 |
| xl | 32 |

**Conventions:**
- Inline chrome: 16–20px
- Command palette items: 18px
- Sparkles icon = AI features
- Semantic colors match text token colors
- Pair status icons with status badges when `showIcon` is enabled

---

### Search
Toolbar: input with leading search icon (16px, Text Subtle) + optional filter pills + optional dropdown filter.  
Topbar AI search: wide field with sparkles icon when AI results present; dropdown results at z-index **50**.

---

### Progress

| Type | Spec |
|------|------|
| Linear (library) | Themed semantic colors |
| Custom bar | Full-radius track; heights 4 / 8 / 12px; animated fill 500ms ease-out |

---

### Workflow stepper

| Step state | Circle fill | Icon |
|------------|-------------|------|
| completed | Success | check, white |
| current | Primary | pulsing dot, white |
| blocked | Danger | warning triangle, white |
| upcoming | Surface Hover | outline circle, Text Subtle |

Circle: **40px**. Connector: **2px** line; completed segments use Success color. Optional AI prediction card below step with Primary 5% tint background.

---

## 9. Motion

### Durations

| Token | ms | Usage |
|-------|-----|-------|
| fast | 150 | Nav, tooltips, breadcrumbs |
| normal | 200–300 | Sidebars, buttons, page fade |
| marketing | 240–280 | Marketing links, cards |
| slow | 500–600 | Progress fill, workflow connectors |
| ambient | 4000–18000 | Marketing float/drift loops |

### Easing
- Standard: `ease`, `ease-in-out`, `ease-out`
- Emphasis: `cubic-bezier(0.4, 0, 0.2, 1)`

### Interactions
| Element | Behavior |
|---------|----------|
| Card (premium) | hover: translateY(-2px), stronger shadow |
| Nav item | hover scale 1.02, tap 0.98 |
| Link | underline on hover, offset 4px |
| Marketing nav link | gradient underline scaleX 0→1 |
| FAB | hover scale 1.05 |
| Page enter | opacity 0→1, 300ms |
| Sidebar width | 200ms ease-in-out |

### Keyframes

| Name | Behavior |
|------|----------|
| float | ±10px vertical, 6s infinite |
| pulse-glow | brand glow oscillation, 4s |
| fade-in-up | 20px up + fade in, 0.6s |
| gradient-shift | background position sweep, 3s |
| marketing-float | -12px drift, 14s |
| marketing-drift | translate + scale, 18s |
| marketing-pulse | opacity + scale, 4.8s |

### Reduced motion
Under `prefers-reduced-motion: reduce` on marketing pages: set all animation/transition durations to **~0ms**, disable ambient marketing animations. Extend this globally in new implementations.

---

## 10. Iconography

See **§8 Icons**. Use a single outline icon library consistently. Do not mix filled and outline sets. AI features always use a sparkles/star motif.

---

## 11. Imagery

### Brand mark
Full-color logo on transparent background — used in favicon, app icon, and loading spinner.

### Illustration themes (SVG)
- Decision intelligence
- Operational autonomy
- Relationship intelligence
- Temporal memory

### Marketing atmosphere assets
- Signal grid overlay (low opacity)
- Hero atmosphere gradient
- Footer wave pattern

### Treatment
- **Marketing:** gradient orbs, glass panels, soft-light overlay on shell
- **Product UI:** illustration + data viz; no stock photography system
- **Module previews:** dark contrast panels with metric rows and accent labels (blue / gold / cyan)

---

## 12. Accessibility

### Required conventions

| Area | Rule |
|------|------|
| Focus | Visible focus ring on all interactive elements; 2px inner + 4px outer primary ring |
| Skip link | Hidden until focused; jumps to main content |
| Icon buttons | Always provide accessible name |
| Alerts | `role="alert"` |
| Toasts | `role="alert"` or `role="status"` + `aria-live` |
| Progress | `role="progressbar"` with value min/max/now |
| Workflow | `role="list"`; `aria-current="step"` on active step |
| Toggle groups | `role="group"`; `aria-pressed` per option |
| Theme toggle | `aria-label="Toggle theme"` |
| Touch targets | Minimum **44×44px** for primary tap targets |
| Keyboard | Document sidebar shortcuts (⌘B, ⌘/) |

### Gaps to close in new implementations
- Global `prefers-reduced-motion` (not only marketing)
- Keyboard-accessible tooltips and hover-only dropdowns
- Consistent focus styling on all form controls from the component library

---

## 13. Design Tokens

Canonical token names use the `--app-*` prefix. Map to your framework (CSS variables, Tailwind theme, design tokens JSON, etc.).

### Colors (light / dark)

```
--app-bg                 #fafaf9 / #0c0a09
--app-surface            #ffffff / #1c1917
--app-surface-2          #f5f5f4 / #292524
--app-surface-hover      #e7e5e4 / #44403c
--app-border             #d6d3d1 / #44403c
--app-border-subtle      #e7e5e4 / #292524
--app-border-strong      #a8a29e / #57534e
--app-text               #1c1917 / #fafaf9
--app-text-muted         #57534e / #a8a29e
--app-text-subtle        #78716c
--app-primary            #1e40af / #3b82f6
--app-primary-hover      #1d4ed8 / #60a5fa
--app-primary-bg         rgba(30,64,175,0.1) / rgba(59,130,246,0.15)
--app-secondary          #d4a332 / #fbbf24
--app-secondary-bg       rgba(212,163,50,0.1) / rgba(251,191,36,0.15)
--app-accent             #2563eb / #60a5fa
--app-accent-bg          rgba(37,99,235,0.1) / rgba(96,165,250,0.15)
--app-success            #16a34a / #22c55e
--app-success-bg         rgba(22,163,74,0.1) / rgba(34,197,94,0.15)
--app-warning            #d97706 / #f59e0b
--app-warning-bg         rgba(217,119,6,0.1) / rgba(245,158,11,0.15)
--app-danger             #dc2626 / #ef4444
--app-danger-bg          rgba(220,38,38,0.1) / rgba(239,68,68,0.15)
--app-info               #0891b2 / #06b6d4
--app-info-bg            rgba(8,145,178,0.1) / rgba(6,182,212,0.15)
--app-neutral            #6b7280 / #9ca3af
--app-neutral-bg         rgba(107,114,128,0.1) / rgba(156,163,175,0.15)
```

### Elevation

```
--app-shadow-1           (see §7)
--app-shadow-2
--shadow-sm … --shadow-xl
--shadow-glow
--brand-glow / --brand-glow-subtle
--gold-glow / --gold-glow-subtle
--app-focus-ring         2px bg + 4px primary/40
```

### Spacing, type, radius, motion, z-index
See §3–§7 and token appendix below.

---

## 14. Design Rules

### DO
- Use **Blue & Gold** for all brand moments
- Map statuses to the six semantic presets (success, warning, info, danger, neutral, primary)
- Default authenticated UI to **compact** density
- Use **8px** radius on standard cards and inputs
- Use **outline icons** at 16–20px for UI chrome
- Use **left 4px border** on alerts
- Use **pill shape** for status badges
- Keep the topbar **sticky** with a subtle primary gradient wash
- Scope marketing glass styles to **public pages only**
- Tint status backgrounds at **10%** (light) or **15%** (dark)
- Provide **accessible names** on all icon-only controls
- Use **one FAB** per screen maximum

### DON'T
- Don't introduce off-palette colors without adding them to the token set
- Don't use **emerald green** (`#047857`, `rgba(4,120,87,…)`) — deprecated legacy accent
- Don't put heavy shadows on every card
- Don't exceed **~600ms** for functional UI transitions (ambient marketing loops excepted)
- Don't rely on **hover-only** for essential actions
- Don't mix multiple button radius systems — pick one per surface (8px app, 12px marketing)
- Don't use multiple FABs on one screen

---

## 15. Adopting in a New Project

1. **Copy the CSS variable blocks** from the appendix into your global stylesheet (light `:root` + dark `.dark`).
2. **Map tokens** to your styling system (Tailwind `extend.colors`, MUI theme, styled-components, etc.).
3. **Load fonts** — Manrope + Space Grotesk for marketing; system UI for app (or load Manrope everywhere for consistency).
4. **Implement three contexts** — default app, dashboard home skin, public marketing — as separate token scopes or theme variants.
5. **Build or import components** matching §8 specs; align border-radius and density tokens first.
6. **Wire dark mode** via class or `data-theme` on the root element.
7. **Use the status mapping table** for all domain statuses.

---

## Appendix A — Copy-paste CSS Variables (Light)

```css
:root {
  --app-bg: #fafaf9;
  --app-surface: #ffffff;
  --app-surface-2: #f5f5f4;
  --app-surface-hover: #e7e5e4;
  --app-border: #d6d3d1;
  --app-border-subtle: #e7e5e4;
  --app-border-strong: #a8a29e;
  --app-text: #1c1917;
  --app-text-muted: #57534e;
  --app-text-subtle: #78716c;
  --app-primary: #1e40af;
  --app-primary-hover: #1d4ed8;
  --app-primary-bg: rgba(30, 64, 175, 0.1);
  --app-secondary: #d4a332;
  --app-secondary-bg: rgba(212, 163, 50, 0.1);
  --app-accent: #2563eb;
  --app-accent-bg: rgba(37, 99, 235, 0.1);
  --app-success: #16a34a;
  --app-success-bg: rgba(22, 163, 74, 0.1);
  --app-warning: #d97706;
  --app-warning-bg: rgba(217, 119, 6, 0.1);
  --app-danger: #dc2626;
  --app-danger-bg: rgba(220, 38, 38, 0.1);
  --app-info: #0891b2;
  --app-info-bg: rgba(8, 145, 178, 0.1);
  --app-neutral: #6b7280;
  --app-neutral-bg: rgba(107, 114, 128, 0.1);
  --app-shadow-1: 0 1px 3px rgba(28, 25, 23, 0.1), 0 4px 12px rgba(28, 25, 23, 0.08);
  --app-shadow-2: 0 4px 8px rgba(28, 25, 23, 0.12), 0 12px 32px rgba(28, 25, 23, 0.1);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 40px rgba(30, 64, 175, 0.15);
  --brand-glow: 0 0 60px rgba(59, 130, 246, 0.3);
  --brand-glow-subtle: 0 0 30px rgba(59, 130, 246, 0.15);
  --gold-glow: 0 0 40px rgba(212, 163, 50, 0.25);
  --gold-glow-subtle: 0 0 20px rgba(212, 163, 50, 0.12);
  --app-focus-ring: 0 0 0 2px #fafaf9, 0 0 0 4px rgba(30, 64, 175, 0.4);
  font-size: 16px;
}
```

## Appendix B — Copy-paste CSS Variables (Dark)

```css
.dark {
  --app-bg: #0c0a09;
  --app-surface: #1c1917;
  --app-surface-2: #292524;
  --app-surface-hover: #44403c;
  --app-border: #44403c;
  --app-border-subtle: #292524;
  --app-border-strong: #57534e;
  --app-text: #fafaf9;
  --app-text-muted: #a8a29e;
  --app-text-subtle: #78716c;
  --app-primary: #3b82f6;
  --app-primary-hover: #60a5fa;
  --app-primary-bg: rgba(59, 130, 246, 0.15);
  --app-secondary: #fbbf24;
  --app-secondary-bg: rgba(251, 191, 36, 0.15);
  --app-accent: #60a5fa;
  --app-accent-bg: rgba(96, 165, 250, 0.15);
  --app-success: #22c55e;
  --app-success-bg: rgba(34, 197, 94, 0.15);
  --app-warning: #f59e0b;
  --app-warning-bg: rgba(245, 158, 11, 0.15);
  --app-danger: #ef4444;
  --app-danger-bg: rgba(239, 68, 68, 0.15);
  --app-info: #06b6d4;
  --app-info-bg: rgba(6, 182, 212, 0.15);
  --app-neutral: #9ca3af;
  --app-neutral-bg: rgba(156, 163, 175, 0.15);
  --app-shadow-1: 0 1px 3px rgba(0, 0, 0, 0.35), 0 6px 16px rgba(0, 0, 0, 0.3);
  --app-shadow-2: 0 4px 8px rgba(0, 0, 0, 0.4), 0 16px 40px rgba(0, 0, 0, 0.35);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 50px rgba(59, 130, 246, 0.2);
  --brand-glow: 0 0 80px rgba(59, 130, 246, 0.4);
  --brand-glow-subtle: 0 0 40px rgba(59, 130, 246, 0.2);
  --gold-glow: 0 0 50px rgba(251, 191, 36, 0.3);
  --gold-glow-subtle: 0 0 25px rgba(251, 191, 36, 0.15);
  --app-focus-ring: 0 0 0 2px #0c0a09, 0 0 0 4px rgba(59, 130, 246, 0.5);
}
```

## Appendix C — Dashboard Home Skin Override (Light)

```css
.theme-dashboard-home {
  --app-bg: #f4f6fb;
  --app-surface: #ffffff;
  --app-surface-2: #f3f6fc;
  --app-surface-hover: #eef3fb;
  --app-border: #d7e0ef;
  --app-border-subtle: #e7edf8;
  --app-border-strong: #b6c4df;
  --app-text: #0f172a;
  --app-text-muted: #475569;
  --app-text-subtle: #64748b;
  --app-primary: #2563eb;
  --app-primary-hover: #1d4ed8;
  --app-primary-bg: rgba(37, 99, 235, 0.12);
  --app-secondary: #f59e0b;
  --app-secondary-bg: rgba(245, 158, 11, 0.14);
  --app-success: #10b981;
  --app-success-bg: rgba(16, 185, 129, 0.14);
  --app-danger: #f43f5e;
  --app-danger-bg: rgba(244, 63, 94, 0.16);
  --app-info: #3b82f6;
  --app-info-bg: rgba(59, 130, 246, 0.14);
}
```

## Appendix D — Viewport / PWA Theme Colors

| Context | Light | Dark |
|---------|-------|------|
| App (use this) | `#1e40af` | `#0c0a09` |
| Public marketing | `#ffffff` | `#000000` |

> **Note:** Do not use `#047857` (legacy emerald) — it is outside the current brand system.

## Appendix E — Deprecated Patterns (do not carry forward)

| Pattern | Replacement |
|---------|-------------|
| Emerald green glow `rgba(4,120,87,0.3)` on active nav | Primary blue glow `rgba(59,130,246,0.3)` |
| `text-vesta` / `card-vesta` aliases | `text-brand` / `card-brand` (blue gradient) |
| themeColor `#047857` | `#1e40af` (light) / `#0c0a09` (dark) |
| Three incompatible button radii on one surface | 8px app, 12px marketing — never mixed on the same page |

---

*VestLedger Design System — portable specification. All values are authoritative; implement with any stack.*
