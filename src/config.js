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
    { id: 'milwaukee_wave', name: 'Milwaukee Wave', league: 'MASL', color: '#000000', colorName: 'Black', logo: '/logos/Milwaukee_Wave_logo.png' },
    { id: 'san_diego_sockers', name: 'San Diego Sockers', league: 'MASL', color: '#00205B', colorName: 'Royal Blue', logo: '/logos/San_Diego_Sockers_logo.png' },
    { id: 'st_louis_ambush', name: 'St. Louis Ambush', league: 'MASL', color: '#009CA6', colorName: 'Teal', logo: '/logos/St_Louis_Ambush_logo.png' },
    { id: 'tacoma_stars', name: 'Tacoma Stars', league: 'MASL', color: '#002244', colorName: 'Navy', logo: '/logos/Tacoma_Stars_logo.png' },
    { id: 'utica_city_fc', name: 'Utica City FC', league: 'MASL', color: '#002D62', colorName: 'Blue', logo: '/logos/Utica_City_FC_logo.png' },

    // ==========================================
    // MASL 2
    // ==========================================
    { id: 'fc_baltimore_1729', name: 'FC Baltimore 1729', league: 'MASL2', division: 'East', color: '#800000', colorName: 'Burgundy', logo: '/logos/FC_Baltimore_1729_logo.png' },
    { id: 'harrisburg_heat', name: 'Harrisburg Heat', league: 'MASL2', division: 'East', color: '#C8102E', colorName: 'Red', logo: '/logos/Harrisburg_Heat_logo.png' },
    { id: 'salisbury_steaks', name: 'Salisbury Steaks', league: 'MASL2', division: 'East', color: '#5C4033', colorName: 'Brown', logo: '/logos/Salisbury_Steaks_logo.png' },
    { id: 'spice_city_fc', name: 'Spice City FC', league: 'MASL2', division: 'East', color: '#E35205', colorName: 'Orange', logo: '/logos/Spice_City_FC_logo.png' },
    { id: 'utica_elite_krajisnik_fc', name: 'Utica Elite Krajisnik FC', league: 'MASL2', division: 'East', color: '#1E3A8A', colorName: 'Navy', logo: '/logos/Utica_Elite_Krajisnik_FC_logo.png' },
    { id: 'iowa_demon_hawks_masl2', name: 'Iowa Demon Hawks', league: 'MASL2', division: 'Midwest', color: '#C8102E', colorName: 'Red', logo: '/logos/Iowa_Demon_Hawks_MASL2_logo.png' },
    { id: 'iowa_raptors_fc', name: 'Iowa Raptors FC', league: 'MASL2', division: 'Midwest', color: '#008000', colorName: 'Green', logo: '/logos/Iowa_Raptors_FC_MASL2_logo.png' },
    { id: 'minnesota_blizzard', name: 'Minnesota Blizzard', league: 'MASL2', division: 'Midwest', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Minnesota_Blizzard_logo.png' },
    { id: 'omaha_kings', name: 'Omaha Kings', league: 'MASL2', division: 'Midwest', color: '#000000', colorName: 'Black', logo: '/logos/Omaha_Kings_logo.png' },
    { id: 'wichita_wings', name: 'Wichita Wings', league: 'MASL2', division: 'Midwest', color: '#F58220', colorName: 'Orange', logo: '/logos/Wichita_Wings_logo.png' },
    { id: 'certified_lions_fc', name: 'Certified Lions FC', league: 'MASL2', division: 'West', color: '#B8860B', colorName: 'Gold', logo: '/logos/Certified_Lions_FC_logo.png' },
    { id: 'guadalajara_mariachis_fc', name: 'Guadalajara Mariachis FC', league: 'MASL2', division: 'West', color: '#000000', colorName: 'Black', logo: '/logos/Guadalajara_Mariachis_FC_logo.png' },
    { id: 'mexico_city', name: 'Mexico City', league: 'MASL2', division: 'West', color: '#006847', colorName: 'Green', logo: '/logos/Mexico_City_logo.png' },
    { id: 'soccer_central_fc', name: 'Soccer Central FC', league: 'MASL2', division: 'West', color: '#1E3A8A', colorName: 'Navy', logo: '/logos/Soccer_Central_FC_logo.png' },
    { id: 'soles_de_sonora', name: 'Soles De Sonora', league: 'MASL2', division: 'West', color: '#FFD100', colorName: 'Yellow', logo: '/logos/Soles_De_Sonora_logo.png' },
    { id: 'texas_spurs', name: 'Texas Spurs', league: 'MASL2', division: 'West', color: '#000000', colorName: 'Black', logo: '/logos/Texas_Spurs_logo.png' },
    { id: 'turlock_cal_express', name: 'Turlock Cal Express', league: 'MASL2', division: 'West', color: '#000000', colorName: 'Black', logo: '/logos/Turlock_Cal_Express_logo.png' },

    // ==========================================
    // MASL 3
    // ==========================================
    { id: 'baltimore_kings', name: 'Baltimore Kings', league: 'MASL3', division: 'Atlantic', color: '#FFD700', colorName: 'Yellow', logo: '/logos/Baltimore_Kings_logo.png' },
    { id: 'cumberland_valley', name: 'Cumberland Valley SC', league: 'MASL3', division: 'Atlantic', color: '#111827', colorName: 'Navy', logo: '/logos/Cumberland_Valley_logo.png' },
    { id: 'delaware_city', name: 'Delaware City FC', league: 'MASL3', division: 'Atlantic', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Delaware_City_FC_logo.png' },
    { id: 'maryland_storm', name: 'Maryland Storm', league: 'MASL3', division: 'Atlantic', color: '#B91C1C', colorName: 'Red', logo: '/logos/Maryland_Storm_logo.png' },
    { id: 'northern_virginia', name: 'Northern Virginia FC', league: 'MASL3', division: 'Atlantic', color: '#B8860B', colorName: 'Black', logo: '/logos/Northern_Virginia_FC_logo.png' },
    { id: 'virginia_marauders', name: 'Virginia Marauders FC', league: 'MASL3', division: 'Atlantic', color: '#1E3A8A', colorName: 'Navy', logo: '/logos/Virginia_Marauders_FC_logo.png' },
    { id: 'buffalo_gunners', name: 'Buffalo Gunners FC', league: 'MASL3', division: 'East', color: '#E31837', colorName: 'Red', logo: '/logos/Buffalo_Gunners_FC_logo.png' },
    { id: 'cleveland_samba', name: 'Cleveland Samba', league: 'MASL3', division: 'East', color: '#1E40AF', colorName: 'Blue', logo: '/logos/Cleveland_Samba_logo.png' },
    { id: 'roc_city_boom', name: 'ROC City Boom', league: 'MASL3', division: 'East', color: '#1D4ED8', colorName: 'Navy', logo: '/logos/ROC_City_Boom_logo.png' },
    { id: 'youngstown_nighthawks_masl3', name: 'Youngstown Nighthawks', league: 'MASL3', division: 'East', color: '#4B5563', colorName: 'Navy', logo: '/logos/Youngstown_Nighthawks_MASL3_logo.png' },
    { id: 'cincinnati_swerve', name: 'Cincinnati Swerve', league: 'MASL3', division: 'Great Lakes North', color: '#000000', colorName: 'Black', logo: '/logos/Cincinnati_Swerve_logo.png' },
    { id: 'detroit_waza_flo', name: 'Detroit Waza Flo', league: 'MASL3', division: 'Great Lakes North', color: '#1D4ED8', colorName: 'Blue', logo: '/logos/Detroit_Waza_Flow_logo.png' },
    { id: 'kalamazoo_united', name: 'Kalamazoo United', league: 'MASL3', division: 'Great Lakes North', color: '#FBBF24', colorName: 'Yellow', logo: '/logos/Kalamazoo_United_logo.png' },
    { id: 'muskegon_risers', name: 'Muskegon Risers', league: 'MASL3', division: 'Great Lakes North', color: '#000000', colorName: 'Black', logo: '/logos/Muskegon_Risers_FC.png' },
    { id: 'deportivo_shaolin', name: 'Deportivo Shaolin (Kansas City)', league: 'MASL3', division: 'South', color: '#B91C1C', colorName: 'Red', logo: '/logos/Deportivo_Shaolin_logo.png' },
    { id: 'okc_certified_lions', name: 'OKC Certified Lions', league: 'MASL3', division: 'South', color: '#B8860B', colorName: 'Black', logo: '/logos/OKC_Certified_Lions_logo.png' },
    { id: 'rgv_barracudas', name: 'RGV Barracudas', league: 'MASL3', division: 'South', color: '#1E3A8A', colorName: 'Blue', logo: '/logos/RGV_Barracudas_FC_logo.png' },
    { id: 'springfield_demize', name: 'Springfield Demize', league: 'MASL3', division: 'South', color: '#60A5FA', colorName: 'Navy', logo: '/logos/Springfield_Demize_logo.png' },
    { id: 'bold_dream_fc', name: 'The Bold Dream FC (Austin)', league: 'MASL3', division: 'South', color: '#D97706', colorName: 'Gold', logo: '/logos/The_Bold_Dream_FC_logo.png' },
    { id: 'wichita_selection', name: 'Wichita Selection', league: 'MASL3', division: 'South', color: '#E31837', colorName: 'Red', logo: '/logos/Wichita_Selection_logo.png' },

    // ==========================================
    // MASLW
    // ==========================================
    { id: 'detroit_city_fc', name: 'Detroit City FC', league: 'MASLW', division: 'Great Lakes North', color: '#612530', colorName: 'Maroon', logo: '/logos/Detroit_City_FC_logo.png' },
    { id: 'fc_berlin', name: 'FC Berlin', league: 'MASLW', division: 'Great Lakes North', color: '#000000', colorName: 'Black', logo: '/logos/FC_Berlin_logo.png' },
    { id: 'indiana_united_fc', name: 'Indiana United FC', league: 'MASLW', division: 'Great Lakes North', color: '#1E3A8A', colorName: 'Navy', logo: '/logos/Indiana_United_FC_logo.png' },
    { id: 'youngstown_nighthawks_maslw', name: 'Youngstown Nighthawks', league: 'MASLW', division: 'Great Lakes North', color: '#4B5563', colorName: 'Navy', logo: '/logos/Youngstown_Nighthawks_MASLW_logo.png' },
    { id: 'cincinnati_sirens_fc', name: 'Cincinnati Sirens FC', league: 'MASLW', division: 'Great Lakes South', color: '#002244', colorName: 'Navy', logo: '/logos/Cincinnati_Sirens_FC_logo.png' },
    { id: 'columbus_eagles_fc', name: 'Columbus Eagles FC', league: 'MASLW', division: 'Great Lakes South', color: '#F2A900', colorName: 'Gold', logo: '/logos/Columbus_Eagles_FC_logo.png' },
    { id: 'louisville_triumph_fc', name: 'Louisville Triumph FC', league: 'MASLW', division: 'Great Lakes South', color: '#000000', colorName: 'Black', logo: '/logos/Louisville_Triumph_FC_logo.png' },
    { id: 'susserfuss_ballverein', name: 'Süsserfuss Ballverein', league: 'MASLW', division: 'Great Lakes South', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Süsserfuss_Ballverein_logo.png' },
    { id: 'ict_aztecs', name: 'ICT Aztecs', league: 'MASLW', division: 'Heartland', color: '#E31837', colorName: 'Red', logo: '/logos/ICT_Aztecs_logo.png' },
    { id: 'okc_ghosts', name: 'OKC Ghosts', league: 'MASLW', division: 'Heartland', color: '#000000', colorName: 'Black', logo: '/logos/OKC_Ghosts_logo.png' },
    { id: 'side_fc_cyclones', name: 'Side FC Cyclones', league: 'MASLW', division: 'Heartland', color: '#000000', colorName: 'Black', logo: '/logos/Side_FC_Cyclones_logo.png' },
    { id: 'tulsa_fc_channel_cats', name: 'Tulsa FC Channel Cats', league: 'MASLW', division: 'Heartland', color: '#F58220', colorName: 'Orange', logo: '/logos/Tulsa_FC_Channel_Cats_logo.png' },
    { id: 'wichita_aero', name: 'Wichita Aero', league: 'MASLW', division: 'Heartland', color: '#00A3E0', colorName: 'Light Blue', logo: '/logos/Wichita_Aero_logo.png' },
    { id: 'wichita_lady_luch', name: 'Wichita Lady Luch', league: 'MASLW', division: 'Heartland', color: '#E31837', colorName: 'Red', logo: '/logos/Wichita_Lady_Luch_logo.png' },
    { id: 'iowa_demon_hawks_maslw', name: 'Iowa Demon Hawks', league: 'MASLW', division: 'Midwest', color: '#C8102E', colorName: 'Red', logo: '/logos/Iowa_Demon_Hawks_MASLW_logo.png' },
    { id: 'iowa_raptors_maslw', name: 'Iowa Raptors', league: 'MASLW', division: 'Midwest', color: '#008000', colorName: 'Green', logo: '/logos/Iowa_Raptors_MASLW_logo.png' },
    { id: 'ks_astras', name: 'KS Astras', league: 'MASLW', division: 'Midwest', color: '#002244', colorName: 'Navy', logo: '/logos/KS_Astras_logo.png' },
    { id: 'omaha_queens', name: 'Omaha Queens', league: 'MASLW', division: 'Midwest', color: '#000000', colorName: 'Black', logo: '/logos/Omaha_Queens_logo.png' },
    { id: '512_fc', name: '512 FC', league: 'MASLW', division: 'South', color: '#000000', colorName: 'Black', logo: '/logos/512_FC_logo.png' },
    { id: 'atletico_monterrey', name: 'Atletico Monterrey', league: 'MASLW', division: 'South', color: '#00205B', colorName: 'Royal Blue', logo: '/logos/Atletico_Monterrey_logo.png' },
    { id: 'houston_bolt', name: 'Houston Bolt', league: 'MASLW', division: 'South', color: '#FFD700', colorName: 'Yellow', logo: '/logos/Houston_Bolt_logo.png' },
    { id: 'houston_indoor_club', name: 'Houston Indoor Club', league: 'MASLW', division: 'South', color: '#000000', colorName: 'Black', logo: '/logos/Houston_Indoor_Club_logo.png' },
    { id: 'rpfc', name: 'RPFC', league: 'MASLW', division: 'South', color: '#000000', colorName: 'Black', logo: '/logos/RPFC_logo.png' },
    { id: 'texas_lone_star_sc', name: 'Texas Lone Star SC', league: 'MASLW', division: 'South', color: '#B91C1C', colorName: 'Red', logo: '/logos/Texas_Lone_Star_SC_logo.png' }
];