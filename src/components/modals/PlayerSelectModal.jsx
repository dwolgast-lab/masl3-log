import React from 'react';
import { formatTime, readableTextOn } from '../../utils';
import { QUARTERS } from '../../config';

export default function PlayerSelectModal({
    modalStep, setModalStep, activeAction, flowTeamColor, modalQuarter, timeInput,
    penaltyData, editingEventId, playerSearchInput, setPlayerSearchInput, filteredFlowRoster,
    handlePlayerSelect, activeBench, requiresSubstituteServer, setRequiresSubstituteServer,
    benchPenaltyEntity, setBenchPenaltyEntity, goalScorer, isPeriodRunning, setModalQuarter, gameEvents
}) {
    if (modalStep !== 'PLAYER' && modalStep !== 'SERVING_PLAYER' && modalStep !== 'ASSIST') return null;

    let headerTitle = "";
    let subTitle = "";

    const isCombo = benchPenaltyEntity && gameEvents?.some(ev => 
        ev.type === 'Time Penalty' && 
        ev.entity?.id === benchPenaltyEntity.id && 
        ev.penalty?.color === 'Blue' && 
        !ev.isJustServing && 
        !ev.clearedFromBoard
    );

    if (modalStep === 'PLAYER') {
        headerTitle = editingEventId ? "EDIT PLAYER" : (activeAction.type === 'Goal / Assist' ? "SELECT GOAL SCORER" : "SELECT OFFENDER");
        subTitle = `${activeAction.type === 'Log Foul' ? 'FOUL' : activeAction.type} - ${modalQuarter} ${activeAction.type !== 'Log Foul' && (activeAction.time || timeInput) ? `@ ${formatTime(activeAction.time || timeInput)}` : ''} ${penaltyData.code ? ` [Code: ${penaltyData.code}]` : ''}`;
    } else if (modalStep === 'SERVING_PLAYER') {
        headerTitle = "SELECT SUBSTITUTE SERVER";
        if (penaltyData.code === 'Y6' || (penaltyData.color === 'Yellow' && isCombo)) {
            subTitle = "Offender is serving Major non-releasable time. Select a teammate to serve the Power Play.";
        } else if (penaltyData.color === 'Red') {
            subTitle = "Offender is Ejected. Select a teammate to serve the Power Play.";
        } else {
            subTitle = "Please select the field player reporting to the penalty box.";
        }
    } else if (modalStep === 'ASSIST') {
        headerTitle = "SELECT ASSIST";
        subTitle = `Goal by: ${typeof goalScorer === 'string' ? goalScorer : `#${goalScorer?.number} ${goalScorer?.name}`}`;
    }

    const rosterToDisplay = modalStep === 'SERVING_PLAYER' 
        ? filteredFlowRoster.filter(p => p.id !== benchPenaltyEntity?.id) 
        : filteredFlowRoster;

    const onPlayerSelectClick = (entity) => {
        if (modalStep === 'PLAYER') {
            if (activeAction.type === 'Goal / Assist') {
                if (entity === 'Own Goal') handlePlayerSelect(entity); 
                else handlePlayerSelect(entity);
            } else if (activeAction.type === 'Time Penalty') {
                
                const isBenchStaff = activeBench.some(b => b.id === entity?.id) || entity === 'Team / Bench';
                const isRedPowerPlay = penaltyData.color === 'Red' && !['R8', 'R9'].includes(penaltyData.code);
                
                let isBlueYellowComboActive = false;
                if (penaltyData.color === 'Yellow' && penaltyData.code !== 'Y6' && entity?.id) {
                    isBlueYellowComboActive = gameEvents.some(ev => 
                        ev.type === 'Time Penalty' && ev.entity?.id === entity.id && 
                        ev.penalty?.color === 'Blue' && !ev.isJustServing && !ev.clearedFromBoard
                    );
                }

                let needsServer = false;
                if (penaltyData.code === 'B1') needsServer = true;
                else if (isBenchStaff) needsServer = false; 
                else if (requiresSubstituteServer || penaltyData.code === 'Y6' || isBlueYellowComboActive || isRedPowerPlay || (entity && entity.isGK)) needsServer = true;
                
                if (needsServer) { 
                    setBenchPenaltyEntity(entity); 
                    setPlayerSearchInput(''); 
                    setModalStep('SERVING_PLAYER'); 
                } else { 
                    handlePlayerSelect(entity); 
                }
            } else { handlePlayerSelect(entity); }
        } else {
            handlePlayerSelect(entity);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full landscape:max-w-3xl max-w-2xl flex flex-col max-h-[90dvh] overflow-hidden">
                
                {modalStep === 'SERVING_PLAYER' && benchPenaltyEntity ? (
                    <div className="bg-yellow-400 dark:bg-yellow-500 p-4 text-black text-center border-b-4 border-yellow-600 shrink-0 shadow-md z-10 relative">
                        <button onClick={() => setModalStep('PLAYER')} className="absolute left-4 top-1/2 -translate-y-1/2 min-h-11 font-bold bg-yellow-500 dark:bg-yellow-600 px-4 rounded hover:bg-yellow-600 shadow-sm transition active:scale-[0.97] active:brightness-95 text-sm text-yellow-950">⬅ Back</button>
                        <div className="text-xl font-black uppercase tracking-wider mb-1 px-20">
                            ✅ {benchPenaltyEntity.name || 'PLAYER'} ASSIGNED TO PENALTY
                        </div>
                        <div className="text-sm font-bold text-yellow-950 px-20">
                            {penaltyData.color === 'Yellow' ? 'Serving Non-Releasable Major.' : 'Requires a substitute server.'} Please select the teammate to serve the 2-minute power play.
                        </div>
                    </div>
                ) : (
                    <div className="p-4 flex justify-between items-center gap-3 shrink-0" style={{ backgroundColor: flowTeamColor, color: readableTextOn(flowTeamColor) }}>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-2xl font-black uppercase">{headerTitle}</h2>
                            <span className="text-sm font-bold opacity-90">{subTitle}</span>
                        </div>
                        <button onClick={() => {
                            if (modalStep === 'PLAYER') {
                                if (editingEventId) setModalStep('EVENT_LOG');
                                else if (activeAction.type === 'Log Foul') setModalStep(null);
                                else if (activeAction.type === 'Time Penalty') setModalStep('PENALTY_CODE');
                                else setModalStep('TIME');
                            } else {
                                setModalStep('PLAYER');
                            }
                        }} className="shrink-0 min-h-11 font-bold bg-slate-900 text-white px-4 rounded hover:bg-slate-800 shadow transition active:scale-[0.97] active:brightness-95">
                            {modalStep === 'PLAYER' ? (editingEventId ? "Cancel Edit" : (activeAction.type === 'Log Foul' ? "Cancel Foul" : "⬅ Back")) : "⬅ Back"}
                        </button>
                    </div>
                )}

                <div className="p-4 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900 flex flex-col relative">
                    
                    {activeAction.type === 'Log Foul' && (!isPeriodRunning || editingEventId) && (
                        <div className="w-full mb-4">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase text-center tracking-widest">Event Quarter</label>
                            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 w-full justify-between gap-1 shadow-inner border border-slate-300 dark:border-slate-700">
                                {QUARTERS.map(q => (
                                    <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 min-h-11 rounded-md font-bold text-sm transition active:scale-[0.97] ${modalQuarter === q ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>{q}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 'ASSIST' && (
                        <button onClick={() => onPlayerSelectClick('Unassisted')} className="mb-4 w-full min-h-14 p-3 border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-950 rounded-xl text-center font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition active:scale-[0.97] active:brightness-95">UNASSISTED</button>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">Quick Jersey # Search:</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={playerSearchInput} onChange={(e) => setPlayerSearchInput(e.target.value)} placeholder="Type jersey number to filter..." className="w-full min-h-12 p-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xl font-bold tabular-nums outline-none focus:border-blue-500 transition" style={{ borderColor: playerSearchInput ? flowTeamColor : '' }} />
                    </div>

                    <div className="grid grid-cols-2 lg:landscape:grid-cols-3 gap-3">
                        {rosterToDisplay.map(player => (
                            <button key={player.id} onClick={() => onPlayerSelectClick(player)} className="flex items-center min-h-14 min-w-0 p-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition active:scale-[0.97] active:brightness-95 group">
                                <span className="w-12 h-12 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-full font-black text-2xl tabular-nums text-slate-800 dark:text-slate-100 transition" style={{ color: flowTeamColor }}>{player.number}</span>
                                <span className="ml-3 min-w-0 flex-1 font-bold text-base text-slate-800 dark:text-slate-100 text-left truncate">{player.name}</span>
                            </button>
                        ))}
                    </div>
                    
                    {modalStep === 'PLAYER' && activeAction.type === 'Time Penalty' && penaltyData.color === 'Yellow' && (
                        <div className="mt-6">
                            <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase text-sm border-b border-slate-200 dark:border-slate-700 pb-1">Bench Personnel</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {activeBench.map(person => (
                                    <button key={person.id} onClick={() => onPlayerSelectClick(person)} className="flex items-center min-h-14 min-w-0 p-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-slate-400 transition active:scale-[0.97] active:brightness-95 text-left">
                                        <span className="font-bold text-base text-slate-800 dark:text-slate-100 truncate min-w-0">{person.name}</span>
                                        <span className="ml-2 shrink-0 text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">({person.role})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {rosterToDisplay.length === 0 && !playerSearchInput && <div className="text-center text-slate-500 dark:text-slate-400 font-bold italic py-8">No active roster found.</div>}

                    {modalStep === 'PLAYER' && !playerSearchInput && (
                        <>
                            {activeAction.type === 'Time Penalty' && (
                                <label className="flex items-center gap-3 mt-6 min-h-11 p-4 bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer">
                                    <input type="checkbox" className="w-6 h-6 shrink-0 accent-blue-600" checked={requiresSubstituteServer} onChange={e => setRequiresSubstituteServer(e.target.checked)} />
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Check if penalty will be served by a substitute (e.g. injured/ejected offender)</span>
                                </label>
                            )}
                            <button onClick={() => {
                                if (activeAction.type === 'Log Foul') onPlayerSelectClick('Unattributed');
                                else onPlayerSelectClick(activeAction.type === 'Goal / Assist' ? 'Own Goal' : 'Team / Bench');
                            }} className={`mt-4 w-full min-h-14 p-3 border-2 border-dashed rounded-xl text-center font-bold transition active:scale-[0.97] active:brightness-95 ${activeAction.type === 'Log Foul' ? 'border-red-400 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900' : 'border-slate-400 bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                                {activeAction.type === 'Goal / Assist' ? "Own Goal" : (activeAction.type === 'Log Foul' ? "Leave Unattributed (Assign Later)" : "Attribute to Team / Bench")}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}