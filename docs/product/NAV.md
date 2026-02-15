# NAV.md
# Stratlife — NAV (MVP Navigation & Interaction Contract)
#artifact #product #navigation #mvp

This document defines how screens, flows, interactions, and navigation work in the Stratlife MVP.
It is the binding contract between wireframes, code, and product philosophy.

Design principles:
- Orientation > consumption
- Calm over urgency
- One primary action per screen
- Flows are short, intentional, and end cleanly
- Titles match destinations (tab title = screen title)

---

## 1️⃣ Screens vs Flows

### Destinations (persistent screens)
Places users return to and “live in”.

- **Life** → `/life`  
  Weekly baseline snapshot + gentle direction into the week.

- **Focus** → `/focus`  
  Weekly direction (1–3 items).

- **Today** → `/today`  
  Orientation hub (glimpse + primary action).

- **Journey** → `/journey`  
  History / memory (moments + weekly baselines + weekly focus retrospective).

- **Settings** → `/settings`  
  Control & privacy.

### Flows (short-lived, modal-style)
Short actions that begin and end cleanly.

- **Life Check** → `/life-check`  
  Baseline snapshot flow. Returns to Life.

- **Capture Moment** → `/capture`  
  Atomic action. Returns to origin (usually Today).

---

## 2️⃣ Navigation Structure (MVP)

### Entry
- App opens at `/`
- Redirect logic:
  - No session → `/welcome`
  - Session → `/today`

### Primary movement
- Users switch between destinations using **bottom tabs**:
  - **Life / Focus / Today / Journey / Settings**
- Today is the center tab (calm “home”).

### Secondary movement
- Modals:
  - Life → Life Check
  - Today → Capture Moment

---

## 3️⃣ Interaction Contracts (Locked)

### Life
- Purpose: **weekly baseline + gentle clarity**
- Shows:
  - “Start / Retake Life Check”
  - “Life this week” snapshot:
    - short summary (“This week feels …”)
    - per-area compact dot rows
    - optional “Remember” line
- No charts, no scores, no analytics.

### Focus
- Purpose: **weekly direction (1–3)**
- Interactions (calm):
  - Tap **text** → edit modal
  - Tap **area pill** → change area
  - Remove is subtle (small “×” in corner)
- Add card hides at max; show caption “Max 3 this week.”

### Today
- Purpose: **orientation + glimpse**
- Shows:
  - weekly rhythm
  - recent moments (small slice)
  - one primary action: Capture Moment
- Not a feed. No infinite scroll.

### Journey
- Purpose: **memory + rereading**
- Sections:
  - Life baselines by week (collapsed “Overall ●●○○○” + expand details)
  - Moments grouped by date
  - “Focus this week” shown retrospectively under the baseline week
- Cards collapsed by default; tap to expand.
- Only one card open at a time.

### Settings
- Purpose: **control + trust**
- Minimal options (theme, reminders later, auth/session)
- No “social” toggles in MVP.

---

## 4️⃣ Back Navigation Rules (Locked)

- **Destinations (tabs)** do not “stack back” into each other.
- **Modals** dismiss back to the previously active destination.
- Welcome → no back into app
- Capture → dismiss back to origin (usually Today)
- Life Check → dismiss back to Life

---

## 5️⃣ MVP Navigation Philosophy

Navigation should feel invisible.

Stratlife v1 is about:
Noticing.
Capturing.
Remembering.

Not consuming.

---

## 6️⃣ Open Questions (Decide later)

1. **Tab bar visibility**
   - Always visible (current)
   - Auto-hide on scroll
2. **Settings as tab**
   - Keep as tab (MVP)
   - Move into Journey header (post-MVP)
3. **Pro limits**
   - Focus items: 3 vs 5+
   - Custom area names in Life/Focus