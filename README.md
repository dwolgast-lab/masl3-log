# MASL 3 4th Official Log

**Author:** Dave Wolgast

## Recent Updates

## [v1.2.2-beta] - 2026-06-23 - Staff Role Mapping Tuned on Real Forms

**Improvements**
* **More Job Abbreviations Recognized:** Validated the scanner against eight real lineup sheets and tuned staff-role mapping — **"AS"** now maps to **Assistant Coach** and **"GM"** to **Manager**. "Owner" and other unrecognized jobs continue to fall back to **Other**. Added an internal local scan test harness (`scripts/scanLocal.mjs`) for validating field mapping against real sheets before deploying.

---

## [v1.2.1-beta] - 2026-06-23 - Staff Role Normalization

**Improvements**
* **Bench Staff Role Mapping:** Scanned "Job" values are now mapped to canonical roles much more reliably — **Head Coach** ("Head Coach", "HC", or a bare "Coach" in the first staff row), **Assistant Coach** ("AC", "Assistant Coach", "Asst. Coach", or a bare "Coach" below the first row), and **Trainer** ("Trainer", "AT", "Athletic Trainer"). The first staff member listed defaults to head coach when the text is bare/unrecognized; explicit labels are respected. Anything else falls back to **Other**.

---

## [v1.2.0-beta] - 2026-06-23 - Claude Vision Roster Scanning

**New Features**
* **Claude Vision Lineup Scanning:** Replaced the Google Cloud Document AI OCR pipeline with a Claude vision call that returns field-mapped roster JSON. The model reads the form's structure directly (number, position, name, Starters vs. Substitutes section) and returns it already mapped to the app's roster model, with `isGK` derived from the position column and `isStarter` from the section — so scanned data lands in roughly the right place and only needs minor correction.
* **League-Agnostic Extraction:** Handles the varying titles, headers, and row counts across MASL, MASL2, MASL3, and MASLW forms rather than being hard-coded to one layout.
* **Automatic Name-Order Normalization:** Normalizes free-form names to "Last, First" — comma-written names are preserved, and "First Last" names are reordered using common-given-name knowledge; hyphenated surnames and quoted nicknames are kept intact.

**Cleanup**
* Removed the `@google-cloud/documentai` dependency; added `@anthropic-ai/sdk` and `zod`. `.gitignore` now excludes `.env`.

---

## [v1.1.0-beta] - 2026-06-02 - Major Penalty Release Workflow & Code Refactor

**New Features**
* **Major Penalty (Y6) Release Workflow:** The Active Penalties board now fully supports the stoppage-based release mechanic for Y6 (Major Penalty) offenders. When a Y6 is logged, the offender's board entry displays **"Earliest: Q3 08:14"** (the calculated 7-minute minimum). Once the 7-minute minimum has elapsed, a green **Released** button appears. Tapping it opens the time keypad so the 4th Official can record the exact stoppage time. That time is stored as the official release timestamp and printed in the PDF "Time Out" column.
* **PDF & Event Log Time-Out Column:** The penalty time-out column now resolves in priority order: actual stoppage release time → PPG release time → calculated expiration.

**Improvements**
* **App.jsx Refactor:** Extracted penalty board and modal workflow handlers into dedicated custom hooks (`usePenaltyHandlers`, `useModalWorkflow`), reducing `App.jsx` by ~95 lines.

**Cleanup**
* Removed unused legacy `pdfEngine.js` and `glob` npm dependency.

---

## [v1.0.3-beta] - 2026-03-18 - Picker UI Polishing
**Bug Fixes & Tweaks**
* **Color Picker Clipping:** Adjusted the directional rendering of the custom color picker popover. It now explicitly opens upwards (`bottom-full`) to prevent it from being abruptly cut off by the `overflow-hidden` rule on the master setup card container.
* **Auto-Dismiss Workflow:** Added workflow smoothing to the color picker tool. The popover will now automatically close itself immediately after the user makes a Secondary Trim color selection, eliminating an unnecessary extra click.

---

## [v1.0.2-beta] - 2026-03-18 - Picker State Batching Fix
**Bug Fixes**
* **React State Clobbering:** Resolved a deep framework quirk where selecting a Primary Color from the custom dropdown failed to update the dashboard's background UI (leaving the preview box looking white/incorrect). The `TeamConfigCard` now utilizes a sequential `useEffect` state queue, forcing the application to securely save the Hex code, fully process the render cycle, and *then* save the text name, eliminating the race condition.

---

## [v1.0.1-beta] - 2026-03-18 - Visual Color Dictionary
**Features & Fixes**
* **Custom Color Dictionary:** Replaced the native OS color picker with a curated, visual dropdown interface. Officials can now explicitly select a generic Primary Color and a Secondary Trim color (e.g., "Pink / White") from a defined grid of colored swatches. This ensures exact, standardized nomenclature is printed on the final PDF report, eliminating formatting inconsistencies.
* **White-UI Contrast Fix:** Implemented a UI failsafe for teams wearing primary White kits. Selecting "White" mathematically sets the background UI engine to a dark silver (`#9CA3AF`) while explicitly saving the text "White" for the report, preventing the catastrophic UI failure of drawing invisible white text on a white dashboard background.

---

## [v1.0.0-beta] - 2026-03-18 - Beta Release & OCR Refinements
**Features & Fixes**
* **Manual Color Overrides:** Fixed a bug where overriding the team's Color Name string on the setup screen failed to update the visual UI theme. The `TeamConfigCard` now features a native `<input type="color">` swatch picker, allowing officials to dynamically overwrite the underlying HEX code if a team is wearing alternate white/away kits.
* **OCR Reliability Rollback:** Analyzed live-fire edge cases where the OCR engine misidentified Starters and Goalkeepers on heavily scrambled, handwritten lineup sheets. To improve data integrity on the sideline, the auto-guessing math was removed. The OCR engine now focuses strictly on extracting Names and Jersey Numbers, defaulting all `isGK` and `isStarter` flags to `false` and requiring the 4th official to perform a fast, manual verification step.

---

👉 **[View all previous release notes in CHANGELOG.md](./CHANGELOG.md)**

👉 **[User Guide is available in USERGUIDE.md](./USERGUIDE.md)**

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### React Compiler
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.