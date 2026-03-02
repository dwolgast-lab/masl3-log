export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];

export const ACTION_BUTTONS = [
    'Goal / Assist', 'Log Foul', 'Time Penalty', 'Team Timeout', 'Injury'
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
        { code: 'B1', desc: 'Bench Penalty' },
        { code: 'B2', desc: 'Boarding' },
        { code: 'B3', desc: 'Delay of Game' },
        { code: 'B4', desc: 'Dissent' },
        { code: 'B5', desc: 'Encroachment' },
        { code: 'B6', desc: 'Equipment Violation' },
        { code: 'B7', desc: 'Four Fouls in a Half' },
        { code: 'B8', desc: 'Foul Language' },
        { code: 'B9', desc: 'Holding' },
        { code: 'B10', desc: 'Simulation / Embellishment' },
        { code: 'B11', desc: 'Sliding' },
        { code: 'B12', desc: 'Spitting on Field' },
        { code: 'B13', desc: 'Striking' },
        { code: 'B14', desc: 'Tripping' },
        { code: 'B15', desc: 'Unsportsmanlike Conduct' },
        { code: 'B16', desc: 'Illegal Substitution' },
        { code: 'B17', desc: 'Other' }
    ],
    'Yellow': [
        { code: 'Y1', desc: 'Second Blue Card' },
        { code: 'Y2', desc: 'Provoking Altercation' },
        { code: 'Y3', desc: 'Second Team Warning' },
        { code: 'Y4', desc: 'Severe Unsportsmanlike Conduct' },
        { code: 'Y5', desc: 'Tackle from Behind' },
        { code: 'Y6', desc: 'Major Penal Foul' }
    ],
    'Red': [
        { code: 'R1', desc: 'Third Time Penalty' },
        { code: 'R2', desc: 'Elbowing' },
        { code: 'R3', desc: 'Fighting' },
        { code: 'R4', desc: 'Head Biting / Head Butting' },
        { code: 'R5', desc: 'Leaving Penalty Box' },
        { code: 'R6', desc: 'Spitting on opponent/official' },
        { code: 'R7', desc: 'Violent Conduct' },
        { code: 'R8', desc: 'Denying Obvious Goal Scoring Opportunity' },
        { code: 'R9', desc: 'Sixth Foul' }
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