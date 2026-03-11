# MASL 3 4th Official Log

**Author:** Dave Wolgast

## Recent Updates

### [v0.66] - 2026-03-11 - Dynamic League Roster Constraints
**Rule Engine & Data Validation**
* **Tiered League Validation:** Re-engineered the roster validation logic to dynamically adapt based on the selected league tier. 
* **MASL/M2 Strict Mode:** If MASL or M2 is selected, the system enforces a strict 16-player maximum with a hard requirement of dressing at least 2 Goalkeepers (effectively capping field players at 14).
* **MASL3/MASLW Amateur Mode:** If an amateur league is selected, the system expands the total allowed roster to 17, enforces a 15 field player maximum, and allows kickoff with only 1 Goalkeeper dressed.

---

### [v0.65] - 2026-03-11 - Advanced Responsive Header Scaling
**Visual & UX Patch**
* **Strict Flex Boundaries:** Implemented strict `min-w-0` and `truncate` CSS rules across the `InGameDashboard` header. This prevents dynamically generated string content (like long team names) from overriding flexbox boundaries, ensuring the layout maintains its 100vh structure without unwanted vertical stacking or word-wrapping on smaller devices.
* **Responsive Breakpoints:** Added targeted tailwind dimension breakpoints (`md:`, `lg:`) to gracefully scale the League Logo, Team Logos, and font sizes down on 11" tablets, while expanding them dynamically for massive 27" PC displays.
* **Score Alignment:** Hardcoded the internal width parameters (`w-8 md:w-12`) of the digital score digits within the central flexbox. This guarantees that the team score blocks remain perfectly physically aligned and do not jitter or resize when scores transition from single digits to double digits.

---

### [v0.64] - 2026-03-11 - Scorebox Layout & Logo Scaling Fixes
**Visual & UX Patch**
* **Scorebox Flex Enforcement:** Fixed a bug where the `Q - 0` scoreline would vertically stack on specific countdown-timer fonts and high-DPI displays (as identified in the previous turn). Instead of relying on a single inline `span` for the text string, the scorebox is now explicitly a flex row `div` with `space-x-4`, guaranteeing the away score, hyphen, and home score always render on a single, perfectly spaced line.
* **Header Scaling boost:** To make better use of PC display space (md breakpoint), the active league logo in the dashboard header has been significantly boosted from `w-20` up to `w-32`, making its display twice as large and much more prominent.

---

### [v0.63] - 2026-03-11 - Officiating Crew Config & Dashboard UI Upgrade
**Features & UX Enhancements**
* **Officiating Crew Modal:** Added a dedicated input modal to the `PregameSetup` screen allowing 4th Officials to document the Crew Chief, Referee, Assistant Referee, and 4th Official. This data binds directly to the active `gameData` state for seamless integration into the upcoming post-game PDF report export.
* **Dashboard Header Expansion:** Moved the `⚙️ Setup` navigation button out of the dashboard header and explicitly into the global footer. This freed up the header layout, allowing the active League Logo to be displayed at 200% scale and ensuring the primary Scoreboard string remains perfectly centered on the screen regardless of device width.

---

### [v0.62] - 2026-03-10 - Dashboard Controls & Reverse-Chronological Sorting
**Data Management**
* **Reverse-Chronological Game Log Enforcement:** Re-engineered the master `gameEvents` render pipeline to mathematically sort events prior to passing them to the `<EventLog />` viewer. The logic enforces Quarter Descending (OT->Q4->Q3...) and Time Ascending (00:00->15:00) so that the newest chronological events resulting from a countdown clock always render at the absolute top of the UI list for live operational efficiency. 
* **Active Penalty Quick-Edits:** Pushed the `startEditingReleaseTime` handler down into the `<ActivePenaltiesWidget />`. Users can now click the new **"Edit Exp."** button directly from the main dashboard to instantly correct an erroneously calculated penalty release time without having to hunt through the Game Log.

---

### [v0.61] - 2026-03-10 - In-Game UI Componentization
**Codebase Optimization**
* **Dashboard Widgets:** Refactored the `InGameDashboard.jsx` file by extracting the `ActivePenalties` and `ActiveInjuries` monitors into standalone React components within the `/src/components/widgets/` directory. 
* **Modal Extraction:** Moved the raw HTML for the Custom Time Confirmation alert out of `App.jsx` and into a reusable `<TimeConfirmModal />` component, significantly streamlining the parent routing file.

---

### [v0.60] - 2026-03-10 - Architectural Componentization (Phase 2)
**Codebase Optimization**
* **Modal Extraction:** Finalized the modularization of the `PregameSetup` UI by stripping out all remaining local state, data handlers, and HTML dedicated to the `RosterEditorModal` and the `StartersViewerModal`. These complex features now live entirely in isolated files inside `/src/components/modals/`.
* **Reduced Monolith:** These dual extraction phases reduced the `PregameSetup.jsx` file footprint by nearly 75%, transforming it from a monolithic file that handled UI, Logic, API routing, and rendering into a clean, easy-to-read layout director.

---

### [v0.59] - 2026-03-10 - Architectural Componentization (Phase 1)
**Codebase Optimization**
* **Pregame UI Componentization:** Broken down the monolithic `PregameSetup.jsx` file by abstracting the core layout blocks into dedicated, reusable React components (`MatchInfoBlock.jsx` and `TeamConfigCard.jsx`). This successfully eliminated nearly 100 lines of duplicated code, allowing a single blueprint to dynamically render both the Away and Home team configurations simply by passing a prop.

---

### [v0.58] - 2026-03-10 - Architectural Refactor: Decoupled OCR Engine
**Codebase Optimization**
* **Isolated Processing Engine:** Extracted all Google Cloud Vision/Document AI communication logic, Base64 image compression pipelines, and text parsing algorithms out of the `PregameSetup.jsx` view component and into a dedicated `ocrEngine.js` utility file. This reduces the view component size by ~150 lines, significantly improving code readability and making future OCR format tweaks entirely independent of the UI logic.

---

### [v0.57] - 2026-03-10 - Footer UI Consolidation
**UI Layout Optimization**
* **Embedded Footer Banner:** Redesigned the "Last Action" UI from a hovering modal to an embedded flexbox item. The edit/undo banner now renders perfectly flat inside the dead white space between the "Start Quarter" and "Media Timeout" buttons in the bottom global footer, ensuring it never obscures active game controls during fast-paced play.


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