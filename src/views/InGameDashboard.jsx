import React from 'react';
import { ACTION_BUTTONS, QUARTERS } from '../config';

export default function InGameDashboard({
    gameData, awayCSSColor, homeCSSColor, awayScore, homeScore, quarter, gameEvents,
    setModalStep, setSummaryTeam, triggerAction, activePenaltiesAway, activePenaltiesHome,
    handlePPGoalScored, handlePenaltyExpired, togglePeriod, isPeriodRunning, setCurrentView,
    handleInjuryCleared
}) {
    // Determine active injuries
    const activeInjuries = gameEvents.filter(ev => ev.type === 'Injury' && !ev.clearedInjury && ev.eligibleReturnTime);

    return (
        <>
            <header className="flex justify-between items-center p-4 bg-white shadow z-10">
                <button onClick={() => setCurrentView('pregame')} className="px-4 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100">⚙️ Setup</button>
                <h1 className="text-4xl font-black tracking-wider uppercase flex items-center">
                    <span style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY'}</span> 
                    <span className="text-gray-400 mx-4 font-mono text-5xl bg-gray-100 px-4 py-1 rounded-xl shadow-inner border border-gray-200">{awayScore} - {homeScore}</span> 
                    <span style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME'}</span>
                </h1>
                <div className="flex bg-gray-200 rounded-lg p-1">
                    {QUARTERS.map(q => (
                        <div key={q} className={`px-6 py-2 rounded-md font-bold transition-colors ${quarter === q ? 'bg-black text-white shadow' : 'text-gray-400'}`}>{q}</div>
                    ))}
                </div>
                <button onClick={() => setModalStep('EVENT_LOG')} className="flex items-center px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow hover:bg-slate-700">
                    Game Log <span className="ml-2 bg-white text-slate-800 px-2 py-0.5 rounded-full text-sm">{gameEvents.length}</span>
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 p-4 flex flex-col border-r-4 border-gray-800 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase" style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY TEAM'}</h2>
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
                        <h2 className="text-3xl font-black uppercase" style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME TEAM'}</h2>
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

            {/* ACTIVE PENALTIES DASHBOARD */}
            <div className="h-40 bg-gray-100 border-t-4 border-gray-300 flex">
                <div className="w-1/2 p-3 border-r-4 border-gray-300 overflow-y-auto">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">Away Active Penalties</h3>
                    {activePenaltiesAway.map(ev => (
                        <div key={ev.id} className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow-sm border-l-4" style={{ borderColor: awayCSSColor }}>
                            <div>
                                <span className="font-bold text-gray-800 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                                {ev.servingPlayer && (
                                    <div className="text-xs text-gray-500 font-bold italic mb-1">
                                        (Served by: #{ev.servingPlayer.number} {ev.servingPlayer.name})
                                    </div>
                                )}
                                <div className="text-xs font-bold text-gray-500">Exp: {ev.releaseTime?.quarter} {ev.releaseTime?.time}</div>
                            </div>
                            <div className="flex flex-col space-y-1">
                                {ev.isReleasable && <button onClick={() => handlePPGoalScored(ev.id)} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 transition">PPG Scored</button>}
                                <button onClick={() => handlePenaltyExpired(ev.id)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border border-gray-200 hover:bg-gray-200 transition">Expired</button>
                            </div>
                        </div>
                    ))}
                    {activePenaltiesAway.length === 0 && <p className="text-xs text-gray-400 font-bold italic">No active penalties</p>}
                </div>
                <div className="w-1/2 p-3 overflow-y-auto">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">Home Active Penalties</h3>
                    {activePenaltiesHome.map(ev => (
                        <div key={ev.id} className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow-sm border-l-4" style={{ borderColor: homeCSSColor }}>
                            <div>
                                <span className="font-bold text-gray-800 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                                {ev.servingPlayer && (
                                    <div className="text-xs text-gray-500 font-bold italic mb-1">
                                        (Served by: #{ev.servingPlayer.number} {ev.servingPlayer.name})
                                    </div>
                                )}
                                <div className="text-xs font-bold text-gray-500">Exp: {ev.releaseTime?.quarter} {ev.releaseTime?.time}</div>
                            </div>
                            <div className="flex flex-col space-y-1">
                                {ev.isReleasable && <button onClick={() => handlePPGoalScored(ev.id)} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 transition">PPG Scored</button>}
                                <button onClick={() => handlePenaltyExpired(ev.id)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border border-gray-200 hover:bg-gray-200 transition">Expired</button>
                            </div>
                        </div>
                    ))}
                    {activePenaltiesHome.length === 0 && <p className="text-xs text-gray-400 font-bold italic">No active penalties</p>}
                </div>
            </div>

            {/* INJURY DASHBOARD (CONDITIONAL) */}
            {activeInjuries.length > 0 && (
                <div className="bg-red-50 border-t-4 border-red-300 flex flex-col p-3 overflow-x-auto min-h-24">
                    <h3 className="text-xs font-black text-red-800 uppercase mb-2 shrink-0">Active Injuries (Return Eligibility)</h3>
                    <div className="flex space-x-4">
                        {activeInjuries.map(ev => (
                            <div key={ev.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border-l-4 border-red-500 min-w-[250px]">
                                <div>
                                    <span className="font-bold text-gray-800 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                                    <div className="text-xs font-bold text-red-600 mt-1">Return: {ev.eligibleReturnTime.quarter} @ {ev.eligibleReturnTime.time}</div>
                                </div>
                                <button onClick={() => handleInjuryCleared(ev.id)} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200 hover:bg-red-200 transition ml-4">Dismiss</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DYNAMIC GLOBAL FOOTER */}
            <footer className="flex justify-between items-center p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 border-t-2 border-gray-200">
                <button onClick={togglePeriod} className={`px-12 py-3 border-2 font-black tracking-wide rounded-lg transition shadow-sm ${isPeriodRunning ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100' : 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'}`}>
                    {isPeriodRunning ? `⏹ END ${quarter}` : `▶ START ${quarter}`}
                </button>
                <button onClick={() => triggerAction('SYSTEM', 'Media Timeout')} className="px-8 py-3 bg-orange-500 text-white font-black text-lg rounded-lg shadow hover:bg-orange-600 transition">
                    MEDIA TIMEOUT
                </button>
            </footer>
        </>
    );
}