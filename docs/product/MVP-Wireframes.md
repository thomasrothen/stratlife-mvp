# MVP-Wireframes.md
# Stratlife — MVP Wireframes
#artifact #product #wireframes #mvp

Single source of truth for all MVP screens.

Design contract:
- Calm • Minimal • Reflective
- Orientation > consumption
- One primary action per screen
- Progress is quiet, but visible
- Titles match destinations (tab title = screen title)

Navigation presentation (MVP implementation):
- Destinations use a quiet bottom tab bar: **Life | Focus | Today | Journey | Settings**
- Flows open as modals: **Capture Moment**, **Life Check**

---

|  **Wireframe #**  |  **Screen name (product)**  |  **Internal meaning**  |
|---|---|---|
|  Screen 1  |  **Welcome**  |  Emotional entry  |
|  Screen 2  |  **Life**  |  Weekly baseline snapshot (destination) |
|  Screen 3  |  **Life Check**  |  Baseline input (modal flow)  |
|  Screen 4  |  **Focus**  |  Weekly direction (destination)  |
|  Screen 5  |  **Capture Moment**  |  Atomic action (modal flow)  |
|  Screen 6  |  **Today**  |  Orientation (destination)  |
|  Screen 7  |  **Journey**  |  History / memory (destination)  |
|  Screen 8  |  **Settings**  |  Control (destination)  |

---

## 🟢 Screen 1 — Welcome

**Purpose:** Emotional entry + intent setting

Stratlife  
Inspire life together

Most growth happens quietly.  
Stratlife helps you notice it —  
and turn it into shared inspiration.

[ Get started ]

Notes:
- No login upfront (or minimal friction)
- This screen sells meaning, not features

---

## 🟢 Screen 2 — Life (Destination)

**Purpose:** Weekly baseline + calm direction

Life  
Week of Feb 9

How does your life feel right now?

[ Start / Retake Life Check ]

Life this week  
This week feels heavy.  
Spirit     ●●○○○  
Fit        ●●●○○  
Experience ●●○○○  
Connect    ●●○○○  
Happy      ●●○○○  
Business   ●●○○○  
Money      ●●○○○  
Home       ●●●●○

Remember: “Better”

Notes:
- No metrics or charts
- Dots are feelings, not scores
- Snapshot is a calm “glance”

---

## 🟢 Screen 3 — Life Check (Modal)

**Purpose:** Gentle self-assessment (60 seconds)

Life Check  
How does your life feel right now?

Spirit        😔 ─── 😊  
Fit           😔 ─── 😊  
Experience    😔 ─── 😊  
Connect       😔 ─── 😊  
Happy         😔 ─── 😊  
Business      😔 ─── 😊  
Money         😔 ─── 😊  
Home          😔 ─── 😊  

Anything you want to remember?  
[ ______________________ ]

[ Save ]   [ Cancel ]

Notes:
- Sliders capture feelings, not metrics
- Optional reflection field
- Writes the weekly baseline (Supabase)

---

## 🟢 Screen 4 — Focus (Destination)

**Purpose:** Direction without overload

Focus  
One to three things. No pressure.  
Week of Feb 9

• Train more this week      (Area: Fit)  
• Study for AI              (Area: Experience)

Interaction (calm):
- Tap text → edit modal
- Tap area pill → change area
- Subtle delete “×” (top-right)

Add a focus (max 3)  
[ text input ]  
[ Area pill ]  
[ + Add focus ]

Notes:
- Max of 1–3 focus items
- Weekly persistence (current week auto-created)
- Add card hides at max; show caption “Max 3 this week.”

---

## 🟢 Screen 5 — Capture Moment (Modal)

**Purpose:** Daily compounding mechanism

Capture a Moment  
What moved you forward today?

Title (required)  
[ ______________________________ ]

Details (optional)  
[ ______________________________ ]

Life area (optional):  
[ Spirit ]

Link to focus (optional):  
[ Train more this week ]

☐ This might help others one day

[ Save moment ]  [ Close ]

Notes:
- Core atomic action of Stratlife
- Sharing is optional and future-facing
- No editing spiral — capture and move on

---

## 🟢 Screen 6 — Today (Destination)

**Purpose:** Orientation + gentle reflection

Today

Weekly rhythm  
• • ○ • • • ○

Current focus  
• Train more this week

Recent moments  
• Had a calm start to the day  
• Sent the proposal  

[ + Add moment ]

Notes:
- Not a feed
- No infinite scroll
- Today shown in context

---

## 🟢 Screen 7 — Journey (Destination)

**Purpose:** Narrative memory, not analytics

Your Journey  
This is your story — one step at a time.

Life baselines  
Week of Feb 9  
This week feels heavy.  
Overall ●●○○○  
(Expand → per-area dots + Remember + Focus this week)

Moments (grouped by date)  
Sun, Feb 8  
“Finished developing the journey screen”

Tap a card to expand.

Notes:
- Chronological and human
- Progressive disclosure allowed
- No streaks, points, or gamification

---

## 🟢 Screen 8 — Settings (Destination)

**Purpose:** Control & trust

Settings

Theme  
( Light • Dark )

Account  
[ Log out ]

Privacy  
You decide what stays private  
and what inspires others.

Notes:
- Privacy framed as empowerment
- Social layer intentionally undefined

---

## 🔒 Explicitly Out of MVP

- Public profiles
- Social feed or discovery
- Likes, comments, followers
- Analytics dashboards
- Streaks or gamification
- AI insights or coaching

Principle:
Stratlife v1 = self-trust before social proof