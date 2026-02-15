# DEVLOG.md
# Stratlife — Devlog

This devlog tracks **decisions, shipped changes, and locked-in principles**.
It is intentionally opinionated: once something is marked “locked”, we stop re-debating it.

---

## Day 8 — Planned

**Theme:** Today screen calm pass + capture loop + reduce friction

### Goals
1. **Today screen (calm orientation)**
   - Ensure Today stays “glimpse, not feed”
   - Show current week context + small “recent moments” slice
2. **Capture loop**
   - Capture modal returns cleanly to origin
   - Write moment to DB and show in Journey
3. **Consistency pass**
   - Same header rhythm across Life / Focus / Today / Journey
   - Same spacing + card density

### Explicit non-goals
- No new tables beyond essentials
- No social/discovery layer

---

## Day 7 — Life + Focus + Supabase-first (Core loop becomes real)

**Status:** ✅ Stable / Core screens operational (Life, Focus, Journey) + Supabase-first persistence

### What we shipped

#### 1) Navigation update (MVP destinations expanded)
- Tabs now: **Life / Focus / Today / Journey / Settings**
- Titles match destinations (tab title = screen title).

#### 2) Life screen + Life Check (weekly baseline)
- **Life** becomes the main “baseline entry” screen.
- Life Check is a **modal flow** that writes to Supabase (`life_checks`).
- After saving a Life Check, Life shows **“Life this week”**:
  - short summary (“This week feels …”)
  - per-area compact dot rows (calm, non-metric feel)
- Journey shows **Life baselines** in history (same dot language + weekly summary).

#### 3) Journey improvements
- Life baseline card gained:
  - collapsed “Overall ●●○○○” summary
  - expanded per-area dot rows
- Journey now also shows **“Focus this week”** (retrospective) under the baseline.

#### 4) Focus screen (calm editing + Supabase persistence)
- Supabase-first Focus persistence (`focus_weeks`, `focus_items`)
- Weekly row uses `week_start` (consistent with Life baseline week logic).
- Focus UX reworked to calm best practice:
  - focus cards are tappable objects
  - tap **text** → edit modal
  - tap **area pill** → quick area picker
  - delete is subtle (“×” top-right), no loud stacked buttons
- At max items (3):
  - Add card hides completely
  - show small caption: “Max 3 this week.”

#### 5) Supabase schema alignment & fixes
- Standardized on `week_start` for week identity where possible.
- Confirmed unique constraints for week upserts (`user_id, week_start`) to support `onConflict`.

### Locked decisions
- **Core destinations** for MVP: Life / Focus / Today / Journey / Settings.
- **Editing style (calm)**:
  - no “Edit / Remove” button stacks
  - edit via tapping the object
  - destructive actions are subtle

### Notes / open decisions
- Today as center tab is kept (calm “home” feeling), but we can revisit if it creates friction.
- Focus item limit:
  - MVP: 3 (calm constraint)
  - Pro: consider 5 (only if it doesn’t break the calm contract)

---

## Day 6 — Navigation Stabilization + Calm UI Pass

**Status:** ✅ Stable / Navigation + Journey behavior locked

### What we shipped

#### 1. Navigation architecture
- Confirmed **Expo Router route groups**:
  - `(auth)` for Welcome
  - `(app)` for main app (Tabs)
  - `(modals)` for Capture + Life Check flows
- Adopted **bottom tabs** for MVP destinations.
- Fixed multiple routing edge cases from earlier refactors (missing routes, empty `/` behavior).

#### 2. Journey screen UX contract (locked)
- **Header stays visible** (“Your Journey” + subtitle) via fixed header outside the ScrollView.
- **Expand/collapse** remains tap-to-toggle (one open at a time).
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
- Expand/collapse cards with “one open at a time”.
- Scroll only when needed to reveal selected card.
- Began migration away from “stuffed note field” towards normalized fields.

---

## Day 4 — Home Screen Philosophy Locked (Orientation > Archive)
**Status:** ✅ Stable / UI contract locked

---

## Day 3 — Auth + Skeleton
**Status:** ✅ Working baseline

---

## Day 2 — Navigation Skeleton
**Status:** ✅ Established

---

## Day 1 — Repo + Tokens
**Status:** ✅ Created