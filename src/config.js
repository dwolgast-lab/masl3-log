export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];

export const ACTION_BUTTONS = [
    'Goal / Assist', 'Log Foul', 'Time Penalty', 'Team Timeout', 'Team Warnings', 'Injury'
];

export const TEAM_WARNINGS = [
    'Bench Dissent',
    'Delay of Game',
    'Embellishment',
    'Encroachment',
    'Shootout / PK'
];

export const BENCH_ROLES = [
    'Head Coach', 'Assistant Coach', 'Trainer', 'Manager', 'Other'
];

export const PENALTY_CODES = {
    'Blue': [
        { code: 'B1', desc: 'Too Many Men (Team Penalty)' },
        { code: 'B2', desc: 'Four Fouls in a half' },
        { code: 'B3', desc: 'GK foul on Shootout PK' },
        { code: 'B4', desc: 'Intentional handball by GK outside area' },
        { code: 'B5', desc: 'GK striking by throwing/pushing ball' },
        { code: 'B6', desc: 'Kick (Severe/Tactical/Blatant)' },
        { code: 'B7', desc: 'Trip (Severe/Tactical/Blatant)' },
        { code: 'B8', desc: 'Reckless Tackle' },
        { code: 'B9', desc: 'Two-Footed Tackle' },
        { code: 'B10', desc: 'Jump (Severe/Tactical/Blatant)' },
        { code: 'B11', desc: 'Charging from behind / Violently' },
        { code: 'B12', desc: 'Striking' },
        { code: 'B13', desc: 'Contact Above Shoulder/Elbow' },
        { code: 'B14', desc: 'Hold (Severe/Tactical/Blatant)' },
        { code: 'B15', desc: 'Push (Severe/Tactical/Blatant)' },
        { code: 'B16', desc: 'Handling (Severe/Tactical/Blatant)' },
        { code: 'B17', desc: 'Boarding' },
        { code: 'B18', desc: 'Dangerous Play' },
        { code: 'B19', desc: 'Obstruction' },
        { code: 'B20', desc: 'Denies Obvious Goal Scoring Opportunity' },
        { code: 'B21', desc: 'Unsportsmanlike Conduct' }
    ],
    'Yellow': [
        { code: 'Y1', desc: 'Dissent' },
        { code: 'Y2', desc: 'Bench Misconduct (Assessed to Coach)' },
        { code: 'Y3', desc: 'Game Delay - Team (Assessed to Coach)' },
        { code: 'Y4', desc: 'Delay of Game - Failing to report to box' },
        { code: 'Y5', desc: 'Ball thrown/kicked off field' },
        { code: 'Y6', desc: 'Major Penal Penalty' },
        { code: 'Y7', desc: 'Embellishing/Faking after Warning' },
        { code: 'Y8', desc: 'Referee Crease Violation' },
        { code: 'Y9', desc: 'Penalty Box Decorum' },
        { code: 'Y10', desc: 'Injured player illegal return' },
        { code: 'Y11', desc: 'Penalty box exit prior to expiration' },
        { code: 'Y12', desc: 'Shootout/PK violation after Warning' },
        { code: 'Y13', desc: 'GK joining altercation' },
        { code: 'Y14', desc: 'Delay of Game (Restarts) after Warning' },
        { code: 'Y15', desc: 'Encroachment after Warning' },
        { code: 'Y16', desc: 'Reentry failing adjustment dangerous equipment' },
        { code: 'Y17', desc: 'Severe Unsportsmanlike Manner' },
        { code: 'Y18', desc: 'Encroachment on Shootout after Warning' },
        { code: 'Y19', desc: 'Entering spectator area' }
    ],
    'Red': [
        { code: 'R1', desc: 'Violent Conduct / Serious Foul Play' },
        { code: 'R2', desc: 'Abusive language/gestures' },
        { code: 'R3', desc: 'Headbutt' },
        { code: 'R4', desc: 'Third man into altercation' },
        { code: 'R5', desc: 'First off bench joining altercation' },
        { code: 'R6', desc: 'Leaving penalty box for altercation/dissent' },
        { code: 'R7', desc: 'Spitting on opponent/official' },
        { code: 'R8', desc: 'Accumulation of 3rd penalty' },
        { code: 'R9', desc: 'Six Fouls in a game (No Power Play)' }
    ]
};

export const LEAGUES = [
    { id: 'MASL', name: 'MASL', logo: '/logos/masl_logo.png' },
    { id: 'MASL2', name: 'MASL 2', logo: '/logos/masl2_logo.png' },
    { id: 'MASL3', name: 'MASL 3', logo: '/logos/masl3_logo.png' },
    { id: 'MASLW', name: 'MASLW', logo: '/logos/maslw_logo.png' }
];

export const TEAMS = [
    // --- ATLANTIC DIVISION ---
    { id: 'baltimore_kings', name: 'Baltimore Kings', league: 'MASL3', division: 'Atlantic', color: '#FFD700', colorName: 'Yellow', logo: '/logos/Baltimore_Kings_logo.png' },
    { id: 'cumberland_valley', name: 'Cumberland Valley SC', league: 'MASL3', division: 'Atlantic', color: '#111827', colorName: 'Navy', logo: '/logos/Cumberland_Valley_logo.png' },
    { id: 'delaware_city', name: 'Delaware City FC', league: 'MASL3', division: 'Atlantic', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Delaware_City_FC_logo.png' },
    { id: 'maryland_storm', name: 'Maryland Storm', league: 'MASL3', division: 'Atlantic', color: '#B91C1C', colorName: 'Red', logo: '/logos/Maryland_Storm_logo.png' },
    { id: 'northern_virginia', name: 'Northern Virginia FC', league: 'MASL3', division: 'Atlantic', color: '#B8860B', colorName: 'Black', logo: '/logos/Northern_Virginia_FC_logo.png' },
    { id: 'virginia_marauders', name: 'Virginia Marauders FC', league: 'MASL3', division: 'Atlantic', color: '#1E3A8A', colorName: 'Navy', logo: '/logos/Virginia_Marauders_FC_logo.png' },
    
    // --- EAST DIVISION ---
    { id: 'buffalo_gunners', name: 'Buffalo Gunners FC', league: 'MASL3', division: 'East', color: '#E31837', colorName: 'Red', logo: '/logos/Buffalo_Gunners_FC_logo.png' },
    { id: 'cleveland_samba', name: 'Cleveland Samba', league: 'MASL3', division: 'East', color: '#1E40AF', colorName: 'Blue', logo: '/logos/Cleveland_Samba_logo.png' },
    { id: 'roc_city_boom', name: 'ROC City Boom', league: 'MASL3', division: 'East', color: '#1D4ED8', colorName: 'Navy', logo: '/logos/ROC_City_Boom_logo.png' },
    { id: 'youngstown_nighthawks', name: 'Youngstown Nighthawks', league: 'MASL3', division: 'East', color: '#4B5563', colorName: 'Navy', logo: '/logos/Youngstown_Nighthawks_logo.png' },

    // --- GREAT LAKES NORTH DIVISION ---
    { id: 'cincinnati_swerve', name: 'Cincinnati Swerve', league: 'MASL3', division: 'Great Lakes North', color: '#000000', colorName: 'Black', logo: '/logos/Cincinnati_Swerve_logo.png' },
    { id: 'detroit_waza_flo', name: 'Detroit Waza Flo', league: 'MASL3', division: 'Great Lakes North', color: '#1D4ED8', colorName: 'Blue', logo: '/logos/Detroit_Waza_Flow_logo.png' },
    { id: 'kalamazoo_united', name: 'Kalamazoo United', league: 'MASL3', division: 'Great Lakes North', color: '#FBBF24', colorName: 'Yellow', logo: '/logos/Kalamazoo_United_logo.png' },
    { id: 'muskegon_risers', name: 'Muskegon Risers', league: 'MASL3', division: 'Great Lakes North', color: '#000000', colorName: 'Black', logo: '/logos/Muskegon_Risers_FC.png' },

    // --- SOUTH DIVISION ---
    { id: 'deportivo_shaolin', name: 'Deportivo Shaolin (Kansas City)', league: 'MASL3', division: 'South', color: '#B91C1C', colorName: 'Red', logo: '/logos/Deportivo_Shaolin_logo.png' },
    { id: 'okc_certified_lions', name: 'OKC Certified Lions', league: 'MASL3', division: 'South', color: '#B8860B', colorName: 'Black', logo: '/logos/OKC_Certified_Lions_logo.png' },
    { id: 'rgv_barracudas', name: 'RGV Barracudas', league: 'MASL3', division: 'South', color: '#1E3A8A', colorName: 'Blue', logo: '/logos/RGV_Barracudas_FC_logo.png' },
    { id: 'springfield_demize', name: 'Springfield Demize', league: 'MASL3', division: 'South', color: '#60A5FA', colorName: 'Navy', logo: '/logos/Springfield_Demize_logo.png' },
    { id: 'bold_dream_fc', name: 'The Bold Dream FC (Austin)', league: 'MASL3', division: 'South', color: '#D97706', colorName: 'Gold', logo: '/logos/The_Bold_Dream_FC_logo.png' },
    { id: 'wichita_selection', name: 'Wichita Selection', league: 'MASL3', division: 'South', color: '#E31837', colorName: 'Red', logo: '/logos/Wichita_Selection_logo.png' }
];