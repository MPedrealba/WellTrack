# WellTrack Design Guidelines

## Design Approach

**Selected Framework:** Hybrid approach inspired by Apple Human Interface Guidelines (for calming clarity) and modern health-tech applications (Headspace, Calm, Better Help) that balance data visualization with emotional warmth.

**Core Principles:**
- **Trustworthy Simplicity:** Clear, uncluttered interfaces that reduce cognitive load for students experiencing stress
- **Gentle Data Visualization:** Present analytics in digestible, non-alarming ways
- **Accessible Warmth:** Professional yet approachable aesthetic that encourages daily engagement
- **Purposeful Motion:** Minimal, meaningful animations that support (never distract from) mental wellness goals

---

## Typography System

**Primary Font:** Inter or SF Pro (Google Fonts CDN)
- Headings: 600-700 weight
- Body: 400-500 weight
- Data/Metrics: 500-600 weight (tabular numbers)

**Type Scale:**
- Hero/Page Titles: text-4xl to text-5xl
- Section Headers: text-2xl to text-3xl  
- Card Titles: text-lg to text-xl
- Body Text: text-base
- Captions/Meta: text-sm
- Button Text: text-sm to text-base, font-medium

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistency
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Margins: m-4, m-6, m-8

**Grid Strategy:**
- Student Dashboard: Single column mobile, 2-3 column desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Admin Dashboard: Dense data grid with 12-column system for complex layouts
- Content max-width: max-w-7xl for dashboards, max-w-4xl for focused content

---

## Component Library

### Navigation
**Student Navigation:**
- Top navigation bar with logo, main sections (Dashboard, Resources, Profile)
- Sticky header with subtle shadow on scroll
- Mobile: Hamburger menu expanding to full-screen overlay

**Admin Navigation:**
- Persistent sidebar (w-64) with collapsible option
- Quick stats widget in sidebar header
- Mobile: Bottom tab bar for primary functions

### Mood Logging Interface (Student Core Feature)
**Emoji Scale Component:**
- 5 large, tappable emoji buttons (min 48px touch target)
- Horizontal layout on all viewports
- Clear visual feedback on selection (scale up slightly, add subtle outline)
- Below emojis: Optional text input (textarea, 3-4 rows) for journal entry

**Daily Check-in Card:**
- Prominent placement on student dashboard
- Shows current streak count
- Simple "Log Today's Mood" CTA button
- Displays last entry timestamp

### Dashboard Cards

**Student Dashboard Cards:**
- Rounded corners (rounded-xl)
- Subtle elevation (shadow-md)
- Padding: p-6 to p-8
- Cards include: Today's Check-in, Mood History Graph, Wellness Tips, Resources

**Admin Dashboard Cards:**
- More data-dense with tighter padding (p-4 to p-6)
- Cards include: At-Risk Alerts, Student Overview Stats, Trend Analytics, Recent Activity Feed

### Data Visualization

**Charts & Graphs:**
- Use Chart.js or Recharts for mood trend visualization
- Line charts for individual student mood over time (7-day, 30-day views)
- Bar charts for aggregate admin data
- Soft, rounded chart elements (no harsh angles)
- Clear axis labels and legends

**Alert System (Admin):**
- Distinct alert cards with left border accent
- Alert levels: Urgent (immediate attention), Concerning (monitor closely), Informational
- Includes student pseudonym, alert reason, timestamp, "View Details" action
- Limit to 5-10 alerts visible, "View All" link

### Forms & Inputs

**Text Inputs:**
- Height: h-12 for single-line, min-h-24 for textarea
- Rounded corners: rounded-lg
- Clear labels above inputs (text-sm, font-medium)
- Placeholder text in reduced opacity

**Buttons:**
- Primary CTA: Large (h-12), rounded-lg, font-medium
- Secondary actions: Medium (h-10), outlined variant
- Tertiary/Text buttons: No background, underline on hover
- Icon buttons: Square (w-10 h-10), rounded-full for circular

**Radio/Checkbox:**
- Large touch targets (min 40px)
- Clear labels with adequate spacing (gap-3)

### Resource Section

**Resource Cards:**
- Grid layout: 1 column mobile, 2-3 columns desktop
- Each card: Image/icon header, title (text-lg font-semibold), brief description, "Read More" link
- Categories: Stress Management, Sleep Health, Academic Wellness, Crisis Support

### Educational Content

**Wellness Tips:**
- Rotating daily tip displayed prominently on student dashboard
- Light, encouraging tone
- Card format with icon, heading, 2-3 sentence description

---

## Images

**Student Dashboard:**
- Small illustrative icons for mood states (use Heroicons or custom wellness icons)
- Wellness tip cards: Soft, abstract illustrations or nature imagery (400x300px)
- No large hero image needed

**Admin Dashboard:**  
- Minimal imagery - focus on data clarity
- User avatars: Circular placeholders (w-10 h-10) with initials

**Resource Section:**
- Each resource card includes relevant imagery (mental health themes, calming nature, supportive illustrations)
- Image size: 400x250px, object-cover with rounded-t-lg

**Login/Onboarding:**
- Small hero section (50vh) with calming abstract background or gentle gradient
- Centered login card overlaying hero

---

## Accessibility & Interaction

- All interactive elements: min 44px touch target
- Form validation: Inline error messages below inputs
- Loading states: Subtle skeleton screens or spinner for data fetching
- Focus indicators: Clear outline on keyboard navigation
- Aria labels on icon-only buttons

---

## Animation Guidelines

**Use Sparingly:**
- Mood emoji selection: Gentle scale transform (scale-105) on tap
- Card hover: Subtle lift (translate-y-1, shadow-lg transition)
- Chart data: Smooth animate-in on load (0.3s ease)
- Page transitions: Simple fade (no elaborate animations)

**Never Animate:**
- Alert notifications (keep stable for clarity)
- Critical data updates
- Background elements

---

## Responsive Breakpoints

- Mobile: Default (< 768px) - Stack all cards, full-width
- Tablet: md (768px+) - 2-column grids where appropriate
- Desktop: lg (1024px+) - 3-column grids, full sidebar for admin
- Wide: xl (1280px+) - Expanded spacing, max-w-7xl containers

---

**Icon Library:** Heroicons (via CDN) - use outline variant for navigation, solid for status indicators

This design creates a calming, trustworthy environment where students feel safe logging their mental state daily, while providing administrators with clear, actionable insights through professional data visualization.