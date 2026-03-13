# Changelog

All notable changes to the MASL 3 4th Official Log App will be documented in this file.

## [v0.73] - 2026-03-13 - Early Release Data Display Fix
**Bug Fixes**
* **Early Release PDF/UI Mismatch:** Fixed a mapping error where early penalty releases (triggered dynamically by Power Play Goals in the active dashboard) correctly updated the internal system state to `actualReleaseTime`, but the PDF generator and the UI Timeline were hardcoded to only display the initially calculated `releaseTime`. Both the `EventLog` timeline and the `alternatePdfEngine` now correctly check for and prioritize early release strings before falling back to the standard scheduled release math.

---

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

## [v0.65] - 2026-03-11 - Advanced Responsive Header Scaling
**Visual & UX Patch**
* **Strict Flex Boundaries:** Implemented strict `min-w-0` and `truncate` CSS rules across the `InGameDashboard` header. This prevents dynamically generated string content (like long team names) from overriding flexbox boundaries, ensuring the layout maintains its 100vh structure without unwanted vertical stacking or word-wrapping on smaller devices.
* **Responsive Breakpoints:** Added targeted tailwind dimension breakpoints (`md:`, `lg:`) to gracefully scale the League Logo, Team Logos, and font sizes down on 11" tablets, while expanding them dynamically for massive 27" PC displays.
* **Score Alignment:** Hardcoded the internal width parameters (`w-8 md:w-12`) of the digital score digits within the central flexbox. This guarantees that the team score blocks remain perfectly physically aligned and do not jitter or resize when scores transition from single digits to double digits.

---

## [v0.64] - 2026-03-11 - Scorebox Layout & Logo Scaling Fixes
**Visual & UX Patch**
* **Scorebox Flex Enforcement:** Fixed a bug where the `Q - 0` scoreline would vertically stack on specific countdown-timer fonts and high-DPI displays (as identified in the previous turn). Instead of relying on a single inline `span` for the text string, the scorebox is now explicitly a flex row `div` with `space-x-4`, guaranteeing the away score, hyphen, and home score always render on a single, perfectly spaced line.
* **Header Scaling boost:** To make better use of PC display space (md breakpoint), the active league logo in the dashboard header has been significantly boosted from `w-20` up to `w-32`, making its display twice as large and much more prominent.

---

## [v0.63] - 2026-03-11 - Officiating Crew Config & Dashboard UI Upgrade
**Features & UX Enhancements**
* **Officiating Crew Modal:** Added a dedicated input modal to the `PregameSetup` screen allowing 4th Officials to document the Crew Chief, Referee, Assistant Referee, and 4th Official. This data binds directly to the active `gameData` state for seamless integration into the upcoming post-game PDF report export.
* **Dashboard Header Expansion:** Moved the `⚙️ Setup` navigation button out of the dashboard header and explicitly into the global footer. This freed up the header layout, allowing the active League Logo to be displayed at 200% scale and ensuring the primary Scoreboard string remains perfectly centered on the screen regardless of device width.

---

## [v0.62] - 2026-03-10 - Dashboard Controls & Reverse-Chronological Sorting
**Data Management**
* **Reverse-Chronological Game Log Enforcement:** Re-engineered the master `gameEvents` render pipeline to mathematically sort events prior to passing them to the `<EventLog />` viewer. The logic enforces Quarter Descending (OT->Q4->Q3...) and Time Ascending (00:00->15:00) so that the newest chronological events resulting from a countdown clock always render at the absolute top of the UI list for live operational efficiency. 
* **Active Penalty Quick-Edits:** Pushed the `startEditingReleaseTime` handler down into the `<ActivePenaltiesWidget />`. Users can now click the new **"Edit Exp."** button directly from the main dashboard to instantly correct an erroneously calculated penalty release time without having to hunt through the Game Log.

---

## [v0.61] - 2026-03-10 - In-Game UI Componentization
**Codebase Optimization**
* **Dashboard Widgets:** Refactored the `InGameDashboard.jsx` file by extracting the `ActivePenalties` and `ActiveInjuries` monitors into standalone React components within the `/src/components/widgets/` directory. 
* **Modal Extraction:** Moved the raw HTML for the Custom Time Confirmation alert out of `App.jsx` and into a reusable `<TimeConfirmModal />` component, significantly streamlining the parent routing file.

---

## [v0.60] - 2026-03-10 - Architectural Componentization (Phase 2)
**Codebase Optimization**
* **Modal Extraction:** Finalized the modularization of the `PregameSetup` UI by stripping out all remaining local state, data handlers, and HTML dedicated to the `RosterEditorModal` and the `StartersViewerModal`. These complex features now live entirely in isolated files inside `/src/components/modals/`.
* **Reduced Monolith:** These dual extraction phases reduced the `PregameSetup.jsx` file footprint by nearly 75%, transforming it from a monolithic file that handled UI, Logic, API routing, and rendering into a clean, easy-to-read layout director.

---

## [v0.59] - 2026-03-10 - Architectural Componentization (Phase 1)
**Codebase Optimization**
* **Pregame UI Componentization:** Broken down the monolithic `PregameSetup.jsx` file by abstracting the core layout blocks into dedicated, reusable React components (`MatchInfoBlock.jsx` and `TeamConfigCard.jsx`). This successfully eliminated nearly 100 lines of duplicated code, allowing a single blueprint to dynamically render both the Away and Home team configurations simply by passing a prop.

---

## [v0.58] - 2026-03-10 - Architectural Refactor: Decoupled OCR Engine
**Codebase Optimization**
* **Isolated Processing Engine:** Extracted all Google Cloud Vision/Document AI communication logic, Base64 image compression pipelines, and text parsing algorithms out of the `PregameSetup.jsx` view component and into a dedicated `ocrEngine.js` utility file. This reduces the view component size by ~150 lines, significantly improving code readability and making future OCR format tweaks entirely independent of the UI logic.

---

## [v0.57] - 2026-03-10 - Footer UI Consolidation
**UI Layout Optimization**
* **Embedded Footer Banner:** Redesigned the "Last Action" UI from a hovering modal to an embedded flexbox item. The edit/undo banner now renders perfectly flat inside the dead white space between the "Start Quarter" and "Media Timeout" buttons in the bottom global footer, ensuring it never obscures active game controls during fast-paced play.

---

## [v0.56] - 2026-03-10 - Alpha Tester QoL Updates & Auto-Flows
**Gameplay & UI Enhancements**
* **Smart Time Validation Modal:** Replaced the OS-level browser alert with a custom, user-friendly React confirmation modal featuring clear "Yes/No" options. The time-entry engine now intelligently catches ambiguous shorthand inputs (e.g., typing '141' resulting in '14:10' instead of '01:41') and specifically prompts the user to verify entries ending in zero.
* **Last Action "Undo" Banner:** Introduced a dynamic toast banner at the bottom of the active game dashboard. Immediately after logging any event, the banner confirms the action and provides instant 1-tap buttons to **[Undo]** (delete) or **[Edit]** the entry without forcing the user to navigate into the full Game Log.

**Rule Engine & Automation**
* **Warning Escalation Auto-Flow:** Mapped MASL team warning infractions to their corresponding Yellow Card penalty codes (e.g., Bench Dissent → Y2, Delay of Game → Y14). When a team receives its 2nd warning for a specific infraction, the system automatically transitions to the Penalty Modal, pre-fills a 5-Minute Yellow Card with the correct code, and prompts the 4th official to select the offending player or coach.

---

## [v0.55] - 2026-03-10 - Player/Coach Validation Rules
**Data Validation**
* **Cross-Roster Duplication Guard:** Added a cross-referencing algorithm to the Pre-Game Validation engine. The system now normalizes and compares all names between the active Player Roster and Bench Staff. If a person is listed in both areas, the system flags a Player/Coach violation, strictly enforcing the MASL mandate that teams must designate a separate, non-playing Head Coach.

---

## [v0.54] - 2026-03-10 - Deep Data Recovery & Anti-Boilerplate Strictness
**Frontend Parsing Enhancements**
* **Fallback Jersey Recovery:** Deployed a "Last Valid Candidate" algorithm. If a team official writes a jersey number directly inside the pre-printed list index column (e.g., `1 . GK Derksen`), the parser recognizes the list index *is* the jersey number, rather than discarding it as boilerplate. This successfully recovers previously dropped players (like the missing #1 Starting Goalkeeper).
* **Anti-Boilerplate Rules:** Added strict negative-keyword filters to block the parser from attempting to extract players or staff from form headers, signature blocks (`Referee : Al`), or the 50-word policy paragraphs printed at the bottom of the MASL form.

---

## [v0.53] - 2026-03-10 - Deep Data Recovery & Sort Pinning
**Frontend Parsing Enhancements**
* **Fallback Jersey Recovery:** When a team official writes a player's jersey number directly inside the pre-printed "List Index" column (e.g. `1 . GK Derksen`), the parser now recognizes that the list index *is* the jersey number. This successfully recovers previously "dropped" players (like the missing Starting Goalkeeper).
* **Anti-Boilerplate Strictness:** Added aggressive word-count limiters and negative-keyword filters to the Bench Staff parser. The engine will no longer hallucinate people by reading the 50-word rule paragraphs printed at the bottom of the MASL form.
* **Bench Staff Hierarchy:** Added a `sortBench` rendering function that permanently pins any staff member with the `Head Coach` role to the very top of the staff UI list (index 0), regardless of the order they were imported or added.

---

## [v0.52] - 2026-03-09 - Numerical Sort & Bench Staff Editing
**Gameplay & UX Enhancements**
* **Universal Numerical Roster Sorting:** Implemented a complex sorting algorithm (`robustNumericalSort`) applied to all player roster lists. This sorts jerseys mathematically (00 -> 0 -> 1-99), handling distinct double-zero ('00') vs standard zero ('0') vs leading zeros ('05'). This allows Assistant Refs in the Game view to instantly locate players by number and quickly identify any players that the OCR missed scanning (like #1 Derksen in the tests).
* **Editable Bench Staff:** Added the ability to Edit existing bench personnel records in the pre-game modal. The modal now features an "Edit" button on staff cards. Clicking it populates the entry fields above, allowing for name misspelling corrections and role updates (e.g. changing an entry to "Head Coach" or "Trainer"). The validation logic correctly guards against duplicate Head Coaches during editing.

---

## [v0.51] - 2026-03-09 - Mathematical Physical Line Builder
**Backend Overhaul**
* **Custom Y-Coordinate Line Assembly:** Scrapped Document AI's unpredictable semantic table extraction. The backend now extracts the raw X and Y layout coordinates of every individual token on the page, mathematically clustering them into strict horizontal rows based on a 1.2% physical height variance.
* **Flawless Layout Retention:** Because the backend literally rebuilds the lines exactly as they physically appear top-to-bottom on the paper, the "Starters" will always be processed first, "Substitutes" second, and "Bench" third, entirely bypassing the previous scrambled output errors.
**Frontend Pre-Game Rule Engine**
* **Strict Roster Assignment:** Re-enabled the Virtual Column Scanner to perfectly slice the physical lines, reliably auto-marking the first 6 players as `STARTERS` and assigning `GK` to the 1st row.
* **Staff Auto-Roles:** First staff member imported automatically assigned to `Head Coach`, with all subsequent staff defaulted to `Assistant Coach`.
* **Kickoff Guard Rails:** Built a pre-game validation engine. If the user clicks "Proceed to Kickoff" without exactly 6 Starters, 1 GK, and 1 Head Coach assigned, the app throws an itemized warning modal requiring explicit confirmation to override.

---

## [v0.50] - 2026-03-09 - Linear OCR Parsing & Validation Guards
**Backend & Parsing Overhaul**
* **Linear Block Reading:** Disabled the strict table-extraction algorithm in Document AI in favor of raw text extraction. This prevents the AI from aggressively breaking apart tables that have non-grid headers (like "STARTERS" and "SUBSTITUTES"), preserving the natural top-to-bottom layout of the roster sheet.
* **Hyper-Aggressive Frontend Parsing:** Completely rewrote the parsing logic to accept messy, linear string outputs. The engine aggressively strips out hallucinated OCR anomalies (e.g., "123456", standalone position letters like "D", "E", "T") and correctly isolates the Jersey Number and Player Name.
* **Auto-Assignment Logic:** The first 6 players imported from the linear read are automatically assigned as `STARTERS`, with the 1st player defaulted to `GK`. The first recognized bench staff member defaults to `Head Coach`, with subsequent staff marked as `Assistant Coach`.
**Gameplay Enhancements**
* **Pre-Game Validation Guard:** Added a strict check to the "Proceed to Kickoff" workflow. If either team fails to meet the MASL requirement of exactly 6 Starters (1 GK, 5 Field Players) and 1 Head Coach, the app triggers a detailed confirmation warning, allowing the 4th official to halt and correct the roster before starting the match.

---

## [v0.49] - 2026-03-09 - Physical Layout Sorting & Auto-Starters
**Backend Enhancements**
* **Y-Coordinate Sorting Algorithm:** Upgraded the Vercel backend to analyze the physical height (bounding poly Y-coordinates) of every table detected by Google Document AI. The tables are now explicitly re-ordered from Top-to-Bottom before returning the payload, preventing the AI from scrambling the reading order of "Starters", "Substitutes", and "Bench Staff" sections.
**Frontend Enhancements**
* **Auto-Starter Assignment:** Because the backend now perfectly respects the physical layout of the official MASL form, the frontend parser automatically assigns the `STARTER` designation to the first 6 players imported, and automatically assigns `GK` status to the very first player, drastically reducing manual entry post-scan.

---

## [v0.48] - 2026-03-09 - Smart Virtual Column Parser
**Frontend & OCR Enhancements**
* **Virtual Column Extraction:** Completely rebuilt the frontend OCR parsing engine to interpret the large spatial gaps provided by Document AI as "virtual cells". This allows the app to accurately isolate jersey numbers from player names regardless of the physical roster orientation or column misalignment.
* **Aggressive Data Sanitization:** The parser now intelligently identifies and discards irrelevant form artifacts, including printed list indices (e.g., "1.", "23") and standalone position markers ("F", "M", "D", "GK"), ensuring only clean player data reaches the import queue.
* **Enhanced Bench Staff Parsing:** Refined the bench staff detection algorithm to automatically strip numeric artifacts and role titles from the raw text, importing cleanly formatted Title Case names directly into the personnel list.

---

## [v0.47] - 2026-03-09 - Advanced Table Extraction & Smart Parser
**Backend Optimization**
* **Row-by-Row AI Extraction:** Rewrote the `/api/scanRoster.js` handler to explicitly pull from Document AI's structured `tables` array instead of falling back to the raw, linear text stream. This ensures column alignment is strictly maintained before sending the data to the client.
**Frontend Enhancements**
* **Smart Roster Parsing Engine:** Upgraded the `handleImportScannedText` logic to intelligently clean the new structured rows. The engine now automatically strips generic list indices (e.g. "1.", "2)") and filters out position letters ("GK", "D", "M") to ensure a clean import of the Jersey Number and Player Name.
* **Auto Bench-Staff Routing:** Added a secondary keyword-detection loop. If the scanner detects a row starting with a bench role (e.g., "COACH", "TRAINER", "MANAGER"), it will automatically parse the name and instantly add them to the team's designated Bench Staff list alongside the player import.

---

## [v0.46] - 2026-03-09 - Client-Side Image Compression
**Performance & API Optimization**
* **Auto-Compressor Engine:** Implemented an HTML5 `<canvas>` rendering pipeline in the frontend that intercepts iPad/iPhone camera photos before they are uploaded. The engine scales the image down to a 1500px bounding box and compresses it to a 60% quality JPEG. 
* **Bypassed Vercel Payload Limits:** This compression successfully shrinks 4MB+ camera payloads down to ~300KB, preventing the `413 PAYLOAD_TOO_LARGE` crashes on Vercel's strict serverless tiers, while simultaneously increasing upload speed over stadium Wi-Fi and providing cleaner edges for Google Document AI to parse.

---

## [v0.45] - 2026-03-09 - Document AI Form Parser Upgrade
**Backend & OCR Enhancements**
* **Document AI Integration:** Upgraded the lineup sheet scanning engine from standard Cloud Vision to the more advanced Google Cloud Document AI (Form Parser). This enterprise-grade model inherently understands page layouts, tables, and columns, drastically reducing the amount of "garbage text" generated from physical roster sheets.
* **Enterprise Authentication:** Migrated the Vercel serverless backend (`/api/scanRoster.js`) to utilize the official `@google-cloud/documentai` SDK with secure Service Account JSON credentials.
* **Layout Retention:** Because Document AI respects the physical structure of the page, jersey numbers and player names now reliably render on the exact same line in the Verification Modal, making the import parsing engine significantly more accurate.

---

## [v0.44] - 2026-03-07 - Inline Roster Editing & One-Tap Validations
**UI Enhancements**
* **One-Tap Validation Toggles:** Replaced the static player badges (`GK`, `STARTER`, `© CAPT`) in the Setup Roster Modal with interactive buttons. 4th Officials can now simply tap a badge to instantly toggle a player's designation. This toggle engine respects all MASL limits (e.g., automatically blocking the selection of a second starting Goalkeeper) without requiring the user to open a separate menu.
* **Full Edit Mode:** Added a dedicated "Edit" button to the roster list. Clicking this elevates the selected player back into the primary top-bar form, allowing the official to easily correct spelling mistakes or jersey number typos imported from the OCR scanner, replacing the "+ Add" button with a dynamic "Update" function to overwrite the existing record cleanly.

---

## [v0.43] - 2026-03-07 - OCR Lineup Scanner Integration
**Features & Backend Integration**
* **Google Cloud Vision API:** Integrated advanced optical character recognition (OCR) to automatically read handwritten or typed lineup sheets via a new "Scan Lineup Sheet" button using the device's camera.
* **Secure Serverless Backend:** Engineered a Vercel Serverless Function (`/api/scanRoster.js`) to act as a secure middleman, processing image payloads without exposing the Google API key to the client-side browser.
* **Verification & Import Engine:** Added a smart text parsing engine that detects jersey numbers, names, and Goalkeeper (GK) designations. Includes a Verification Modal allowing the 4th official to quickly review and correct the raw scanned text before committing the batch to the active roster.

---

## [v0.42] - 2026-03-05 - Multi-League Database Expansion & Color Mapping
**Data Updates**
* **Universal MASL Roster:** Imported 49 new teams across the MASL, MASL2, and MASLW leagues from the official master CSV file. The database now includes 69 distinct teams, making the app instantly usable across the entire league ecosystem.
* **Division Routing:** All new teams are fully segmented by their exact active league and division, allowing the pregame setup dropdowns to dynamically group them into clean headers.
* **Brand Color Injection:** Researched and integrated accurate primary Brand Hex codes and English "Jersey Color" names for the majority of the league to ensure the UI instantly brands itself correctly upon team selection.
* **Conflict Resolution:** Designed unique file paths and IDs (e.g., `Iowa_Demon_Hawks_MASL2_logo.png`) for franchises that operate teams in multiple leagues to prevent logo and data overriding.

---

## [v0.41] - 2026-03-04 - Responsive Score Bug
**UI Enhancements**
* **Score Wrapping Fix:** Updated the flexbox layout rules in the In-Game Dashboard header. The score indicator (e.g., "1 - 0") is now locked using `whitespace-nowrap` and `shrink-0` to ensure it never breaks across multiple lines.
* **Smart Name Truncation:** Added `truncate` functionality to the team names so that exceptionally long franchise names will elegantly fade with an ellipsis instead of destroying the flexbox container boundaries on smaller screens like the iPad mini.

---

## [v0.40] - 2026-03-04 - UI Button Restoration
**Bug Fixes**
* **Restored Team Warnings:** Fixed an accidental omission in the system configuration array that caused the "Team Warnings" button to disappear from the In-Game Dashboard grid. The button is now fully restored and functioning.

---

## [v0.39.1] - 2026-03-03 - UI Declutter
**UI Enhancements**
* **Hidden Hex Code:** Removed the direct "Brand Hex" input from the Pregame Setup interface. The UI now only displays the Team Name and the English "Jersey Color" field. The app still perfectly handles the hex mapping silently in the background when selecting a team from the dropdown, ensuring a cleaner visual experience for the official.

---

## [v0.39] - 2026-03-03 - Jersey Color Names vs Brand Hex
**Data & Setup UI**
* **Color Separation:** Separated the team `color` properties into two distinct variables: the "Brand Hex" (used exclusively for coloring the app's internal UI) and the "Jersey Color Name" (a simple English string used for the official report).
* **Dynamic Setup Fields:** Updated the Pregame Setup screen to dynamically load and display both the Brand Hex and Jersey Color Name. This allows the 4th official to easily overwrite the report color (e.g. typing "White" for an alternate kit) without breaking the branded color styling of the application's interface.

---

## [v0.38] - 2026-03-03 - Match Information: Game Number Field
**Data & Setup UI**
* **Game Number Implementation:** Added a new text input field to the Match Information section on the Pregame Setup screen specifically designed to capture the alphanumeric league-assigned Game Number (e.g. `25MASL3-001`). This value is now securely tracked in the global `gameData` state object in preparation for official reporting functions.

---

## [v0.37] - 2026-03-03 - Hotfix: Combo Engine State Passer
**Bug Fixes & UI Enhancements**
* **Combo Selection Crash Fixed:** Resolved a silent JavaScript crash that occurred when clicking an offender who already had an active Blue Card. The app failed to update the state because the `setBenchPenaltyEntity` function was not properly passed from `App.jsx` into the `PlayerSelectModal`.
* **UX Redesign:** The Player Select modal now deploys a massive, unmissable yellow confirmation banner when a Combo or Major penalty is assigned, providing immediate feedback that the original offender was accepted and explicitly instructing the official to now select the substitute server.

---

## [v0.35] - 2026-03-03 - Dynamic Combo Escalation Engine
**Features & Logic Upgrades**
* **Active Penalty Interception:** The app now strictly monitors active penalties. If a player receives a Yellow card at *any time* while currently serving a Blue card (whether instantly or 1 minute later), the app triggers the Combo Engine.
* **Rolling Penalty Math:** The Combo Engine automatically modifies the original Blue card, adding 5 minutes to its existing expiration time and locking it to Non-Releasable status.
* **Contextual Modals:** The Player Select modal dynamically changes its titles and subheaders when a Combo or Major penalty is triggered, explicitly instructing the official to assign a teammate to serve the remaining Power Play time.

---

## [v0.34] - 2026-03-02 - Official Penalty Codes & Combo Engine
**Features & Data Updates**
* **Official Code Database:** Replaced the generic placeholder penalty list with the official MASL 2024-2025 Penalty Codes document.
* **Blue + Yellow Combo Engine:** Engineered a sequential logic interceptor. If a player is assigned a Blue Card, and then receives an additional Yellow Card at the exact same clock time, the app automatically converts the original Blue Card into a 7-minute Non-Releasable Major, forces the official to assign a teammate to serve the 2-minute Releasable power play, and cleanly logs the Yellow Card for game accumulation without duplicating dashboard timers.

---

## [v0.33] - 2026-03-02 - Division Grouping
**UI & Experience Enhancements**
* **Division Headers:** Re-engineered the team dropdowns to utilize HTML `<optgroup>` tags. The dropdown now dynamically sorts and categorizes teams under their respective Division headers (Atlantic, East, Great Lakes North, South) based on the database object.

---

## [v0.32] - 2026-03-02 - Hotfix: Player Select Modal Crash
**Bug Fixes**
* **Foul Logging Crash Fixed:** Resolved a fatal crash (blank screen) that occurred when logging a foul. The `PlayerSelectModal` was missing the import for the `QUARTERS` database, causing the render to fail when attempting to draw the contextual quarter selector.

---

## [v0.31] - 2026-03-02 - Team Selection Validation
**Features & Logic Upgrades**
* **Duplicate Team Validation:** Added strict validation to the Setup screen. The app now alerts the user and prevents selection if the same franchise is chosen for both the Home and Away teams.
* **Kickoff Safety Check:** Added a secondary validation check to the "Proceed to Kickoff" button that ensures manually typed custom entries also do not match before allowing the game to start.
* **Version UI Restoration:** Restored the floating version and author indicator to the pregame setup screen that was accidentally omitted during Phase 1 refactoring.

---

## [v0.30] - 2026-03-02 - Smart Selectors & Fixes
**Features & Logic Upgrades**
* **Smart Dropdown Selectors:** Updated the Team Setup screen to use controlled, smart dropdown menus. Selecting a team from the database instantly maps the franchise properties. The menus dynamically fall back to a "Custom Entry" option if the user manually overrides the team name via the text input for exhibition matches.
* **Missing Props Fix:** Restored missing state-setter functions that were dropped during the Phase 1 refactoring to ensure the setup views correctly route player additions to the core game data engine.

---

## [v0.29] - 2026-03-02 - Franchise Databases & UI Branding
**Architecture & UI Upgrades**
* **League & Team Databases:** Implemented hardcoded structural databases within `config.js` to replace manual data entry.
* **Dropdown Selection Flow:** Replaced the free-text Setup fields with smart dropdown selectors. Selecting a team dynamically populates their name, team color, and franchise logo based on the selected League context.
* **In-Game Branding:** The Active Scoreboard now dynamically renders the selected league logo and franchise logos adjacent to the team names, providing immediate visual confirmation and a broadcast-quality UI feel.

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