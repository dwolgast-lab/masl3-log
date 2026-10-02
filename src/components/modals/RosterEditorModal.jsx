import React, { useState, useRef } from 'react';
import { BENCH_ROLES } from '../../config';
import { robustNumericalSort, sortBench, processRosterImage, mergeScannedRoster } from '../../ocrEngine';
import { readableTextOn } from '../../utils';

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

    // --- DYNAMIC LEAGUE CONSTRAINTS ---
    const isPro = !['MASL3', 'MASLW'].includes(gameData.league);
    const maxTotalPlayers = isPro ? 16 : 17;
    const maxFieldPlayers = isPro ? 14 : 15;

    const handleAddPlayer = () => {
        if (!newPlayer.number || !newPlayer.name) return alert("Please enter both a jersey number and a name.");
        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;

        if (currentRoster.some(p => p.number === newPlayer.number && p.id !== editingPlayerId)) {
            return alert(`Jersey number ${newPlayer.number} already exists on this roster.`);
        }

        const otherPlayers = editingPlayerId ? currentRoster.filter(p => p.id !== editingPlayerId) : currentRoster;
        
        // Apply Dynamic Limits
        if (!editingPlayerId && currentRoster.length >= maxTotalPlayers) return alert(`Max ${maxTotalPlayers} total players allowed in ${gameData.league}.`);
        if (!newPlayer.isGK && otherPlayers.filter(p => !p.isGK).length >= maxFieldPlayers) return alert(`Max ${maxFieldPlayers} Field Players allowed in ${gameData.league}.`);
        
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
                // Apply Dynamic Limits on Toggle
                if (otherPlayers.filter(p => !p.isGK).length >= maxFieldPlayers) return alert(`Max ${maxFieldPlayers} Field Players allowed in ${gameData.league}. Cannot change GK to Field Player without removing one first.`);
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
            const data = await processRosterImage(file);
            setScanResult(data);
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
        
        const { updatedRoster, updatedBench, newPlayersCount, newStaffCount } = mergeScannedRoster(scanResult, currentRoster, currentBench);

        if (newPlayersCount > 0 || newStaffCount > 0) {
            if (newPlayersCount > 0) setRoster(updatedRoster);
            if (newStaffCount > 0) setBench(updatedBench);
            alert(`Imported ${newPlayersCount} players and ${newStaffCount} bench staff!`);
        } else {
            alert("Could not detect any new data. Players already on the roster are skipped.");
        }
        setScanResult(null);
    };

    const teamColor = activeRosterModal === 'AWAY' ? awayCSSColor : homeCSSColor;
    const headerText = readableTextOn(teamColor);
    const fieldCls = "w-full min-h-11 px-3 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 dark:text-slate-100";
    const lblCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase";
    const checkLbl = "min-h-11 px-2 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 cursor-pointer active:brightness-95 transition";
    const checkTxt = "font-bold text-xs uppercase text-slate-700 dark:text-slate-200";
    const btnPrimary = (editing) => `min-h-11 px-4 text-white text-sm font-bold rounded-lg shadow active:scale-[0.97] active:brightness-95 transition ${editing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 dark:bg-slate-600 hover:bg-slate-700'}`;
    const btnCancel = "min-h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-[0.97] active:brightness-95 transition";
    const toggleCls = (on, onCls) => `min-h-11 px-3 text-xs font-bold rounded-lg border active:scale-[0.97] active:brightness-95 transition ${on ? onCls : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700 dark:hover:bg-slate-700'}`;
    const editBtn = "min-h-11 min-w-11 px-3 text-sm rounded-lg font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950 active:scale-[0.97] active:brightness-95 transition";
    const delBtn = "min-h-11 min-w-11 px-3 text-sm rounded-lg font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 active:scale-[0.97] active:brightness-95 transition";
    const resetPlayer = () => { setEditingPlayerId(null); setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false }); };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-full max-h-[90dvh] overflow-hidden relative">
                
                {isScanning && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-[60] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reading lineup sheet with Claude AI...</h3>
                        <p className="text-slate-500 dark:text-slate-400">This may take a few seconds.</p>
                    </div>
                )}

                {scanResult !== null && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-800 z-[60] flex flex-col p-4 md:p-6 overflow-hidden">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">VERIFY SCANNED ROSTER</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                            Fields detected from the lineup sheet. <strong>Players already on the roster are skipped on import.</strong> <br/>
                            Correct any misreads <em>after</em> importing.
                        </p>

                        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Players ({(scanResult.players || []).length})</h3>
                                {(scanResult.players || []).length === 0 && <p className="text-sm text-slate-400 italic">None detected.</p>}
                                {(scanResult.players || []).map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 py-1.5 px-2 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100">
                                        <span className="w-10 font-black tabular-nums">{p.number || '—'}</span>
                                        <span className="flex-1">{p.name}</span>
                                        {p.position && <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{p.position}</span>}
                                        {(p.position || '').toUpperCase().includes('GK') && <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase">GK</span>}
                                        {p.isStarter && <span className="text-[11px] font-bold text-green-600 dark:text-green-400 uppercase">Starter</span>}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Bench Staff ({(scanResult.staff || []).length})</h3>
                                {(scanResult.staff || []).length === 0 && <p className="text-sm text-slate-400 italic">None detected.</p>}
                                {(scanResult.staff || []).map((s, i) => (
                                    <div key={i} className="flex items-center gap-3 py-1.5 px-2 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100">
                                        <span className="flex-1">{s.name}</span>
                                        {s.role && <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{s.role}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 shrink-0 mt-4">
                            <button onClick={() => setScanResult(null)} className="min-h-11 px-6 font-bold text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.97] active:brightness-95 transition">Cancel</button>
                            <button onClick={handleImportScannedText} className="min-h-11 px-6 font-black text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.97] active:brightness-95 transition">Import Data</button>
                        </div>
                    </div>
                )}

                <div className="p-4 flex flex-wrap justify-between items-center gap-3 shrink-0" style={{ backgroundColor: teamColor, color: headerText }}>
                    <h2 className="text-xl md:text-2xl font-black uppercase">
                        {(activeRosterModal === 'AWAY' ? gameData.awayTeam : gameData.homeTeam) || `${activeRosterModal} TEAM`} PERSONNEL
                    </h2>
                    <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                        <button onClick={() => fileInputRef.current.click()} className="min-h-11 flex items-center bg-white text-slate-800 px-4 rounded-lg font-bold shadow hover:bg-slate-100 active:scale-[0.97] active:brightness-95 transition text-sm">
                            📷 Scan Lineup Sheet
                        </button>
                        <button onClick={closeRosterModal} className="min-h-11 font-bold bg-slate-900 text-white px-6 rounded-lg hover:bg-slate-800 shadow active:scale-[0.97] active:brightness-95 transition">Done</button>
                    </div>
                </div>
                
                <div className="flex flex-col landscape:flex-row flex-1 min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <div className="portrait:flex-[3] landscape:w-2/3 min-h-0 landscape:border-r portrait:border-b border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-3 md:p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
                            <div className="flex flex-wrap gap-2 items-end">
                                <div className="w-20"><label className={lblCls}>No.</label><input type="text" inputMode="numeric" pattern="[0-9]*" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value.toUpperCase().trim()})} className={`${fieldCls} font-bold tabular-nums`} placeholder="00" /></div>
                                <div className="flex-1 min-w-40"><label className={lblCls}>Player Name</label><input type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className={fieldCls} placeholder="Last Name, First Name" /></div>
                                <div className="flex gap-2">
                                    <label className={checkLbl}><input type="checkbox" checked={newPlayer.isGK} onChange={e => setNewPlayer({...newPlayer, isGK: e.target.checked})} className="w-5 h-5 accent-orange-500" /><span className={checkTxt}>GK</span></label>
                                    <label className={checkLbl}><input type="checkbox" checked={newPlayer.isStarter} onChange={e => setNewPlayer({...newPlayer, isStarter: e.target.checked})} className="w-5 h-5 accent-green-600" /><span className={checkTxt}>Start</span></label>
                                    <label className={checkLbl}><input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})} className="w-5 h-5 accent-yellow-500" /><span className={checkTxt}>Capt</span></label>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleAddPlayer} className={btnPrimary(editingPlayerId)}>
                                        {editingPlayerId ? 'Update' : '+ Add'}
                                    </button>
                                    {editingPlayerId && (
                                        <button onClick={resetPlayer} className={btnCancel}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 md:p-4 overflow-y-auto flex-1">
                            <div className="space-y-2">
                                {[...(activeRosterModal === 'AWAY' ? awayRoster : homeRoster)]
                                    .sort(robustNumericalSort) 
                                    .map(player => (
                                    <div key={player.id} className={`flex flex-wrap items-center justify-between gap-2 p-2 border rounded-lg shadow-sm transition ${editingPlayerId === player.id ? 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-40">
                                            <span className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-full font-black tabular-nums text-sm text-slate-700 dark:text-slate-100 shrink-0">{player.number}</span>
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate flex-1">{player.name}</span>
                                        </div>
                                        
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => togglePlayerAttr(player.id, 'isGK')} className={toggleCls(player.isGK, 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700')}>GK</button>
                                            <button onClick={() => togglePlayerAttr(player.id, 'isStarter')} className={toggleCls(player.isStarter, 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700')}>STARTER</button>
                                            <button onClick={() => togglePlayerAttr(player.id, 'isCaptain')} className={toggleCls(player.isCaptain, 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700')}>© CAPT</button>
                                        </div>

                                        <div className="flex gap-2 shrink-0 ml-2 border-l border-slate-200 dark:border-slate-700 pl-3">
                                            <button onClick={() => { setEditingPlayerId(player.id); setNewPlayer(player); }} className={editBtn}>Edit</button>
                                            <button onClick={() => removePlayer(player.id)} className={`${delBtn} ml-2`}>Del</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="portrait:flex-[2] landscape:w-1/3 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
                        <div className="p-3 md:p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
                            <div className="flex flex-col gap-2">
                                <input type="text" value={newBench.name} onChange={e => setNewBench({...newBench, name: e.target.value})} className={fieldCls} placeholder="Staff Name" />
                                <select value={newBench.role} onChange={e => setNewBench({...newBench, role: e.target.value})} className={`${fieldCls} font-bold`}>
                                    {BENCH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <button onClick={handleAddBench} className={`flex-1 ${btnPrimary(editingBenchId)}`}>
                                        {editingBenchId ? 'Update Staff' : '+ Add Staff'}
                                    </button>
                                    {editingBenchId && (
                                        <button onClick={() => { setEditingBenchId(null); setNewBench({ name: '', role: 'Assistant Coach' }); }} className={btnCancel}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-3 md:p-4 overflow-y-auto flex-1">
                            <div className="space-y-2">
                                {sortBench(activeRosterModal === 'AWAY' ? awayBench : homeBench).map(person => (
                                    <div key={person.id} className={`flex items-center gap-2 p-2 border rounded-lg shadow-sm ${editingBenchId === person.id ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 break-words">{person.name}</span>
                                            <span className="text-[11px] font-bold mt-1 uppercase w-fit px-1.5 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 truncate max-w-full">{person.role}</span>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => { setEditingBenchId(person.id); setNewBench(person); }} className={editBtn}>Edit</button>
                                            <button onClick={() => removeBench(person.id)} className={`${delBtn} ml-2`}>Remove</button>
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
