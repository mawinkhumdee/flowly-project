# Flow Travel - Project Planning

As the Lead Software Engineer, here is the technical roadmap and execution plan for building the **Flow Travel** application based on the requirements defined in `readme.md`. We are prioritizing "The Stream" as the core interaction model and adhering to the "Soft Utility" design language.

## 1. Technical Architecture & Tech Stack

Our stack is defined as:
*   **Frontend:** React + Tailwind CSS v3 (Responsive mobile-first web app)
*   **Backend:** Golang 1.26
*   **Database:** MongoDB
*   **Mapping:** Mapbox (for custom muted styles and route drawing)

### Core System Design
*   **Client-Side State:** We will likely need a robust state manager (like Zustand or Redux Toolkit) in the frontend to handle the complex optimistic UI updates (e.g., drag-and-drop reordering, instant travel time calculations, and swiping to complete).
*   **Backend Architecture:** The Golang backend will follow a clean, layered architecture (Handlers/Controllers -> Services -> Repositories) for maintainability.
*   **Routing & Travel Calculation:** We will need to integrate a third-party API (like Google Maps Distance Matrix API or Mapbox Directions API) on the backend to dynamically calculate travel times ("15 min walk", "20 min Uber") between consecutive location nodes.

---

## 2. Database Schema Design (High-Level)

To support the fluid timeline and trip manager, we need a flexible document structure in MongoDB:

*   **`users` Collection:** Authentication and user profiles.
*   **`trips` Collection:**
    *   `_id`, `user_id`, `title` (e.g., "Tokyo Day 1")
    *   `created_at`, `updated_at`
*   **`stops` Collection** (or embedded in `trips` if list size guaranteed to be small, but a separate collection is safer for large timelines):
    *   `_id`, `trip_id`
    *   `order_index` (Critical for drag-and-drop ordering)
    *   `place_name`, `address`, `coordinates` (Lat/Lng)
    *   `arrival_time`, `duration`
    *   `status` (enum: 'pending', 'completed')
    *   `travel_time_from_previous` (cached value from routing API)
    *   `notes`

---

## 3. Execution Phases

We will build iteratively, focusing on value delivery. Since "The Stream" is the core value proposition, it receives priority.

### Phase 1: Foundation & Design System Setup
**Goal:** Establish the repository, CI/CD pipelines, database connections, and the foundational design tokens.
*   **Frontend:**
    *   Initialize Vite + React project.
    *   Configure Tailwind CSS v3 with the custom "Soft Utility" color palette, typography (Satoshi/General Sans), and design tokens (radius, spacing, shadows).
    *   Build base atoms: Headings, Text styles, Cards (`24px` radius), Buttons, Inputs.
*   **Backend:**
    *   Initialize Go module (`go 1.26`).
    *   Set up Gorilla Mux or Gin for HTTP routing.
    *   Configure MongoDB connection and basic repository interfaces.

### Phase 2: Core Interaction - The Stream (MVP)
**Goal:** Prove the primary interaction model. Users can add stops, see a vertical timeline, and complete stops.
*   **Frontend:**
    *   Implement "The Stream" layout (Header, Scrollable Body, Sticky Footer).
    *   Build the *Location Card* component (time, name, drag handle).
    *   Build the *Timeline Spine* component (dynamic dashed/solid lines, Travel Pills).
    *   Implement the *Input Field* (floating pill, auto-complete placeholder).
    *   Implement *Swipe-to-Complete* interaction (animations, state change).
*   **Backend:**
    *   Implement `CreateTrip` and `GetTrip` endpoints.
    *   Implement `AddStop`, `UpdateStopStatus` (for completion) endpoints.

### Phase 3: Location Details & Operations
**Goal:** Allow users to edit details and reorder their trip.
*   **Frontend:**
    *   Implement the *Location Detail (Drawer)* bottom-sheet modal.
    *   Integrate forms for Time Picker, Title Edit, and Notes Area.
    *   Implement *Drag-and-Drop* functionality on the Stream to reorder stops.
*   **Backend:**
    *   Implement `UpdateStopDetails` and `DeleteStop` endpoints.
    *   Implement `ReorderStops` endpoint (calculating new `order_index` values).
    *   Integrate Routing API (Mapbox/Google Maps) to fetch new travel times when the order changes.

### Phase 4: Spatial Context - The Compass
**Goal:** Visualize the itinerary geographically.
*   **Frontend:**
    *   Integrate Mapbox GL JS react wrapper.
    *   Implement "The Compass" layout (full-screen map).
    *   Draw custom markers (numbered pins) based on the order from The Stream.
    *   Draw polylines connecting points (dashed for future, solid for completed).
    *   Build the floating list toggle (Fab) to return to the Stream.
*   **Backend:**
    *   Ensure location coordinates are consistently validated and returned in the Trip payload.

### Phase 5: Meta-Layer - Trip Manager
**Goal:** Support multiple itineraries and switching between them.
*   **Frontend:**
    *   Implement "Trip Manager" view (Grid layout of cards).
    *   Build "Create New Trip" and "Trip Card" components (with mini-route previews).
*   **Backend:**
    *   Implement `ListUserTrips` endpoint aggregating stop counts and total estimated durations.

---

## 4. Key Engineering Challenges / Risks
1.  **Complex State / Reordering:** Optimistic UI is required for drag-and-drop to feel responsive, but the server must remain the source of truth for the `order_index`. Handling failures gracefully during a reorder event is crucial.
2.  **Routing API Costs & Limits:** Dynamically calculating travel times between arbitrary points can get expensive. We must heavily cache routes (e.g., distance from Location A to Location B) in our database to minimize external API calls.
3.  **Map Performance:** Rendering a Mapbox instance while maintaining 60fps animations for bottom sheets and swiping will require careful performance tuning in React.

## 5. Next Steps
Once this high-level plan is approved, my immediate next step will be to start **Phase 1: Foundation**, initializing the Go backend and React frontend repositories, and translating the CSS Custom Properties into a Tailwind configuration file.
