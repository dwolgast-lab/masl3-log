import React, { useState, useRef } from 'react';
import { BENCH_ROLES, LEAGUES, TEAMS } from '../config';

// UTILITY: ROBUST NUMERICAL JERSEY SORT
// Handles standard numbers, leading zeros (05), and distinct '00' vs '0' nuance.
const robustNumericalSort = (a, b) => {
    const jerseyA = a.number;
    const jerseyB = b.number;

    if (jerseyA === '00') return -1; // 00 always first
    if (jerseyB === '00') return 1;

    // parseInt handles standard numerical comparison (e.g. "05" becomes 5)
    const numA = parseInt(jerseyA, 10);
    const numB = parseInt(jerseyB, 10);

    if (numA !== numB) {
        return numA - numB;
    }
    
    // Fallback comparison for safety
    return jerseyA.localeCompare(jerseyB);
};

export default function PregameSetup({
    gameData, setGameData, handleInputChange, awayCSSColor, homeCSSColor,
    awayRoster, setAwayRoster, homeRoster, setHomeRoster,
    awayBench, setAwayBench, homeBench, setHomeBench,
    activeRosterModal, setActiveRosterModal,
    showStartersModal, setShowStartersModal,
    newPlayer, setNewPlayer,
    newBench, setNewBench,
    setCurrentView, clearAllGameData, onExportPDF, appVersion
}) {
    const fileInputRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editingBenchId, setEditingBenchId] = useState(null); // NEW: Manage staff editing

    // Ensure starters modal uses strict numerical sort
    const getSortedStarters = (roster) => roster
        .filter(p => p.isStarter)
        .sort(robustNumericalSort);

    const activeLeague = LEAGUES.find(l => l.id === gameData.league);
    const availableTeams = TEAMS.filter(t => t.league === gameData.league);

    const teamsByDivision = availableTeams.reduce((acc, team) => {
        const div = team.division || 'Other';
        if (!acc[div]) acc[div] = [];
        acc[div].push(team);
        return acc;
    }, {});

    const getTeamSelectValue = (type) => {
        const teamName = gameData[`${type}Team`];
        const team = availableTeams.find(t => t.name === teamName);
        return team ? team.id : 'custom';
    };

    const handleTeamSelect = (type, e) => {
        const teamId = e.target.value;
        const otherType = type === 'away' ? 'home' : 'away';

        if (teamId === 'custom') {
            setGameData({ ...gameData, [`${type}Logo`]: '' });
            return;
        }
        
        const selected = TEAMS.find(t => t.id === teamId);
        if (selected) {
            if (selected.name === gameData[`${otherType}Team`]) {
                alert(`The ${selected.name} are already selected as the ${otherType === 'away' ? 'Away' : 'Home'} team. Please choose a different team.`);
                return;
            }

            setGameData({
                ...gameData,
                [`${type}Team`]: selected.name,
                [`${type}Color`]: selected.color,
                [`${type}ColorName`]: selected.colorName,
                [`${type}Logo`]: selected.logo
            });
        }
    };

    // --- MASL GAME STATE VALIDATION GUARDS ---
    const checkTeamValidity = (teamName, roster, bench) => {
        let warnings = [];
        const starters = roster.filter(p => p.isStarter);
        const startingGKs = starters.filter(p => p.isGK);
        const headCoaches = bench.filter(b => b.role === 'Head Coach');

        if (starters.length !== 6) warnings.push(`Requires exactly 6 Starters (GK + 5 Field).`);
        if (startingGKs.length !== 1) warnings.push(`Requires exactly 1 Starting Goalkeeper.`);
        if (headCoaches.length !== 1) warnings.push(`Requires exactly 1 Head Coach.`);
        
        return warnings.length > 0 ? { team: teamName, warnings } : null;
    };

    const handleProceedToKickoff = () => {
        if (gameData.awayTeam && gameData.homeTeam && gameData.awayTeam.trim().toLowerCase() === gameData.homeTeam.trim().toLowerCase()) {
            return alert("Home and Away teams cannot be the same. Please change one of the team names before proceeding to kickoff.");
        }

        const awayErrors = checkTeamValidity(gameData.awayTeam || 'Away Team', awayRoster, awayBench);
        const homeErrors = checkTeamValidity(gameData.homeTeam || 'Home Team', homeRoster, homeBench);

        if (awayErrors || homeErrors) {
            let errorMsg = "⚠️ PRE-GAME VALIDATION WARNING ⚠️\n\nThe following MASL roster rules have not been met:\n\n";
            if (awayErrors) {
                errorMsg += `${awayErrors.team}:\n`;
                awayErrors.warnings.forEach(w => errorMsg += `- ${w}\n`);
                errorMsg += "\n";
            }
            if (homeErrors) {
                errorMsg += `${homeErrors.team}:\n`;
                homeErrors.warnings.forEach(w => errorMsg += `- ${w}\n`);
            }
            errorMsg += "\nAre you sure you want to proceed to kickoff anyway?";
            
            if (!window.confirm(errorMsg)) {
                return; 
            }
        }
        
        // Ensure data is passed out using strict numerical sort
        awayRoster.sort(robustNumericalSort);
        homeRoster.sort(robustNumericalSort);

        setCurrentView('ingame');
    };

    const handleAddPlayer = () => {
        if (!newPlayer.number || !newPlayer.name) return alert("Please enter both a jersey number and a name.");
        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;

        // Disallow duplicates (treating 00, 0, 01, 1 distinctly)
        if (currentRoster.some(p => p.number === newPlayer.number && p.id !== editingPlayerId)) {
            return alert(`Jersey number ${newPlayer.number} already exists on this roster.`);
        }

        const otherPlayers = editingPlayerId ? currentRoster.filter(p => p.id !== editingPlayerId) : currentRoster;
        if (!editingPlayerId && currentRoster.length >= 17) return alert("Max 17 total players.");
        if (!newPlayer.isGK && otherPlayers.filter(p => !p.isGK).length >= 15) return alert("Max 15 Field Players.");
        
        if (newPlayer.isStarter) {
            if (newPlayer.isGK && otherPlayers.filter(p => p.isGK && p.isStarter).length >= 1) return alert("Only 1 Starting Goalkeeper allowed.");
            if (!newPlayer.isGK && otherPlayers.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players allowed.");
        }
        if (newPlayer.isCaptain && otherPlayers.some(p => p.isCaptain)) return alert("A team can only have ONE designated Captain.");

        let updated;
        if (editingPlayerId) {
            updated = currentRoster.map(p => p.id === editingPlayerId ? { ...newPlayer, id: editingPlayerId } : p);
            setEditingPlayerId(null);
        } else {
            updated = [...currentRoster, { ...newPlayer, id: Date.now() }];
        }
        
        // Ensure state is saved using strict numerical sort
        setRoster(updated.sort(robustNumericalSort));
        setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false }); 
    };

    const togglePlayerAttr = (id, attr) => {
        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;
        const player = currentRoster.find(p => p.id === id);
        let newValue = !player[attr];
        const otherPlayers = currentRoster.filter(p => p.id !== id);

        if (newValue) {
            if (attr === 'isCaptain' && otherPlayers.some(p => p.isCaptain)) return alert("A team can only have ONE designated Captain.");
            if (attr === 'isStarter') {
                if (player.isGK && otherPlayers.filter(p => p.isGK && p.isStarter).length >= 1) return alert("Only 1 Starting Goalkeeper allowed.");
                if (!player.isGK && otherPlayers.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players allowed.");
            }
            if (attr === 'isGK') {
                if (player.isStarter && otherPlayers.filter(p => p.isGK && p.isStarter).length >= 1) {
                    return alert("Only 1 Starting Goalkeeper allowed. Please un-select the current starting GK first.");
                }
            }
        } else {
            if (attr === 'isGK') {
                if (otherPlayers.filter(p => !p.isGK).length >= 15) return alert("Max 15 Field Players. Cannot change GK to Field Player without removing one.");
                if (player.isStarter && otherPlayers.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players. Please un-select starter status first.");
            }
        }
        
        const updated = currentRoster.map(p => p.id === id ? { ...p, [attr]: newValue } : p);
        setRoster(updated);
        if (editingPlayerId === id) setNewPlayer(prev => ({ ...prev, [attr]: newValue }));
    };

    const handleAddBench = () => {
        if (!newBench.name) return alert("Please enter name.");
        const currentBench = activeRosterModal === 'AWAY' ? awayBench : homeBench;
        const setBench = activeRosterModal === 'AWAY' ? setAwayBench : setHomeBench;
        
        if (!editingBenchId && currentBench.length >= 5) return alert("Max 5 bench personnel.");
        
        // Guard against duplicate Head Coaches
        if (newBench.role === 'Head Coach' && currentBench.some(b => b.role === 'Head Coach' && b.id !== editingBenchId)) {
            return alert("A team can only have ONE designated Head Coach.");
        }
        
        let updated;
        if (editingBenchId) {
            // Edit mode: Update existing entry
            updated = currentBench.map(b => b.id === editingBenchId ? { ...newBench, id: editingBenchId } : b);
            setEditingBenchId(null);
        } else {
            // Add mode: Append new entry
            updated = [...currentBench, { ...newBench, id: Date.now() }];
        }

        setBench(updated);
        setNewBench({ name: '', role: 'Assistant Coach' });
    };

    const removePlayer = (id) => activeRosterModal === 'AWAY' ? setAwayRoster(awayRoster.filter(p => p.id !== id)) : setHomeRoster(homeRoster.filter(p => p.id !== id));
    const removeBench = (id) => activeRosterModal === 'AWAY' ? setAwayBench(awayBench.filter(b => b.id !== id)) : setHomeBench(homeBench.filter(b => b.id !== id));

    const closeRosterModal = () => {
        setActiveRosterModal(null);
        setEditingPlayerId(null);
        setEditingBenchId(null); // Clear editing state
        setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false });
        setNewBench({ name: '', role: 'Assistant Coach' });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        setScanResult(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_WIDTH) { width *= MAX_WIDTH / height; height = MAX_WIDTH; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

                try {
                    const response = await fetch('/api/scanRoster', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64: compressedBase64 })
                    });

                    const data = await response.json();
                    if (data.error) throw new Error(data.error);

                    setScanResult(data.text);
                } catch (error) {
                    alert("Failed to scan roster: " + error.message);
                } finally {
                    setIsScanning(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            };
        };
    };

    // --- SMART PARSER + Auto GK/Starter ---
    const handleImportScannedText = () => {
        if (!scanResult) return;

        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;
        const currentBench = activeRosterModal === 'AWAY' ? awayBench : homeBench;
        const setBench = activeRosterModal === 'AWAY' ? setAwayBench : setHomeBench;
        
        let newPlayers = [];
        let newStaff = [];
        const benchKeywords = ['COACH', 'TRAINER', 'MANAGER', 'STAFF', 'ASSISTANT', 'DOCTOR', 'PHYSIO'];
        let importedPlayerCount = 0;

        const lines = scanResult.split('\n');
        
        lines.forEach(line => {
            // Ignore blank lines and form headers
            if (!line.trim() || line.toUpperCase().includes('JERSEY NO') || line.toUpperCase().includes('LAST NAME')) return;

            // Extract virtual cells based on large spatial gaps
            const cells = line.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
            
            let jerseyNum = null;
            let nameParts = [];
            let isGK = false;

            // --- PROCESS PLAYER FORMAT ---
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                let upperCell = cell.toUpperCase();

                if (!jerseyNum) {
                    if (/^\d{1,2}$/.test(cell)) {
                        // Garbage check for leading list indices (printed "1.", "2)")
                        if (i + 1 < cells.length && /^\d{1,2}$/.test(cells[i+1])) continue;
                        jerseyNum = cell;
                    }
                } 
                else {
                    if (upperCell === 'GK' || upperCell === 'G') {
                        isGK = true;
                    } else if (/^[DMFET]$/.test(upperCell)) {
                        continue; // Skip single letter positions
                    } else {
                        if (upperCell.includes('GK')) {
                            isGK = true;
                            cell = cell.replace(/GK/ig, '').trim();
                        }
                        if (cell) nameParts.push(cell);
                    }
                }
            }

            if (jerseyNum && nameParts.length > 0) {
                const finalName = nameParts.join(' ').replace(/[^a-zA-Z\s,-]/g, '').trim();
                
                if (finalName.length > 1 && !currentRoster.some(p => p.number === jerseyNum) && !newPlayers.some(p => p.number === jerseyNum)) {
                    importedPlayerCount++;
                    
                    // Logic: First 6 lines are starters. 1st line is GK.
                    const isAutoStarter = importedPlayerCount <= 6;
                    const isAutoGK = isGK || importedPlayerCount === 1;

                    newPlayers.push({
                        id: Date.now() + Math.random(),
                        number: jerseyNum,
                        name: finalName,
                        isGK: isAutoGK,
                        isStarter: isAutoStarter,
                        isCaptain: false
                    });
                }
            } 
            // --- PROCESS BENCH STAFF FORMAT ---
            else {
                let upperLine = line.toUpperCase();
                let foundRole = benchKeywords.find(role => upperLine.includes(role));
                
                if (foundRole) {
                    let staffName = upperLine.replace(foundRole, '').replace(/[^A-Z\s,-]/g, '').trim();
                    if (staffName.length > 2 && !currentBench.some(b => b.name.toUpperCase() === staffName) && !newStaff.some(b => b.name.toUpperCase() === staffName)) {
                        newStaff.push({
                            id: Date.now() + Math.random(),
                            // Title Case
                            name: staffName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '), 
                            // Rule Application: First staff found becomes Head Coach, rest Assistant Coaches.
                            role: (currentBench.length === 0 && newStaff.length === 0) ? 'Head Coach' : 'Assistant Coach'
                        });
                    }
                }
            }
        });

        if (newPlayers.length > 0 || newStaff.length > 0) {
            if (newPlayers.length > 0) {
                // Ensure state is saved sorted
                const updatedRoster = [...currentRoster, ...newPlayers].sort(robustNumericalSort);
                setRoster(updatedRoster);
            }
            if (newStaff.length > 0) {
                const updatedBench = [...currentBench, ...newStaff];
                setBench(updatedBench);
            }
            alert(`Imported ${newPlayers.length} players (${Math.min(newPlayers.length, 6)} auto-marked as Starters) and ${newStaff.length} bench staff!`);
        } else {
            alert("Could not detect any valid data. Please ensure rows have a jersey number and a name.");
        }
        setScanResult(null); 
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans relative flex flex-col items-center">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="bg-slate-800 p-6 text-white flex justify-between items-center relative">
                    <div className="flex items-center space-x-4 z-10">
                        {activeLeague?.logo && <img src={activeLeague.logo} alt="League Logo" className="w-16 h-16 object-contain bg-white rounded-full p-1" />}
                        <div>
                            <h1 className="text-3xl font-black tracking-wider">{activeLeague?.name || 'MASL'} PRE-GAME SETUP</h1>
                            <span className="font-bold text-slate-300">4th Official Log</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <section>
                        <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4">
                            <h2 className="text-xl font-bold text-slate-700">Match Information</h2>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-bold text-gray-600">Select League:</label>
                                <select name="league" value={gameData.league || 'MASL3'} onChange={handleInputChange} className="p-2 border rounded bg-gray-50 font-bold shadow-sm">
                                    {LEAGUES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Game Number</label><input type="text" name="gameNumber" placeholder="e.g. 25MASL3-001" value={gameData.gameNumber || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50 uppercase" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Date</label><input type="date" name="date" value={gameData.date} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Scheduled KO</label><input type="time" name="scheduledKO" value={gameData.scheduledKO || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Venue</label><input type="text" name="venue" value={gameData.venue} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">City</label><input type="text" name="city" value={gameData.city} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-4">
                            <h2 className="text-xl font-bold text-slate-700">Teams & Rosters</h2>
                            <button onClick={() => setShowStartersModal(true)} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition">
                                👀 View Starting Lineups
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col relative">
                                {gameData.awayLogo && <img src={gameData.awayLogo} alt="Away Logo" className="absolute top-4 right-4 w-12 h-12 object-contain opacity-80 drop-shadow-sm" />}
                                <h3 className="font-black mb-4 uppercase" style={{ color: awayCSSColor }}>AWAY TEAM</h3>
                                
                                <select value={getTeamSelectValue('away')} onChange={(e) => handleTeamSelect('away', e)} className="w-full p-3 border rounded-lg mb-3 font-bold bg-white shadow-sm outline-none focus:border-blue-500">
                                    <option value="custom">-- Custom / Manual Entry --</option>
                                    {Object.keys(teamsByDivision).map(division => (
                                        <optgroup key={division} label={`${division} Division`}>
                                            {teamsByDivision[division].map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                
                                <div className="flex space-x-2 mb-4">
                                    <input type="text" name="awayTeam" placeholder="Team Name" value={gameData.awayTeam} onChange={handleInputChange} className="flex-[2] p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" />
                                    <input type="text" name="awayColorName" placeholder="Jersey Color" value={gameData.awayColorName || ''} onChange={handleInputChange} className="flex-1 p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" title="Report Color Name" />
                                </div>

                                <button onClick={() => setActiveRosterModal('AWAY')} className="w-full mt-auto py-3 text-white font-bold rounded-lg shadow flex justify-between px-4 hover:opacity-90 transition" style={{ backgroundColor: awayCSSColor }}>
                                    <span>Edit Roster & Bench</span>
                                    <span>{awayRoster.length} Plyrs / {awayBench.length} Staff</span>
                                </button>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col relative">
                                {gameData.homeLogo && <img src={gameData.homeLogo} alt="Home Logo" className="absolute top-4 right-4 w-12 h-12 object-contain opacity-80 drop-shadow-sm" />}
                                <h3 className="font-black mb-4 uppercase" style={{ color: homeCSSColor }}>HOME TEAM</h3>
                                
                                <select value={getTeamSelectValue('home')} onChange={(e) => handleTeamSelect('home', e)} className="w-full p-3 border rounded-lg mb-3 font-bold bg-white shadow-sm outline-none focus:border-blue-500">
                                    <option value="custom">-- Custom / Manual Entry --</option>
                                    {Object.keys(teamsByDivision).map(division => (
                                        <optgroup key={division} label={`${division} Division`}>
                                            {teamsByDivision[division].map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>

                                <div className="flex space-x-2 mb-4">
                                    <input type="text" name="homeTeam" placeholder="Team Name" value={gameData.homeTeam} onChange={handleInputChange} className="flex-[2] p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" />
                                    <input type="text" name="homeColorName" placeholder="Jersey Color" value={gameData.homeColorName || ''} onChange={handleInputChange} className="flex-1 p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" title="Report Color Name" />
                                </div>

                                <button onClick={() => setActiveRosterModal('HOME')} className="w-full mt-auto py-3 text-white font-bold rounded-lg shadow flex justify-between px-4 hover:opacity-90 transition" style={{ backgroundColor: homeCSSColor }}>
                                    <span>Edit Roster & Bench</span>
                                    <span>{homeRoster.length} Plyrs / {homeBench.length} Staff</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
                    <span className="text-sm font-bold text-green-600 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span> Auto-Saving Enabled
                    </span>
                    <button onClick={handleProceedToKickoff} className="px-8 py-4 bg-green-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-green-700 transition">
                        PROCEED TO KICKOFF ➔
                    </button>
                </div>
            </div>

            <div className="w-full max-w-5xl flex justify-between px-4">
                <button onClick={clearAllGameData} className="text-red-500 font-bold border-b border-transparent hover:border-red-500 transition">
                    ⚠️ End Match & Wipe All Data
                </button>
                <button onClick={onExportPDF} className="px-6 py-3 bg-blue-600 text-white font-black rounded-lg shadow-lg hover:bg-blue-700 transition">
                    📥 Export Official PDF Worksheet
                </button>
            </div>

            {/* STARTERS SLIDE-UP MODAL */}
            {showStartersModal && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6 py-12">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[80vh] overflow-hidden">
                        <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-2xl font-black uppercase">STARTING LINEUPS</h2>
                            <button onClick={() => setShowStartersModal(false)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Close</button>
                        </div>
                        <div className="flex flex-1 overflow-hidden">
                            <div className="w-1/2 flex flex-col border-r bg-gray-50">
                                <div className="p-4 text-center text-white font-black text-xl uppercase shrink-0 shadow-sm" style={{ backgroundColor: awayCSSColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{gameData.awayTeam || 'AWAY TEAM'}</div>
                                <div className="p-6 overflow-y-auto flex-1 space-y-3">
                                    {getSortedStarters(awayRoster).map(player => (
                                        <div key={player.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full font-black text-lg text-gray-800 border" style={{ borderColor: awayCSSColor }}>{player.number}</span>
                                            <span className="ml-4 font-bold text-xl text-gray-800">{player.name}</span>
                                            <div className="ml-auto flex space-x-1">
                                                {player.isGK && <span className="bg-orange-100 text-orange-800 text-xs font-black px-2 py-1 rounded">GK</span>}
                                                {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2 py-1 rounded">© Capt</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-1/2 flex flex-col bg-gray-50">
                                <div className="p-4 text-center text-white font-black text-xl uppercase shrink-0 shadow-sm" style={{ backgroundColor: homeCSSColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{gameData.homeTeam || 'HOME TEAM'}</div>
                                <div className="p-6 overflow-y-auto flex-1 space-y-3">
                                    {getSortedStarters(homeRoster).map(player => (
                                        <div key={player.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full font-black text-lg text-gray-800 border" style={{ borderColor: homeCSSColor }}>{player.number}</span>
                                            <span className="ml-4 font-bold text-xl text-gray-800">{player.name}</span>
                                            <div className="ml-auto flex space-x-1">
                                                {player.isGK && <span className="bg-orange-100 text-orange-800 text-xs font-black px-2 py-1 rounded">GK</span>}
                                                {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2 py-1 rounded">© Capt</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* FULL ROSTER EDITOR MODAL */}
            {activeRosterModal && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6 py-12">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-full max-h-[90vh] overflow-hidden relative">
                        
                        {/* Scanning Overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 bg-white/90 z-[60] flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <h3 className="text-xl font-bold text-gray-800">Processing Document via Google Cloud AI...</h3>
                                <p className="text-gray-500">This may take a few seconds.</p>
                            </div>
                        )}

                        {/* OCR Verification View */}
                        {scanResult !== null && (
                            <div className="absolute inset-0 bg-white z-[60] flex flex-col p-6 overflow-hidden">
                                <h2 className="text-2xl font-black text-gray-800 mb-2">VERIFY SCANNED TEXT</h2>
                                <p className="text-sm text-gray-600 mb-4 border-b pb-4">
                                    Below is the raw text extracted. <strong>It may look messy, but our parser handles it.</strong> <br/>
                                    If it looks complete, just click "Import Data". Correct misspellings *after* import.
                                </p>
                                
                                <textarea 
                                    className="flex-1 w-full p-4 border-2 border-gray-300 rounded-xl font-mono text-sm mb-4 outline-none focus:border-blue-500 bg-gray-50 overflow-y-auto"
                                    value={scanResult}
                                    onChange={(e) => setScanResult(e.target.value)}
                                />
                                
                                <div className="flex justify-end space-x-4 shrink-0 mt-4">
                                    <button onClick={() => setScanResult(null)} className="px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                                    <button onClick={handleImportScannedText} className="px-6 py-3 font-black text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700">Import Data</button>
                                </div>
                            </div>
                        )}

                        {/* Modal Header */}
                        <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: activeRosterModal === 'AWAY' ? awayCSSColor : homeCSSColor }}>
                            <h2 className="text-2xl font-black uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                {(activeRosterModal === 'AWAY' ? gameData.awayTeam : gameData.homeTeam) || `${activeRosterModal} TEAM`} PERSONNEL
                            </h2>
                            <div className="flex items-center space-x-4">
                                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                                <button onClick={() => fileInputRef.current.click()} className="flex items-center bg-white text-slate-800 px-4 py-2 rounded font-black shadow hover:bg-gray-100 transition text-sm">
                                    📷 Scan Lineup Sheet
                                </button>
                                <button onClick={closeRosterModal} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Done</button>
                            </div>
                        </div>
                        
                        <div className="flex flex-1 overflow-hidden bg-gray-50">
                            {/* --- PLAYER SECTION (2/3) --- */}
                            <div className="w-2/3 border-r flex flex-col h-full overflow-hidden">
                                {/* EDIT / ADD PLAYER BAR */}
                                <div className="p-4 bg-white border-b shrink-0">
                                    <div className="flex gap-2 items-end">
                                        <div className="w-16"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">No.</label><input type="text" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value.toUpperCase().trim()})} className="w-full p-2 border rounded bg-gray-50 font-bold" placeholder="00" /></div>
                                        <div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Player Name</label><input type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Last Name, First Name" /></div>
                                        <div className="flex flex-col space-y-1 pb-1">
                                            <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isGK} onChange={e => setNewPlayer({...newPlayer, isGK: e.target.checked})} className="w-4 h-4 accent-orange-500" /><span className="font-bold text-[10px] uppercase text-gray-700">GK</span></label>
                                            <div className="flex space-x-2">
                                                <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isStarter} onChange={e => setNewPlayer({...newPlayer, isStarter: e.target.checked})} className="w-4 h-4 accent-green-600" /><span className="font-bold text-[10px] uppercase text-gray-700">Start</span></label>
                                                <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})} className="w-4 h-4 accent-yellow-500" /><span className="font-bold text-[10px] uppercase text-gray-700">Capt</span></label>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button onClick={handleAddPlayer} className={`px-4 py-2 text-white text-sm font-bold rounded shadow transition ${editingPlayerId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                                {editingPlayerId ? 'Update' : '+ Add'}
                                            </button>
                                            {editingPlayerId && (
                                                <button onClick={() => { setEditingPlayerId(null); setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false }); }} className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-bold rounded hover:bg-gray-300 transition">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* ROSTER LIST (RENDERED NUMERICALLY) */}
                                <div className="p-4 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        {(activeRosterModal === 'AWAY' ? awayRoster : homeRoster)
                                            .sort(robustNumericalSort) // APPLIED: Strict Numerical Sort for viewing
                                            .map(player => (
                                            <div key={player.id} className={`flex items-center justify-between p-2 border rounded shadow-sm transition ${editingPlayerId === player.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-full font-black text-sm text-slate-700 shrink-0">{player.number}</span>
                                                    <span className="font-bold text-sm text-gray-800 truncate flex-1">{player.name}</span>
                                                </div>
                                                
                                                {/* QUICK TOGGLE BADGES */}
                                                <div className="flex space-x-1 shrink-0 ml-2">
                                                    <button onClick={() => togglePlayerAttr(player.id, 'isGK')} className={`text-[10px] font-black px-2 py-1 rounded border transition ${player.isGK ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>GK</button>
                                                    <button onClick={() => togglePlayerAttr(player.id, 'isStarter')} className={`text-[10px] font-black px-2 py-1 rounded border transition ${player.isStarter ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>STARTER</button>
                                                    <button onClick={() => togglePlayerAttr(player.id, 'isCaptain')} className={`text-[10px] font-black px-2 py-1 rounded border transition ${player.isCaptain ? 'bg-yellow-100 text-yellow-800 border-yellow-400' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>© CAPT</button>
                                                </div>

                                                {/* ACTIONS */}
                                                <div className="flex space-x-1 shrink-0 ml-4 border-l pl-2">
                                                    <button onClick={() => { setEditingPlayerId(player.id); setNewPlayer(player); }} className="text-blue-500 hover:bg-blue-100 px-2 py-1 text-xs rounded font-bold transition">Edit</button>
                                                    <button onClick={() => removePlayer(player.id)} className="text-red-500 hover:bg-red-100 px-2 py-1 text-xs rounded font-bold transition">Del</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* --- STAFF SECTION (1/3) --- */}
                            <div className="w-1/3 flex flex-col h-full bg-slate-50 overflow-hidden">
                                {/* EDIT / ADD STAFF BAR */}
                                <div className="p-4 bg-white border-b shrink-0">
                                    <div className="flex flex-col gap-2">
                                        <input type="text" value={newBench.name} onChange={e => setNewBench({...newBench, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm" placeholder="Staff Name" />
                                        <select value={newBench.role} onChange={e => setNewBench({...newBench, role: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm font-bold">
                                            {BENCH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                        <div className="flex gap-1">
                                            <button onClick={handleAddBench} className={`flex-1 py-2 text-white text-sm font-bold rounded transition ${editingBenchId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                                {editingBenchId ? 'Update Staff' : '+ Add Staff'}
                                            </button>
                                            {editingBenchId && (
                                                <button onClick={() => { setEditingBenchId(null); setNewBench({ name: '', role: 'Assistant Coach' }); }} className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-bold rounded hover:bg-gray-300 transition">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* STAFF LIST */}
                                <div className="p-4 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        {(activeRosterModal === 'AWAY' ? awayBench : homeBench).map(person => (
                                            <div key={person.id} className={`flex flex-col p-2 bg-white border rounded shadow-sm relative ${editingBenchId === person.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                                                <span className="font-bold text-sm text-gray-800 pr-16">{person.name}</span>
                                                <span className="text-[10px] font-black mt-1 uppercase w-fit px-1.5 py-0.5 bg-gray-100 text-gray-600 border truncate max-w-full">{person.role}</span>
                                                <div className="absolute top-2 right-2 flex space-x-1Actions shrink-0">
                                                    <button onClick={() => { setEditingBenchId(person.id); setNewBench(person); }} className="text-blue-500 hover:bg-blue-100 px-2 py-1 text-xs rounded font-bold transition">Edit</button>
                                                    <button onClick={() => removeBench(person.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 z-[1000] drop-shadow-md">
                Author: Dave Wolgast | v{appVersion}
            </div>
        </div>
    );
}