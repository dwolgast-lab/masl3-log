import React from 'react';
import { robustNumericalSort } from '../../ocrEngine';
import { readableTextOn } from '../../utils';

export default function StartersViewerModal({
    showStartersModal, setShowStartersModal, gameData, awayCSSColor, homeCSSColor, awayRoster, homeRoster
}) {
    if (!showStartersModal) return null;

    const getSortedStarters = (roster) => roster.filter(p => p.isStarter).sort(robustNumericalSort);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90dvh] overflow-hidden">
                <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white flex justify-between items-center gap-3 shrink-0">
                    <h2 className="text-2xl font-black uppercase">STARTING LINEUPS</h2>
                    <button onClick={() => setShowStartersModal(false)} className="min-h-11 min-w-11 font-bold bg-slate-900 dark:bg-slate-700 text-white px-4 rounded hover:bg-slate-700 shadow active:scale-[0.97] active:brightness-95 transition">Close</button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/2 min-w-0 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <div className="p-4 text-center font-black text-xl uppercase shrink-0 shadow-sm truncate" style={{ backgroundColor: awayCSSColor, color: readableTextOn(awayCSSColor) }}>{gameData.awayTeam || 'Away TEAM'}</div>
                        <div className="p-3 md:p-6 overflow-y-auto flex-1 space-y-3">
                            {getSortedStarters(awayRoster).map(player => (
                                <div key={player.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                    <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full font-black text-lg tabular-nums text-slate-800 dark:text-slate-100 border-2" style={{ borderColor: awayCSSColor }}>{player.number}</span>
                                    <span className="min-w-0 font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100">{player.name}</span>
                                    <div className="ml-auto flex gap-1 shrink-0">
                                        {player.isGK && <span className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded">GK</span>}
                                        {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 text-xs font-bold px-2 py-1 rounded">© Capt</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2 min-w-0 flex flex-col bg-slate-50 dark:bg-slate-800">
                        <div className="p-4 text-center font-black text-xl uppercase shrink-0 shadow-sm truncate" style={{ backgroundColor: homeCSSColor, color: readableTextOn(homeCSSColor) }}>{gameData.homeTeam || 'Home TEAM'}</div>
                        <div className="p-3 md:p-6 overflow-y-auto flex-1 space-y-3">
                            {getSortedStarters(homeRoster).map(player => (
                                <div key={player.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                    <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full font-black text-lg tabular-nums text-slate-800 dark:text-slate-100 border-2" style={{ borderColor: homeCSSColor }}>{player.number}</span>
                                    <span className="min-w-0 font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100">{player.name}</span>
                                    <div className="ml-auto flex gap-1 shrink-0">
                                        {player.isGK && <span className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded">GK</span>}
                                        {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 text-xs font-bold px-2 py-1 rounded">© Capt</span>}
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
