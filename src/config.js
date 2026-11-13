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
    // ==========================================
    // MASL 1
    // ==========================================
    { id: 'baltimore_blast', name: 'Baltimore Blast', league: 'MASL', color: '#E31837', colorName: 'Red', logo: '/logos/Baltimore_Blast_logo.png' },
    { id: 'empire_strykers', name: 'Empire Strykers', league: 'MASL', color: '#F26122', colorName: 'Orange', logo: '/logos/Empire_Strykers_logo.png' },
    { id: 'kansas_city_comets', name: 'Kansas City Comets', league: 'MASL', color: '#002F65', colorName: 'Navy', logo: '/logos/Kansas_City_Comets_logo.png' },
    { id: 'lehigh_valley_spirits', name: 'Lehigh Valley Spirits', league: 'MASL', color: '#FF5400', colorName: 'Orange / Black', logo: '/logos/Lehigh_Valley_Spirits_logo.png' },
    { id: 'milwaukee_wave', name: 'Milwaukee Wave', league: 'MASL', color: '#000000', colorName: 'Black', logo: '/logos/Milwaukee_Wave_logo.png' },
    { id: 'san_diego_sockers', name: 'San Diego Sockers', league: 'MASL', color: '#00205B', colorName: 'Royal Blue', logo: '/logos/San_Diego_Sockers_logo.png' },
    { id: 'st_louis_ambush', name: 'St. Louis Ambush', league: 'MASL', color: '#009CA6', colorName: 'Teal', logo: '/logos/St_Louis_Ambush_logo.png' },
    { id: 'tacoma_stars', name: 'Tacoma Stars', league: 'MASL', color: '#002244', colorName: 'Navy', logo: '/logos/Tacoma_Stars_logo.png' },
    { id: 'utica_city_fc', name: 'Utica City FC', league: 'MASL', color: '#002D62', colorName: 'Blue', logo: '/logos/Utica_City_FC_logo.png' },

    // ==========================================
    // MASL 2
    // ==========================================
    // TODO: Chicago Mustangs, Chihuahua Savage, Fresno, Gricks TJ have provisional colors and no logo until official assets are provided
    // TODO: Salisbury Steaks logo changed for 2026-27 (now brown/gold); replace Salisbury_Steaks_logo.png
    // Departed after 2025-26 (logo files kept in public/logos): Utica Elite Krajisnik FC, Minnesota Blizzard, Omaha Kings, Wichita Wings, Mexico City, Soccer Central FC, Soles De Sonora
    { id: 'beachtown_fc', name: 'Beachtown FC', league: 'MASL2', division: 'East', color: '#38BDF8', colorName: 'Sky Blue / White', logo: '/logos/Beachtown_FC_logo.png' },
    { id: 'fc_baltimore_1729', name: 'FC Baltimore 1729', league: 'MASL2', division: 'East', color: '#800000', colorName: 'Burgundy', logo: '/logos/FC_Baltimore_1729_logo.png' },
    { id: 'harrisburg_heat', name: 'Harrisburg Heat', league: 'MASL2', division: 'East', color: '#C8102E', colorName: 'Red', logo: '/logos/Harrisburg_Heat_logo.png' },
    { id: 'salisbury_steaks', name: 'Salisbury Steaks', league: 'MASL2', division: 'East', color: '#5C4033', colorName: 'Brown', logo: '/logos/Salisbury_Steaks_logo.png' },
    { id: 'spice_city_fc', name: 'Spice City FC', league: 'MASL2', division: 'East', color: '#E35205', colorName: 'Orange', logo: '/logos/Spice_City_FC_logo.png' },
    { id: 'chicago_mustangs', name: 'Chicago Mustangs', league: 'MASL2', division: 'Midwest', color: '#C8102E', colorName: 'Red', logo: '' },
    { id: 'iowa_demon_hawks_masl2', name: 'Iowa Demon Hawks', league: 'MASL2', division: 'Midwest', color: '#C8102E', colorName: 'Red', logo: '/logos/Iowa_Demon_Hawks_MASL2_logo.png' },
    { id: 'iowa_raptors_fc', name: 'Iowa Raptors FC', league: 'MASL2', division: 'Midwest', color: '#008000', colorName: 'Green', logo: '/logos/Iowa_Raptors_MASL2_logo.png' },
    { id: 'certified_lions_fc', name: 'OKC Certified Lions FC', league: 'MASL2', division: 'Midwest', color: '#B8860B', colorName: 'Gold', logo: '/logos/Certified_Lions_FC_logo.png' },
    { id: 'texas_spurs', name: 'Texas Spurs', league: 'MASL2', division: 'Midwest', color: '#000000', colorName: 'Black', logo: '/logos/Texas_Spurs_logo.png' },
    { id: 'chihuahua_savage', name: 'Chihuahua Savage', league: 'MASL2', division: 'West', color: '#000000', colorName: 'Black', logo: '' },
    { id: 'fresno', name: 'Fresno', league: 'MASL2', division: 'West', color: '#4B5563', colorName: 'Gray', logo: '' },
    { id: 'gricks_tj', name: 'Gricks TJ (Tijuana, MX)', league: 'MASL2', division: 'West', color: '#C8102E', colorName: 'Red', logo: '' },
    { id: 'guadalajara_mariachis_fc', name: 'Guadalajara Mariachis FC', league: 'MASL2', division: 'West', color: '#000000', colorName: 'Black', logo: '/logos/Guadalajara_Mariachis_FC_logo.png' },
    { id: 'turlock_cal_express', name: 'Turlock Cal Express', league: 'MASL2', division: 'West', color: '#000000', colorName: 'Black', logo: '/logos/Turlock_Cal_Express_logo.png' },

    // ==========================================
    // MASL 3
    // ==========================================
    // TODO: FC Indiana, FC Rockford, Summit City Sentinels, Syracuse Knights have provisional colors and no logo until official assets are provided
    // Departed after 2025-26 (logo files kept in public/logos): Baltimore Kings, Cumberland Valley SC, Delaware City FC, Maryland Storm, Northern Virginia FC, Virginia Marauders FC, Buffalo Gunners FC, Deportivo Shaolin, OKC Certified Lions, RGV Barracudas, Springfield Demize, The Bold Dream FC, Wichita Selection
    { id: 'cincinnati_swerve', name: 'Cincinnati Swerve', league: 'MASL3', color: '#000000', colorName: 'Black', logo: '/logos/Cincinnati_Swerve_logo.png' },
    { id: 'cleveland_samba', name: 'Cleveland Samba', league: 'MASL3', color: '#1E40AF', colorName: 'Blue', logo: '/logos/Cleveland_Samba_logo.png' },
    { id: 'detroit_waza_flo', name: 'Detroit Waza Flo', league: 'MASL3', color: '#1D4ED8', colorName: 'Blue', logo: '/logos/Detroit_Waza_Flow_logo.png' },
    { id: 'fc_indiana', name: 'FC Indiana', league: 'MASL3', color: '#C8102E', colorName: 'Red', logo: '' },
    { id: 'fc_rockford', name: 'FC Rockford', league: 'MASL3', color: '#4A90C2', colorName: 'Light Blue', logo: '' },
    { id: 'kalamazoo_united', name: 'Kalamazoo United FC', league: 'MASL3', color: '#FBBF24', colorName: 'Yellow', logo: '/logos/Kalamazoo_United_logo.png' },
    { id: 'muskegon_risers', name: 'Muskegon Risers', league: 'MASL3', color: '#000000', colorName: 'Black', logo: '/logos/Muskegon_Risers_FC.png' },
    { id: 'roc_city_boom', name: 'ROC City Boom', league: 'MASL3', color: '#1D4ED8', colorName: 'Blue', logo: '/logos/ROC_City_Boom_logo.png' },
    { id: 'summit_city_sentinels', name: 'Summit City Sentinels', league: 'MASL3', color: '#4B2E83', colorName: 'Purple', logo: '' },
    { id: 'syracuse_knights', name: 'Syracuse Knights', league: 'MASL3', color: '#1E3A8A', colorName: 'Navy', logo: '' },
    { id: 'youngstown_nighthawks_masl3', name: 'Youngstown Nighthawks', league: 'MASL3', color: '#4B5563', colorName: 'Gray', logo: '/logos/Youngstown_Nighthawks_MASL3_logo.png' },

    // ==========================================
    // MASLW
    // ==========================================
    // TODO: Chicago Mustangs, Indy Nights, Simply Futbol, Space City FC have provisional colors and no logo until official assets are provided
    // TODO: Astras FC (formerly KS Astras) logo appears changed (magenta ring); Muskegon Risers MASLW logo may differ from MASL3 (blue tint) - confirm
    // Departed after 2025-26 (logo files kept in public/logos): Indiana United FC, Wichita Lady Luck, Iowa Raptors, Omaha Queens, Houston Bolt
    { id: 'chicago_mustangs_maslw', name: 'Chicago Mustangs', league: 'MASLW', division: 'Great Lakes', color: '#C8102E', colorName: 'Red', logo: '' },
    { id: 'cincinnati_sirens_fc', name: 'Cincinnati Sirens FC', league: 'MASLW', division: 'Great Lakes', color: '#002244', colorName: 'Navy', logo: '/logos/Cincinnati_Sirens_FC_logo.png' },
    { id: 'columbus_eagles_fc', name: 'Columbus Eagles FC', league: 'MASLW', division: 'Great Lakes', color: '#F2A900', colorName: 'Gold', logo: '/logos/Columbus_Eagles_FC_logo.png' },
    { id: 'detroit_city_fc', name: 'Detroit City FC', league: 'MASLW', division: 'Great Lakes', color: '#612530', colorName: 'Maroon', logo: '/logos/Detroit_City_FC_logo.png' },
    { id: 'detroit_waza_flo_maslw', name: 'Detroit Waza Flo', league: 'MASLW', division: 'Great Lakes', color: '#1D4ED8', colorName: 'Blue', logo: '/logos/Detroit_Waza_Flow_logo.png' },
    { id: 'fc_berlin', name: 'FC Berlin (Kitchener, ON)', league: 'MASLW', division: 'Great Lakes', color: '#000000', colorName: 'Black', logo: '/logos/FC_Berlin_logo.png' },
    { id: 'indy_nights', name: 'Indy Nights', league: 'MASLW', division: 'Great Lakes', color: '#000000', colorName: 'Black', logo: '' },
    { id: 'louisville_triumph_fc', name: 'Louisville Triumph FC', league: 'MASLW', division: 'Great Lakes', color: '#000000', colorName: 'Black', logo: '/logos/Louisville_Triumph_FC_logo.png' },
    { id: 'muskegon_risers_maslw', name: 'Muskegon Risers', league: 'MASLW', division: 'Great Lakes', color: '#000000', colorName: 'Black', logo: '/logos/Muskegon_Risers_FC.png' },
    { id: 'susserfuss_ballverein', name: 'Süsserfuss Ballverein (Akron)', league: 'MASLW', division: 'Great Lakes', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Susserfuss_Ballverein_logo.png' },
    { id: 'youngstown_nighthawks_maslw', name: 'Youngstown Nighthawks', league: 'MASLW', division: 'Great Lakes', color: '#4B5563', colorName: 'Gray', logo: '/logos/Youngstown_Nighthawks_MASLW_logo.png' },
    { id: 'ks_astras', name: 'Astras FC', league: 'MASLW', division: 'Heartland', color: '#002244', colorName: 'Navy', logo: '/logos/KS_Astras_logo.png' },
    { id: 'ict_aztecs', name: 'ICT Aztecs (Wichita)', league: 'MASLW', division: 'Heartland', color: '#E31837', colorName: 'Red', logo: '/logos/ICT_Aztecs_logo.png' },
    { id: 'iowa_demon_hawks_maslw', name: 'Iowa Demon Hawks', league: 'MASLW', division: 'Heartland', color: '#C8102E', colorName: 'Red', logo: '/logos/Iowa_Demon_Hawks_MASLW_logo.png' },
    { id: 'okc_ghosts', name: 'OKC Ghosts', league: 'MASLW', division: 'Heartland', color: '#000000', colorName: 'Black', logo: '/logos/OKC_Ghosts_logo.png' },
    { id: 'side_fc_cyclones', name: 'Side FC Cyclones (OKC)', league: 'MASLW', division: 'Heartland', color: '#000000', colorName: 'Black', logo: '/logos/Side_FC_Cyclones_logo.png' },
    { id: 'tulsa_fc_channel_cats', name: 'Tulsa FC Channel Cats', league: 'MASLW', division: 'Heartland', color: '#F58220', colorName: 'Orange', logo: '/logos/Tulsa_FC_Channel_Cats_logo.png' },
    { id: 'wichita_aero', name: 'Wichita Aero', league: 'MASLW', division: 'Heartland', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Wichita_Aero_logo.png' },
    { id: '512_fc', name: '512 FC (Austin)', league: 'MASLW', division: 'South', color: '#000000', colorName: 'Black', logo: '/logos/512_FC_logo.png' },
    { id: 'atletico_monterrey', name: 'Atletico Monterrey', league: 'MASLW', division: 'South', color: '#00205B', colorName: 'Royal Blue', logo: '/logos/Atletico_Monterrey_logo.png' },
    { id: 'houston_indoor_club', name: 'Houston Indoor Club', league: 'MASLW', division: 'South', color: '#000000', colorName: 'Black', logo: '/logos/Houston_Indoor_Club_logo.png' },
    { id: 'rgv_barracudas_maslw', name: 'RGV Barracudas', league: 'MASLW', division: 'South', color: '#1E3A8A', colorName: 'Navy', logo: '/logos/RGV_Barracudas_FC_logo.png' },
    { id: 'rpfc', name: 'RPFC (Dallas)', league: 'MASLW', division: 'South', color: '#000000', colorName: 'Black', logo: '/logos/RPFC_logo.png' },
    { id: 'simply_futbol', name: 'Simply Futbol (Dallas)', league: 'MASLW', division: 'South', color: '#C8102E', colorName: 'Red', logo: '' },
    { id: 'space_city_fc', name: 'Space City FC (Houston)', league: 'MASLW', division: 'South', color: '#1E3A8A', colorName: 'Navy', logo: '' },
    { id: 'texas_lone_star_sc', name: 'Texas Lone Star SC (Dallas)', league: 'MASLW', division: 'South', color: '#B91C1C', colorName: 'Red', logo: '/logos/Texas_Lone_Star_SC_logo.png' }
];
export const WARNING_ESCALATION = {
    'Bench Dissent': 'Y2',
    'Delay of Game': 'Y14',
    'Embellishment': 'Y7',
    'Encroachment': 'Y15',
    'Shootout / PK': 'Y12'
};
