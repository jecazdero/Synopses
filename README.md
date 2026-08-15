# Synopses

![Synopses overview](docs/synopses-overview.png)

**Synopses** replaces email/Google Docs/Excel for coordinating movie-synopsis translation into up to 190 languages, across three roles — **Producer**, **Translator**, and **Reviewer**.

This repo is a fully functional, click-through **prototype**: every flow is genuinely stateful and interactive, built directly from the validated Figma designs.

**Design file:** [figma.com/design/VCbxdDdbOWFtrQYIYSGp4O/Synopses](https://www.figma.com/design/VCbxdDdbOWFtrQYIYSGp4O/Synopses?node-id=0-1&t=PY4YevcXtJEqvaFM-1)

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS (dark theme, tokens matched to Figma)
- React Router
- Zustand, persisted to `localStorage`

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. There's no real backend or auth — use the role switcher in the header (top right) to jump between the Producer, Translator, and Reviewer personas and demo all three flows from one build.

Other scripts:

```bash
npm run build     # type-check and production build
npm run lint       # Oxlint
npm run preview    # preview the production build locally
```

## What's mocked vs. real

- **AI translate / polish / review-note**: stubbed — a short loading delay, then placeholder generated text. No live LLM call.
- **Google Docs / Excel import** (Create Synopsis): accepts a link or file, but parsing is stubbed with placeholder text.
- **Everything else** — routing, status transitions, translator assignment, comments/replies, absence auto-blocking, reviewer decline → reassignment — is fully wired against real app state and persists to `localStorage` across refreshes.

## Roles at a glance

| Role | Screens | Key actions |
|---|---|---|
| **Producer** | Dashboard, Movie Detail, Create Synopsis | Create/distribute translation tasks, assign translators or trigger AI translation, track progress, download/share completed work |
| **Translator** | My Translations, Translate | Translate with AI and/or manually, manage absence, reply to reviewer comments, submit for review |
| **Reviewer** | My Review Tasks, Review Translation | AI-assisted review, approve or decline (with a required comment) — declines reassign to the original translator |
