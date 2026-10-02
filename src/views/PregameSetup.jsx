import React, { useState } from 'react';
import { LEAGUES, TEAMS } from '../config';
import { robustNumericalSort } from '../ocrEngine';

import MatchInfoBlock from '../components/MatchInfoBlock';
import TeamConfigCard from '../components/TeamConfigCard';
import StartersViewerModal from '../components/modals/StartersViewerModal';
import RosterEditorModal from '../components/modals/RosterEditorModal';
import CrewEditorModal from '../components/modals/CrewEditorModal';
import BugReportModal from '../components/modals/BugReportModal';

export default function PregameSetup({
    gameData, setGameData, handleInputChange, awayCSSColor, homeCSSColor,
    awayRoster, setAwayRoster, homeRoster, setHomeRoster,
    awayBench, setAwayBench, homeBench, setHomeBench,
    activeRosterModal, setActiveRosterModal,
    showStartersModal, setShowStartersModal,
    newPlayer, setNewPlayer, newBench, setNewBench,
    setCurrentView, clearAllGameData, onExportPDF, appVersion,
    isDarkMode, setIsDarkMode
}) {

    const [showCrewModal, setShowCrewModal] = useState(false);
    const [showBugModal, setShowBugModal] = useState(false);
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
        const totalGKs = roster.filter(p => p.isGK);
        
        const isPro = !['MASL3', 'MASLW'].includes(gameData.league);

        if (starters.length !== 6) warnings.push(`Requires exactly 6 Starters (GK + 5 Field).`);
        if (startingGKs.length !== 1) warnings.push(`Requires exactly 1 Starting Goalkeeper.`);
        if (headCoaches.length !== 1) warnings.push(`Requires exactly 1 Head Coach.`);
        
        if (isPro && totalGKs.length < 2) {
            warnings.push(`Roster Violation: ${gameData.league} rules require at least 2 Goalkeepers on the active roster.`);
        }
        
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
        
        setAwayRoster([...awayRoster].sort(robustNumericalSort));
        setHomeRoster([...homeRoster].sort(robustNumericalSort));
        setCurrentView('ingame');
    };

    const btnDark = "min-h-11 px-4 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.97] active:brightness-95 transition";

    return (
        <div className="min-h-dvh pt-safe pb-safe bg-slate-100 dark:bg-slate-900 p-4 landscape:p-8 font-sans relative flex flex-col items-center">
            <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                <div className="bg-slate-800 dark:bg-slate-950 p-6 text-white flex justify-between items-center relative">
                    <div className="flex items-center space-x-4 z-10">
                        {activeLeague?.logo && <img src={activeLeague.logo} alt="League Logo" className="w-16 h-16 object-contain bg-white rounded-full p-1" />}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-wider">{activeLeague?.name || 'MASL'} PRE-GAME SETUP</h1>
                            <span className="font-bold text-slate-300">4th Official Log</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8 space-y-8">
                    <section>
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b-2 border-slate-200 dark:border-slate-700 pb-3 mb-4">
                            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-100">Match Information</h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isDarkMode}
                                    aria-pressed={isDarkMode}
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="min-h-11 flex items-center gap-3 bg-slate-100 dark:bg-slate-700 px-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.97] active:brightness-95 transition"
                                >
                                    <span className={`relative inline-block w-11 h-6 rounded-full shrink-0 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-5' : ''}`}></span>
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-100">🌙 Dark Mode</span>
                                </button>

                                <button onClick={() => setShowCrewModal(true)} className={btnDark}>
                                    🧑‍⚖️ Officiating Crew
                                </button>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="league-select" className="text-sm font-bold text-slate-600 dark:text-slate-300">Select League:</label>
                                    <select id="league-select" name="league" value={gameData.league || 'MASL3'} onChange={handleInputChange} className="min-h-11 px-3 text-base border border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 rounded-lg bg-slate-50 font-bold shadow-sm">
                                        {LEAGUES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <MatchInfoBlock gameData={gameData} handleInputChange={handleInputChange} />
                    </section>

                    <section>
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b-2 border-slate-200 dark:border-slate-700 pb-3 mb-4">
                            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-100">Teams & Rosters</h2>
                            <button onClick={() => setShowStartersModal(true)} className={btnDark}>
                                👀 View Starting Lineups
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-8">
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

                <div className="bg-slate-50 dark:bg-slate-900 p-4 md:p-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 justify-between items-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span> Auto-Saving Enabled
                    </span>
                    <button onClick={handleProceedToKickoff} className="min-h-14 px-8 py-3 bg-green-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-green-700 active:scale-[0.97] active:brightness-95 transition">
                        PROCEED TO KICKOFF ➔
                    </button>
                </div>
            </div>

            <div className="w-full max-w-5xl flex flex-wrap gap-3 justify-between px-1">
                <button onClick={clearAllGameData} className="min-h-11 px-4 text-sm text-red-600 dark:text-red-400 font-bold border-2 border-red-500 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 active:scale-[0.97] active:brightness-95 transition">
                    ⚠️ End Match & Wipe All Data
                </button>
                <button onClick={onExportPDF} className="min-h-11 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 active:scale-[0.97] active:brightness-95 transition">
                    📥 Export Official PDF Worksheet
                </button>
            </div>

            <CrewEditorModal show={showCrewModal} onClose={() => setShowCrewModal(false)} gameData={gameData} handleInputChange={handleInputChange} />
            <StartersViewerModal showStartersModal={showStartersModal} setShowStartersModal={setShowStartersModal} gameData={gameData} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} awayRoster={awayRoster} homeRoster={homeRoster} />
            <RosterEditorModal activeRosterModal={activeRosterModal} setActiveRosterModal={setActiveRosterModal} gameData={gameData} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} awayRoster={awayRoster} setAwayRoster={setAwayRoster} homeRoster={homeRoster} setHomeRoster={setHomeRoster} awayBench={awayBench} setAwayBench={setAwayBench} homeBench={homeBench} setHomeBench={setHomeBench} newPlayer={newPlayer} setNewPlayer={setNewPlayer} newBench={newBench} setNewBench={setNewBench} />
            <BugReportModal 
                isOpen={showBugModal} 
                onClose={() => setShowBugModal(false)} 
                appVersion={appVersion}
            />
            <div className="w-full max-w-5xl flex flex-wrap gap-3 justify-between items-center px-1 mt-6">
                <button 
                    onClick={() => setShowBugModal(true)} 
                    className="min-h-11 px-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-[0.97] active:brightness-95 transition bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                    🐞 Report a Bug / Feedback
                </button>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1">
                    Author: Dave Wolgast | v{appVersion}
                </div>
            </div>
        </div>
    );
}
