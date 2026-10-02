import { getPlayerFouls, readableTextOn } from '../utils';

export default function FoulSummary({ summaryTeam, gameData, awayRoster, homeRoster, gameEvents, awayCSSColor, homeCSSColor, onClose }) {
    const teamRoster = summaryTeam === 'AWAY' ? awayRoster : homeRoster;
    const teamColor = summaryTeam === 'AWAY' ? awayCSSColor : homeCSSColor;
    const teamName = summaryTeam === 'AWAY' ? gameData.awayTeam : gameData.homeTeam;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90dvh] overflow-hidden">
                <div className="p-4 flex justify-between items-center gap-2 shrink-0" style={{ backgroundColor: teamColor, color: readableTextOn(teamColor) }}>
                    <h2 className="text-lg md:text-2xl font-black uppercase min-w-0">{teamName || summaryTeam} - FOUL & PENALTY SUMMARY</h2>
                    <button onClick={onClose} className="shrink-0 min-h-11 min-w-11 font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition active:scale-[0.97] active:brightness-95">Close</button>
                </div>
                <div className="flex-1 overflow-x-auto overflow-y-auto bg-white dark:bg-slate-800 p-3 md:p-6">
                    <table className="w-full text-left border-collapse tabular-nums text-sm md:text-base">
                        <thead>
                            <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-600 dark:text-slate-300">Player</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-500 dark:text-slate-400 text-center border-l dark:border-slate-600 bg-slate-50 dark:bg-slate-900">Q1</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-900">Q2</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-800 dark:text-slate-100 text-center bg-slate-200 dark:bg-slate-700">1st Half</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-500 dark:text-slate-400 text-center border-l dark:border-slate-600 bg-slate-50 dark:bg-slate-900">Q3</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-900">Q4</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-900">OT</th>
                                <th className="py-3 px-1 md:px-2 font-bold text-slate-800 dark:text-slate-100 text-center bg-slate-200 dark:bg-slate-700">2nd Half/OT</th>
                                <th className="py-3 px-1 md:px-2 font-black text-slate-900 dark:text-white text-center border-l-4 border-slate-800 dark:border-slate-400 bg-slate-100 dark:bg-slate-900 text-lg">Total</th>
                                
                                {/* New Card Columns */}
                                <th className="py-3 px-1 md:px-2 font-black text-blue-600 dark:text-blue-300 text-center border-l dark:border-slate-600 bg-blue-50 dark:bg-blue-950 text-lg">B</th>
                                <th className="py-3 px-1 md:px-2 font-black text-yellow-700 dark:text-yellow-300 text-center bg-yellow-50 dark:bg-yellow-950 text-lg">Y</th>
                                <th className="py-3 px-1 md:px-2 font-black text-red-600 dark:text-red-300 text-center bg-red-50 dark:bg-red-950 text-lg">R</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamRoster.map(player => {
                                const fouls = getPlayerFouls(player, summaryTeam, gameEvents);
                                if (fouls.total === 0 && fouls.blueCards === 0 && fouls.yellowCards === 0 && fouls.redCards === 0) return null; 
                                return (
                                    <tr key={player.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="py-3 px-1 md:px-2 flex items-center">
                                            <span className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-full font-black text-sm mr-2 md:mr-3 border shrink-0" style={{ borderColor: teamColor }}>{player.number}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{player.name}</span>
                                        </td>
                                        <td className="py-3 px-1 md:px-2 text-center text-slate-600 dark:text-slate-300 border-l dark:border-slate-600 bg-slate-50 dark:bg-slate-900">{fouls.q1 || '-'}</td>
                                        <td className="py-3 px-1 md:px-2 text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">{fouls.q2 || '-'}</td>
                                        <td className={`py-3 px-1 md:px-2 text-center font-bold text-lg bg-slate-200 dark:bg-slate-700 ${fouls.firstHalf === 4 ? 'text-blue-600' : (fouls.firstHalf >= 3 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100')}`}>{fouls.firstHalf}</td>
                                        <td className="py-3 px-1 md:px-2 text-center text-slate-600 dark:text-slate-300 border-l dark:border-slate-600 bg-slate-50 dark:bg-slate-900">{fouls.q3 || '-'}</td>
                                        <td className="py-3 px-1 md:px-2 text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">{fouls.q4 || '-'}</td>
                                        <td className="py-3 px-1 md:px-2 text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">{fouls.ot || '-'}</td>
                                        <td className={`py-3 px-1 md:px-2 text-center font-bold text-lg bg-slate-200 dark:bg-slate-700 ${fouls.secondHalf === 4 ? 'text-blue-600' : (fouls.secondHalf >= 3 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100')}`}>{fouls.secondHalf}</td>
                                        <td className={`py-3 px-1 md:px-2 text-center font-black text-xl border-l-4 border-slate-800 dark:border-slate-400 bg-slate-100 dark:bg-slate-900 ${fouls.total >= 5 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{fouls.total}</td>
                                        
                                        {/* Card Renderings */}
                                        <td className="py-3 px-1 md:px-2 text-center font-bold text-blue-600 dark:text-blue-300 border-l dark:border-slate-600 bg-blue-50 dark:bg-blue-950 text-lg">{fouls.blueCards > 0 ? fouls.blueCards : '-'}</td>
                                        <td className="py-3 px-1 md:px-2 text-center font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950 text-lg">{fouls.yellowCards > 0 ? fouls.yellowCards : '-'}</td>
                                        <td className="py-3 px-1 md:px-2 text-center font-bold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950 text-lg">{fouls.redCards > 0 ? fouls.redCards : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {gameEvents.filter(ev => ev.team === summaryTeam && (ev.type === 'Log Foul' || ev.type === 'Time Penalty')).length === 0 && (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-12 font-bold italic">No fouls or penalties logged for this team yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}