# MASL 3 4th Official Log - Release Notes
**Author:** Dave Wolgast

---

## [v0.23] - UI Refactoring Phase 1
**Architecture & Modularization**
* **Massive Codebase Refactor:** Split the monolithic `App.jsx` into a modern, modular React structure.
* **Extracted Utilities:** Moved static arrays (penalty codes, team warnings) to `config.js` and math/time engines to `utils.js`.
* **Extracted PDF Engine:** Moved the `pdf-lib` generation logic to its own dedicated `pdfEngine.js` service.
* **Component Extraction:** Separated the major UI overlays (`TimerOverlay`, `AlertOverlay`, `FoulSummary`) and screens (`PregameSetup`) into independent files to dramatically improve maintainability and performance.

---

## [v0.22] - Context-Aware Data Entry
**Logic & UI Enhancements**
* **Decoupled Quarters:** Separated the "Game Clock Quarter" from the "Data Entry Quarter". The app now dynamically injects a Quarter Selector into the keypad if the game clock is stopped or if a past event is being edited.
* **Active Penalty Dashboard Update:** The dashboard now explicitly displays the `(Served by: #X)` substitute directly below the offender's name to prevent bench confusion.
* **Protected Edits:** Safely isolated the edit state to ensure editing past events does not alter the active live game clock.

---

## [v0.21] - Goalkeeper & Substitute Routing Fixes
**Bug Fixes**
* **Player Routing Engine:** Re-engineered the `handlePlayerSelect` workflow to prevent an infinite loop when assigning penalties to Goalkeepers or checking the "Substitute Server" box.
* **Offender Exclusion:** Dynamically stripped the original foul offender from the "Who is Serving?" list to prevent assigning a player to serve their own bench penalty.

---

## [v0.20] - Intelligent Error Prevention
**Features & Logic Upgrades**
* **Intelligent Time Validation:** Added math-based auto-correction. If an impossible time is entered (e.g., `9310`), the app calculates if it was a typo for `09:31`, prompts the user, and auto-corrects the entry.
* **Goalkeeper Penalty Enforcement:** The app now actively intercepts penalties given to players with the "GK" designation and forces the assignment of a field-player substitute to serve the time.
* **Editable Timestamps:** Users can now edit the original time of an event in the Game Log, and the app will automatically recalculate and update penalty release times and injury return times.
* **Simultaneous PPG Release:** Updated the Power Play Goal math to instantly release penalties if a PPG is scored at the *exact same second* a penalty is assessed (e.g., Shootout or Penalty Kick goals).

---

## [v0.19] - Audio Cues & Validation
**Features & QoL Enhancements**
* **Synthetic Desk Bell:** Built a custom Web Audio API synthesizer that generates a dual-harmonic desk bell tone from the device speakers (1 bell at 30s, 2 at 15s, 4 at expiration) to notify the 4th official without requiring visual focus.
* **Auto-Dismiss Timers:** Timeout clocks now automatically clear from the screen exactly 15 seconds after reaching 0:00.
* **Self-Assist Prevention:** Added validation to prevent the app from allowing the goal scorer to also be credited with the assist on the same play.

---

## [v0.18] - Smart PPG & Minimizable Timers
**Features & Logic Upgrades**
* **Minimizable Overlays:** All break and timeout timers now feature a "Minimize to Top" button (and auto-minimize after 15 seconds), allowing the user to interact with the Game Log and Roster while the clock counts down.
* **Smart Power Play Matching:** The "PPG Scored" button now features an absolute-seconds math engine that scans the game log, finds the exact time of the active Power Play goal, and automatically calculates the early release time for the penalty box.
* **Manual PPG Fallback:** Added a dedicated Keypad modal for manual Power Play Goal time entry if an automated match isn't found.
* **Timeout Standardization:** Added an automated 60-second timer for Team Timeouts.

---

## [v0.17] - Team Warnings & Match Flow
**Features**
* **Team Warnings Engine:** Added the 5 specific MASL Team Warning reasons (Bench Dissent, Delay of Game, Embellishment, Encroachment, Shootout/PK).
* **Warning Escalation:** App now tracks team warnings and triggers a massive full-screen Yellow Card alert if a team violates the same warning twice.
* **Dynamic Period Controls:** Replaced static logging buttons with dynamic "Start/End Quarter" buttons that log real-world timestamps to the system.
* **Automated Breaks:** Added automated countdown timers for Halftime (10 mins) and Quarter Breaks (3 mins).


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
