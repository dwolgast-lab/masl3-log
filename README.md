# MASL 3 4th Official Log

**Author:** Dave Wolgast

## Recent Updates

## [v0.77] - 2026-03-13 - Live Foul Accumulation & Special Goal UI
**Features & UX Upgrades**
* **Live Foul Accumulation:** Replaced the generic "Foul Logged" text in the live `EventLog` timeline with dynamic, mathematically calculated historical foul counts. The engine now looks back through the match array at the specific timestamp of the foul to output both `Foul Count (half)` and `Foul Count (game)` directly onto the offending player's timeline card, removing the need to check the Foul Summary screen.
* **Goal Type Data Mapping:** Updated both the live UI and the PDF Engine to explicitly format special-teams goals. If a goal does not have an assist, it now explicitly reads `--unassisted--` to prove to auditors it was not forgotten. Furthermore, if a goal is tagged as a Penalty Kick (`PK`) or Shootout (`SO`), the system entirely strips out the assist UI/PDF logic, adhering strictly to MASL logging rules where assists cannot be awarded on direct free kicks.

---

## [v0.76] - 2026-03-13 - PDF Report: Special Goal Designators
**Reporting & Export Updates**
* **Goal Type Column Added:** Added a dedicated `Type` column to the far right of the Goals table in the PDF report export.
* **Dynamic Designator Injection:** The PDF engine now detects and intercepts active `goalFlags`. Standard goals leave the new column blank, but any goal tagged as a Power Play (`PP`), Penalty Kick (`PK`), or Shootout (`SO`) is explicitly categorized in the new column for immediate context during post-game review.

---

## [v0.75] - 2026-03-13 - Timeline Absolute Boundary Math
**UI & PDF Synchronization**
* **Strict Period Boundaries:** Re-engineered the timeline sorting algorithms across both `App.jsx` and the PDF builder to utilize "Virtual Sort Times." Start markers are dynamically injected into the array as happening at `99:99`, and End markers as `-01:00`. This mathematical trick absolutely guarantees that Start and End markers act as solid bookends at the top and bottom of their respective quarters, regardless of when they were actually clicked relative to other events.
* **Media Timeout Highlighting:** Extracted Media Timeouts from the standard system design. They now render on the live dashboard timeline as bright `bg-orange-500` pills with matching white/orange sub-text styling to immediately stand out from standard period breaks during live gameplay.

---

## [v0.74] - 2026-03-13 - Foul Timeline Display Refinement
**UI Enhancements**
* **Cleaned Timeline Badges:** Refined the Game Log timeline display for standard foul events. Because standard fouls do not require a specific match clock time, the central timeline "time pill" now dynamically hides the default `--:--` placeholder and instead perfectly centers an enlarged Quarter badge for a much cleaner, more intentional aesthetic, while still properly sorting in the exact order the foul was logged.

---

## [v0.73] - 2026-03-13 - Early Release Data Display Fix
**Bug Fixes**
* **Early Release PDF/UI Mismatch:** Fixed a mapping error where early penalty releases (triggered dynamically by Power Play Goals in the active dashboard) correctly updated the internal system state to `actualReleaseTime`, but the PDF generator and the UI Timeline were hardcoded to only display the initially calculated `releaseTime`. Both the `EventLog` timeline and the `alternatePdfEngine` now correctly check for and prioritize early release strings before falling back to the standard scheduled release math.



## [v0.72] - 2026-03-13 - PDF Sub-Component Sorting & Header Overlap Fix
**Data Sorting & PDF Integrity**
* **Total PDF Chronological Sorting:** Patched the `alternatePdfEngine.js` builder. The chronological mapping hook (Quarter Ascending, Time Descending) is now heavily applied to every individual sub-table containing timestamped events (Goals, Timeouts, Warnings, and Injuries), ensuring perfect time alignment throughout the entire multi-page document.
* **Orphan Header Collision Fix:** `jsPDF-autotable` naturally ignores top page limits when automatically spanning an elongated table across multiple pages. To fix the resulting header overlaps, a hard boundary override of `margin: { top: 80, bottom: 50 }` was applied to all 13 rendering blocks in the PDF engine, creating 40pt of protected clearance below the repeated League Logo on every page.

---

## [v0.71] - 2026-03-13 - PDF Builder Hotfix
**Bug Fixes**
* **PDF Render Crash Resolved:** Fixed a silent Javascript variable reference error (`ReferenceError: loadedLogo is not defined`) that triggered when attempting to stamp the league logo onto the header of the exported PDF.

---

## [v0.70] - 2026-03-13 - Timeline Polish & Layout Fixes
**Visual & UX Patch**
* **Dynamic Event Logos:** Updated the `EventLog` timeline so that team events physically stamp the active team's franchise logo on the inner edge of the event card (closest to the center line timeline) for immediate visual team recognition.
* **Inline Card Icons:** Relocated the visual colored penalty cards inside the timeline view to immediately follow the offending player/coach's name in a strict flex-row, exactly mirroring the PDF report format.
* **Enhanced System Headers:** The "Start/End Quarter" system events in the center of the timeline now render their real-world 12-hour time-of-day in bright, bold white text for maximum readability against the dark slate background. Additionally, Media Timeouts and Team Timeouts now clearly output their associated match clock times below the header.

---

## [v0.69] - 2026-03-13 - Dashboard Timeline & PDF Iconography Engine
**UI & PDF Upgrades**
* **MLS-Style Game Log Timeline:** Completely rewrote the `EventLog.jsx` UI from a rigid table into a broadcast-style vertical timeline. Events are now dynamically sorted to their respective team's side (Home on Right, Away on Left) with a central spine rendering quarter/time pills.
* **Dynamic PDF Canvas Icons:** Removed background color shading in the Game Log PDF. The engine now uses advanced `jsPDF-autotable` callback hooks to physically draw exact-scale replica colored penalty cards (Blue, Yellow, Red) next to penalty descriptions.
* **Accumulation Iconography:** The Team Data Foul and Coach Penalty tables now represent active penalties visually by drawing multiple side-by-side card icons in sequential order (e.g. 🟦 🟨) instead of just displaying an integer.
* **Game Log Team Logos:** The PDF Game Log table now dynamically renders the active franchise logos directly into the table cells in place of raw team names, drastically increasing visual scannability during post-game review.
* **Halftime Engine Logic:** Hardcoded the central logic engine to adhere to specific MASL league rules regarding halftime clocks. Selecting MASL/M2 now enforces a 15-minute countdown clock, whereas selecting MASL3/MASLW scales it down to 10 minutes.

---

## [v0.68] - 2026-03-12 - PDF Formatting Refinements
**Reporting & Export**
* **Dynamic Table Routing:** Implemented an automated `checkSpace()` calculation hook in the `alternatePdfEngine.js` builder. The engine now mathematically checks the remaining Y-axis space on the current page before drawing *any* header or table, actively forcing page-breaks to eliminate orphaned table headers and widows across the entire document.
* **Game Log Detail Enhancements:** Rebuilt the `Goal / Assist` description parser to actively check for and append specific context flags (e.g. `[PP]`, `[PK]`, `[SO]`) into the text string. 
* **Period Marker Emphasization:** Updated the chronological sorting engine to ensure Period Markers lacking countdown times properly slot at the beginning (15:00) and end (00:00) of quarters based on internal ID arrays. Furthermore, the 12-hour Time-of-Day timestamps injected into these row descriptions are now strictly formatted with `fontStyle: 'bold'`.
* **Coach Penalties Optimization:** Filtered the Coach Penalties extraction map to exclusively render staff members who incurred a penalty. If no coach recorded a penalty, the table outputs a singular `None` row to maintain a clean layout.


👉 **[View all previous release notes in CHANGELOG.md](./CHANGELOG.md)**

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