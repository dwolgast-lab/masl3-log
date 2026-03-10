import React from 'react';
import { ACTION_BUTTONS, QUARTERS, LEAGUES } from '../config';

export default function InGameDashboard({
    gameData, awayCSSColor, homeCSSColor, awayScore, homeScore, quarter, gameEvents,
    setModalStep, setSummaryTeam, triggerAction, activePenaltiesAway, activePenaltiesHome,
    handlePPGoalScored, handlePenaltyExpired, togglePeriod, isPeriodRunning, setCurrentView,
    handleInjuryCleared, lastAddedEventId, setLastAddedEventId, startEditingEvent, deleteEvent
}) {
    const activeInjuries = gameEvents.filter(ev => ev.type === 'Injury' && !ev.clearedInjury && ev.eligibleReturnTime);
    const activeLeague = LEAGUES.find(l => l.id === gameData.league);
    
    // Find the most recently added event for the Toast Banner
    const lastEvent = lastAddedEventId ? gameEvents.find(e => e.id === lastAddedEventId) : null;

    const renderCardSquares = (penalty, isJustServing) => {
        if (!penalty) return null;
        if ((penalty.code === 'Y6' || penalty.isCombo) && !isJustServing) return '🟦 🟨'; 
        if (penalty.color === 'Blue') return '🟦';
        if (penalty.color === 'Yellow') return '🟨';
        if (penalty.color === 'Red') return '🟥';
        return '';
    };

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
            <header className="flex justify-between items-center p-4 bg-white shadow z-10">
                <div className="flex items-center space-x-4">
                    {activeLeague?.logo && <img src={activeLeague.logo} alt="League" className="w-10 h-10 object-contain hidden md:block" />}
                    <button onClick={() => setCurrentView('pregame')} className="px-4 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100">⚙️ Setup</button>
                </div>
                
                <h1 className="text-4xl font-black tracking-wider uppercase flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        {gameData.awayLogo && <img src={gameData.awayLogo} alt="Away" className="w-12 h-12 object-contain drop-shadow-md" />}
                        <span style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY'}</span> 
                    </div>

                    <span className="text-gray-400 font-mono text-5xl bg-gray-100 px-6 py-1 rounded-xl shadow-inner border border-gray-200">
                        {awayScore} - {homeScore}
                    </span> 

                    <div className="flex items-center space-x-3">
                        <span style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME'}</span>
                        {gameData.homeLogo && <img src={gameData.homeLogo} alt="Home" className="w-12 h-12 object-contain drop-shadow-md" />}
                    </div>
                </h1>

                <div className="flex items-center space-x-4">
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
                            <button key={btn} onClick={() => triggerAction('AWAY', btn)} style={{ borderColor: awayCSSColor, color: awayCSSColor }} className="w-full py-4 bg-white border-