# Stratlife — NAV (MVP Navigation & Interaction Contract)
#artifact #product #navigation #mvp

This document defines how screens, flows, interactions, and navigation work in the Stratlife MVP.
It is the binding contract between wireframes, code, and product philosophy.

Design principles:
- Orientation > consumption
- Calm over urgency
- One primary action per screen
- Flows are short, intentional, and end cleanly

---

## 1️⃣ Screens vs Flows

### Destinations (persistent screens)
Places users return to and “live in”.

- **Welcome** → `/welcome`  
  Screen 1 — Emotional entry, intent setting

- **Today** → `/today`  
  Screen 5 — Home / orientation hub

- **Focus** → `/focus`  
  Screen 3 — Weekly direction (1–3 items)

- **Journey** → `/journey`  
  Screen 6 — Personal history & memory

- **Settings** → `/settings`  
  Screen 7 — Control & privacy

### Flows (short-lived, modal-style)
Short actions that begin and end cleanly.

- **Capture Moment** → `/capture`  
  Screen 4 — atomic action; returns to origin

- **Life Check** → `/life-check`  
  Screen 2 — baseline snapshot; returns to Today

---

## 2️⃣ Navigation Structure (MVP)

### Entry
- App opens at `/`
- Redirect logic:
  - No session → `/welcome`
  - Session → `/today`

### Primary movement
- Users switch between destinations using **bottom tabs**:
  - Today / Focus / Journey / Settings

### Secondary movement
- Modals:
  - Today → Capture
  - Today → Life Check (as a modal flow)

---

## 3️⃣ Interaction Contracts (Locked)

### Today (Home)
- Purpose: **orientation + glimpse**
- Shows:
  - Weekly rhythm glimpse
  - Add Moment (primary)
  - Recent moments (small list)
  - CTA to Journey
- No infinite scroll feed.

### Journey
- Purpose: **memory + rereading**
- Cards are collapsed by default.
- Tap a card:
  - expands inline (details + tags)
  - only one card open at a time
- When navigated from Today with a selected item:
  - Journey opens with that item expanded and highlighted.

### Focus
- Purpose: weekly direction (1–3)
- One input, small set, minimal friction
- Calm metadata (area) allowed but secondary

### Settings
- Purpose: control + privacy
- Minimal options
- No “social” toggles in MVP

---

## 4️⃣ Back Navigation Rules (Locked)

- **Destinations (tabs)** do not “stack back” into each other.
- **Modals** dismiss back to the previously active destination.
- Welcome → no back into app
- Capture → dismiss back to the originating destination (usually Today)
- Life Check → dismiss back to Today

Today is the default home tab.

---

## 5️⃣ MVP Navigation Philosophy

- **Bottom tab bar is used in v1** for calm orientation between the 4 destinations.
- No discovery or feed
- No browsing other people
- Navigation should feel invisible

Stratlife v1 is about:
Noticing.
Capturing.
Remembering.

Not consuming.

---

## 6️⃣ Open Navigation Questions (Decide later)

1. **Tab bar visibility**
   - Always visible (current)
   - Auto-hide on scroll
2. **Destinations**
   - Does **Settings** belong as a tab long-term?
   - Should Focus be a tab or a short flow?