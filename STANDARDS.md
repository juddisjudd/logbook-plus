# Logbook+ — Project Standards

## Core Principles

* Desktop-only focus. Ignore Tauri’s web build path.
* Use **Bun** for all scripts and tooling.
* Code-first workflows. Keep explanations short unless requested.
* Read-only external data from:

  * `S:\_projects_\_arc-raiders_\arcraiders-data`
  * `S:\_projects_\_arc-raiders_\ARDB`
* No mutation of source data. Data pulls must be re-runnable and update-safe.

## File & Directory Structure

* `/src-tauri` — Tauri configuration, commands, and integration.
* `/src` — Vue + TypeScript UI code.
* `/src/components` — Reusable UI pieces.
* `/src/views` — Top-level screens.
* `/src/styles` — Shared styling primitives.
* `/data` — Local copies or processed outputs from external directories.
* `/inspiration` — Screenshot references.
* Markdown docs live at project root.

## Coding Standards

* Typescript strict mode enabled.
* Prefer composition API for Vue.
* Avoid global mutable state. Use scoped stores.
* Use descriptive names; avoid abbreviations except well-known terms.
* One component per file. Keep components small.

## UI Standards

* Component spacing must follow AESTHETICS-GUIDE.md.
* No system window controls — always custom.
* Header is the only draggable region.
* Hotkey toggling must be global and non-intrusive.

## Versioning

* App version should be sourced directly from `package.json`.
* Header must always display the value from `package.json`.
* A Bun script may be used to bump and sync the version, but `package.json` remains the canonical source.

## Data Handling

* External directories treated as immutable.
* Any imported data should go through a parsing layer.
* Auto-update workflow should re-pull data without breaking components.

## Build & Distribution

* Bun preferred for all scripts.
* Tauri build must target Windows desktop only.
* All assets must be optimized for fast overlay startup.

## Review Process

* New features must conform to all three docs: PLAN, AESTHETICS, STANDARDS.
* Style, UX, and structure checked before merging.
