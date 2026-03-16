# MASL 3 4th Official Log

**Author:** Dave Wolgast

## Recent Updates

## [v0.83] - 2026-03-16 - iPad Flexbox Layout Squeeze Fix
**UI Optimization**
* **Strict Proportional Header:** Re-engineered the master `InGameDashboard` flexbox to prevent aggressive scaling loops on 11" iPad screens (`md`/`lg` breakpoints). The header is now strictly segmented (Left Logo: 20%, Center Scoreboard: 60%, Right Controls: 20%), guaranteeing the team names have ample horizontal space and eliminating the visual "C..." and "B..." truncation squeeze.
* **Redundant Quarter Cleanup:** The `Q1/Q2/Q3` display toggle in the header has been explicitly hidden on all displays smaller than large PC monitors (`xl`). Because the active quarter is already prominently displayed on the primary toggle button in the footer, removing this read-only element from tablets successfully frees up an additional 250px of critical layout space.
* **Control Panel Text Wrapping:** Removed the forced single-line `truncate` class from the main team name headers in the central control block. Long franchise names (e.g., "BUFFALO GUNNERS FC") will now gracefully wrap to a second line (`line-clamp-2`) instead of randomly cutting off characters.

---

## [v0.82] - 2026-03-16 - iPad Responsiveness & Layout Scaling
**Visual & UX Patch**
* **Dynamic Font Scaling:** Fixed an extreme truncation bug present on 11" tablets operating in landscape orientation. The team name header fonts were statically locked to `text-4xl`, which forced flexbox to aggressively calculate intrinsic widths and compress names like "BUFFALO GUNNERS FC" down to a single letter. The font logic has been updated to scale smoothly (`text-2xl` on iPad, scaling up to `text-4xl` only on massive desktop monitors), allowing long team names to breathe and wrap appropriately.
* **Scorebox Diet:** Shaved down the internal padding, icon widths, and font sizing of the central scorebox specifically on the `md` UI breakpoint, surrendering significant horizontal layout space back to the team name containers.

---


## [v0.81] - 2026-03-16 - Video Review Safeguards & Logging
**Logic & UX Upgrades**
* **VR Availability Locks:** Passed the master `gameEvents` state into the VR Modal to act as a logic guard. The modal now actively evaluates a team's VR history when rendering the Team Selection step. If a team has used their single challenge (or failed their earned secondary challenge), their selection button disables itself and explicitly displays a "No Challenges Remaining" text warning.
* **Timeline Fallback Overrides:** Patched a gap in the timeline UI where Video Reviews were rendering with an "Unknown" name placeholder because they lack a specific player entity. The timeline now explicitly recognizes `Video Review` events, replaces the header with either "Coach Challenge" or "Referee Review", and generates a clean, color-coded description block displaying the Reason, Specification, Result, and whether the challenge flag was successfully collected.

---


## [v0.80] - 2026-03-16 - Dark Mode Contrast & VR Flow Refinements
**Visual & UX Upgrades**
* **Dynamic Dark Mode Contrast:** Implemented a real-time luminance calculation engine (`ensureVisibleInDark`). When Dark Mode is active, the system now automatically evaluates team brand colors (e.g., Navy Blue or Forest Green) and mathematically brightens them by 60% if they fall below a strict visibility threshold, guaranteeing UI legibility against the dark background without losing the team's core identity.
* **Standardized VR Time Entry:** Rerouted the Video Review initiation flow. Instead of requiring manual typing into a dedicated text box, pressing "VIDEO REVIEW" now opens the standard Time Keypad (defaulting to the current quarter). After the user inputs the clock time, the system seamlessly hijacks the routing and passes the data directly into the Video Review wizard.

**Bug Fixes**
* **VR Modal State Reset:** Fixed a bug where the Video Review modal would incorrectly remember its previous state (getting "stuck" on the Failed Challenge or Outcome screens after a previous review). A new React `useEffect` hook now forcefully resets the internal wizard state back to the first step every single time the modal is opened.

---

## [v0.79] - 2026-03-16 - Broadcast Theme & VR Subsystem
**Major Features & Refinements**
* **Dark Mode Theme Engine:** Added a universal dark mode engine toggleable from the Pregame Setup screen. When active, it deeply injects custom slate-and-white tailwind classes across the entire `InGameDashboard` and UI modals to significantly reduce stadium glare during live operations.
* **Real-Time Status Bar:** Embedded a data-driven status bar directly beneath the central scoreboard. It automatically tracks "Timeouts Remaining" for both teams in real-time, and conditionally evaluates the strict MASL logic rules to display if a "VR Challenge" remains available.
* **Video Review (VR) Subsystem:** Created a complex, multi-step `VideoReviewModal.jsx` specifically for `MASL` tier matches. This flow cleanly documents Quarter, Time, Initiator (Referee vs. Coach), Specific MASL Reason Code arrays, Outcome (Stands vs Overturned), and forces flag-collection verification on failed coach challenges.
* **PDF VR Rendering:** The `alternatePdfEngine.js` dynamically intercepts Video Review events and routes them into dedicated tracking tables on the team data sheets, as well as printing their complex descriptions cleanly into the chronological Game Log.

---

## [v0.78] - 2026-03-13 - Data Extraction Failsafe
**Bug Fixes**
* **Assist "Undefined" Render Bug:** Fixed a Javascript evaluation quirk where skipping the assist entry or manually selecting "Unassisted" from the player modal stored a flat string instead of a player object. Attempting to extract the `.name` property from this string caused the UI and PDF engine to output the literal text `"undefined"`. The extraction logic has been hardened to securely check object types before rendering, ensuring `--unassisted--` reliably prints across all contexts.

---

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