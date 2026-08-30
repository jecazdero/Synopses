# Synopses — Project Description

Synopses is a desktop application designed to streamline the translation of movie synopses into 190 languages for a global audience — replacing a currently fragmented workflow that relies on email, Google Docs, and Excel.

**The problem it solves:** Coordinating multilingual synopsis translations across 190 languages through disconnected tools creates delays, miscommunication, and inefficiency. There's no single source of truth for tracking translation status, assigning work, or managing reviews.

**Who it serves — three core roles:**

- **Producers** — create and distribute translation tasks, track progress across movies and languages, and access finished translations, all from a centralized dashboard.
- **Translators** — manage assigned translations, use AI assistance at any stage (before, during, or after manual work), track deadlines, log absences, and respond to reviewer feedback.
- **Reviewers** — evaluate submitted translations with AI-assisted review support, approve or decline work with required feedback, and track task status across assignments.

**Core value proposition:** Replace scattered, manual coordination with a centralized, status-driven workflow — where AI acts as a built-in productivity layer (translation assistance, review support) rather than a bolt-on feature — and where every core task (create, translate, review) can be completed in fewer than 10 clicks.

**Origin stage:** This build started from a solo-builder design phase — validating Figma screen designs for each role individually before compiling them into a 5-slide value-proposition deck for executive presentation. The project followed Netflix's brand style guide and a strict sequencing model (one role validated at a time, no skipping ahead), with defined "done" criteria per screen and workflow checkpoints to keep design and validation disciplined. The AI Collaboration Brief below is that original planning document; `synopses-claude-code-brief.md` (also in this repo) is the build brief derived from it once all three role screens were validated in Figma.

---

# AI Collaboration Brief

A reusable context document to open any AI collaboration session.

## 1. What I'm Building & Who It's For

**Product name:** Synopses

**One-line description:** A desktop application that streamlines translating movie synopses into multiple languages.

**Who it's for:** Producers, translators, and reviewers who currently coordinate 190-language synopsis translations through email, Google Docs, and Excel.

**The problem:** Synopses currently manages the translation of movie synopses for its global audience through a combination of emails, Google Docs, and Excel. This decentralized approach leads to inefficiencies, delays, and challenges in coordination, especially in managing translations into 190 languages.

## 2. User Roles & Permissions

| Role | Can do |
|---|---|
| Producer | Create translation tasks, manage task distribution, access completed translations |
| Translator | Translate synopses, use AI integration for multi-language translation, submit for review |
| Reviewer | Approve or return translations; comment and suggest edits |

## 3. User Needs

- As a Producer, I want to create translation tasks, manage task distribution, and access completed translations in fewer than 10 clicks per task.
- As a Translator, I want to translate synopses, use AI integration for multi-language translation, and submit for review in fewer than 10 clicks.
- As a Reviewer, I want to approve or return translations — and comment and suggest edits — in fewer than 10 clicks.

## 4. My Role & What I Own

I am a product builder (team of one). I own the product decisions and am building this to create a product value proposition — with screens designed in Figma — to present to executives and validate my ideas.

## 5. Functional Requirements

### 5.1 User Roles and Permissions

- **Producers:** Create translation tasks, manage task distribution, and access completed translations
- **Translators:** Translate synopses, utilize AI integration for multi-language translation, and submit for review
- **Reviewers:** Approve or return translations, with the ability to comment and suggest edits

### 5.2 Task Management

- Automated task assignment based on translator ratings and availability
- Task redistribution feature for handling absences due to vacations or other reasons
- A "finished tasks" repository for producers to access completed translations

### 5.3 AI Integration for Translation

- AI-assisted translation feature to enable translators to work across multiple languages more efficiently

### 5.4 Communication and Collaboration Tools

- Integrated messaging and notification system for real-time updates and communication
- Centralized document management to replace emails, Google Docs, and Excel

## 6. Constraints

- **Team size:** 1 (me)
- **Timeline:** Value proposition must be complete within 1 hour
- **Deliverable:** 1 value proposition document, max 5 slides, in Figma
- **Non-negotiable:** Slides must cover all three roles and show designed solutions for each
- **Non-negotiable:** App screen designs must be validated by me before the value proposition slides are built

## 7. Where AI Is Involved — and Where It Isn't

**AI should:**

- First, design desktop app solution screens in Figma for each role (Producer, Translator, Reviewer), created as Figma frames — for me to review and validate.
- Only after I approve the screens, build the value proposition document in Figma: max 5 slides, containing the validated designed solutions for each role plus an executive summary per role.
- Before designing each screen, check with me on the elements that screen should contain — don't design first and explain after.
- Act as a critical reviewer, brainstorming partner, and fact checker throughout — challenge weak ideas, flag gaps, and verify claims rather than just executing requests.

**AI should NOT:**

- Skip the validation checkpoint and jump straight to the value proposition deck
- Finalize slide content before screens are approved
- Design a screen's elements before checking with me what it should contain
- Move to the next role's screen before the current one is validated
- Make scope, role, or permission decisions without confirming with me

**My responsibility:**

The designed outcome is mine to own — solutions must be user-friendly, solve the actual problem, and be visually appealing. AI supports and challenges my thinking; I make the final call.

**How we work through the screens:**

- One role, one Figma screen, one at a time — not all three at once.
- Before building it, we agree on what elements the screen needs.
- We focus on a single role's screen until I say it's good enough against Section 8 criteria, fine-tuning as needed.
- Only then do we move to the next role.

## 8. Definition of "Good Enough" (per screen)

Applies to all three roles:

- [ ] Follows the Netflix brand style guide
- [ ] Visually consistent with the other two role screens (same design language, components, layout logic)
- [ ] Solves the actual problem for that role
- [ ] Is easy to use
- [ ] Core task for that role can be completed in fewer than 10 clicks (see Section 3)
- [ ] Gives that role AI assistance for performing their daily tasks (not just a generic AI mention — tied to what they actually do)

**Producer screen — must deliver:**

- [ ] A Create button that's noticeable within 1 second
- [ ] Create button starts a new synopses entry
- [ ] Can create from scratch, or upload from Google Docs or Excel
- [ ] All movies visible in one place; clicking a movie opens its detail page
- [ ] Once created, Producer can see at a glance: movie name, translation deadline, responsible Director's name, original synopsis
- [ ] Can track translation progress per movie
- [ ] Sees a timeline and status for each movie's translations
- [ ] Can use AI to translate into any of the 190 languages, or assign tasks for manual translation
- [ ] For each movie, sees timeline and status broken down by language
- [ ] Movie Detail page shows Translation Progress and an Actions dropdown (Update Synopses, Download all, Share via link, Delete — gated by status, see table below)
- [ ] Movie statuses: To do, In progress, Blocked, Done
- [ ] Per-language translation statuses: To do, In progress, Blocked, Review, Done
- [ ] Can easily see which language is assigned to whom, when, and how many days the Translator has spent on it
- [ ] If Producer auto-translates the original into all 190 languages, they're prompted to assign those translations for review

**All Movies list — per-row actions by status:**

| Status | View Details | Update Synopses | Download all translations | Share translations via link | Delete Synopsis |
|---|---|---|---|---|---|
| To do | ✓ | ✓ | | | ✓ |
| In progress | ✓ | ✓ | | | ✓ |
| Blocked | ✓ | ✓ | | | ✓ |
| Done | ✓ | | ✓ | ✓ | ✓ |

**Movie Detail page — Actions (kebab dropdown), by status:**

Shows Translation Progress and an Actions dropdown, gated by the same status rule as the All Movies list above. The only difference: View Details is omitted here (redundant — you're already on the detail page). Everything else (Update Synopses, Download all, Share via link, Delete) follows the same status gating as the list.

- [ ] End-to-end flow (create task → distribute → access completed translation) takes fewer than 10 clicks

**Translator screen — must deliver:**

- [ ] Easily sees pending translations assigned to them
- [ ] Can follow the progress of their own translations
- [ ] Sees movie, original synopsis, director, and deadline
- [ ] Can set up periods of absence
- [ ] If Translator is absent, their translation moves to Blocked with reason "Sick leave" or "PTO"
- [ ] Blocked status always shows a reason: Absent or Incomplete synopsis
- [ ] Can manually change a translation's status; setting status to Blocked requires providing a reason
- [ ] Translate with AI is an assistive action available at any time, not an exclusive path — Translator can translate with AI then edit the result manually, translate manually then polish with AI, or combine both, at any stage including after Reviewer feedback
- [ ] Can easily see reviewer comments, separated per movie, and can reply to each comment
- [ ] After a Reviewer sends feedback, Translator can revise the translation using AI, manually, or both
- [ ] End-to-end flow (translate, AI-assisted or manual → submit for review) takes fewer than 10 clicks

**Reviewer screen — must deliver:**

- [ ] Sees all tasks assigned to them
- [ ] Sees movie name, director, producer, translator, deadline, original synopsis, and translation
- [ ] Can easily see the status of every assigned task
- [ ] Can use AI to assist with reviewing a translation
- [ ] Can approve a valid translation
- [ ] Can decline an invalid translation and must provide a comment explaining why
- [ ] If declined, sees who it gets reassigned to (the previous Translator)
- [ ] End-to-end flow (review → approve/decline with comment) takes fewer than 10 clicks

## 9. Workflow Checkpoints

- [ ] Step 1a: AI designs Producer screen in Figma → I validate & fine-tune against Section 8 criteria
- [ ] Step 1b: AI designs Translator screen in Figma → I validate & fine-tune against Section 8 criteria
- [ ] Step 1c: AI designs Reviewer screen in Figma → I validate & fine-tune against Section 8 criteria
- [ ] Checkpoint: all 3 screens approved
- [ ] Step 2: AI builds 5-slide value proposition deck in Figma (designed solutions + exec summary per role)
- [ ] Step 3: I review final deck before presenting to executives

---

*Template notes: Sections 1–2 set static context (what/who) that rarely changes mid-project. Section 3 captures user-level success criteria. Section 4 sets my role. Section 5 captures the fuller functional spec — useful once the idea moves past the value-proposition stage into build planning. Section 6 covers constraints. Section 7 is the most important for AI collaboration — be explicit about sequencing and approval gates, not just tasks. Section 8 defines "done" so approval isn't a vague vibe check. Section 9 turns the brief into a checklist you can literally track against, one role at a time.*
