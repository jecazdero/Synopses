# Synopses — Functional Prototype Build Brief (for Claude Code)

*Paste this whole file as your first message to Claude Code. It contains everything needed to scaffold and build a working, click-through prototype of the Synopses app — no need to re-explain context.*

---

## 0. What already exists

The product has already been through discovery and design. Do NOT redesign from scratch — **implement against the validated Figma designs.**

- **Figma file:** https://www.figma.com/design/VCbxdDdbOWFtrQYIYSGp4O/Synopses
- **Validated screens (7), all 1440×1024, on the "Design" page:**
  | Screen | Node ID |
  |---|---|
  | Producer / Dashboard (All Movies) | `2:16` |
  | Producer / Movie Detail | `2:135` |
  | Producer / Create Synopses | `31:2` |
  | Translator / My Translations | `33:2` |
  | Translator / Translate | `33:137` |
  | Reviewer / My Review Tasks | `40:2` |
  | Reviewer / Review Translation | `40:146` |
- **Value-proposition deck (5 slides, for reference only — not part of the app build):** `46:4`, `48:2`, `56:2`, `57:2`, `58:2`

**Before writing any UI code**, pull design context for each of the 7 screens above (via Figma MCP / dev mode) so components, spacing, and copy match the validated frames exactly. Don't guess layout — read it from Figma.

**Design system, extracted from Figma (use as tokens, verify against Dev Mode):**
- Background: `#141414` · Panel: `#1f1f1f` · Row/card alt: `#2a2a2a` · Border/divider: `#333333`
- Accent (Netflix red): `#e50914` — primary buttons, destructive actions, active states
- Text: white `#ffffff` primary, `#b3b3b3` secondary
- Font: **Inter** (Extra Bold for wordmark, Bold for headings, Medium/Semi Bold for body/labels)
- Icons: **Material Icons** (outline style, e.g. `visibility`, `download`, `ios_share`, `delete`)
- Dark theme throughout, Netflix-brand-inspired

---

## 1. What we're building

**Synopses** — a desktop web app that replaces email/Google Docs/Excel for coordinating movie-synopsis translation into up to 190 languages, across three roles: **Producer, Translator, Reviewer**.

This build is a **fully functional interactive prototype**, not the final production system. Goal: every flow below should be genuinely clickable and stateful (not static mockup screenshots), so it can be demoed end-to-end. See Section 6 for what "functional" means here.

---

## 2. Roles & permissions

| Role | Can do |
|---|---|
| **Producer** | Create translation tasks, distribute/assign them, track progress, access completed translations |
| **Translator** | Translate synopses (AI-assisted or manual), manage own workload/absence, submit for review, respond to reviewer comments |
| **Reviewer** | Approve or return translations with required comments, use AI to assist review |

For the prototype: implement a simple **role switcher** (no real auth) so we can demo all three roles from one build — e.g., a dropdown in the header to switch persona, matching the "Producer · Maria Alves" pattern seen in Figma.

---

## 3. Tech stack (proposed — flag if you'd choose differently)

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS, configured with the design tokens in Section 0 (dark theme by default)
- **Routing:** React Router
- **State/data:** No real backend for the prototype. Use an in-memory store (Zustand or React Context) seeded with realistic mock data, persisted to `localStorage` so state survives refresh during a demo.
- **AI integration:** Mocked. "Translate with AI" and "AI-assisted review" should feel real (loading state → plausible generated/translated text) but do not need a live LLM call unless I ask for one later.
- **Icons:** Material Symbols/Icons (matches Figma)

If you think a different stack better serves "fully functional, demoable in a browser," propose it and explain the tradeoff before scaffolding — don't switch silently.

---

## 4. Data model (prototype scope)

Please propose a full TypeScript type/interface set before writing app logic, but it should cover at minimum:

**Movie / Synopsis**
- id, title, original synopsis text, director name, producer, deadline, created date
- status: `To do | In progress | Blocked | Done`
- one entry per target language (see Translation below)

**Translation (per movie × language)**
- language
- status: `To do | In progress | Blocked | Review | Done`
- assigned translator, assigned date, days spent
- if Blocked: reason (`Absent` or `Incomplete synopsis`) — required, not optional
- translated text (AI-generated, manual, or hybrid)
- reviewer comments thread (per comment: author, text, timestamp, and translator replies)

**User**
- id, name, role (Producer / Translator / Reviewer)
- for Translators: rating, availability, absence periods (with reason: Sick leave / PTO)

**Comment**
- author, text, timestamp, parent translation, replies[]

Seed the mock data with **3–5 movies**, each with **multiple languages in different statuses**, so every status/permission branch in Section 6 is actually reachable in the demo without me manually creating data first.

---

## 5. Build sequence

Build and let me review **one role at a time**, in this order — don't build all three in parallel:

1. **Producer flow** (Dashboard → Movie Detail → Create Synopses)
2. **Translator flow** (My Translations → Translate)
3. **Reviewer flow** (My Review Tasks → Review Translation)
4. Cross-cutting polish pass: shared header/nav, role switcher, status legend/badges consistent across all screens

After each role's screens are working, stop and let me click through before moving to the next. Don't silently make scope/permission decisions if something in Section 6 is ambiguous when you hit it — flag it and propose a default.

---

## 6. Functional requirements per screen

### 6.1 Producer — Dashboard (`2:16`)
- Prominent **Create** button (top right, matches Figma's red button) → opens Create Synopses flow
- All movies visible in a table/list; clicking a movie name opens Movie Detail
- Per row: movie name, deadline, responsible director, status badge
- Status legend visible (`To do / In progress / Blocked / Done`)
- Per-row **kebab menu**, actions gated by status (implement exactly this matrix):

| Status | View Details | Update Synopses | Download all | Share via link | Delete |
|---|---|---|---|---|---|
| To do | ✓ | ✓ | | | ✓ |
| In progress | ✓ | ✓ | | | ✓ |
| Blocked | ✓ | ✓ | | | ✓ |
| Done | ✓ | | ✓ | ✓ | ✓ |

### 6.2 Producer — Movie Detail (`2:135`)
- Shows movie name, deadline, director, original synopsis
- **Translation Progress**: per-language status, assigned translator, days spent
- **Actions** dropdown — same status-gating matrix as above, minus "View Details" (redundant on this page)
- Producer can trigger AI translation into any/all of the 190 languages, or manually assign a language to a translator
- If Producer bulk-translates via AI, prompt them to assign the results for review (don't leave AI output un-routed)

### 6.3 Producer — Create Synopses (`31:2`)
- Create from scratch, or upload from a file (mock the Google Docs/Excel import — a file picker that accepts .docx/.xlsx/.csv is enough; parsing can be stubbed)
- Fields: title, original synopsis text, director, deadline
- On save, movie appears on Dashboard with status `To do`

### 6.4 Translator — My Translations (`33:2`)
- List of translations assigned to this translator: movie, original synopsis, director, deadline, status
- Can set up absence periods; when absent, their in-progress translations move to `Blocked` with reason `Sick leave`/`PTO` automatically
- Can see progress of their own work at a glance

### 6.5 Translator — Translate (`33:137`)
- **Translate with AI** must be available at *any* point in the flow, not a fork you commit to — translator can: AI-translate then hand-edit, write manually then AI-polish, or mix both, including after reviewer feedback comes back
- Manual status change control; selecting `Blocked` requires a reason field (enforce this — don't allow submit without it)
- Reviewer comments shown per movie, with **reply** capability per comment
- After reviewer feedback, translator can revise via AI, manually, or both, then resubmit

### 6.6 Reviewer — My Review Tasks (`40:2`)
- All tasks assigned to this reviewer: movie, director, producer, translator, deadline, status
- Status clearly visible per task

### 6.7 Reviewer — Review Translation (`40:146`)
- Shows original synopsis + translation side by side
- **AI-assist review** action (e.g., AI flags potential issues/quality check — mock this as a plausible generated note)
- **Approve** → status → `Done`
- **Decline** → requires a comment (enforce, don't allow empty decline) → reassigns to the same translator who submitted it, and translator should see it back in their queue as `Blocked`/needs-revision with the comment visible

---

## 7. Cross-cutting rules (apply everywhere)

- Every core end-to-end flow (create → distribute → access; translate → submit; review → approve/decline) should be completable in **fewer than 10 clicks** — if you find yourself adding more, flag it, don't just ship it.
- Status badges/colors must be visually consistent across all three roles' screens.
- Blocked always shows a visible reason — never a bare "Blocked" with no context.
- This is a prototype for an executive-facing demo, not a backend system — favor a convincing, clickable experience over data persistence correctness or scale.

---

## 8. How I want you to work with me

- Treat this brief as ground truth, but act as a critical partner: if something here conflicts with what's actually in the Figma file, or you spot a gap/inconsistency (e.g., a status transition that isn't defined), **flag it and propose an answer** rather than silently picking one or silently skipping it.
- Confirm the tech stack (Section 3) before scaffolding.
- Build role-by-role (Section 5) and pause for my review between roles rather than building all screens end-to-end unreviewed.
- After scaffolding, give me a short summary of what's mocked vs. real (e.g., "AI translation is a stub that returns placeholder text after a 1s delay") so I know exactly what I'm demoing.

---

*Source context: this build brief is derived from the project's AI Collaboration Brief (Sections 1–9), after all three role screens were already validated in Figma per that brief's Section 9 checkpoints.*
