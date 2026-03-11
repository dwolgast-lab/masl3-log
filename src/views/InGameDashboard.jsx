import React from 'react';
import { ACTION_BUTTONS, QUARTERS, LEAGUES } from '../config';
import ActivePenaltiesWidget from '../components/widgets/ActivePenaltiesWidget';
import ActiveInjuriesWidget from '../components/widgets/ActiveInjuriesWidget';

export default function InGameDashboard({
    gameData, awayCSSColor, homeCSSColor, awayScore, homeScore, quarter, gameEvents,
    setModalStep, setSummaryTeam, triggerAction, activePenaltiesAway, activePenaltiesHome,
    handlePPGoalScored, handlePenaltyExpired, togglePeriod, isPeriodRunning, setCurrentView,
    handleInjuryCleared, lastAddedEventId, setLastAddedEventId, startEditingEvent, deleteEvent,
    startEditingReleaseTime
}) {
    const activeInjuries = gameEvents.filter(ev => ev.type === 'Injury' && !ev.clearedInjury && ev.eligibleReturnTime);
    const activeLeague = LEAGUES.find(l => l.id === gameData.league);
    const lastEvent = lastAddedEventId ? gameEvents.find(e => e.id === lastAddedEventId) : null;

    const formatEventDescription = (ev) => {
        let text = `${ev.team} - ${ev.type}`;
        if (ev.entity && ev.entity.name) text += ` (${ev.entity.number ? '#' + ev.entity.number + ' ' : ''}${ev.entity.name})`;
        if (ev.warningReason) text += ` [${ev.warningReason}]`;
        if (ev.penalty) text += ` [${ev.penalty.code}]`;
        if (ev.time) text += ` @ ${ev.time} ${ev.quarter}`;
        return text;
    };

    return (
        <>
            <header className="flex justify-between items-center p-4 bg-white shadow z-10 relative">
                {/* LEFT: Prominent League Logo (ENLARGED) */}
                <div className="flex-1 flex items-center justify-start">
                    {activeLeague?.logo && <img src={activeLeague.logo} alt="League" className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-md" />}
                </div>
                
                {/* CENTER: Scoreboard */}
                <h1 className="flex-1 flex justify-center items-center space-x-6 text-4xl font-black tracking-wider uppercase">
                    <div className="flex items-center space-x-3">
                        {gameData.awayLogo && <img src={gameData.awayLogo} alt="Away" className="w-12 h-12 object-contain drop-shadow-md" />}
                        <span style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY'}</span> 
                    </div>

                    {/* UPDATED: Scorebox explicit Flex container */}
                    <div className="text-gray-400 font-mono text-5xl bg-gray-100 px-6 py-1 rounded-xl shadow-inner border border-gray-200 flex items-center space-x-4">
                        {awayScore} <span className="text-gray-300">-</span> {homeScore}
                    </div> 

                    <div className="flex items-center space-x-3">
                        <span style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME'}</span>
                        {gameData.homeLogo && <img src={gameData.homeLogo} alt="Home" className="w-12 h-12 object-contain drop-shadow-md" />}
                    </div>
                </h1>

                {/* RIGHT: Controls */}
                <div className="flex-1 flex items-center justify-end space-x-4">
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        {QUARTERS.map(q => (
                            <div key={q} className={`px-4 py-2 rounded-md font-bold transition-colors ${quarter === q ? 'bg-black text-white shadow' : 'text-gray-400'}`}>{q}</div>
                        ))}
                    </div>
                    <button onClick={() => setModalStep('EVENT_LOG')} className="flex items-center px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow hover:bg-slate-700">
                        Log <span className="ml-2 bg-white text-slate-800 px-2 py-0.5 rounded-full text-sm">{gameEvents.length}</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="w-1/2 p-4 flex flex-col border-r-4 border-gray-800 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase flex items-center space-x-3" style={{ color: awayCSSColor }}>
                            {gameData.awayLogo && <img src={gameData.awayLogo} alt="Away" className="w-8 h-8 object-contain" />}
                            <span>{gameData.awayTeam || 'AWAY TEAM'}</span>
                        </h2>
                        <button onClick={() => {setSummaryTeam('AWAY'); setModalStep('FOUL_SUMMARY');}} className="px-4 py-2 font-bold rounded shadow-sm border" style={{ color: awayCSSColor, borderColor: awayCSSColor }}>Foul Summary</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {ACTION_BUTTONS.map(btn => (
                            <button key={btn} onClick={() => triggerAction('AWAY', btn)} style={{ borderColor: awayCSSColor, color: awayCSSColor }} className="w-full py-4 bg-white border-[3px] text-lg font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-1/2 p-4 flex flex-col bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase flex items-center space-x-3" style={{ color: homeCSSColor }}>
                            {gameData.homeLogo && <img src={gameData.homeLogo} alt="Home" className="w-8 h-8 object-contain" />}
                            <span>{gameData.homeTeam || 'HOME TEAM'}</span>
                        </h2>
                        <button onClick={() => {setSummaryTeam('HOME'); setModalStep('FOUL_SUMMARY');}} className="px-4 py-2 font-bold rounded shadow-sm border" style={{ color: homeCSSColor, borderColor: homeCSSColor }}>Foul Summary</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {ACTION_BUTTONS.map(btn => (
                            <button key={btn} onClick={() => triggerAction('HOME', btn)} style={{ borderColor: homeCSSColor, color: homeCSSColor }} className="w-full py-4 bg-white border-[3px] text-lg font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
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
                startEditingReleaseTime={startEditingReleaseTime}
            />

            <ActiveInjuriesWidget activeInjuries={activeInjuries} handleInjuryCleared={handleInjuryCleared} />

            <footer className="flex justify-between items-center p-3 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 border-t-2 border-gray-200 h-[88px] shrink-0">
                <button onClick={togglePeriod} className={`shrink-0 px-8 h-full border-2 font-black tracking-wide rounded-lg transition shadow-sm ${isPeriodRunning ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100' : 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'}`}>
                    {isPeriodRunning ? `⏹ END ${quarter}` : `▶ START ${quarter}`}
                </button>
                
                {lastEvent ? (
                    <div className="flex-1 flex justify-center mx-4">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-inner flex items-center space-x-4 border-2 border-slate-700 max-w-2xl w-full">
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

                <div className="flex space-x-3 shrink-0 h-full">
                    <button onClick={() => setCurrentView('pregame')} className="px-6 h-full bg-slate-100 text-slate-700 font-black text-base rounded-lg shadow-sm border-2 border-slate-200 hover:bg-slate-200 transition">
                        ⚙️ SETUP
                    </button>
                    <button onClick={() => triggerAction('SYSTEM', 'Media Timeout')} className="px-6 h-full bg-orange-500 text-white font-black text-base rounded-lg shadow hover:bg-orange-600 transition">
                        MEDIA TIMEOUT
                    </button>
                </div>
            </footer>
        </>
    );
}