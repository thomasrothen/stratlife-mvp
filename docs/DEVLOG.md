# Stratlife — DEVLOG

A running development log capturing **decisions, philosophy, and contracts**.  
Not a changelog.  
Not a task list.  
This is where intent is preserved.

---

## 📅 Today — 2026-02-08
**Current focus:** History screen foundations  
**State:** Philosophy locked, implementation pending

### Plan for next day
- Implement **History screen scaffold**
- Wire **“See all wins →”** from Home to History
- Decide on:
  - week grouping logic
  - empty state copy + tone
- (Optional) Stub **Win Detail screen** (read-only)

---

## Day 5 — History Screen (Reflection > Pattern)

**Status:** 🟡 Concept locked / Implementation pending

### Purpose
The **History screen** is not a feed.  
It exists to help users **recognize patterns over time**, not relive moments.

> Home shows *now*.  
> History shows *trajectory*.

### Core principles
- **Reflection over recall**
- **Patterns over events**
- **User as observer of self**

Tone: calm, analytical, almost archival.

### What we defined
- History is organized by **time blocks** (weeks first, not days)
- Each block answers:
  - *What did my life look like then?*
  - *Was this phase strong, weak, or neutral?*
- Visual emphasis on:
  - consistency
  - gaps
  - momentum shifts

### Explicit non-goals
- ❌ No infinite scrolling
- ❌ No social comparison
- ❌ No resurfacing “best moments” for dopamine

### Design direction
- Muted, archival feel
- Denser than Home, still breathable
- Feels like a **personal logbook**, not a social timeline

### Open questions (parked)
- When does an entry become “history”?
- How much interpretation should the system add?
- Should History ever surface insights proactively?

_Tag: day5-history_

---

## Day 4 — Home Screen Contract Locked (Orientation > Archive)

**Status:** ✅ Stable / UI contract locked

### What we shipped
- Locked the **Home screen contract**:
  - orientation + glimpse
  - never consumption
- Weekly rhythm dots with a subtle ring highlighting **today**
- Home shows the **latest 3 wins only** (intentional glimpse)
- Calm **“See all wins →”** affordance (no visual tricks)
- Win cards are **summary-only**:
  - title + relative date
  - note clamped to **2 lines**
  - reserved footer slot for future media hint
- Layout stabilized into **three zones**:
  - **Top:** orientation (purpose + weekly rhythm)
  - **Middle:** recent wins (scrollable glimpse)
  - **Bottom:** deliberate action (log win)

### Design rules
- No scrolling history on Home
- No drilling into the past
- No performance indicators

Home must always feel:
- light
- quiet
- grounding

If Home becomes interesting, it’s broken.

_Tag: day4-home-contract_

---

## Day 3 — Core MVP Loop Complete

**Status:** ✅ Stable / Core loop working

### What we shipped
- Email-based **passwordless authentication** (Supabase magic link)
- Persistent user sessions
- Row Level Security enforced per user
- Core loop working end-to-end:  
  **Create Win → save → load**
- Feed updates after creating a win
- Data survives app restart

This is the moment Stratlife stopped being a setup exercise  
and became a **real app with real data**.

### Technical state (end of day)
- Supabase project created
- Keys stored in `.env.local` (not committed)
- `wins` table created with RLS (CRUD: own rows only)
- AuthProvider wired into the app
- Temporary Supabase email rate-limit friction resolved

_Tag: mvp-core-complete_

---

## Day 2 — Data & Structure

**Status:** ✅ Stable

### What we shipped
- Project structure cleaned and stabilized
- Supabase client integrated
- Environment variable handling set up
- Initial database schema for `wins`
- Row Level Security defined early (security-first)
- First real data flowing: app → database → UI

_Tag: day2-data-foundation_

---

## Day 1 — Project Bootstrap & Direction

**Status:** ✅ Complete

### What we shipped
- Expo + React Native project initialized
- iOS simulator running reliably
- Basic navigation via Expo Router
- Initial UI components (Card, Button, Text, Input)
- GitHub repository created
- Dev workflow established (local → commit → iterate)

### Key decision
Stratlife is a **mobile-first reflection tool**,  
not a web app and not a social feed.

_Tag: day1-bootstrap_

---

## Guiding Principle (Living)

> **Orientation → Reflection → Meaning**  
> Never the other way around.

Any future feature must justify:
- which screen it belongs to
- which question it answers
- which principle it preserves

If it can’t — it doesn’t ship.