# Stratlife — Devlog

This devlog tracks **decisions, shipped changes, and locked-in principles**.
It is intentionally opinionated: once something is marked “locked”, we stop re-debating it.

---

## Day 7 — Planned

**Theme:** Outlook integration spike + tighten “orientation rails”

### Goals
1. **Outlook integration (MVP-friendly)**
   - Decide *scope*: (A) Microsoft sign-in via Supabase provider, (B) “Add reminder” deep link, or (C) export `.ics`.
   - Implement the smallest end-to-end slice (no background sync yet).
2. **Navigation contract decision**
   - Keep bottom tabs for now, but document the open question:
     - always visible vs auto-hide on scroll vs fewer destinations
3. **Polish pass**
   - Make Today / Focus / Settings spacing & headers consistent with Journey.

### Explicit non-goals
- No social layer
- No analytics
- No “sync everything” Outlook feature (yet)

---

## Day 6 — Navigation Stabilization + Calm UI Pass

**Status:** ✅ Stable / Navigation + Journey behavior locked

### What we shipped

#### 1. Navigation architecture
- Confirmed **Expo Router route groups**:
  - `(auth)` for Welcome
  - `(app)` for main app (Tabs)
  - `(modals)` for Capture + Life Check flows
- Adopted **bottom tabs** for MVP destinations (Today / Focus / Journey / Settings).
- Fixed multiple routing edge cases from earlier refactors (missing routes, empty `/` behavior).

#### 2. Journey screen UX contract (locked)
- **Header stays visible** (“Your Journey” + subtitle) via fixed header outside the ScrollView.
- **Expand/collapse** remains tap-to-toggle (one open at a time).
- **Metadata pills** moved to calm “tags” (theme-based, smaller, secondary).
- **End-of-list breathing room** to avoid the “cut off under tab bar” feel.

#### 3. Tab bar integration (calm baseline)
- No shadows / no floating.
- Hairline divider + neutral background.
- Outline icons (avoid “loud” filled states).

### Notes / open decisions
- **Tab bar strategy**: keep visible for now. Revisit:
  - always visible vs hide on scroll
  - whether Settings belongs as a tab long-term

---

## Day 5 — Journey Interaction + Data Model Cleanup

**Status:** ✅ Stable / Core interaction & data model locked

### What we shipped

#### 1. Journey interaction (expand/collapse)
- Implemented expandable cards (tap to open, tap another to switch focus).
- Only one card can be expanded at a time.
- Added best-practice scroll behavior:
  - If the selected card is already fully visible → do not scroll.
  - If it’s partially hidden → scroll only enough to reveal.

#### 2. “Selected card” navigation loop
- Today → tap recent moment → Journey opens with the moment **auto-expanded**.
- Focus is updated to the most recently selected moment.

#### 3. Data model cleanup
- Began migration away from “stuffed note field” (area/focus/share inside text).
- Introduced normalized columns:
  - `area`, `focus`, `share`, `details`
- Added legacy parsing fallback for older notes.

### Locked decisions
- Journey stays calm: no animations, no feed behavior.
- Expand/collapse is the core interaction (not a separate “detail screen” for MVP).

---

## Day 4 — Home Screen Philosophy Locked (Orientation > Archive)

**Status:** ✅ Stable / UI contract locked

### What we shipped
- Locked the **Home/Index screen contract**: orientation + glimpse, not consumption.
- Weekly rhythm dots + subtle ring for **today**.
- “Add moment” is the only primary action.
- Journey is secondary depth.

### Locked decisions
- Home is not an archive.
- Home shows only a small, intentional slice.

---

## Day 3 — Auth + Skeleton

**Status:** ✅ Working baseline

### What we shipped
- Supabase email auth
- Session handling / redirect gate
- Welcome screen entry

---

## Day 2 — Navigation Skeleton

**Status:** ✅ Established

### What we shipped
- Expo Router route groups scaffold
- Core screens created (Today, Journey, Settings, Capture)

---

## Day 1 — Repo + Tokens

**Status:** ✅ Created

### What we shipped
- Expo + TypeScript baseline
- Theme tokens (colors/space/radius/font)
- UI components scaffold (Text/Card/Button/Input)

---