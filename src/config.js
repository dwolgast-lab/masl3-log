// src/config.js

export const PENALTY_CODES = {
    'Blue': [
        { code: 'B1', desc: "Too Many Men (gains advantage/interferes) TEAM PENALTY" },
        { code: 'B2', desc: "Four Fouls by a player in a half" },
        { code: 'B3', desc: "Any foul committed by GK on Shootout PK" },
        { code: 'B4', desc: "Intentional handball by GK outside of his penalty area" },
        { code: 'B5', desc: "GK striking by throwing ball/violently pushing opponent" },
        { code: 'B6', desc: "Kick (Severe, tactical, or blatant in nature)" },
        { code: 'B7', desc: "Trip (Severe, tactical, or blatant in nature)" },
        { code: 'B8', desc: "Reckless Tackle (Severe, tactical, or blatant in nature)" },
        { code: 'B9', desc: "Two-Footed Tackle" },
        { code: 'B10', desc: "Jump (Severe, tactical, or blatant in nature)" },
        { code: 'B11', desc: "Charging from behind/Violently (Severe, tactical, blatant)" },
        { code: 'B12', desc: "Striking (Severe or blatant in nature)" },
        { code: 'B13', desc: "Contact Above the Shoulder/Elbow (Severe or blatant)" },
        { code: 'B14', desc: "Hold (Severe, tactical, or blatant in nature)" },
        { code: 'B15', desc: "Push (Severe, tactical, or blatant in nature)" },
        { code: 'B16', desc: "Handling (Severe, tactical, or blatant in nature)" },
        { code: 'B17', desc: "Boarding (Severe or blatant in nature)" },
        { code: 'B18', desc: "Dangerous play (Severe, tactical, or blatant in nature)" },
        { code: 'B19', desc: "Obstruction (Severe, tactical, or blatant in nature)" },
        { code: 'B20', desc: "Shootout: Denies an Obvious Goal Scoring Opportunity" },
        { code: 'B21', desc: "Unsportsmanlike Conduct (during mass confrontation/deadball)" }
    ],
    'Yellow': [
        { code: 'Y1', desc: "Dissent" },
        { code: 'Y2', desc: "Bench Misconduct (assessed against coach)" },
        { code: 'Y3', desc: "Game Delay - Team (assessed against Coach)" },
        { code: 'Y4', desc: "Delay of Game after Time Penalty (failing to report)" },
        { code: 'Y5', desc: "Ball thrown/kicked off field following goal" },
        { code: 'Y6', desc: "Major Penal Penalty" }, 
        { code: 'Y7', desc: "Embellishing or Faking a foul after Team Warning" },
        { code: 'Y8', desc: "Referee Crease Violation" },
        { code: 'Y9', desc: "Penalty Box Decorum" },
        { code: 'Y10', desc: "Injured player illegal return" },
        { code: 'Y11', desc: "Penalty box exit prior to time expiration" },
        { code: 'Y12', desc: "Shootout or Penalty Kick violation following Team Warning" },
        { code: 'Y13', desc: "Goalkeeper joining in an altercation (leaving penalty area)" },
        { code: 'Y14', desc: "Delay of Game Violation (Restarts) following Team Warning" },
        { code: 'Y15', desc: "Encroachment (following Team Warning)" },
        { code: 'Y16', desc: "Reentry failing adjustment dangerous equipment" },
        { code: 'Y17', desc: "Severe Unsporstmanlike Manner" },
        { code: 'Y18', desc: "Encroachment on Shootout after a Team Warning" },
        { code: 'Y19', desc: "Entering spectator area" }
    ],
    'Red': [
        { code: 'R1', desc: "Violent Conduct or Serious Foul Play" },
        { code: 'R2', desc: "Offensive, insulting, obscene or abusive language/gestures" },
        { code: 'R3', desc: "Headbutt" },
        { code: 'R4', desc: "Third man into an altercation" },
        { code: 'R5', desc: "First off bench joining an altercation" },
        { code: 'R6', desc: "Leaving the penalty box to engage in altercation/dissent" },
        { code: 'R7', desc: "Spitting on or at opponent or official" },
        { code: 'R8', desc: "Accumulation of 3rd penalty" }, 
        { code: 'R9', desc: "Six Fouls in a game (NO POWER PLAY)" }
    ]
};

export const TEAM_WARNINGS = ["Bench Dissent", "Delay of Game", "Embellishment", "Encroachment", "Shootout / PK Violation"];
export const ACTION_BUTTONS = ['Goal / Assist', 'Log Foul', 'Time Penalty', 'Injury', 'Team Timeout', 'Team Warnings'];
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];
export const BENCH_ROLES = ['Head Coach', 'Assistant Coach', 'Trainer', 'Other'];