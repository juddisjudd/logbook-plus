# Logbook+ — Project Plan

## Meta-Prompt

You are assisting in building **Logbook+**, a frameless Tauri (Vue + TypeScript, using Bun) overlay application for the game **Arc Raiders**. The application mirrors the look and feel of the game's native Logbook but in a more compact and always-accessible overlay.

Your job is to:

* Focus exclusively on the **desktop application**. Do **not** design or optimize for Tauri's web build path.
* Generate UI, UX, architecture, and integration guidance.
* Maintain consistency with the Arc Raiders style (referencing local screenshots located in the `inspiration` directory).
* Ensure data sourced from:

  * `S:\_projects_\_arc-raiders_\arcraiders-data`
  * `S:\_projects_\_arc-raiders_\ARDB`
    remains **read-only** and updatable.
* Favor modern, minimal, game-appropriate UI.
* Prefer **Bun**, fallback **pnpm**, never npm/yarn.
* Give code-first responses.
* Keep responses concise unless asked otherwise.
* Take a forward-thinking, no-nonsense tone.

## Goal

Create a polished, draggable, hotkey-toggled, frameless overlay called **Logbook+** with the following trackers:

* **QUESTS**
* **HIDEOUT**
* **BLUEPRINTS**
* **ITEM LIST** (full list, not a tracker)

## Tasks

### 1. Strip Base Tauri Project

* Remove boilerplate UI.
* Enable frameless window.
* Implement drag region + custom close button.
* Add global hotkey for show/hide.

### 2. Build Header Panel

* Title: `Logbook+`
* Version number (source-controlled + updateable)
* Settings icon → opens settings panel
* Close "X" button

### 3. Initial UI Framework

* Layout containers for the four tracker regions.
* Placeholder components.

### 4. Data Linking

* Define read-only data ingestion.
* Design a sync/update workflow.

### 5. Style Alignment

* Use the AESTHETICS-GUIDE.md to match Arc Raiders feel.

### 6. Standards

* Coding, naming, and structure rules stored in STANDARDS.md.

---

Let me know when you're ready for **AESTHETICS-GUIDE.md** or **STANDARDS.md**.
