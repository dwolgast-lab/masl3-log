# MASL 4th Official Log App: User Guide
**Version 1.3.0-beta+**

Welcome to the digital MASL 4th Official Log App. This platform is designed to replace the traditional paper worksheet, automating penalty math, foul accumulation, and timeline tracking so Assistant Referees and 4th Officials can keep their eyes on the game.

This guide will walk you through setting up a match, logging live game events, exporting the final official PDF worksheet, and submitting bug reports.

---

## Table of Contents
1. Initial Setup & Rosters
2. The In-Game Dashboard Overview
3. Logging Live Game Events
4. Managing Penalties & Power Plays
5. Video Review & Media Timeouts
6. The Match Timeline (Event Log)
7. Post-Game & Exporting the PDF
8. Support & Bug Reporting

---

## 1. Initial Setup & Rosters

The app currently lives at [MASL Game Log App](https://masl3-log.vercel.app/)

When you first load the app, you will land on the **Pregame Setup** screen. This is where you configure the match details before kickoff. 

*Note: The app features an Auto-Save function. If you accidentally close your browser or refresh the page, your data will remain safely stored on your device.*

`[Insert Screenshot: The main Pregame Setup screen showing Match Info and Team panels]`

### Match Information & Crew
1. **Select League:** Choose the appropriate league (MASL, MASL2, MASL3, MASLW). *Note: Choosing MASL activates specific features like the 15-minute halftime and Video Review.*
2. **Match Details:** Fill in the Date, Scheduled Kickoff, Game Number, Venue, and City.
3. **Officiating Crew:** Click the **"🧑‍⚖️ Officiating Crew"** button to enter the names of the Crew Chief, Referee, Assistant Referee, and 4th Official.
4. **Dark Mode:** If you are working in a dimly lit arena and want to reduce screen glare, toggle **"🌙 Dark Mode"** on.

### Setting Up Teams and Rosters
Use the Team Configuration cards to set up the Home and Away teams. 
1. **Select Team:** Choose the franchise from the dropdown menu. The app will automatically load the team's default colors and logo. 
2. **Jersey Colors (The Color Picker):** If a team is wearing an alternate uniform, click the color swatch block to open the Color Picker. You can select a **Primary Color** and a **Secondary Trim** from the predefined list. This ensures the exact color names (e.g., "Pink / White") are perfectly formatted on your final PDF report.
3. Click **"Edit Roster & Bench"** to open the roster editor.

> **💡 PRO TIP:** While the app is fully touch-compatible for tablets like the iPad, **using a physical keyboard (like an iPad Magic Keyboard or a Bluetooth keyboard) for entering and editing team rosters is highly recommended, but not strictly necessary.** It will make pregame data entry significantly faster.

`[Insert Screenshot: The Roster Editor Modal]`

* **Adding Players Manually:** Enter the player's number and name (formatted "Last Name, First Name"), tick the **GK**, **Start**, or **Capt** boxes as needed, and press **+ Add**. Manually added players start as non-starting field players, so set those flags yourself.
* **Scanning a Lineup Sheet:** Instead of typing each player, you can photograph the team's paper lineup sheet and let the app fill the roster in for you — see *Scanning a Lineup Sheet* below.
* **Goalkeepers, Starters & Captain:** A **scanned** import already sets goalkeepers, the starters/substitutes split, and names for you. **Manually** added players, by contrast, start as non-starting field players. Either way, the **team captain is never auto-detected** — designate it yourself with the **© CAPT** button, and always review the **GK** and **STARTER** flags on each player row against the paper sheet before kickoff.
* **Adding Bench Staff:** Use the **Bench Staff** panel on the right to add the Head Coach and other staff — enter a name, pick a role from the dropdown (Head Coach, Assistant Coach, Trainer, Manager, Other), and tap **+ Add Staff**. (Scanning fills this in automatically.)
* **Validation:** When you click "Proceed to Kickoff", the app will warn you if a roster violates MASL rules (e.g., missing a starting GK, no Head Coach, or missing the minimum required GKs for pro leagues).

### Scanning a Lineup Sheet

Most teams hand you a paper lineup sheet before the match. Instead of typing every player, you can scan it:

1. In the Roster Editor, tap **📷 Scan Lineup Sheet** in the top bar. On a phone or tablet this usually opens your device's camera so you can photograph the sheet; on a laptop it lets you choose an image file.
2. The app reads the form using Claude AI. A **"Reading lineup sheet with Claude AI..."** spinner appears for a few seconds.
3. A **VERIFY SCANNED ROSTER** screen shows everything it detected — each player's number, name and position, with a **GK** tag for goalkeepers and a **Starter** tag for the starting block — plus the bench staff and their roles.
4. Review the list, then tap **Import Data** (or **Cancel** to discard). Players whose jersey number is already on the roster are skipped, so you can re-scan without creating duplicates.

**What scanning fills in for you:** unlike manual entry, a scanned import carries over what the form actually shows — goalkeepers (from the Position column), the starters-vs-substitutes split (from which block a player is in), names reformatted to "Last, First", and bench-staff roles. The head coach is taken from the Bench Staff section, or — if a coach only signed the bottom of the sheet without listing themselves there — from that signature line.

`[Insert Screenshot: The "📷 Scan Lineup Sheet" button in the Roster Editor top bar]`
`[Insert Screenshot: The "Reading lineup sheet with Claude AI..." spinner]`
`[Insert Screenshot: The VERIFY SCANNED ROSTER screen]`

> **⚠️ Always verify a scan.** The scanner is very good at putting data in the *right fields*, but it is **not** a perfect transcriber — especially with messy handwriting. Expect a few minor corrections after importing (a misspelled name, a wrong jersey digit, a GK/Starter flag). On each player row, tap the **GK / STARTER / © CAPT** buttons to fix flags, or **Edit** to change a number or name. Always confirm the imported roster against the paper sheet before kickoff.

---

## 2. The In-Game Dashboard Overview

Once setup is complete, click **PROCEED TO KICKOFF ➔** to enter the live game view.

`[Insert Screenshot: The main In-Game Dashboard layout in either light or dark mode]`

### Dashboard Layout
* **The Header:** Displays the current score, team logos, and the active quarter.
* **Status Bar:** Located directly beneath the score. This tracks "Timeouts Left" for each team, and if you are in an MASL match, whether the team's Video Review (VR) Challenge is still available.
* **Control Panels:** The left (Away) and right (Home) sides of the screen contain the primary action buttons for logging events to specific teams.
* **Active Trackers:** The bottom half of the screen contains the **Active Penalties** and **Active Injuries** boards.
* **The Footer:** Contains the Start/End Quarter toggle, the Undo/Edit bar for the most recent event, and buttons for Media Timeouts and Video Review.

### Managing Periods
To start the match clock, click the green **▶ START Q1** button in the bottom left. To end the quarter, click the red **⏹ END Q1** button. The app will automatically advance to the next quarter and set a Quarter Break or Halftime timer on the screen.

---

## 3. Logging Live Game Events

To log an event, tap the corresponding button under the offending/scoring team's name.

`[Insert Screenshot: The Time Keypad Modal]`

### The Time Keypad
Almost all events begin by asking for the game clock time. 
* Enter the time exactly as it appears on the scoreboard (e.g., for 12:45, type `1 2 4 5`).
* If you make a mistake, use **DEL** or **CLEAR**.
* Press **NEXT ➔** to proceed.

### Logging a Goal
1. Tap **Goal / Assist**.
2. Enter the game clock time.
3. **Flags:** If the goal was a Power Play Goal (PP), Penalty Kick (PK), or Shootout (SO), toggle the corresponding switch at the bottom of the keypad *before* pressing Next.
4. Select the Goalscorer from the roster.
5. Select the Assisting player (or tap "Unassisted").

### Logging a Foul
1. Tap **Log Foul** (Fouls do not require a time entry).
2. Select the player who committed the foul.
* **Smart Alerts:** The app tracks foul accumulation instantly. If a player commits their 4th foul in a half, or their 6th foul of the game, a brightly colored alert will pop up instructing you to issue a Blue Card or eject the player.

---

## 4. Managing Penalties & Power Plays

The app automates all penalty math, including release times and power play releases.

### Entering a Penalty
1. Tap **Time Penalty** and enter the time.
2. Select the Card Color (Blue, Yellow, or Red).
3. Select the specific MASL Penalty Code (e.g., Y2, B14). The app will show the description.
4. Select the offending player.
5. If the penalty requires a substitute server (e.g., a Goalkeeper penalty or a Bench penalty), the app will automatically prompt you to select the player serving the time.

`[Insert Screenshot: The Active Penalties Widget showing a blue card counting down]`

### Releasing a Penalty Early (PPG)
If the opposing team scores a Power Play Goal, the penalized player may be eligible for early release.
1. Look at the **Active Penalties** board at the bottom of the screen.
2. Locate the releasable penalty and tap the **PPG Scored** button next to it.
3. The app will verify if a valid Power Play goal was logged during the penalty window. If it finds one, it will automatically release the player and remove them from the active board.

### Major Penalty (Y6) Release
A Y6 (Major Penalty) creates two entries on the Active Penalties board:

* **Teammate (Server):** Serves the first 2 minutes of power play time. This entry shows a **PPG Scored** button and is released early if the opponent scores.
* **Offender:** Serves the remaining 5 minutes with no early release possible. This entry shows **"Earliest: Q3 08:14"** — the 7-minute minimum calculated from the penalty time.

Once the 7-minute minimum has elapsed and play stops:
1. Tap the green **Released** button on the offender's entry.
2. The time keypad will open — enter the clock time of the stoppage when the player is officially released.
3. Tap **Confirm**. The player is removed from the board and the exact release time is recorded on the final PDF report.

> **Note:** If the player is released at a stoppage but you do not have the exact time, you can tap **Expired** as a fallback to clear the entry from the board without logging a specific release time.

---

## 5. Video Review & Media Timeouts

### Video Review (MASL Only)
If you set the league to MASL, a purple **VIDEO REVIEW** button will appear in the footer.
1. Tap the button and enter the game clock time using the keypad.
2. Follow the on-screen wizard: Select who initiated it (Coach vs. Referee), the specific Challenge Reason, the Sub-reason, and the Outcome.
3. If a Coach's Challenge fails, the app will prompt you to verify that the physical challenge flag was collected, and will instantly update the team's VR Status in the dashboard header to "N".

### Media Timeouts
Tap the orange **MEDIA TIMEOUT** button in the footer. Enter the time. The app will log the timeout and automatically start a 90-second countdown timer on your screen to help you manage the break.

---

## 6. The Match Timeline (Event Log)

If you need to review the game, edit a mistake, or audit a foul count, tap the **Log (X)** button in the top right corner.

`[Insert Screenshot: The Event Log Timeline view]`

This opens the Match Timeline. Events are displayed in reverse-chronological order (newest at the top), split cleanly between the Away team (left) and Home team (right).
* **Live Foul Counts:** Under every logged foul, you will see the player's exact Foul Count for the half and the game at that specific moment in time.
* **Editing:** Tap **Edit** on any event to change the player, time, or penalty code.
* **Edit Exp:** For time penalties, you can manually override the calculated Expiration/Release time if necessary.
* **Undo/Delete:** Tap **Delete** to permanently remove an errant entry.

---

## 7. Post-Game & Exporting the PDF

When the game is over and you are ready to submit your paperwork:

1. Click the **⚙️ SETUP** button in the footer to return to the Pregame Setup screen.
2. Scroll to the very bottom and click the blue **📥 Export Official PDF Worksheet** button.
3. The app will instantly generate a broadcast-quality, multi-page PDF document. 
   * Page 1 covers Match Info, Team Data (Goals, Warnings, Injuries, Timeouts), and Foul/Penalty accumulations represented by color-coded icons.
   * Page 2 covers the opposing team.
   * Page 3+ contains the full, timestamped chronological game log.

### Starting a New Game
Once you have saved your PDF and are ready to prepare for your next assignment, click the red **⚠️ End Match & Wipe All Data** button at the bottom of the Setup screen. This will permanently clear the current game from your device's memory.

---

## 8. Support & Bug Reporting

If you encounter an issue during a match, or if you have a feature request to make the app better, you can report it directly to the developer from within the app.

`[Insert Screenshot: The Bug Report Form]`

1. Navigate to the **Pregame Setup** screen.
2. In the bottom left corner of the screen, tap the **🐞 Report a Bug / Feedback** button.
3. Fill out the form with a clear title, a description of the issue, and the steps to reproduce it. 
4. **Note:** The app will automatically capture your current App Version, Device Type, and Browser Information to help the developer diagnose the issue quickly.
5. Tap **Submit Bug Report** to send the information directly to the development team.