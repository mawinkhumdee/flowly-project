# Flow Travel

## Product Overview

**The Pitch:** A minimalist travel timeline that treats your trip like a fluid checklist. Instead of complex itineraries, users get a continuous thread of locations connected by real-time transit estimates.

**For:** Spontaneous travelers and day-planners who value "what's next" over rigid scheduling. They care about flow, logistics, and visual clarity.

**Device:** Mobile (Responsive web app optimization)

**Design Direction:** **"Soft Utility."** A vertical spine connects floating islands of content. The aesthetic is pillowy and approachable—reminiscent of premium Japanese stationery. High legibility, rounded geometry, and a sense of calm progression.

**Inspired by:** *Minimalist weather apps (Not Boring Weather), linear habit trackers, Japanese transit maps.*

---

## Screens

- **1. The Stream (Main):** Vertical timeline of locations with travel interpolation.
- **2. The Compass (Map):** Interactive map view with connected route nodes.
- **3. Location Detail:** Edit drawer for notes, times, and drag-and-drop reordering.
- **4. Trip Manager:** High-level view to switch between different trip lists.

---

## Key Flows

**Add Stop to Timeline:**
1. User is on **The Stream** -> taps floating input bar at bottom.
2. User types "Cafe Mogador" -> selects from auto-complete dropdown.
3. System inserts "Cafe Mogador" at end of list -> instantly calculates travel time from previous stop.

**Complete a Stop:**
1. User is on **The Stream** -> physically arrives at location.
2. User swipes "MoMA" card right -> card dims, checkbox animates to filled state, connector line turns solid/active color.

**Switch to Map:**
1. User is on **The Stream** -> taps "Compass" toggle in header.
2. View flips to **The Compass** -> map centers on current location with route polyline drawn.

---

<details>
<summary>Design System</summary>

## Color Palette

- **Primary:** `#3B4D61` - Slate Blue (Headings, active icons)
- **Background:** `#F7F5F2` - Warm Rice Paper (Page background)
- **Surface:** `#FFFFFF` - Cards, Input fields
- **Text:** `#2C333A` - Primary Body
- **Muted:** `#9AA5B1` - Timestamps, connector lines (inactive)
- **Accent:** `#8D99AE` - Cool Grey (Travel times pill background)
- **Success:** `#8CB369` - Sage Green (Completed state, active route line)
- **Highlight:** `#E6B89C` - Soft Terracotta (Current location marker)

## Typography

**Font Family:** *Satoshi* (Geometric sans with character) or *General Sans*.

- **Headings:** Satoshi-Bold, 20px (Compact, tight tracking)
- **Body:** Satoshi-Medium, 16px (High readability)
- **Meta:** Satoshi-Medium, 13px (Travel time pills)
- **Tiny:** Satoshi-Bold, 11px (Labels, uppercase)

**Style Notes:**
- **Radius:** `24px` on cards (Super rounded)
- **Shadows:** `0 4px 20px -8px rgba(59, 77, 97, 0.08)` (Soft, diffuse lift)
- **Lines:** `3px` width for timeline connectors (Chunky, friendly lines)

## Design Tokens

```css
:root {
  --color-primary: #3B4D61;
  --color-background: #F7F5F2;
  --color-surface: #FFFFFF;
  --color-text: #2C333A;
  --color-muted: #9AA5B1;
  --color-success: #8CB369;
  --font-primary: 'Satoshi', sans-serif;
  --radius-lg: 24px;
  --radius-pill: 999px;
  --spacing-base: 16px;
}
```

</details>

---

<details>
<summary>Screen Specifications</summary>

### 1. The Stream (Main)

**Purpose:** The core interface. Shows the chronological sequence of stops.

**Layout:**
- **Header:** Sticky top. Minimal. Trip Title (left), Map Toggle (right).
- **Body:** Scrollable vertical list. Central timeline spine connects cards.
- **Footer:** Sticky bottom. Floating input field.

**Key Elements:**
- **Timeline Spine:** 3px vertical line (dashed = future, solid = traveled). Centers horizontally or aligns left depending on card layout.
- **Location Card:**
    - White surface, `24px` radius.
    - Left side: Time anchor (e.g., "10:00 AM").
    - Center: Location Name (Bold).
    - Right: Drag handle (six dots).
- **Travel Pill:** Small pill shape *between* cards on the spine.
    - Text: "15 min walk" or "20 min Uber".
    - Background: `--color-accent` (20% opacity).
- **Input Field:** Pill-shaped, floating `16px` above bottom edge.
    - Text: "Add next stop..."
    - Icon: Plus (`+`) on right.

**States:**
- **Empty:** "Start your journey" illustration centered. Input field invites first stop.
- **Completed Item:** Card opacity 50%. Title strikethrough. Spine turns Sage Green.
- **Active Item:** Pulsing ring around the timeline node.

**Interactions:**
- **Swipe Card Right:** Triggers completion state. Haptic feedback.
- **Tap Travel Pill:** Toggles between "Walk/Drive/Transit" modes.

**Responsive:**
- **Mobile:** Single column. Input fixed bottom.
- **Desktop:** Centered column (max-width 480px). Background pattern added to empty space.

### 2. The Compass (Map)

**Purpose:** Visualizing the spatial relationship between stops.

**Layout:** Full-screen map view.

**Key Elements:**
- **Map Layer:** Custom Mapbox style (muted colors, removed POI clutter).
- **Route Line:** Thick polyline connecting numbered pins.
    - Dashed line for future segments.
    - Solid line for completed segments.
- **Pins:** Circular markers containing the stop order number (1, 2, 3).
- **List Toggle:** Floating button bottom-right (Fab) to return to Stream.

**Interactions:**
- **Tap Pin:** Opens small tooltip with Location Name + "Navigate" button.

### 3. Location Detail (Drawer)

**Purpose:** Editing specifics of a stop.

**Layout:** Bottom-sheet modal (height: auto or 60%).

**Key Elements:**
- **Handle:** Grey bar for drag-to-dismiss.
- **Title Input:** Large text field (edit name).
- **Time Picker:** "Arrival Time" / "Duration".
- **Notes Area:** "Gate code: 1234", "Reservation under Sam".
- **Delete Button:** Red text, bottom center.

**Interactions:**
- **Click Overlay:** Closes drawer.

### 4. Trip Manager

**Purpose:** Switching between different days or trips.

**Layout:** Grid of cards.

**Key Elements:**
- **Create New:** Dashed border card, centered `+`.
- **Trip Card:**
    - Title: "Tokyo Day 1"
    - Meta: "5 stops • 4h 30m"
    - Visual: Mini-preview of the route line shape.

</details>

---

<details>
<summary>Build Guide</summary>

**Stack:** HTML + Tailwind CSS v3

**Build Order:**
1. **The Stream:** This defines the core interaction model (timeline, cards) and the primary CSS variables. Without the timeline logic, the other screens hold no value.
2. **Location Detail:** Required for CRUD operations on the stream items.
3. **The Compass:** Can be integrated last as a visual representation of the existing data in The Stream.
4. **Trip Manager:** Meta-layer needed only when multiple lists are supported.


### 5. Technical Stack

**Frontend:** React + Tailwind CSS v3
**Backend:** golang 1.26
**Database:** MongoDB

</details>