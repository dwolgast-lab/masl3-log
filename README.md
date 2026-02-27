# MASL 3 4th Official Log - Release Notes
**Author:** Dave Wolgast

---

## [v0.28] - 2026-02-27 - Red Card Intercept & Penalty Icons
**Features & Visual Upgrades**
* **Active Penalty Icons:** The Active Penalties dashboard now renders colored squares (🟦, 🟨, 🟥) next to the player's name based on the assigned card color. A Y6 Major Penalty offender automatically renders both Blue and Yellow (🟦 🟨).
* **Red Card Ejection Server:** The app now automatically intercepts all standard Red Cards (R1 through R7) and forces the 4th official to select a substitute field player to serve the accompanying 2-minute penalty time, strictly enforcing the MASL shorthanded rule.

---

## [v0.27] - 2026-02-27 - Timeouts, Release Overrides & Warning Fixes
**Features & Logic Upgrades**
* **Manual Expiration Override (Rule 12.11):** Added an "Edit Exp" button to all Time Penalties in the Game Log. This allows the official to manually adjust the release time to accommodate MASL Rule 12.11 (delayed penalty start times when a team has 3 or more active penalties).
* **Media Timeout Validation:** The app now mathematically blocks any attempt to log a Media Timeout if the inputted time is greater than `08:00` remaining in the quarter.
* **Warning Edit Fix:** Fixed a logic loop where editing a team warning would duplicate the entry and falsely trigger a "Second Warning" Yellow Card escalation. Edits now cleanly overwrite the original entry.

---

## [v0.26] - 2026-02-27 - Advanced Y6 & Accumulation Engine
**Features & Logic Upgrades**
* **Y6 Major Penalty Split Engine:** Assigning a Y6 now automatically generates *two* independent active penalties: a 7-minute Non-Releasable penalty for the original offender, and a 2-minute Releasable penalty for the field player serving the time.
* **Penalty Accumulation Engine:** The app now strictly tracks total penalties per individual (where a Y6 mathematically counts as 2 penalties: one Blue, one Yellow). Reaching 2 penalties triggers a Warning Alert, and reaching 3 penalties triggers a Red Card Ejection Alert.
* **Bench Personnel Restrictions:** The Player Select modal now dynamically hides Bench Personnel unless the "Yellow Card" color is actively selected, preventing improper card assignments.
* **Foul Summary Accuracy:** The `B`, `Y`, and `R` card tracking columns now accurately reflect accumulations (and properly exclude substitute players who are merely serving time for a teammate).

---

## [v0.25] - 2026-02-27 - Advanced Penalty & Injury Management
**Features & Logic Upgrades**
* **Y6 Major Penal Upgrades:** Selecting a Y6 Yellow Card now immediately prompts the official to select the accompanying Blue Card reason. It then automatically forces a substitute player selection to serve the 2-minute releasable portion, while the original offender serves the strict 5-minute non-releasable portion.
* **Foul Summary Dashboard:** The Foul Summary screen now tracks and displays `B` (Blue), `Y` (Yellow), and `R` (Red) card accumulations alongside standard fouls.
* **Injury Dashboard:** Added a dynamic "Active Injuries" section that appears immediately below the penalty dashboard whenever a player is ruled out for a time duration. It displays their eligible return time and includes a manual "Dismiss" override button.
* **Timeout Limits:** The app now strictly enforces the MASL standard 2 Team Timeouts per team, per match, and blocks the logging of a 3rd.
* **Log Styling:** Unattributed fouls now appear in bold Red styling inside the Game Log to visually remind the official they must be assigned before the final report is generated.

---

## [v0.24] - 2026-02-27 - Architecture Refactoring Phase 2
**Performance & Maintainability**
* **Modal Extraction:** Abstracted `TimeKeypadModal`, `WarningModal`, `PenaltyModal`, and `PlayerSelectModal` out of the main logic block.
* **Component Optimization:** `App.jsx` was successfully reduced from 1,300+ lines down to ~300 lines of pure state and routing logic. UI files are now isolated for easy CSS styling and debugging.

---

## [v0.23] - 2026-02-27 - UI Refactoring Phase 1
**Architecture & Modularization**
* **Massive Codebase Refactor:** Split the monolithic `App.jsx` into a modern, modular React structure.
* **Extracted Utilities:** Moved static arrays (penalty codes, team warnings) to `config.js` and math/time engines to `utils.js`.

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
