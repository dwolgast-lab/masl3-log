# Code & UI Review: MASL 4th Official Log

**Reviewed:** v1.3.0-beta, October 2026
**Target devices:** iPad Air / iPad Pro 10.9" (1180 × 820 landscape) and 12.9" (1366 × 1024 landscape). Landscape first; portrait must still work without clipping.

## Outcome (October 2026)

Both phases shipped on branch `ccr-e180b837-31wzr5`. Every bug from B1 to B13 is fixed, along with O1–O5, S2, offline install and the UI items U1–U12.

| Check | Before | After |
|---|---|---|
| `npm run lint` | 4 errors, 1 warning | 0 |
| JavaScript loaded at startup | 761 KB | 341 KB (PDF engine loads on Export) |
| Unused files shipped | 9.4 MB | 0 |
| Broken team logos | 2 | 0 |
| Opens with no connection | No | Yes, after one online visit |
| Screens checked at 1180×820, 1366×1024, 820×1180, light and dark | none | 8 screens, 48 shots, no page errors or horizontal scroll |

A browser run drove the real UI through the B1 and B2 scenarios: a power-play goal releases only the live penalty, and Undo on a Y6 removes both linked events. Both passed. Timer drift (B6) and the wake lock were checked by code review only, because they need a real iPad going to sleep. Lineup scanning on Opus 5.5 needs one run of `scripts/scanLocal.mjs` with your API key.

Still open: S1, B14 and U13, plus the backup button and the test suite listed at the end of section 6.

## Summary

The app works and the game logic is careful. Penalty math, combo cards and Y6 serving all show real thought about the rulebook. The problems cluster in three places. A handful of logic bugs corrupt the record in edge cases that a 4th Official will hit during a real match. The interface was built on a desktop browser, so many controls are too small for a finger, the quarter indicator disappears on the 10.9" iPad, and dark mode only covers half the app. Finally, the app has no offline support, which is a real risk in arenas with weak Wi-Fi.

Baseline checks at the time of review:

| Check | Result |
|---|---|
| `npm run lint` | 4 errors, 1 warning |
| `npm run build` | Passes. Main bundle 761 KB (233 KB gzipped), with a size warning |
| Unused weight in `public/` | 9.4 MB (`worksheet.pdf`, never referenced) |
| Broken team logos | 2 |
| Automated tests | None |

## 1. Bugs

Severity reflects what happens during a live match. "High" means the official record or the board ends up wrong without warning.

| # | Severity | Where | Problem | Fix |
|---|---|---|---|---|
| B1 | High | `App.jsx` `finalizeEvent` | A goal flagged Power Play attaches its time to the oldest releasable penalty on the other team. That search ignores whether the penalty already expired or cleared, and ignores whether the goal fell inside the penalty window. A Q4 PPG can stamp a release time onto a Q1 penalty, which then prints in the PDF "Time Out" column. | Only match penalties still on the board whose window contains the goal time. Clear the matched penalty from the board. |
| B2 | High | Footer "Undo", `deleteEvent` | Undo removes only the primary event. A Y6 leaves its paired "serving" penalty on the board. A blue + yellow combo leaves the serving entry and keeps the +5 extension on the original blue. | Tag linked events with a shared group id when they are created. Undo and delete remove or revert the whole group. |
| B3 | Medium | `App.jsx` `finalizeWarning` | `TEAM_WARNINGS` spells the option `Shootout / PK` while the escalation map uses `Shootout/PK`. A second shootout warning becomes a penalty with code `Y` instead of `Y12`. | Use one spelling, driven from `config.js`. |
| B4 | Medium | `App.jsx` penalty count | A penalty against "Team / Bench" has no id, so the accumulation check counts every Team / Bench penalty as one person. After three, the app shows "EJECTION REQUIRED" for `#undefined Team / Bench`. | Skip the per-person count when the entity is not a person. |
| B5 | Medium | `config.js` | Two logo paths point to files that do not exist: `Iowa_Raptors_FC_MASL2_logo.png` (file is `Iowa_Raptors_MASL2_logo.png`) and `Süsserfuss_Ballverein_logo.png` (file is `Susserfuss_…`). Those teams show a broken image on the dashboard, event log and PDF. | Correct both paths. |
| B6 | Medium | `App.jsx` timer | The countdown subtracts one second per `setInterval` tick. iPadOS slows or pauses timers when the screen dims, locks or the tab goes to the background, so a 90-second media timeout can run long. | Store an end timestamp and compute remaining time from the clock on each tick and when the page becomes visible again. |
| B7 | Medium | `utils.js` `useStickyState` | `JSON.parse` has no guard. One corrupt localStorage value gives a blank white screen on launch, mid-game, with no way back except wiping data. | Wrap the read in `try/catch` and fall back to the default. |
| B8 | Low | `PregameSetup.jsx`, `RosterEditorModal.jsx` | Rosters get sorted in place (`awayRoster.sort(...)`), which mutates React state directly. It works today by luck. | Sort a copy. |
| B9 | Low | `TeamConfigCard.jsx` | The two-phase "update queue" exists to dodge a stale-state bug in `handleInputChange`, which spreads an old copy of `gameData`. It also trips two lint rules. | Make `handleInputChange` use a functional update, then delete the queue. |
| B10 | Low | `ActivePenaltiesWidget.jsx` | `PenaltyList` is defined inside the render function, so React rebuilds both lists from scratch on every render (lint error). | Move it to module scope. |
| B11 | Low | `VideoReviewModal.jsx` | Resets its own state from an effect when it opens (lint error). | Reset through a `key` from the parent. |
| B12 | Low | `App.jsx` `clearAllGameData` | `localStorage.clear()` also wipes the dark-mode preference. | Remove only match data keys. |
| B13 | Low | `RosterEditorModal.jsx` | Class name typo `space-x-1Actions` drops the spacing on bench staff buttons. | Fix the typo. |
| B14 | Info | `useModalWorkflow.js` | Time entry accepts up to 15:00 in OT, while the penalty math treats OT as 10:00. | Needs your rule confirmation before any change. Not in this round. |

## 2. Optimization & cleanup

| # | Item | Action |
|---|---|---|
| O1 | `public/worksheet.pdf` (9.4 MB) is unused. Every deploy ships it, and an offline cache would download it to every iPad. | Delete. |
| O2 | `pdf-lib` dependency is unused since v1.1.0. | Remove from `package.json`. |
| O3 | The PDF engine (jsPDF, html2canvas, DOMPurify) loads at startup, though it only runs once per match. | Load it on demand with a dynamic `import()` when the official taps Export. |
| O4 | `App.css`, `src/assets/react.svg` and the Vite boilerplate at the bottom of `README.md` are template leftovers. `index.html` still uses the Vite favicon and the title `masl3-log`. | Delete the dead files. Give the page a real title and icon. |
| O5 | The `App.jsx` header comment says version 1.0.3. | Point to `APP_VERSION` instead of repeating it. |
| O6 | Derived lists (`activePenaltiesAway`, scores) are recalculated each render. A match has a few hundred events at most, so this costs nothing measurable. | Leave as is. Adding memoization here adds code without a benefit. |

## 3. Security & cost

| # | Item | Recommendation |
|---|---|---|
| S1 | `/api/scanRoster` accepts any POST from anyone. Each call is a billed Claude vision request with your API key. | Add a shared passcode header or a Vercel rate limit. Needs your decision on how officials would enter a passcode. Not in this round. |
| S2 | The scanner used `claude-opus-4-8`. The ID was valid and the call shape correct. | **Done.** Switched to Claude Opus 5.5 (newer, $4 / $20 per million tokens vs. $5 / $25) with effort pinned to `high`, since Opus 5.5 defaults to `medium`. If Opus 5.5 declines a request on policy grounds, the API retries it on Opus 4.8 in the same call. Run `scripts/scanLocal.mjs` on your sample sheets to confirm extraction quality before the next match. |

## 4. iPad UI findings

The current layout came from a desktop browser. On an iPad, four issues stand out.

**Touch targets.** Apple's minimum is 44 × 44 points. Many controls fall well short: Event Log Edit/Delete (about 24 px tall), the penalty board's PPG Scored / Edit Exp. / Expired buttons (about 24 px), the footer Edit / Undo / ✕ (about 26 px), the roster GK / STARTER / CAPT toggles (about 22 px) and the color swatches (28 to 32 px). A gloved or rushed tap hits the wrong button.

**Missing quarter indicator.** The Q1–OT strip in the header carries `hidden xl:flex`, which means it only shows at 1280 px and wider. On a 10.9" iPad it never appears in either orientation. The only clue to the current period is the START / END button text.

**Collisions and wasted space.** The "Author | version" label sits at `bottom-2 right-2` with `z-[1000]`, directly on top of the MEDIA TIMEOUT button. The Active Penalties strip always takes 160 px even when empty, which squeezes the action buttons on an 820 px-tall landscape screen. The status line uses fixed `12rem` padding that misaligns the two teams on narrower screens.

**Keyboard pop-up.** The jersey search in the player picker has `autoFocus`, so the iPad keyboard slides up and covers half the roster every time the official logs a foul, goal or penalty. That is the most frequent action in the app.

**Other findings**

| # | Finding | Recommendation |
|---|---|---|
| U1 | `h-screen` (100vh) on iPad Safari includes the area behind the toolbar, so the footer can slip below the visible edge. | Use `h-dvh`, add `viewport-fit=cover` and safe-area padding. |
| U2 | Double-tapping a button zooms the page on iPad Safari. | Add `touch-action: manipulation` app-wide. |
| U3 | Feedback relies on `hover:` styles, which never show on a touchscreen. | Add `active:` pressed states (slight scale and darken) to every button. |
| U4 | Dark mode covers the dashboard header only. Pregame, every modal, the penalty board and the injury strip stay bright white, which defeats the purpose in a dark arena. | Make dark mode global with Tailwind's `dark:` variant driven by a class on `<html>`. |
| U5 | The score is drawn in `text-gray-400` on light gray in light mode. It is the most important number on the screen and the faintest. | High-contrast, tabular-figure score. |
| U6 | Light team colors (Baltimore Kings `#FFD700`, Soles De Sonora `#FFD100`, Kalamazoo `#FBBF24`) become unreadable yellow text on white. Headers that put white text on the team color fail the same way. | Darken light colors for text use, and pick black or white text on team-color backgrounds by luminance. |
| U7 | The Event Log and Foul Summary tables use fixed widths (`min-w-[800px]`, `max-w-sm` cards with negative margins) that crowd in portrait. | Fluid widths, larger rows. |
| U8 | Pregame match info uses five columns at every width. At 820 px portrait each field is about 130 px wide. | Two or three columns in portrait, five in landscape. |
| U9 | The roster editor splits 2/3 and 1/3 side by side at every width. | Stack the bench panel below the player list in portrait. |
| U10 | Number fields use `type="text"` or `type="number"`. | Use `inputMode="numeric"` so the iPad shows its number pad without the spinner arrows. |
| U11 | The foul alert card pulses its whole body forever. | Pulse only the colored header strip. |
| U12 | Almost every label uses `font-black`, which flattens the hierarchy. | Reserve black weight for scores, team names and primary actions. |
| U13 | `window.alert()` appears 31 times, including a "Q1 has officially started" box that needs a tap every period. | Later round. Replace informational alerts with a toast and keep confirmations. |

## 5. Offline / home-screen install

Arena Wi-Fi drops. Today the app needs a connection to load at all. Safari also deletes localStorage for sites that go unvisited for seven days, unless the site is installed to the home screen.

Plan: add a web app manifest, Apple touch icons and status-bar meta tags, plus a small hand-written service worker. The worker caches the app shell and built assets on first load, serves them offline, and leaves `/api/*` and the bug-report form network-only. A hand-written worker avoids a plugin dependency that has not been tested against the Vite 8 beta this project uses. A Screen Wake Lock request during live play keeps the iPad from dimming mid-quarter.

## 6. Remediation plan

Sonnet 5.5 subagents carry out the work in two phases. Each agent owns a set of files no other agent touches in the same phase, so they run in parallel without conflicts. I review every diff, run lint and build after each phase, and commit per phase.

**Phase 0, done by the orchestrator.** Switch the scanner to Opus 5.5 (S2). Delete the dead files and the unused dependency (O1, O2, O4 file removals). Fix the two logo paths (B5).

**Phase 1, three agents in parallel.**

| Agent | Owns | Items |
|---|---|---|
| A1, game logic | `App.jsx`, `src/hooks/*`, `src/utils.js`, `src/config.js` | B1, B2, B3, B4, B6, B7, B9 (functional update half), B12, O3, O5, dark class on `<html>`, wake lock |
| A2, component fixes | `TeamConfigCard.jsx`, `ActivePenaltiesWidget.jsx`, `VideoReviewModal.jsx`, `RosterEditorModal.jsx`, `PregameSetup.jsx` | B8, B9 (queue removal), B10, B11, B13 |
| A3, platform | `index.html`, `src/index.css`, `public/manifest.webmanifest`, `public/sw.js`, icons, `src/main.jsx` | Section 5, U1, U2, Tailwind `dark:` variant setup |

Phase 1 gate: lint at zero errors, build passes, and a scripted run of the B1–B4 scenarios behaves correctly.

**Phase 2, three agents in parallel (UI).** Shared rules for all three: 44 px minimum targets, `active:` states, `dark:` variants everywhere, `inputMode="numeric"` on number fields, landscape-first layouts that reflow in portrait, no changes to game logic.

| Agent | Owns | Items |
|---|---|---|
| U-Game | `InGameDashboard.jsx`, `widgets/*`, `TimerOverlay.jsx`, `AlertOverlay.jsx`, `EventLog.jsx`, `FoulSummary.jsx` | Quarter indicator, version label, collapsible penalty strip, score contrast, U5–U7, U11 |
| U-Setup | `PregameSetup.jsx`, `MatchInfoBlock.jsx`, `TeamConfigCard.jsx`, `RosterEditorModal.jsx`, `CrewEditorModal.jsx`, `StartersViewerModal.jsx`, `BugReportModal.jsx` | U8, U9, swatch size, roster toggles, version label placement |
| U-Flow | `TimeKeypadModal.jsx`, `PenaltyModal.jsx`, `PlayerSelectModal.jsx`, `WarningModal.jsx`, `TimeConfirmModal.jsx`, `VideoReviewModal.jsx` | Remove search `autoFocus`, bigger player tiles, dark mode, readable text on team-color headers |

A shared helper for readable text on team colors (U6) goes into `utils.js` during Phase 1 so all three UI agents use the same one.

Phase 2 gate: lint and build pass. A Playwright run captures screenshots of every main screen at 1180 × 820, 1366 × 1024 and 820 × 1180, in light and dark mode. I check those for clipping, overlap and contrast before committing.

**Out of scope for this round:** S1 (endpoint passcode), B14 (OT length rule), U13 (alert-to-toast), a JSON backup/export button, and an automated test suite. Each needs a decision from you or adds a feature you did not ask for.
