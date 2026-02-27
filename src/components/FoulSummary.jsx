import { getPlayerFouls } from '../utils';

export default function FoulSummary({ summaryTeam, gameData, awayRoster, homeRoster, gameEvents, awayCSSColor, homeCSSColor, onClose }) {
    const teamRoster = summaryTeam === 'AWAY' ? awayRoster : homeRoster;
    const teamColor = summaryTeam === 'AWAY' ? awayCSSColor : homeCSSColor;
    const teamName = summaryTeam === 'AWAY' ? gameData.awayTeam : gameData.homeTeam;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: teamColor }}>
                    <h2 className="text-2xl font-black uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{teamName || summaryTeam} - FOUL SUMMARY</h2>
                    <button onClick={onClose} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Close</button>
                </div>
                <div className="flex-1 overflow-x-auto overflow-y-auto bg-white p-6">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b-2 border-gray-300">
                                <th className="py-3 px-2 font-bold text-gray-600">Player</th>
                                <th className="py-3 px-2 font-bold text-gray-500 text-center border-l bg-gray-50">Q1</th>
                                <th className="py-3 px-2 font-bold text-gray-500 text-center bg-gray-50">Q2</th>
                                <th className="py-3 px-2 font-bold text-gray-800 text-center bg-gray-200">1st Half</th>
                                <th className="py-3 px-2 font-bold text-gray-500 text-center border-l bg-gray-50">Q3</th>
                                <th className="py-3 px-2 font-bold text-gray-500 text-center bg-gray-50">Q4</th>
                                <th className="py-3 px-2 font-bold text-gray-500 text-center bg-gray-50">OT</th>
                                <th className="py-3 px-2 font-bold text-gray-800 text-center bg-gray-200">2nd Half/OT</th>
                                <th className="py-3 px-2 font-black text-gray-900 text-center border-l-4 border-gray-800 bg-gray-100 text-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamRoster.map(player => {
                                const fouls = getPlayerFouls(player, summaryTeam, gameEvents);
                                if (fouls.total === 0) return null; 
                                return (
                                    <tr key={player.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-2 flex items-center">
                                            <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-black text-sm mr-3 border" style={{ borderColor: teamColor }}>{player.number}</span>
                                            <span className="font-bold text-gray-800">{player.name}</span>
                                        </td>
                                        <td className="py-3 px-2 text-center text-gray-600 border-l bg-gray-50">{fouls.q1 || '-'}</td>
                                        <td className="py-3 px-2 text-center text-gray-600 bg-gray-50">{fouls.q2 || '-'}</td>
                                        <td className={`py-3 px-2 text-center font-bold text-lg bg-gray-200 ${fouls.firstHalf === 4 ? 'text-blue-600' : (fouls.firstHalf >= 3 ? 'text-red-500' : 'text-gray-800')}`}>{fouls.firstHalf}</td>
                                        <td className="py-3 px-2 text-center text-gray-600 border-l bg-gray-50">{fouls.q3 || '-'}</td>
                                        <td className="py-3 px-2 text-center text-gray-600 bg-gray-50">{fouls.q4 || '-'}</td>
                                        <td className="py-3 px-2 text-center text-gray-600 bg-gray-50">{fouls.ot || '-'}</td>
                                        <td className={`py-3 px-2 text-center font-bold text-lg bg-gray-200 ${fouls.secondHalf === 4 ? 'text-blue-600' : (fouls.secondHalf >= 3 ? 'text-red-500' : 'text-gray-800')}`}>{fouls.secondHalf}</td>
                                        <td className={`py-3 px-2 text-center font-black text-xl border-l-4 border-gray-800 bg-gray-100 ${fouls.total >= 5 ? 'text-red-600' : 'text-gray-900'}`}>{fouls.total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {gameEvents.filter(ev => ev.type === 'Log Foul' && ev.team === summaryTeam).length === 0 && (
                        <div className="text-center text-gray-400 py-12 font-bold italic">No fouls logged for this team yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}