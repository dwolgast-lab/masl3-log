import React from 'react';
import { robustNumericalSort } from '../../ocrEngine';

export default function StartersViewerModal({
    showStartersModal, setShowStartersModal, gameData, awayCSSColor, homeCSSColor, awayRoster, homeRoster
}) {
    if (!showStartersModal) return null;

    const getSortedStarters = (roster) => roster.filter(p => p.isStarter).sort(robustNumericalSort);

    return (
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
    );
}