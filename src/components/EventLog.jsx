import React from 'react';

export default function EventLog({ gameEvents, setModalStep, awayCSSColor, homeCSSColor, gameData, startEditingEvent, deleteEvent }) {
    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-4 bg-slate-800 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-black uppercase">Official Game Log</h2>
                    <button onClick={() => setModalStep(null)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 shadow transition">Close</button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
                    {gameEvents.length === 0 && <div className="text-center text-gray-400 py-12 font-bold italic">No events logged yet.</div>}
                    
                    {gameEvents.map(event => (
                        <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                            
                            {event.type === 'Period Marker' ? (
                                <div className="flex items-center space-x-6 w-full">
                                    <div className="flex flex-col items-center justify-center bg-gray-200 w-16 h-16 rounded-lg">
                                        <span className="text-xs font-bold text-gray-600">{event.quarter}</span>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">MATCH CLOCK</span>
                                        <span className="text-xl font-black text-gray-800 uppercase">{event.action} {event.quarter}</span>
                                        <span className="font-bold text-blue-600 mt-1">⏱ Real-world time: {event.realTime}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-6">
                                    <div className="flex flex-col items-center justify-center bg-gray-100 w-16 h-16 rounded-lg shrink-0">
                                        <span className="text-xs font-bold text-gray-500">{event.quarter}</span>
                                        {event.time && <span className="font-black text-gray-800">{event.time}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            {event.team !== 'SYSTEM' && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: event.team === 'AWAY' ? awayCSSColor : homeCSSColor }}></span>}
                                            <span className="font-bold text-gray-500 uppercase text-xs">
                                                {event.team === 'SYSTEM' ? 'SYSTEM' : (event.team === 'AWAY' ? gameData.awayTeam || 'AWAY' : gameData.homeTeam || 'HOME')}
                                            </span>
                                        </div>
                                        
                                        <span className="text-xl font-black text-gray-800 uppercase flex items-center">
                                            {event.type === 'Log Foul' ? 'FOUL' : event.type}
                                        </span>
                                        
                                        {event.penalty?.code && (
                                            <div className="text-sm font-bold mt-1" style={{ color: event.penalty.color === 'Yellow' ? '#b45309' : event.penalty.color.toLowerCase() }}>
                                                [{event.penalty.code} - {event.penalty.desc}]
                                            </div>
                                        )}
                                        {event.type === 'Team Warnings' && event.warningReason && (
                                            <div className="text-sm font-bold mt-1 text-orange-600">
                                                [Reason: {event.warningReason}]
                                            </div>
                                        )}
                                        
                                        <span className="font-bold text-gray-600 mt-1 flex items-center flex-wrap">
                                            {typeof event.entity === 'string' ? event.entity : `#${event.entity?.number} - ${event.entity?.name}`}
                                            
                                            {event.servingPlayer && (
                                                <span className="text-sm font-bold text-gray-500 ml-2 italic">
                                                    (Served by: #{event.servingPlayer.number} {event.servingPlayer.name})
                                                </span>
                                            )}

                                            {event.assist && (
                                                <span className="text-sm font-bold text-blue-600 ml-2 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                    {typeof event.assist === 'string' ? `(${event.assist})` : `(Ast: #${event.assist?.number} ${event.assist?.name})`}
                                                </span>
                                            )}

                                            {event.goalFlags && (event.goalFlags.pp || event.goalFlags.shootout || event.goalFlags.pk) && (
                                                <span className="text-xs font-black text-purple-600 ml-2 border border-purple-300 bg-purple-50 px-2 py-0.5 rounded">
                                                    {[event.goalFlags.pp ? 'PP' : '', event.goalFlags.shootout ? 'SO' : '', event.goalFlags.pk ? 'PK' : ''].filter(Boolean).join(', ')}
                                                </span>
                                            )}
                                        </span>

                                        {event.type === 'Injury' && event.eligibleReturnTime && (
                                            <div className="mt-2 text-xs font-bold p-2 bg-green-50 text-green-700 rounded-md border border-green-200 inline-block">
                                                Eligible to Return: {event.eligibleReturnTime.quarter} at {event.eligibleReturnTime.time}
                                            </div>
                                        )}

                                        {event.type === 'Time Penalty' && event.releaseTime && (
                                            <div className="mt-2 text-xs font-bold p-2 bg-gray-100 rounded-md border inline-block">
                                                {event.actualReleaseTime ? (
                                                    <span className="text-green-600">
                                                        <strike className="text-gray-400 mr-2">Exp: {event.releaseTime.quarter} {event.releaseTime.time}</strike>
                                                        Released Early: {event.actualReleaseTime.quarter} {event.actualReleaseTime.time} (PPG)
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-700">
                                                        {event.majorReleaseTime ? 'Teammate Release' : 'Scheduled Release'}: {event.releaseTime.quarter} {event.releaseTime.time}
                                                        {event.majorReleaseTime && ` | Offender Release: ${event.majorReleaseTime.quarter} ${event.majorReleaseTime.time}`}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3 shrink-0 ml-4">
                                {event.entity && event.type !== 'Period Marker' && event.entity !== 'Team' && (
                                    <button onClick={() => startEditingEvent(event)} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition">Edit</button>
                                )}
                                <button onClick={() => deleteEvent(event.id)} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}