import React, { useState } from 'react';
import { ACTION_BUTTONS, QUARTERS, LEAGUES } from '../config';
import ActivePenaltiesWidget from '../components/widgets/ActivePenaltiesWidget';
import ActiveInjuriesWidget from '../components/widgets/ActiveInjuriesWidget';

export default function InGameDashboard({
    gameData, awayCSSColor, homeCSSColor, awayScore, homeScore, quarter, gameEvents, setGameEvents,
    setModalStep, setSummaryTeam, triggerAction, activePenaltiesAway, activePenaltiesHome,
    handlePPGoalScored, handlePenaltyExpired, togglePeriod, isPeriodRunning, setCurrentView,
    handleInjuryCleared, lastAddedEventId, setLastAddedEventId, startEditingEvent, deleteEvent,
    startEditingReleaseTime, isDarkMode
}) {
    const activeInjuries = gameEvents.filter(ev => ev.type === 'Injury' && !ev.clearedInjury && ev.eligibleReturnTime);
    const activeLeague = LEAGUES.find(l => l.id === gameData.league);
    const lastEvent = lastAddedEventId ? gameEvents.find(e => e.id === lastAddedEventId) : null;
    const isMASL = gameData.league === 'MASL';

    // Status Line Math
    const awayTOs = 2 - gameEvents.filter(e => e.type === 'Team Timeout' && e.team === 'AWAY').length;
    const homeTOs = 2 - gameEvents.filter(e => e.type === 'Team Timeout' && e.team === 'HOME').length;
    
    const checkVR = (teamId) => {
        const vrs = gameEvents.filter(e => e.type === 'Video Review' && e.initiator === 'Coach' && e.team === teamId);
        if (vrs.length === 0) return 'Y';
        const successful = vrs.filter(e => e.result === 'Overturned/Changed').length;
        return (vrs.length === 1 && successful === 1) ? 'Y' : 'N';
    };

    // Dark Mode Theme Classes
    const themeBg = isDarkMode ? 'bg-slate-900' : 'bg-gray-100';
    const panelBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
    const headerBg = isDarkMode ? 'bg-slate-800 shadow-lg border-b border-slate-700' : 'bg-white shadow';
    const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    const formatEventDescription = (ev) => {
        let text = `${ev.team} - ${ev.type}`;
        if (ev.entity && ev.entity.name) text += ` (${ev.entity.number ? '#' + ev.entity.number + ' ' : ''}${ev.entity.name})`;
        if (ev.warningReason) text += ` [${ev.warningReason}]`;
        if (ev.penalty) text += ` [${ev.penalty.code}]`;
        if (ev.time) text += ` @ ${ev.time} ${ev.quarter}`;
        return text;
    };

    return (
        <div className={`flex flex-col h-full w-full ${themeBg} transition-colors duration-300`}>
            <header className={`flex flex-col ${headerBg} z-10 w-full min-w-0`}>
                <div className="flex justify-between items-center p-3 md:p-4">
                    <div className="flex-none w-20 md:w-32 flex items-center justify-start">
                        {activeLeague?.logo && <img src={activeLeague.logo} alt="League" className={`w-16 h-16 md:w-28 md:h-28 object-contain drop-shadow-md ${isDarkMode ? 'brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' : ''}`} />}
                    </div>
                    
                    <div className="flex-1 flex justify-center items-center min-w-0 px-2 md:px-4">
                        <div className="flex flex-1 justify-end items-center space-x-2 md:space-x-4 min-w-0">
                            {gameData.awayLogo && <img src={gameData.awayLogo} alt="Away" className="w-8 h-8 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-md hidden sm:block" />}
                            <span className="truncate text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-wider" style={{ color: awayCSSColor, textShadow: isDarkMode ? '0px 2px 4px rgba(0,0,0,0.8)' : 'none' }}>
                                {gameData.awayTeam || 'AWAY'}
                            </span>
                        </div>

                        <div className={`shrink-0 font-mono text-3xl sm:text-4xl md:text-5xl px-3 md:px-8 py-1 rounded-xl shadow-inner border flex items-center justify-center mx-2 md:mx-6 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                            <span className="w-8 md:w-12 text-right">{awayScore}</span> 
                            <span className="mx-2 md:mx-4 opacity-50">-</span> 
                            <span className="w-8 md:w-12 text-left">{homeScore}</span>
                        </div> 

                        <div className="flex flex-1 justify-start items-center space-x-2 md:space-x-4 min-w-0">
                            <span className="truncate text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-wider" style={{ color: homeCSSColor, textShadow: isDarkMode ? '0px 2px 4px rgba(0,0,0,0.8)' : 'none' }}>
                                {gameData.homeTeam || 'HOME'}
                            </span>
                            {gameData.homeLogo && <img src={gameData.homeLogo} alt="Home" className="w-8 h-8 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-md hidden sm:block" />}
                        </div>
                    </div>

                    <div className="flex-none flex items-center justify-end space-x-2 md:space-x-4">
                        <div className={`rounded-lg p-1 hidden lg:flex ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                            {QUARTERS.map(q => (
                                <div key={q} className={`px-2 py-1 md:px-4 md:py-2 rounded-md font-bold transition-colors ${quarter === q ? (isDarkMode ? 'bg-white text-slate-900 shadow' : 'bg-black text-white shadow') : textMuted}`}>{q}</div>
                            ))}
                        </div>
                        <button onClick={() => setModalStep('EVENT_LOG')} className={`flex items-center px-4 py-2 md:px-6 md:py-3 font-bold md:text-lg rounded-lg shadow transition ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                            Log <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>{gameEvents.length}</span>
                        </button>
                    </div>
                </div>

                <div className={`flex justify-between items-center px-8 py-1.5 text-xs font-black tracking-widest uppercase border-t ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    <div className="flex-1 text-right pr-6 md:pr-[12rem]">
                        <span className="mr-4">Timeouts Left: <span className={awayTOs === 0 ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-slate-800')}>{awayTOs}</span></span>
                        {isMASL && <span>VR Challenge: <span className={checkVR('AWAY') === 'N' ? 'text-red-500' : 'text-green-500'}>{checkVR('AWAY')}</span></span>}
                    </div>
                    <div className="w-10"></div>
                    <div className="flex-1 text-left pl-6 md:pl-[12rem]">
                        <span className="mr-4">Timeouts Left: <span className={homeTOs === 0 ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-slate-800')}>{homeTOs}</span></span>
                        {isMASL && <span>VR Challenge: <span className={checkVR('HOME') === 'N' ? 'text-red-500' : 'text-green-500'}>{checkVR('HOME')}</span></span>}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <div className={`w-1/2 p-4 flex flex-col border-r-4 ${panelBg} ${isDarkMode ? 'border-slate-900' : 'border-gray-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase flex items-center space-x-3" style={{ color: awayCSSColor, textShadow: isDarkMode ? '0px 1px 3px rgba(0,0,0,0.8)' : 'none' }}>
                            {gameData.awayLogo && <img src={gameData.awayLogo} alt="Away" className="w-8 h-8 object-contain" />}
                            <span>{gameData.awayTeam || 'AWAY TEAM'}</span>
                        </h2>
                        <button onClick={() => {setSummaryTeam('AWAY'); setModalStep('FOUL_SUMMARY');}} className="px-4 py-2 font-bold rounded shadow-sm border" style={{ color: awayCSSColor, borderColor: awayCSSColor }}>Foul Summary</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {ACTION_BUTTONS.map(btn => (
                            <button key={btn} onClick={() => triggerAction('AWAY', btn)} style={{ borderColor: awayCSSColor, color: awayCSSColor }} className={`w-full py-4 border-[3px] text-lg font-bold rounded-xl shadow-sm transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 hover:text-white' : 'bg-white hover:bg-gray-50'}`}>
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`w-1/2 p-4 flex flex-col ${panelBg}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase flex items-center space-x-3" style={{ color: homeCSSColor, textShadow: isDarkMode ? '0px 1px 3px rgba(0,0,0,0.8)' : 'none' }}>
                            {gameData.homeLogo && <img src={gameData.homeLogo} alt="Home" className="w-8 h-8 object-contain" />}
                            <span>{gameData.homeTeam || 'HOME TEAM'}</span>
                        </h2>
                        <button onClick={() => {setSummaryTeam('HOME'); setModalStep('FOUL_SUMMARY');}} className="px-4 py-2 font-bold rounded shadow-sm border" style={{ color: homeCSSColor, borderColor: homeCSSColor }}>Foul Summary</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {ACTION_BUTTONS.map(btn => (
                            <button key={btn} onClick={() => triggerAction('HOME', btn)} style={{ borderColor: homeCSSColor, color: homeCSSColor }} className={`w-full py-4 border-[3px] text-lg font-bold rounded-xl shadow-sm transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 hover:text-white' : 'bg-white hover:bg-gray-50'}`}>
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <ActivePenaltiesWidget 
                activePenaltiesAway={activePenaltiesAway} activePenaltiesHome={activePenaltiesHome} 
                awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} 
                handlePPGoalScored={handlePPGoalScored} handlePenaltyExpired={handlePenaltyExpired} 
                startEditingReleaseTime={startEditingReleaseTime} isDarkMode={isDarkMode}
            />

            <ActiveInjuriesWidget activeInjuries={activeInjuries} handleInjuryCleared={handleInjuryCleared} isDarkMode={isDarkMode} />

            <footer className={`flex justify-between items-center p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-10 border-t-2 h-[88px] shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <button onClick={togglePeriod} className={`shrink-0 px-6 md:px-8 h-full border-2 font-black tracking-wide rounded-lg transition shadow-sm ${isPeriodRunning ? 'bg-red-900 border-red-500 text-red-100 hover:bg-red-800' : 'bg-green-900 border-green-500 text-green-100 hover:bg-green-800'}`}>
                    {isPeriodRunning ? `⏹ END ${quarter}` : `▶ START ${quarter}`}
                </button>
                
                {lastEvent ? (
                    <div className="flex-1 flex justify-center mx-2 md:mx-4">
                        <div className={`text-white px-4 py-2 rounded-xl shadow-inner flex items-center space-x-4 border-2 max-w-2xl w-full ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-900 border-slate-700'}`}>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black text-green-400 mb-0.5 tracking-wider uppercase">✅ Action Logged</div>
                                <div className="font-bold text-sm truncate">{formatEventDescription(lastEvent)}</div>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                                <button onClick={() => { startEditingEvent(lastEvent); setLastAddedEventId(null); }} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black rounded hover:bg-blue-500 transition">Edit</button>
                                <button onClick={() => { deleteEvent(lastEvent.id); setLastAddedEventId(null); }} className="px-4 py-1.5 bg-red-600 text-white text-xs font-black rounded hover:bg-red-500 transition">Undo</button>
                                <button onClick={() => setLastAddedEventId(null)} className="px-2 py-1.5 text-gray-400 hover:text-white transition font-bold">✕</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1" />
                )}

                <div className="flex space-x-2 md:space-x-3 shrink-0 h-full">
                    {/* MODIFIED: VR Button triggers Time Keypad via SYSTEM route */}
                    {isMASL && (
                        <button onClick={() => triggerAction('SYSTEM', 'Video Review')} className="px-4 md:px-6 h-full bg-purple-700 text-white font-black text-sm md:text-base rounded-lg shadow hover:bg-purple-600 transition border border-purple-500">
                            VIDEO REVIEW
                        </button>
                    )}
                    <button onClick={() => setCurrentView('pregame')} className={`px-4 md:px-6 h-full font-black text-sm md:text-base rounded-lg shadow-sm border-2 transition ${isDarkMode ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}>
                        ⚙️ SETUP
                    </button>
                    <button onClick={() => triggerAction('SYSTEM', 'Media Timeout')} className="px-4 md:px-6 h-full bg-orange-600 text-white font-black text-sm md:text-base rounded-lg shadow hover:bg-orange-500 transition border border-orange-500">
                        MEDIA TIMEOUT
                    </button>
                </div>
            </footer>
        </div>
    );
}