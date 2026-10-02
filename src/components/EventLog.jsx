import React from 'react';

export default function EventLog({ 
    gameEvents, setModalStep, awayCSSColor, homeCSSColor, gameData, 
    startEditingEvent, deleteEvent, startEditingReleaseTime 
}) {
    
    const getEventDescription = (ev, isSystemContext = false) => {
        if (ev.type === 'Time Penalty') {
            const code = ev.penalty?.code ? `[${ev.penalty.code}]` : '';
            const outTimeObj = ev.majorReleaseTime || ev.actualReleaseTime || ev.releaseTime;
            
            return (
                <div>
                    <div className="font-bold">{ev.type} {code}</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">{ev.penalty?.desc}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">
                        Exp: {outTimeObj ? `${outTimeObj.quarter} ${outTimeObj.time}` : '---'}
                    </div>
                </div>
            );
        }
        if (ev.type === 'Goal / Assist') {
            const flags = [];
            if (ev.goalFlags?.pp) flags.push('PP');
            if (ev.goalFlags?.pk) flags.push('PK');
            if (ev.goalFlags?.shootout) flags.push('SO');
            const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
            
            const isPKorSO = ev.goalFlags?.pk || ev.goalFlags?.shootout;
            const assistName = typeof ev.assist === 'string' ? ev.assist : ev.assist?.name;
            const hasAssist = assistName && assistName !== 'Unassisted';
            
            return (
                <div>
                    <div className="font-bold text-green-700 dark:text-green-400">{ev.type}{flagStr}</div>
                    {!isPKorSO && hasAssist && <div className="text-sm mt-1">Assist: {assistName}</div>}
                    {!isPKorSO && !hasAssist && <div className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">--unassisted--</div>}
                </div>
            );
        }
        if (ev.type === 'Log Foul') {
            const isFirstHalf = ['Q1', 'Q2'].includes(ev.quarter);
            
            const historicalFouls = gameEvents.filter(e => 
                e.type === 'Log Foul' && 
                e.team === ev.team && 
                e.entity?.id === ev.entity?.id && 
                e.id <= ev.id
            );
            
            const gameCount = historicalFouls.length;
            const halfCount = historicalFouls.filter(e => {
                const eFirstHalf = ['Q1', 'Q2'].includes(e.quarter);
                return isFirstHalf === eFirstHalf;
            }).length;

            return (
                <div>
                    <div className="font-bold">Foul Count (half): {halfCount}</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">Foul Count (game): {gameCount}</div>
                </div>
            );
        }
        if (ev.type === 'Team Warnings') return <div><div className="font-bold text-orange-600 dark:text-orange-400">Warning</div><div className="text-sm">{ev.warningReason}</div></div>;
        if (ev.type === 'Team Timeout' || ev.type === 'Media Timeout') {
            return (
                <div>
                    <div className="font-bold">{ev.type}</div>
                    <div className={`text-sm font-bold mt-1 ${isSystemContext ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>@ {ev.time}</div>
                </div>
            );
        }
        if (ev.type === 'Injury') return <div><div className="font-bold text-red-600 dark:text-red-400">Injury Time-Out</div><div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Return: {ev.eligibleReturnTime ? `${ev.eligibleReturnTime.quarter} ${ev.eligibleReturnTime.time}` : '---'}</div></div>;
        if (ev.type === 'Period Marker') {
            return (
                <div className="font-black text-white text-lg">
                    {ev.action} {ev.quarter} 
                    <span className="block text-sm text-white font-bold mt-1">@ {ev.realTime}</span>
                </div>
            );
        }
        if (ev.type === 'Video Review') {
            const isOverturned = ev.result === 'Overturned/Changed';
            return (
                <div>
                    <div className="font-bold text-purple-700 dark:text-purple-300">Reason: <span className="font-normal text-slate-800 dark:text-slate-100">{ev.reason}</span></div>
                    {ev.subReason && <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">Spec: <span className="font-normal text-slate-600 dark:text-slate-400">{ev.subReason}</span></div>}
                    <div className={`text-sm font-black mt-2 uppercase tracking-wide ${isOverturned ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {ev.result}
                    </div>
                    {ev.flagCollected && <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Flag Collected</div>}
                </div>
            );
        }
        
        return <div>{ev.type}</div>;
    };

    const getCardColor = (colorStr) => {
        if (colorStr === 'Blue') return 'bg-[#0096FF] border-[#0077CC]';
        if (colorStr === 'Yellow') return 'bg-[#FFCC00] border-[#E6B800]';
        if (colorStr === 'Red') return 'bg-[#ED1C24] border-[#CC0000]';
        return 'bg-gray-400 border-gray-500';
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90dvh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10">
                    <h2 className="text-2xl font-black uppercase tracking-wider">Match Timeline</h2>
                    <button onClick={() => setModalStep(null)} className="min-h-11 font-bold bg-slate-900 dark:bg-slate-700 text-white px-5 py-2 rounded-lg hover:bg-slate-700 shadow transition active:scale-[0.97] active:brightness-95">
                        Close Log
                    </button>
                </div>

                {/* Legend & Column Headers */}
                <div className="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10 shrink-0 px-4 md:px-8 py-3">
                    <div className="flex-1 min-w-0 truncate text-left font-black text-lg uppercase" style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY'}</div>
                    <div className="w-24 text-center font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest pt-1">Time</div>
                    <div className="flex-1 min-w-0 truncate text-right font-black text-lg uppercase" style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME'}</div>
                </div>

                {/* Timeline Body */}
                <div className="flex-1 overflow-y-auto p-4 relative pb-20">
                    {/* The Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 transform -translate-x-1/2 rounded-full"></div>

                    {gameEvents.length === 0 && (
                        <div className="text-center text-slate-500 dark:text-slate-400 font-bold mt-10 text-xl relative z-10 bg-slate-100 dark:bg-slate-900 inline-block mx-auto px-6 py-2 rounded-full border-2 border-slate-300 dark:border-slate-600 left-1/2 transform -translate-x-1/2">
                            No Events Logged
                        </div>
                    )}

                    <div className="space-y-6 relative z-10">
                        {gameEvents.map(ev => {
                            const isAway = ev.team === 'AWAY';
                            const isHome = ev.team === 'HOME';
                            const isSystem = ev.team === 'SYSTEM';

                            const timePill = (
                                <div className={`w-20 md:w-28 shrink-0 flex flex-col items-center justify-center bg-white dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-600 shadow-md rounded-full px-2 z-20 ${ev.type === 'Log Foul' ? 'py-2' : 'py-1'}`}>
                                    <span className={`font-black text-slate-500 dark:text-slate-400 uppercase ${ev.type === 'Log Foul' ? 'text-sm' : 'text-xs'}`}>{ev.quarter}</span>
                                    {ev.type !== 'Log Foul' && (
                                        <span className="text-lg font-mono font-bold tabular-nums text-slate-800 dark:text-slate-100 leading-none">{ev.time || '--:--'}</span>
                                    )}
                                </div>
                            );

                            const eventCard = (
                                <div className={`flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-t-4 rounded-xl shadow-md py-4 w-full min-w-0 max-w-md relative hover:shadow-lg transition-shadow ${isAway ? 'border-l pl-4 pr-12' : 'border-r pr-4 pl-12'}`} 
                                     style={{ borderTopColor: isAway ? awayCSSColor : (isHome ? homeCSSColor : '#64748b') }}>
                                    
                                    {!isSystem && (
                                        <img 
                                            src={isAway ? gameData.awayLogo : gameData.homeLogo} 
                                            alt="team-logo" 
                                            className={`absolute top-4 ${isAway ? 'right-3' : 'left-3'} w-8 h-8 object-contain drop-shadow-sm opacity-90`}
                                        />
                                    )}

                                    {!isSystem && (
                                        <div className="flex items-center justify-start mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                            <span className="font-black text-lg text-slate-800 dark:text-slate-100 mr-2">
                                                {ev.entity?.number ? `#${ev.entity.number} ` : ''} 
                                                
                                                {/* MODIFIED: Safely Render Headers for special events like VR without Player Entities */}
                                                {ev.type === 'Video Review' 
                                                    ? (ev.initiator === 'Referee' ? 'Referee Review' : 'Coach Challenge') 
                                                    : (ev.entity?.name || (typeof ev.entity === 'string' ? ev.entity : 'Unknown'))
                                                }
                                            </span>
                                            
                                            {ev.type === 'Time Penalty' && ev.penalty?.color && !ev.isJustServing && (
                                                <div className="flex space-x-1">
                                                    {ev.penalty.code === 'Y6' || ev.penalty.isCombo ? (
                                                        <>
                                                            <div className={`w-4 h-6 rounded border shadow-sm ${getCardColor('Blue')}`}></div>
                                                            <div className={`w-4 h-6 rounded border shadow-sm ${getCardColor('Yellow')}`}></div>
                                                        </>
                                                    ) : (
                                                        <div className={`w-4 h-6 rounded border shadow-sm ${getCardColor(ev.penalty.color)}`}></div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 text-slate-800 dark:text-slate-100">
                                        {getEventDescription(ev, false)}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        <button onClick={() => startEditingEvent(ev)} className="min-h-11 px-4 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-sm font-bold rounded hover:bg-blue-100 transition active:scale-[0.97] active:brightness-95">Edit</button>
                                        {ev.type === 'Time Penalty' && <button onClick={() => startEditingReleaseTime(ev.id)} className="min-h-11 px-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 text-sm font-bold rounded hover:bg-yellow-100 transition active:scale-[0.97] active:brightness-95">Edit Exp.</button>}
                                        <button onClick={() => deleteEvent(ev.id)} className="min-h-11 px-4 ml-auto bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-sm font-bold rounded hover:bg-red-100 transition active:scale-[0.97] active:brightness-95">Delete</button>
                                    </div>
                                </div>
                            );

                            if (isSystem && ev.type !== 'Video Review') {
                                return (
                                    <div key={ev.id} className="flex justify-center w-full relative">
                                        <div className={`flex flex-col items-center justify-center text-white border-4 shadow-xl rounded-xl py-2 px-6 z-20 w-full max-w-xs text-center ${ev.type === 'Media Timeout' ? 'bg-orange-500 border-orange-600' : 'bg-slate-800 border-slate-900 dark:bg-slate-700 dark:border-slate-500'}`}>
                                            {getEventDescription(ev, true)}
                                            <button onClick={() => deleteEvent(ev.id)} className={`min-h-11 px-4 mt-1 text-sm underline ${ev.type === 'Media Timeout' ? 'text-orange-100 hover:text-white' : 'text-gray-300 hover:text-red-300'}`}>Delete</button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={ev.id} className="flex items-center w-full relative">
                                    <div className="flex-1 min-w-0 flex justify-end pr-4 md:pr-8">
                                        {isAway ? eventCard : null}
                                    </div>

                                    {ev.type !== 'Video Review' ? timePill : (isSystem ? timePill : null)}

                                    <div className="flex-1 min-w-0 flex justify-start pl-4 md:pl-8">
                                        {isHome ? eventCard : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}