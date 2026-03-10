import React from 'react';
import { LEAGUES, TEAMS } from '../config';
import { robustNumericalSort } from '../ocrEngine';

import MatchInfoBlock from '../components/MatchInfoBlock';
import TeamConfigCard from '../components/TeamConfigCard';
import StartersViewerModal from '../components/modals/StartersViewerModal';
import RosterEditorModal from '../components/modals/RosterEditorModal';

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

    const activeLeague = LEAGUES.find(l => l.id === gameData.league);
    
    const teamsByDivision = TEAMS.filter(t => t.league === gameData.league).reduce((acc, team) => {
        const div = team.division || 'Other';
        if (!acc[div]) acc[div] = [];
        acc[div].push(team);
        return acc;
    }, {});

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

    const checkTeamValidity = (teamName, roster, bench) => {
        let warnings = [];
        const starters = roster.filter(p => p.isStarter);
        const startingGKs = starters.filter(p => p.isGK);
        const headCoaches = bench.filter(b => b.role === 'Head Coach');

        if (starters.length !== 6) warnings.push(`Requires exactly 6 Starters (GK + 5 Field).`);
        if (startingGKs.length !== 1) warnings.push(`Requires exactly 1 Starting Goalkeeper.`);
        if (headCoaches.length !== 1) warnings.push(`Requires exactly 1 Head Coach.`);
        
        const normalizeName = (name) => name.toLowerCase().replace(/[^a-z]/g, '');
        const benchNames = bench.map(b => normalizeName(b.name));
        
        const overlaps = roster.filter(p => benchNames.includes(normalizeName(p.name)));
        if (overlaps.length > 0) {
            const overlapNames = overlaps.map(o => o.name).join(', ');
            warnings.push(`Player/Coach Violation: ${overlapNames} cannot be listed on both the Player Roster and Bench Staff.`);
        }

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
            
            if (!window.confirm(errorMsg)) return; 
        }
        
        awayRoster.sort(robustNumericalSort);
        homeRoster.sort(robustNumericalSort);
        setCurrentView('ingame');
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
                        <MatchInfoBlock gameData={gameData} handleInputChange={handleInputChange} />
                    </section>

                    <section>
                        <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-4">
                            <h2 className="text-xl font-bold text-slate-700">Teams & Rosters</h2>
                            <button onClick={() => setShowStartersModal(true)} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition">
                                👀 View Starting Lineups
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <TeamConfigCard 
                                type="away" gameData={gameData} handleInputChange={handleInputChange} 
                                handleTeamSelect={handleTeamSelect} teamsByDivision={teamsByDivision} 
                                cssColor={awayCSSColor} rosterCount={awayRoster.length} benchCount={awayBench.length} setActiveRosterModal={setActiveRosterModal} 
                            />
                            <TeamConfigCard 
                                type="home" gameData={gameData} handleInputChange={handleInputChange} 
                                handleTeamSelect={handleTeamSelect} teamsByDivision={teamsByDivision} 
                                cssColor={homeCSSColor} rosterCount={homeRoster.length} benchCount={homeBench.length} setActiveRosterModal={setActiveRosterModal} 
                            />
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

            <StartersViewerModal 
                showStartersModal={showStartersModal} setShowStartersModal={setShowStartersModal} 
                gameData={gameData} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} 
                awayRoster={awayRoster} homeRoster={homeRoster} 
            />
            
            <RosterEditorModal 
                activeRosterModal={activeRosterModal} setActiveRosterModal={setActiveRosterModal} 
                gameData={gameData} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor}
                awayRoster={awayRoster} setAwayRoster={setAwayRoster} homeRoster={homeRoster} setHomeRoster={setHomeRoster} 
                awayBench={awayBench} setAwayBench={setAwayBench} homeBench={homeBench} setHomeBench={setHomeBench}
                newPlayer={newPlayer} setNewPlayer={setNewPlayer} newBench={newBench} setNewBench={setNewBench}
            />
            
            <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 z-[1000] drop-shadow-md">
                Author: Dave Wolgast | v{appVersion}
            </div>
        </div>
    );
}