import React from 'react';

export default function EventLog({ 
    gameEvents, setModalStep, awayCSSColor, homeCSSColor, gameData, 
    startEditingEvent, deleteEvent, startEditingReleaseTime 
}) {
    
    const getEventDescription = (ev) => {
        if (ev.type === 'Time Penalty') {
            const code = ev.penalty?.code ? `[${ev.penalty.code}]` : '';
            // NEW: Fallback to actualReleaseTime if available
            const outTimeObj = ev.actualReleaseTime || ev.releaseTime;
            
            return (
                <div>
                    <div className="font-bold">{ev.type} {code}</div>
                    <div className="text-sm text-gray-700 mt-1">{ev.penalty?.desc}</div>
                    <div className="text-xs text-gray-500 font-bold mt-2">
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
            
            return (
                <div>
                    <div className="font-bold text-green-700">{ev.type}{flagStr}</div>
                    {ev.assist && <div className="text-sm mt-1">Assist: {ev.assist.name}</div>}
                    {!ev.assist && <div className="text-sm text-gray-500 italic mt-1">Unassisted</div>}
                </div>
            );
        }
        if (ev.type === 'Log Foul') return <div className="font-bold">Foul Logged</div>;
        if (ev.type === 'Team Warnings') return <div><div className="font-bold text-orange-600">Warning</div><div className="text-sm">{ev.warningReason}</div></div>;
        if (ev.type === 'Team Timeout' || ev.type === 'Media Timeout') {
            return (
                <div>
                    <div className="font-bold">{ev.type}</div>
                    <div className="text-sm font-bold text-gray-200 mt-1">@ {ev.time}</div>
                </div>
            );
        }
        if (ev.type === 'Injury') return <div><div className="font-bold text-red-600">Injury Time-Out</div><div className="text-xs text-gray-500 font-bold mt-1">Return: {ev.eligibleReturnTime ? `${ev.eligibleReturnTime.quarter} ${ev.eligibleReturnTime.time}` : '---'}</div></div>;
        if (ev.type === 'Period Marker') {
            return (
                <div className="font-black text-white text-lg">
                    {ev.action} {ev.quarter} 
                    <span className="block text-sm text-white font-bold mt-1">@ {ev.realTime}</span>
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
            <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10">
                    <h2 className="text-2xl font-black uppercase tracking-wider">Match Timeline</h2>
                    <button onClick={() => setModalStep(null)} className="font-bold bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-700 shadow transition">
                        Close Log
                    </button>
                </div>

                {/* Legend & Column Headers */}
                <div className="flex bg-white border-b shadow-sm z-10 shrink-0 px-8 py-3">
                    <div className="flex-1 text-left font-black text-lg uppercase" style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY'}</div>
                    <div className="w-24 text-center font-bold text-gray-400 text-xs uppercase tracking-widest pt-1">Time</div>
                    <div className="flex-1 text-right font-black text-lg uppercase" style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME'}</div>
                </div>

                {/* Timeline Body */}
                <div className="flex-1 overflow-y-auto p-4 relative pb-20">
                    {/* The Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300 transform -translate-x-1/2 rounded-full"></div>

                    {gameEvents.length === 0 && (
                        <div className="text-center text-gray-400 font-bold mt-10 text-xl relative z-10 bg-gray-100 inline-block mx-auto px-6 py-2 rounded-full border-2 border-gray-300 left-1/2 transform -translate-x-1/2">
                            No Events Logged
                        </div>
                    )}

                    <div className="space-y-6 relative z-10">
                        {gameEvents.map(ev => {
                            const isAway = ev.team === 'AWAY';
                            const isHome = ev.team === 'HOME';
                            const isSystem = ev.team === 'SYSTEM';

                            // The pill that sits strictly on the center line
                            const timePill = (
                                <div className="w-20 md:w-28 shrink-0 flex flex-col items-center justify-center bg-white border-4 border-gray-300 shadow-md rounded-full py-1 px-2 z-20">
                                    <span className="text-xs font-black text-gray-500 uppercase">{ev.quarter}</span>
                                    <span className="text-lg font-mono font-bold text-slate-800 leading-none">{ev.time || '--:--'}</span>
                                </div>
                            );

                            // The Event Card
                            const eventCard = (
                                <div className={`flex flex-col bg-white border-t-4 rounded-xl shadow-md py-4 w-full max-w-sm relative hover:shadow-lg transition-shadow ${isAway ? 'border-l pl-4 pr-12' : 'border-r pr-4 pl-12'}`} 
                                     style={{ borderTopColor: isAway ? awayCSSColor : (isHome ? homeCSSColor : '#64748b') }}>
                                    
                                    {/* Logo at edge closest to center */}
                                    {!isSystem && (
                                        <img 
                                            src={isAway ? gameData.awayLogo : gameData.homeLogo} 
                                            alt="team-logo" 
                                            className={`absolute top-4 ${isAway ? 'right-3' : 'left-3'} w-8 h-8 object-contain drop-shadow-sm opacity-90`}
                                        />
                                    )}

                                    {/* Player Info / Penalty Card Icons */}
                                    {!isSystem && (
                                        <div className="flex items-center justify-start mb-2 border-b pb-2">
                                            <span className="font-black text-lg text-gray-800 mr-2">
                                                {ev.entity?.number ? `#${ev.entity.number} ` : ''} 
                                                {ev.entity?.name || (typeof ev.entity === 'string' ? ev.entity : 'Unknown')}
                                            </span>
                                            
                                            {/* Render Card Icons directly following name */}
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

                                    {/* Event Description */}
                                    <div className="flex-1 text-gray-800">
                                        {getEventDescription(ev)}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={`flex mt-4 space-x-2 ${isHome ? 'justify-end' : 'justify-start'}`}>
                                        <button onClick={() => startEditingEvent(ev)} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black rounded hover:bg-blue-100 transition">Edit</button>
                                        {ev.type === 'Time Penalty' && <button onClick={() => startEditingReleaseTime(ev.id)} className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-black rounded hover:bg-yellow-100 transition">Edit Exp.</button>}
                                        <button onClick={() => deleteEvent(ev.id)} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-black rounded hover:bg-red-100 transition">Delete</button>
                                    </div>
                                </div>
                            );

                            return (
                                <div key={ev.id} className="flex items-center w-full relative">
                                    
                                    {/* LEFT SIDE (AWAY) */}
                                    <div className="flex-1 flex justify-end pr-4 md:pr-8">
                                        {isAway ? eventCard : null}
                                    </div>

                                    {/* CENTER LINE (TIME) */}
                                    {isSystem ? (
                                        // System events hijack the center column completely
                                        <div className="shrink-0 flex flex-col items-center justify-center bg-slate-800 text-white border-4 border-slate-900 shadow-xl rounded-xl py-2 px-6 z-20 w-48 md:w-64 text-center mx-[-4rem]">
                                            {getEventDescription(ev)}
                                            <button onClick={() => deleteEvent(ev.id)} className="mt-2 text-[10px] text-gray-400 hover:text-red-400 underline">Delete</button>
                                        </div>
                                    ) : timePill}

                                    {/* RIGHT SIDE (HOME) */}
                                    <div className="flex-1 flex justify-start pl-4 md:pl-8">
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