import React, { useState, useRef } from 'react';
import { BENCH_ROLES } from '../../config';
import { robustNumericalSort, sortBench, processRosterImage, parseRosterText } from '../../ocrEngine';

export default function RosterEditorModal({
    activeRosterModal, setActiveRosterModal,
    gameData, awayCSSColor, homeCSSColor,
    awayRoster, setAwayRoster, homeRoster, setHomeRoster,
    awayBench, setAwayBench, homeBench, setHomeBench,
    newPlayer, setNewPlayer, newBench, setNewBench
}) {
    const fileInputRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editingBenchId, setEditingBenchId] = useState(null);

    if (!activeRosterModal) return null;

    const handleAddPlayer = () => {
        if (!newPlayer.number || !newPlayer.name) return alert("Please enter both a jersey number and a name.");
        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;

        if (currentRoster.some(p => p.number === newPlayer.number && p.id !== editingPlayerId)) {
            return alert(`Jersey number ${newPlayer.number} already exists on this roster.`);
        }

        const otherPlayers = editingPlayerId ? currentRoster.filter(p => p.id !== editingPlayerId) : currentRoster;
        if (!editingPlayerId && currentRoster.length >= 17) return alert("Max 17 total players.");
        if (!newPlayer.isGK && otherPlayers.filter(p => !p.isGK).length >= 15) return alert("Max 15 Field Players.");
        
        if (newPlayer.isStarter) {
            if (newPlayer.isGK && otherPlayers.filter(p => p.isGK && p.isStarter).length >= 1) return alert("Only 1 Starting Goalkeeper allowed.");
            if (!newPlayer.isGK && otherPlayers.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players allowed.");
        }
        if (newPlayer.isCaptain && otherPlayers.some(p => p.isCaptain)) return alert("A team can only have ONE designated Captain.");

        let updated = editingPlayerId 
            ? currentRoster.map(p => p.id === editingPlayerId ? { ...newPlayer, id: editingPlayerId } : p)
            : [...currentRoster, { ...newPlayer, id: Date.now() }];
        
        setRoster(updated.sort(robustNumericalSort));
        setEditingPlayerId(null);
        setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false }); 
    };

    const togglePlayerAttr = (id, attr) => {
        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;
        const player = currentRoster.find(p => p.id === id);
        let newValue = !player[attr];
        const otherPlayers = currentRoster.filter(p => p.id !== id);

        if (newValue) {
            if (attr === 'isCaptain' && otherPlayers.some(p => p.isCaptain)) return alert("A team can only have ONE designated Captain.");
            if (attr === 'isStarter') {
                if (player.isGK && otherPlayers.filter(p => p.isGK && p.isStarter).length >= 1) return alert("Only 1 Starting Goalkeeper allowed.");
                if (!player.isGK && otherPlayers.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players allowed.");
            }
            if (attr === 'isGK') {
                if (player.isStarter && otherPlayers.filter(p => p.isGK && p.isStarter).length >= 1) return alert("Only 1 Starting Goalkeeper allowed. Please un-select the current starting GK first.");
            }
        } else {
            if (attr === 'isGK') {
                if (otherPlayers.filter(p => !p.isGK).length >= 15) return alert("Max 15 Field Players. Cannot change GK to Field Player without removing one.");
                if (player.isStarter && otherPlayers.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players. Please un-select starter status first.");
            }
        }
        
        const updated = currentRoster.map(p => p.id === id ? { ...p, [attr]: newValue } : p);
        setRoster(updated);
        if (editingPlayerId === id) setNewPlayer(prev => ({ ...prev, [attr]: newValue }));
    };

    const handleAddBench = () => {
        if (!newBench.name) return alert("Please enter name.");
        const currentBench = activeRosterModal === 'AWAY' ? awayBench : homeBench;
        const setBench = activeRosterModal === 'AWAY' ? setAwayBench : setHomeBench;
        
        if (!editingBenchId && currentBench.length >= 5) return alert("Max 5 bench personnel.");
        if (newBench.role === 'Head Coach' && currentBench.some(b => b.role === 'Head Coach' && b.id !== editingBenchId)) return alert("A team can only have ONE designated Head Coach.");
        
        let updated = editingBenchId
            ? currentBench.map(b => b.id === editingBenchId ? { ...newBench, id: editingBenchId } : b)
            : [...currentBench, { ...newBench, id: Date.now() }];

        setBench(updated);
        setEditingBenchId(null);
        setNewBench({ name: '', role: 'Assistant Coach' });
    };

    const removePlayer = (id) => activeRosterModal === 'AWAY' ? setAwayRoster(awayRoster.filter(p => p.id !== id)) : setHomeRoster(homeRoster.filter(p => p.id !== id));
    const removeBench = (id) => activeRosterModal === 'AWAY' ? setAwayBench(awayBench.filter(b => b.id !== id)) : setHomeBench(homeBench.filter(b => b.id !== id));

    const closeRosterModal = () => {
        setActiveRosterModal(null);
        setEditingPlayerId(null);
        setEditingBenchId(null); 
        setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false });
        setNewBench({ name: '', role: 'Assistant Coach' });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        setScanResult(null);

        try {
            const text = await processRosterImage(file);
            setScanResult(text);
        } catch (error) {
            alert("Failed to scan roster: " + error.message);
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleImportScannedText = () => {
        if (!scanResult) return;

        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;
        const currentBench = activeRosterModal === 'AWAY' ? awayBench : homeBench;
        const setBench = activeRosterModal === 'AWAY' ? setAwayBench : setHomeBench;
        
        const { updatedRoster, updatedBench, newPlayersCount, newStaffCount } = parseRosterText(scanResult, currentRoster, currentBench);

        if (newPlayersCount > 0 || newStaffCount > 0) {
            if (newPlayersCount > 0) setRoster(updatedRoster);
            if (newStaffCount > 0) setBench(updatedBench);
            alert(`Imported ${newPlayersCount} players (${Math.min(newPlayersCount, 6)} auto-marked as Starters) and ${newStaffCount} bench staff!`);
        } else {
            alert("Could not detect any valid data. Please ensure rows have a jersey number and a name.");
        }
        setScanResult(null); 
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6 py-12">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-full max-h-[90vh] overflow-hidden relative">
                
                {isScanning && (
                    <div className="absolute inset-0 bg-white/90 z-[60] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-xl font-bold text-gray-800">Processing Document via Google Cloud AI...</h3>
                        <p className="text-gray-500">This may take a few seconds.</p>
                    </div>
                )}

                {scanResult !== null && (
                    <div className="absolute inset-0 bg-white z-[60] flex flex-col p-6 overflow-hidden">
                        <h2 className="text-2xl font-black text-gray-800 mb-2">VERIFY SCANNED TEXT</h2>
                        <p className="text-sm text-gray-600 mb-4 border-b pb-4">
                            Below is the raw text extracted. <strong>It may look messy, but our parser handles it.</strong> <br/>
                            If it looks complete, just click "Import Data". Correct misspellings *after* import.
                        </p>
                        
                        <textarea 
                            className="flex-1 w-full p-4 border-2 border-gray-300 rounded-xl font-mono text-sm mb-4 outline-none focus:border-blue-500 bg-gray-50 overflow-y-auto"
                            value={scanResult}
                            onChange={(e) => setScanResult(e.target.value)}
                        />
                        
                        <div className="flex justify-end space-x-4 shrink-0 mt-4">
                            <button onClick={() => setScanResult(null)} className="px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={handleImportScannedText} className="px-6 py-3 font-black text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700">Import Data</button>
                        </div>
                    </div>
                )}

                <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: activeRosterModal === 'AWAY' ? awayCSSColor : homeCSSColor }}>
                    <h2 className="text-2xl font-black uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {(activeRosterModal === 'AWAY' ? gameData.awayTeam : gameData.homeTeam) || `${activeRosterModal} TEAM`} PERSONNEL
                    </h2>
                    <div className="flex items-center space-x-4">
                        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center bg-white text-slate-800 px-4 py-2 rounded font-black shadow hover:bg-gray-100 transition text-sm">
                            📷 Scan Lineup Sheet
                        </button>
                        <button onClick={closeRosterModal} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Done</button>
                    </div>
                </div>
                
                <div className="flex flex-1 overflow-hidden bg-gray-50">
                    <div className="w-2/3 border-r flex flex-col h-full overflow-hidden">
                        <div className="p-4 bg-white border-b shrink-0">
                            <div className="flex gap-2 items-end">
                                <div className="w-16"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">No.</label><input type="text" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value.toUpperCase().trim()})} className="w-full p-2 border rounded bg-gray-50 font-bold" placeholder="00" /></div>
                                <div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Player Name</label><input type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Last Name, First Name" /></div>
                                <div className="flex flex-col space-y-1 pb-1">
                                    <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isGK} onChange={e => setNewPlayer({...newPlayer, isGK: e.target.checked})} className="w-4 h-4 accent-orange-500" /><span className="font-bold text-[10px] uppercase text-gray-700">GK</span></label>
                                    <div className="flex space-x-2">
                                        <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isStarter} onChange={e => setNewPlayer({...newPlayer, isStarter: e.target.checked})} className="w-4 h-4 accent-green-600" /><span className="font-bold text-[10px] uppercase text-gray-700">Start</span></label>
                                        <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})} className="w-4 h-4 accent-yellow-500" /><span className="font-bold text-[10px] uppercase text-gray-700">Capt</span></label>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={handleAddPlayer} className={`px-4 py-2 text-white text-sm font-bold rounded shadow transition ${editingPlayerId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                        {editingPlayerId ? 'Update' : '+ Add'}
                                    </button>
                                    {editingPlayerId && (
                                        <button onClick={() => { setEditingPlayerId(null); setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false }); }} className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-bold rounded hover:bg-gray-300 transition">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 overflow-y-auto flex-1">
                            <div className="space-y-2">
                                {(activeRosterModal === 'AWAY' ? awayRoster : homeRoster)
                                    .sort(robustNumericalSort) 
                                    .map(player => (
                                    <div key={player.id} className={`flex items-center justify-between p-2 border rounded shadow-sm transition ${editingPlayerId === player.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <span className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-full font-black text-sm text-slate-700 shrink-0">{player.number}</span>
                                            <span className="font-bold text-sm text-gray-800 truncate flex-1">{player.name}</span>
                                        </div>
                                        
                                        <div className="flex space-x-1 shrink-0 ml-2">
                                            <button onClick={() => togglePlayerAttr(player.id, 'isGK')} className={`text-[10px] font-black px-2 py-1 rounded border transition ${player.isGK ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>GK</button>
                                            <button onClick={() => togglePlayerAttr(player.id, 'isStarter')} className={`text-[10px] font-black px-2 py-1 rounded border transition ${player.isStarter ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>STARTER</button>
                                            <button onClick={() => togglePlayerAttr(player.id, 'isCaptain')} className={`text-[10px] font-black px-2 py-1 rounded border transition ${player.isCaptain ? 'bg-yellow-100 text-yellow-800 border-yellow-400' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>© CAPT</button>
                                        </div>

                                        <div className="flex space-x-1 shrink-0 ml-4 border-l pl-2">
                                            <button onClick={() => { setEditingPlayerId(player.id); setNewPlayer(player); }} className="text-blue-500 hover:bg-blue-100 px-2 py-1 text-xs rounded font-bold transition">Edit</button>
                                            <button onClick={() => removePlayer(player.id)} className="text-red-500 hover:bg-red-100 px-2 py-1 text-xs rounded font-bold transition">Del</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-1/3 flex flex-col h-full bg-slate-50 overflow-hidden">
                        <div className="p-4 bg-white border-b shrink-0">
                            <div className="flex flex-col gap-2">
                                <input type="text" value={newBench.name} onChange={e => setNewBench({...newBench, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm" placeholder="Staff Name" />
                                <select value={newBench.role} onChange={e => setNewBench({...newBench, role: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm font-bold">
                                    {BENCH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <div className="flex gap-1">
                                    <button onClick={handleAddBench} className={`flex-1 py-2 text-white text-sm font-bold rounded transition ${editingBenchId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                        {editingBenchId ? 'Update Staff' : '+ Add Staff'}
                                    </button>
                                    {editingBenchId && (
                                        <button onClick={() => { setEditingBenchId(null); setNewBench({ name: '', role: 'Assistant Coach' }); }} className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-bold rounded hover:bg-gray-300 transition">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <div className="space-y-2">
                                {sortBench(activeRosterModal === 'AWAY' ? awayBench : homeBench).map(person => (
                                    <div key={person.id} className={`flex flex-col p-2 bg-white border rounded shadow-sm relative ${editingBenchId === person.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                                        <span className="font-bold text-sm text-gray-800 pr-16">{person.name}</span>
                                        <span className="text-[10px] font-black mt-1 uppercase w-fit px-1.5 py-0.5 bg-gray-100 text-gray-600 border truncate max-w-full">{person.role}</span>
                                        <div className="absolute top-2 right-2 flex space-x-1Actions shrink-0">
                                            <button onClick={() => { setEditingBenchId(person.id); setNewBench(person); }} className="text-blue-500 hover:bg-blue-100 px-2 py-1 text-xs rounded font-bold transition">Edit</button>
                                            <button onClick={() => removeBench(person.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}