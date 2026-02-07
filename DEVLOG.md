# DEVLOG.md

## Day 5 — History & Depth (Planned)

**Status:** ⏳ Planned

### Day intent
Make depth available **without disturbing calm**.

The Home screen stays an orientation layer.  
Depth moves into dedicated screens.

### What we will work on
1) **History / Archive screen**
   - Full list of wins
   - Normal scrolling (no limits)
   - Reuse existing Win card style
   - Empty state + calm default layout

2) Wire **“See all wins →”** to the History screen

3) (Optional, time permitting)
   - Create **Win Detail screen stub**
   - Show full title, date, and note
   - Prepare space for media (no uploads yet)

### Why this matters
This creates a clean separation:
- **Home = awareness**
- **History = memory**
- **Detail = reflection**

This separation is essential for Stratlife’s long-term clarity.

_Tag: day5-history-depth_

---

## Day 4 — Home Screen Contract Locked (Orientation > Archive)

**Status:** ✅ Stable / UI contract locked

### What we shipped
- Locked the **Home screen contract**: orientation + glimpse, not consumption.
- Weekly rhythm dots with a subtle ring highlighting **today**.
- Home feed shows the **latest 3 wins** (intentional glimpse), with a calm  
  **“See all wins →”** affordance (no overlays, no visual tricks).
- Win cards are **summary-only**:
  - title + relative date
  - note clamped to **2 lines**
  - reserved footer slot for future **media hint** (icon / tiny preview)
- Scroll indicator enabled for clarity.
- Layout stabilized into **three clear zones**:
  - **Top:** orientation (purpose + weekly rhythm)
  - **Middle:** recent wins (scrollable glimpse)
  - **Bottom:** deliberate action (log out for now)

### Why this matters
The Home screen must stay calm even with hundreds of wins and richer content  
(photos, videos, longer reflections later).

This avoids “feed-ification” and keeps Stratlife focused on **noticing what works**,  
not on performance dashboards, metrics, or endless scrolling.

_Tag: day4-home-contract_

---

## Day 3 — Core MVP Loop Complete

**Status:** ✅ Stable / Core loop working

### What we shipped
- Email-based **passwordless authentication** via Supabase (OTP / Magic Link)
- Persistent user sessions across app restarts
- Row Level Security enforced per user
- Core loop working end-to-end:  
  **Create Win → save to database → load in feed**
- Feed updates correctly after creating a win
- Data survives app restart (verified)

This is the point where Stratlife stopped being a setup exercise  
and became a **real app with real users and real data**.

_Tag: mvp-core-complete_

### Technical state (end of day)
- Supabase project created
- Keys stored in `.env.local` (not committed)
- Data API enabled
- `wins` table created with RLS policies (CRUD: own rows only)
- App has `AuthProvider` and login route
- Temporary friction with Supabase email rate limits (cooldown resolved)

---

## Day 2 — Data & Structure

**Status:** ✅ Stable

### What we shipped
- Project structure cleaned and stabilized
- Supabase client integrated into the app
- Environment variable handling set up correctly
- Initial database schema for `wins`
- Row Level Security policies defined early (security-first)
- First real data flowing from app → database → UI

_Tag: day2-data-foundation_

---

## Day 1 — Project Bootstrap & Direction

**Status:** ✅ Complete

### What we shipped
- Expo + React Native project initialized
- iOS simulator running reliably
- Basic navigation with Expo Router
- Initial UI components (Card, Button, Text, Input)
- GitHub repository created and connected
- Dev workflow established (local → commit → iterate)

### Key decision
Stratlife is built as a **mobile-first reflection tool**,  
not a web app and not a social feed.

_Tag: day1-bootstrap_