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

// --- LEAGUE & TEAM DATABASES ---
export const LEAGUES = [
    { id: 'MASL', name: 'MASL', logo: '/logos/masl_logo.png' },
    { id: 'MASL2', name: 'MASL 2', logo: '/logos/masl2_logo.png' },
    { id: 'MASL3', name: 'MASL 3', logo: '/logos/masl3_logo.png' },
    { id: 'MASLW', name: 'MASLW', logo: '/logos/maslw_logo.png' }
];

export const TEAMS = [
    // --- ATLANTIC DIVISION ---
    { id: 'baltimore_kings', name: 'Baltimore Kings', league: 'MASL3', color: '#FFD700', logo: '/logos/Baltimore_Kings_logo.png' },
    { id: 'cumberland_valley', name: 'Cumberland Valley SC', league: 'MASL3', color: '#111827', logo: '/logos/Cumberland_Valley_logo.png' },
    { id: 'delaware_city', name: 'Delaware City FC', league: 'MASL3', color: '#00A3E0', logo: '/logos/Delaware_City_FC_logo.png' },
    { id: 'maryland_storm', name: 'Maryland Storm', league: 'MASL3', color: '#B91C1C', logo: '/logos/Maryland_Storm_logo.png' },
    { id: 'northern_virginia', name: 'Northern Virginia FC', league: 'MASL3', color: '#B8860B', logo: '/logos/Northern_Virginia_FC_logo.png' },
    { id: 'virginia_marauders', name: 'Virginia Marauders FC', league: 'MASL3', color: '#1E3A8A', logo: '/logos/Virginia_Marauders_FC_logo.png' },
    
    // --- EAST DIVISION ---
    { id: 'buffalo_gunners', name: 'Buffalo Gunners FC', league: 'MASL3', color: '#E31837', logo: '/logos/Buffalo_Gunners_FC_logo.png' },
    { id: 'cleveland_samba', name: 'Cleveland Samba', league: 'MASL3', color: '#1E40AF', logo: '/logos/Cleveland_Samba_logo.png' },
    { id: 'roc_city_boom', name: 'ROC City Boom', league: 'MASL3', color: '#1D4ED8', logo: '/logos/ROC_City_Boom_logo.png' },
    { id: 'youngstown_nighthawks', name: 'Youngstown Nighthawks', league: 'MASL3', color: '#4B5563', logo: '/logos/Youngstown_Nighthawks_logo.png' },

    // --- GREAT LAKES NORTH DIVISION ---
    { id: 'cincinnati_swerve', name: 'Cincinnati Swerve', league: 'MASL3', color: '#000000', logo: '/logos/Cincinnati_Swerve_logo.png' },
    { id: 'detroit_waza_flo', name: 'Detroit Waza Flo', league: 'MASL3', color: '#1D4ED8', logo: '/logos/Detroit_Waza_Flow_logo.png' },
    { id: 'kalamazoo_united', name: 'Kalamazoo United', league: 'MASL3', color: '#FBBF24', logo: '/logos/Kalamazoo_United_logo.png' },
    { id: 'muskegon_risers', name: 'Muskegon Risers', league: 'MASL3', color: '#000000', logo: '/logos/Muskegon_Risers_FC.png' },

    // --- SOUTH DIVISION ---
    { id: 'deportivo_shaolin', name: 'Deportivo Shaolin (Kansas City)', league: 'MASL3', color: '#B91C1C', logo: '/logos/Deportivo_Shaolin_logo.png' },
    { id: 'okc_certified_lions', name: 'OKC Certified Lions', league: 'MASL3', color: '#B8860B', logo: '/logos/OKC_Certified_Lions_logo.png' },
    { id: 'rgv_barracudas', name: 'RGV Barracudas', league: 'MASL3', color: '#1E3A8A', logo: '/logos/RGV_Barracudas_FC_logo.png' },
    { id: 'springfield_demize', name: 'Springfield Demize', league: 'MASL3', color: '#60A5FA', logo: '/logos/Springfield_Demize_logo.png' },
    { id: 'bold_dream_fc', name: 'The Bold Dream FC (Austin)', league: 'MASL3', color: '#D97706', logo: '/logos/The_Bold_Dream_FC_logo.png' },
    { id: 'wichita_selection', name: 'Wichita Selection', league: 'MASL3', color: '#E31837', logo: '/logos/Wichita_Selection_logo.png' }
];
    
    // Future teams for MASL, MASL2, and MASLW can be added right here!
];