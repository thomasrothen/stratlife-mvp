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

- **Journey** → `/journey`  
  Screen 6 — Personal history & memory

- **Settings** → `/settings`  
  Screen 7 — Control & privacy

---

### Flows (transient actions)
Short, task-oriented experiences that always return to a destination.

- **Life Check** → `/life-check`  
  Screen 2 — Baseline snapshot  
  Starts from Today, ends at Focus or Today

- **Focus Wall** → `/focus`  
  Screen 3 — Direction & attention  
  Starts after Life Check or from Today, ends at Today

- **Capture Moment** → `/capture`  
  Screen 4 — Daily compounding action  
  Starts from Today, ends back at Today

Rule:
Flows are never places to browse.
They exist to complete one action and then disappear.

---

## 2️⃣ Interaction Rules (Defaults, Limits, Empty States)

### Screen 1 — Welcome (`/welcome`)

Defaults:
- Intro text + “Get started”
- No login friction until action

Rules:
- “Get started” → email / code flow
- Once authenticated → redirect to Today

Back behavior:
- Back disabled or exits app

---

### Screen 2 — Life Check (`/life-check`)

Defaults:
- All sliders start at neutral midpoint
- Reflection field empty

Limits:
- Reflection text: max 240 characters

Empty states:
- Reflection is optional
- User may continue without typing

Save behavior:
- “Continue” saves snapshot
- Navigates to Focus Wall or Today

Back behavior:
- Back → Today (discard allowed)

---

### Screen 3 — Focus Wall (`/focus`)

Defaults:
- Focus list empty
- Hint: “One or two things are enough”

Limits:
- Max active focus items: 3
- Focus text: max 60 characters
- Life area selection required per focus

Empty states:
- No focus yet → CTA “Add your first focus”

Save behavior:
- At least 1 focus required to save
- Save returns to Today

Back behavior:
- Back → Today

---

### Screen 4 — Capture Moment (`/capture`)

Defaults:
- Text input focused
- Life area optional
- Focus link optional
- “This might help others one day” unchecked

Limits:
- Moment text required
- Max 280–500 characters (MVP choice)

Empty states:
- Save disabled until text exists

Save behavior:
- Save → return to previous screen (usually Today)
- No draft persistence in MVP

Back behavior:
- Back → Today (discard)

---

### Screen 5 — Today (`/today`)

Defaults:
- Orientation blocks only:
  - Weekly rhythm (dots)
  - Focus preview
  - Recent moments (glimpse)

Limits:
- Recent moments shown: max 3
- Focus preview shown: max 2–3

Empty states:
- No moments → “Start with something small”
- No focus → CTA “Add a focus”

Primary actions:
- “+ Add moment” → Capture Moment
- “See your journey →” → Journey

---

### Screen 6 — Journey (`/journey`)

Defaults:
- Reverse chronological list
- Grouped by date

Limits:
- No analytics or gamification
- No public content in MVP

Empty states:
- No entries → “Your journey starts with your first moment”
- CTA to Capture Moment

Actions:
- Tap entry → no detail view in MVP

Back behavior:
- Back → Today

---

### Screen 7 — Settings (`/settings`)

Defaults:
- Name placeholder
- Reminder default off or preset time

Limits:
- Name: max 30 characters

Actions:
- Theme toggle
- Privacy control
- Log out

Back behavior:
- Back → Today

---

## 3️⃣ Navigation Map (Routes & Entry Points)

Canonical routes:
- `/` → redirect gate (Welcome or Today)
- `/welcome`
- `/today`
- `/capture`
- `/journey`
- `/life-check`
- `/focus`
- `/settings`

Entry logic:
- First launch → `/welcome`
- Authenticated return → `/today`

---

## 4️⃣ Back Navigation Rules (Locked)

- Welcome → no back into app
- Capture → Today
- Life Check → Today
- Focus Wall → Today
- Journey → Today
- Settings → Today

Today is the home base.
All paths lead back to Today.

---

## 5️⃣ MVP Navigation Philosophy

- No bottom tab bar in v1
- No discovery or feed
- No browsing other people
- Navigation should feel invisible

Stratlife v1 is about:
Noticing.
Capturing.
Remembering.

Not consuming.