# MASL 3 4th Official Log

**Author:** Dave Wolgast

## Recent Updates

## [v1.0.0-beta] - 2026-03-18 - Beta Release & OCR Refinements
**Features & Fixes**
* **Manual Color Overrides:** Fixed a bug where overriding the team's Color Name string on the setup screen failed to update the visual UI theme. The `TeamConfigCard` now features a native `<input type="color">` swatch picker, allowing officials to dynamically overwrite the underlying HEX code if a team is wearing alternate white/away kits.
* **OCR Reliability Rollback:** Analyzed live-fire edge cases where the OCR engine misidentified Starters and Goalkeepers on heavily scrambled, handwritten lineup sheets. To improve data integrity on the sideline, the auto-guessing math was removed. The OCR engine now focuses strictly on extracting Names and Jersey Numbers, defaulting all `isGK` and `isStarter` flags to `false` and requiring the 4th official to perform a fast, manual verification step.

---

## [v0.85] - 2026-03-18 - Integrated Bug Reporting Subsystem
**Support & Feedback**
* **In-App Bug Reporting:** Built a dedicated `BugReportModal` directly into the Pregame Setup screen, allowing officials to securely report bugs or submit feature requests without leaving the application or needing a third-party account.
* **Automated Diagnostics:** The reporting engine automatically captures and appends the active App Version and the user's raw System/Browser information (`navigator.userAgent`) to the payload, drastically improving developer troubleshooting capabilities.
* **Secure Form Routing:** Implemented a secure, serverless Formspree POST endpoint to route feedback directly to the developer's email without exposing private API tokens or requiring heavy backend architecture.

---

## [v0.84] - 2026-03-16 - iPad Flexbox Header Override
**UI Polish**
* **Fluid Center Weighting:** Removed the rigid 20/60/20 container widths introduced in v0.83, which inadvertently shrunk the central scoreboard container on iPad landscape orientations. The left and right headers now use `flex-none` (consuming only minimum required space), while the central container utilizes `flex-1` to greedily absorb all remaining horizontal real estate.
* **Scorebox Padding Diet:** Heavily reduced the padding and margins around the central numbers inside the scorebox, returning critical horizontal layout space to the team names.
* **Header Line-Clamp:** Replaced the single-line `truncate` instruction on the header team names with a dynamic `line-clamp-2 leading-none` rule. Long franchise names will now gracefully stack onto two lines in the header rather than being cut off.

---

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