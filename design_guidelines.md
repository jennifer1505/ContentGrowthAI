# Design Guidelines: AI-Powered Marketing Content Pipeline

## Design Approach

**Selected Approach:** Modern SaaS Dashboard (Design System)
**Justification:** Utility-focused productivity tool requiring efficient data visualization, workflow management, and analytics display. Drawing inspiration from Linear's clean aesthetics, Notion's content management UX, and HubSpot's familiar CRM patterns.

**Core Design Principles:**
- Information clarity over decoration
- Efficient workflow with minimal cognitive load
- Professional, trustworthy aesthetic for B2B context
- Data-first visual hierarchy

---

## Color Palette

**Dark Mode (Primary):**
- Background Primary: 222 15% 11%
- Background Secondary: 222 13% 15%
- Background Elevated: 222 12% 18%
- Border Subtle: 217 10% 25%
- Text Primary: 210 10% 95%
- Text Secondary: 210 8% 70%
- Text Muted: 210 8% 50%

**Brand & Accent Colors:**
- Primary Brand: 250 70% 60% (vibrant purple for CTAs, active states)
- Success: 142 70% 50% (performance indicators, positive metrics)
- Warning: 38 92% 60% (alerts, moderate engagement)
- Danger: 0 72% 60% (errors, low performance)
- Info: 210 70% 60% (neutral information, tooltips)

**Light Mode:**
- Background: 0 0% 100%
- Surface: 210 15% 98%
- Border: 217 10% 88%
- Text Primary: 222 15% 15%

---

## Typography

**Font Family:**
- Primary: 'Inter' (from Google Fonts CDN)
- Monospace: 'JetBrains Mono' (for code snippets, API responses)

**Type Scale:**
- Display (Hero): 2.5rem / 600 weight / -0.02em tracking
- H1 (Section Headers): 2rem / 600 weight / -0.01em tracking
- H2 (Card Titles): 1.5rem / 600 weight
- H3 (Subsections): 1.25rem / 600 weight
- Body Large: 1rem / 400 weight / 1.6 line-height
- Body Default: 0.875rem / 400 weight / 1.5 line-height
- Caption: 0.75rem / 400 weight / text-muted color
- Label: 0.75rem / 500 weight / uppercase / 0.05em tracking

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 3, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (form labels, inline elements): p-2, gap-2
- Component padding: p-4, p-6
- Card spacing: p-6, p-8
- Section spacing: py-12, py-16, py-20
- Page margins: px-8, max-w-7xl container

**Grid System:**
- Dashboard grid: 12-column responsive grid
- Primary content area: 8-9 columns
- Sidebar (if needed): 3-4 columns
- Metric cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

---

## Component Library

### Navigation
- **Top Navigation Bar:** Fixed header with logo left, navigation center, user profile right, h-16, backdrop-blur with bg-opacity-90
- **Sidebar Navigation (Optional):** Left-aligned, w-64, collapsible on mobile, icon + label pattern

### Core UI Elements
- **Buttons:** 
  - Primary: bg-primary, px-6, py-2.5, rounded-lg, font-medium
  - Secondary: border-2, variant outline, backdrop-blur when on images
  - Ghost: hover:bg-secondary for nav items
- **Input Fields:** h-10, px-4, rounded-lg, border, focus ring with primary color
- **Cards:** bg-elevated, rounded-xl, p-6, border-subtle, shadow-sm hover:shadow-md transition

### Data Visualization
- **Metric Cards:** 
  - Large number display (2.5rem, font-semibold)
  - Label below (caption style, text-muted)
  - Trend indicator (arrow icon + percentage, color-coded)
  - 4-column grid on desktop, stack on mobile
  
- **Performance Tables:**
  - Striped rows for readability
  - Fixed header on scroll
  - Action buttons right-aligned
  - Hover state highlights row

- **Charts/Graphs:**
  - Use Chart.js or Recharts library
  - Consistent color palette from design system
  - Tooltips on hover
  - Responsive sizing

### Content Displays
- **Generated Content Preview:**
  - Blog preview: max-w-3xl, prose styling, bg-surface card
  - Newsletter variants: 3-column grid (stack mobile), compact cards
  - Syntax highlighting for JSON/API responses

- **Campaign Log:**
  - Timeline view with dates on left
  - Campaign cards showing: title, date, personas targeted, quick metrics
  - Expandable for full details

### Forms & Workflows
- **Content Generation Form:**
  - Single-column layout, max-w-2xl centered
  - Topic input: large textarea, h-24
  - Persona selection: checkbox group with icons
  - Generate button: prominent, full-width on mobile
  
- **Dashboard Controls:**
  - Filter bar: flex layout with dropdowns, date pickers
  - Search: icon prefix, w-full md:w-96

### Overlays
- **Modals:** max-w-2xl, centered, backdrop-blur overlay, slide-in animation
- **Toasts:** top-right position, auto-dismiss, status icon + message
- **Tooltips:** Small, dark, rounded, appear on hover with 200ms delay

---

## Page Layouts

### Dashboard Home
- **Hero Metrics:** 4-metric card grid at top (Total Campaigns, Avg Open Rate, Top Persona, Recent Activity)
- **Two-Column Layout:**
  - Left (60%): Recent campaigns table, performance chart
  - Right (40%): Quick actions card, AI insights summary
- No traditional hero image - focus on data immediacy

### Content Generation Page
- **Centered workflow:** max-w-4xl, step-by-step card progression
- **Live preview:** Split view showing input left, AI output right (desktop), stacked (mobile)

### Analytics & Reporting
- **Full-width charts:** Time-series performance graph spanning top
- **Persona Comparison:** 3-column cards showing metrics by segment
- **Historical Data Table:** Full-width, pagination, export button

---

## Animations

**Minimal, Purposeful Motion:**
- Button hover: transform scale(1.02), 150ms
- Card hover: shadow elevation change, 200ms
- Page transitions: fade-in, 300ms
- Loading states: spinner or skeleton screens
- **Avoid:** Parallax, scroll-triggered animations, decorative motion

---

## Images

**No Hero Image Required** - This is a utility dashboard prioritizing immediate functionality over visual storytelling.

**Icon Usage:**
- Use Heroicons via CDN for all UI icons
- Persona icons: briefcase (Founders), palette (Creatives), cog (Ops)
- Metric icons: arrow-up/down for trends, chart icons for analytics
- Status icons: check-circle (success), exclamation (warning), x-circle (error)

**Illustrations (Optional):**
- Empty states: Simple line illustrations for "No campaigns yet"
- 404/Error pages: Minimal geometric illustration