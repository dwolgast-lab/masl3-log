import React from 'react';
import { BENCH_ROLES } from '../config';

export default function PregameSetup({
    gameData, handleInputChange, awayCSSColor, homeCSSColor,
    awayRoster, homeRoster, awayBench, homeBench,
    activeRosterModal, setActiveRosterModal,
    showStartersModal, setShowStartersModal,
    newPlayer, setNewPlayer, handleAddPlayer, removePlayer,
    newBench, setNewBench, handleAddBench, removeBench,
    setCurrentView, clearAllGameData, onExportPDF
}) {
    const getSortedStarters = (roster) => roster.filter(p => p.isStarter).sort((a, b) => {
        if (a.isGK && !b.isGK) return -1;
        if (!a.isGK && b.isGK) return 1;
        return parseInt(a.number) - parseInt(b.number);
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans relative flex flex-col items-center">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                    <h1 className="text-3xl font-black tracking-wider">MASL3 PRE-GAME SETUP</h1>
                    <span className="font-bold text-slate-300">4th Official Log</span>
                </div>

                <div className="p-8 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-700 border-b-2 border-slate-200 pb-2 mb-4">Match Information</h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Date</label><input type="date" name="date" value={gameData.date} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Scheduled KO</label><input type="time" name="scheduledKO" onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">Venue</label><input type="text" name="venue" value={gameData.venue} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            <div><label className="block text-sm font-bold text-gray-600 mb-1">City</label><input type="text" name="city" value={gameData.city} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-4">
                            <h2 className="text-xl font-bold text-slate-700">Teams & Rosters</h2>
                            <button onClick={() => setShowStartersModal(true)} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition">
                                👀 View Starting Lineups
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                <h3 className="font-black mb-4 uppercase" style={{ color: awayCSSColor }}>AWAY TEAM</h3>
                                <input type="text" name="awayTeam" placeholder="Team Name" value={gameData.awayTeam} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-3" />
                                <input type="text" name="awayColor" placeholder="Uniform Color (e.g. Navy / White)" value={gameData.awayColor} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-4" />
                                <button onClick={() => setActiveRosterModal('AWAY')} className="w-full py-3 text-white font-bold rounded-lg shadow flex justify-between px-4" style={{ backgroundColor: awayCSSColor }}>
                                    <span>Edit Roster & Bench</span>
                                    <span>{awayRoster.length} Plyrs / {awayBench.length} Staff</span>
                                </button>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                <h3 className="font-black mb-4 uppercase" style={{ color: homeCSSColor }}>HOME TEAM</h3>
                                <input type="text" name="homeTeam" placeholder="Team Name" value={gameData.homeTeam} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-3" />
                                <input type="text" name="homeColor" placeholder="Uniform Color (e.g. Orange / Black)" value={gameData.homeColor} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-4" />
                                <button onClick={() => setActiveRosterModal('HOME')} className="w-full py-3 text-white font-bold rounded-lg shadow flex justify-between px-4" style={{ backgroundColor: homeCSSColor }}>
                                    <span>Edit Roster & Bench</span>
                                    <span>{homeRoster.length} Plyrs / {homeBench.length} Staff</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
                    <span className="text-sm font-bold text-green-600 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span> Auto-Saving Enabled
                    </span>
                    <button onClick={() => setCurrentView('ingame')} className="px-8 py-4 bg-green-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-green-700 transition">
                        PROCEED TO KICKOFF ➔
                    </button>
                </div>
            </div>

            <div className="w-full max-w-5xl flex justify-between px-4">
                <button onClick={clearAllGameData} className="text-red-500 font-bold border-b border-transparent hover:border-red-500 transition">
                    ⚠️ End Match & Wipe All Data
                </button>
                <button onClick={onExportPDF} className="px-6 py-3 bg-blue-600 text-white font-black rounded-lg shadow-lg hover:bg-blue-700 transition">
                    📥 Export Official PDF Worksheet
                </button>
            </div>

            {showStartersModal && (
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
            )}

            {activeRosterModal && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6 py-12">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-full max-h-[90vh] overflow-hidden">
                        <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: activeRosterModal === 'AWAY' ? awayCSSColor : homeCSSColor }}>
                            <h2 className="text-2xl font-black uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                {(activeRosterModal === 'AWAY' ? gameData.awayTeam : gameData.homeTeam) || `${activeRosterModal} TEAM`} PERSONNEL
                            </h2>
                            <button onClick={() => setActiveRosterModal(null)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Done</button>
                        </div>
                        <div className="flex flex-1 overflow-hidden bg-gray-50">
                            <div className="w-2/3 border-r flex flex-col h-full">
                                <div className="p-4 bg-white border-b shrink-0">
                                    <div className="flex gap-3 items-end">
                                        <div className="w-20"><label className="block text-xs font-bold text-gray-600 mb-1">Jersey #</label><input type="number" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="00" /></div>
                                        <div className="flex-1"><label className="block text-xs font-bold text-gray-600 mb-1">Player Name</label><input type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Last Name, First Name" /></div>
                                        <div className="flex flex-col space-y-1 pb-1">
                                            <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isGK} onChange={e => setNewPlayer({...newPlayer, isGK: e.target.checked})} className="w-4 h-4 accent-orange-500" /><span className="font-bold text-xs text-gray-700">GK</span></label>
                                            <div className="flex space-x-3">
                                                <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isStarter} onChange={e => setNewPlayer({...newPlayer, isStarter: e.target.checked})} className="w-4 h-4 accent-green-600" /><span className="font-bold text-xs text-gray-700">Starter</span></label>
                                                <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})} className="w-4 h-4 accent-yellow-500" /><span className="font-bold text-xs text-gray-700">Capt.</span></label>
                                            </div>
                                        </div>
                                        <button onClick={handleAddPlayer} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 shadow">+ Add</button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        {(activeRosterModal === 'AWAY' ? awayRoster : homeRoster).map(player => (
                                            <div key={player.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                                                <div className="flex items-center space-x-3">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-full font-black text-sm text-slate-700">{player.number}</span>
                                                    <span className="font-bold text-sm text-gray-800">{player.name}</span>
                                                    <div className="flex space-x-1 ml-2">
                                                        {player.isGK && <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-orange-200">GK</span>}
                                                        {player.isStarter && <span className="bg-green-100 text-green-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-200">STARTER</span>}
                                                        {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-300">© CAPTAIN</span>}
                                                    </div>
                                                </div>
                                                <button onClick={() => removePlayer(player.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-col h-full bg-slate-50">
                                <div className="p-4 bg-white border-b shrink-0">
                                    <div className="flex flex-col gap-2">
                                        <input type="text" value={newBench.name} onChange={e => setNewBench({...newBench, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm" placeholder="Staff Name" />
                                        <select value={newBench.role} onChange={e => setNewBench({...newBench, role: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm font-bold">
                                            {BENCH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                        <button onClick={handleAddBench} className="w-full py-2 bg-slate-800 text-white text-sm font-bold rounded">+ Add Staff</button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        {(activeRosterModal === 'AWAY' ? awayBench : homeBench).map(person => (
                                            <div key={person.id} className="flex flex-col p-2 bg-white border border-gray-200 rounded shadow-sm relative">
                                                <span className="font-bold text-sm text-gray-800">{person.name}</span>
                                                <span className="text-[10px] font-black mt-1 uppercase w-fit px-1.5 py-0.5 bg-gray-100 text-gray-600 border">{person.role}</span>
                                                <button onClick={() => removeBench(person.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}