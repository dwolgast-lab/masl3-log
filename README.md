# MASL 3 4th Official Log

**Author:** Dave Wolgast

## Recent Updates

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

---

### [v0.67] - 2026-03-12 - Alternate MASL Game Log PDF Engine
**Reporting & Data Export**
* [cite_start]**New PDF Engine:** Built a completely standalone PDF generation engine (`alternatePdfEngine.js`) to produce a secondary "MASL Game Log" report that mirrors the official `.docx` reporting format[cite: 1]. 
* [cite_start]**Dynamic Table Routing:** The engine mathematically sorts and extracts Goals [cite: 7][cite_start], Penalties (Players & Coaches) [cite: 10, 12][cite_start], Fouls [cite: 14][cite_start], Injuries [cite: 16][cite_start], and Warnings [cite: 18] [cite_start]into highly compact, readable tables mapped specifically to the Home [cite: 2] [cite_start]and Away [cite: 19] teams.
* [cite_start]**Chronological Report Sorting:** Enforced a specific chronological sort (Quarter Ascending, Time Descending) exclusively for the exported Game Log section[cite: 37], while maintaining the separate "Newest-First" reverse-chronological sort for the live dashboard.
* [cite_start]**Pale Shading Effects:** Engineered custom payload hooks into `jsPDF-autotable` to automatically apply pale shading to Game Log rows depending on the penalty event (`#8EC5FF` for Blue, `#FFF085` for Yellow, `#FF8A8C` for Red)[cite: 37].

---

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