# Stratlife — Devlog

This devlog tracks **decisions, shipped changes, and locked-in principles**.
It is intentionally opinionated: once something is marked “locked”, we stop re-debating it.

---

## Day 6 — Planned

**Theme:** Stability, clarity, and future-proofing

### Goals
1. Verify and clean up legacy `note` data.
2. Subtle expand/collapse animation in Journey.
3. Tighten Capture → Journey loop:
   - After save, navigate to Journey and highlight new entry.
4. Navigation contract review & final polish.
5. Optional microcopy improvements.

### Explicit non-goals
- No new features
- No social layer
- No analytics

---

## Day 5 — Journey Interaction + Data Model Cleanup

**Status:** ✅ Stable / Core interaction & data model locked

### What we shipped

#### 1. Journey interaction (expand + focus)
- Implemented **tap-to-expand** cards in Journey.
- Active card now **follows user focus**:
  - Previous card collapses
  - New card expands
  - View scrolls only when needed (best-practice behavior).
- Fixed unreliable tap handling inside `ScrollView` using:
  - `TouchableOpacity`
  - `onPressIn`
  - explicit layout tracking per card.
- Soft highlight for deep-linked cards from Today (`?highlight=id`).
- Bottom scrolling corrected using **safe-area–aware content inset** (no more clipped cards).

#### 2. Structured data model (important)
- Moved away from packing metadata into a single `note` blob.
- Introduced **proper columns** in `wins`:
  - `title`
  - `details`
  - `area`
  - `focus`
  - `share`
- Updated app to **write structured fields** instead of parsing text.
- Added safe **legacy fallback** for older rows still using `note`.

#### 3. Capture flow refined
- Clear separation:
  - **Title** = headline (required)
  - **Details** = optional body
  - **Area / Focus / Share** = optional metadata
- Capture UI now matches how data is stored and displayed.
- MVP contract clarified: *small, honest moments first*.

#### 4. Today screen hierarchy confirmed
- Today = **orientation + action**, not consumption.
- Cards show:
  - title
  - relative time
- Tap → deep link into Journey (focused entry).
- Removed logout from Today (now only in Settings).

### Decisions locked in
- Journey uses **progressive disclosure** (collapsed by default).
- Interaction logic lives in screens, not base UI components.
- Structured data > clever text parsing.
- Today is a *glimpse*, Journey is the *story*.

### Known follow-ups
- Remove legacy `note` column once backfill is complete.
- Introduce media support on Journey cards later.

---

## Day 4 — Navigation & Structural Cleanup

**Status:** ✅ Stable

### What we shipped
- Clean Expo Router structure:
  - `(auth)` for authentication
  - `(app)` for core screens
  - `(modals)` for transient flows
- File names aligned with screen purpose:
  - `today.tsx`
  - `journey.tsx`
  - `capture.tsx`
  - `settings.tsx`
- Navigation rules clarified:
  - Capture opens as modal
  - Journey reachable from Today
  - Logout only in Settings

### Navigation principles locked
- One clear primary action per screen
- Back behavior must always feel obvious
- Modals never replace destinations

---

## Day 3 — Home / Today Philosophy Locked

**Status:** ✅ Stable / UI contract locked

### Today screen purpose
> Orientation + glimpse — not archive, not analysis.

### What we shipped
- Weekly rhythm dots (glimpse, not score)
- Primary CTA: **Add moment**
- Recent moments shown as a *preview*, not a list

### What Today explicitly does NOT do
- No full metadata display
- No deep reflection
- No scrolling through history

---

## Day 2 — Screen Model & Flow Decisions

**Status:** ✅ Locked

### Screen model
We separated **destinations** from **actions**:

#### Destinations (places you return to)
- Today
- Journey
- Settings

#### Transient actions (flows)
- Welcome / Auth
- Capture Moment

### Key decisions
- **Capture is a modal**, not a destination.
- **Journey is the archive** (meaning over time).
- **Today is orientation + action**, not consumption.

---

## Day 1 — Vision, Scope & MVP Spine

**Status:** ✅ Locked

### What we decided
- Stratlife is **not a habit tracker** and not a social feed.
- Core promise:
  > *Most growth happens quietly. Stratlife helps you notice it — and turn it into shared inspiration.*
- MVP focuses on:
  - noticing progress
  - capturing small, honest moments
  - reflecting over time

### Core life areas (initial)
- Spirit
- Fit
- Connect
- Experience
- Happy
- Business
- Money

### Early constraints (important)
- No gamification
- No streak pressure
- No infinite feeds
- Calm > clever

---

_End of devlog._