import React from 'react';
import { formatTime } from '../../utils';

export default function PlayerSelectModal({
    modalStep, setModalStep, activeAction, flowTeamColor, modalQuarter, timeInput,
    penaltyData, editingEventId, playerSearchInput, setPlayerSearchInput, filteredFlowRoster,
    handlePlayerSelect, activeBench, requiresSubstituteServer, setRequiresSubstituteServer,
    benchPenaltyEntity, goalScorer
}) {
    if (modalStep !== 'PLAYER' && modalStep !== 'SERVING_PLAYER' && modalStep !== 'ASSIST') return null;

    let headerTitle = "";
    let subTitle = "";

    if (modalStep === 'PLAYER') {
        headerTitle = editingEventId ? "EDIT PLAYER" : (activeAction.type === 'Goal / Assist' ? "SELECT GOAL SCORER" : "SELECT OFFENDER");
        subTitle = `${activeAction.type === 'Log Foul' ? 'FOUL' : activeAction.type} - ${modalQuarter} ${activeAction.type !== 'Log Foul' && (activeAction.time || timeInput) ? `@ ${formatTime(activeAction.time || timeInput)}` : ''} ${penaltyData.code ? ` [Code: ${penaltyData.code}]` : ''}`;
    } else if (modalStep === 'SERVING_PLAYER') {
        headerTitle = "WHO IS SERVING PENALTY?";
        subTitle = "Please select the field player reporting to the penalty box";
    } else if (modalStep === 'ASSIST') {
        headerTitle = "SELECT ASSIST";
        subTitle = `Goal by: ${typeof goalScorer === 'string' ? goalScorer : `#${goalScorer?.number} ${goalScorer?.name}`}`;
    }

    const rosterToDisplay = modalStep === 'SERVING_PLAYER' 
        ? filteredFlowRoster.filter(p => p.id !== benchPenaltyEntity?.id) 
        : filteredFlowRoster;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: flowTeamColor }}>
                    <div className="flex flex-col" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        <h2 className="text-2xl font-black uppercase">{headerTitle}</h2>
                        <span className="text-sm font-bold opacity-80">{subTitle}</span>
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
                    }} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">
                        {modalStep === 'PLAYER' ? (editingEventId ? "Cancel Edit" : (activeAction.type === 'Log Foul' ? "Cancel Foul" : "⬅ Back")) : "⬅ Back"}
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col">
                    
                    {activeAction.type === 'Log Foul' && (!isPeriodRunning || editingEventId) && (
                        <div className="w-full mb-6">
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase text-center tracking-widest">Event Quarter</label>
                            <div className="flex bg-gray-200 rounded-lg p-1 w-full justify-between shadow-inner border border-gray-300">
                                {QUARTERS.map(q => (
                                    <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${modalQuarter === q ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-300'}`}>{q}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 'ASSIST' && (
                        <button onClick={() => handlePlayerSelect('Unassisted')} className="mb-6 w-full p-4 border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl text-center font-bold text-blue-700 hover:bg-blue-100 transition">UNASSISTED</button>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">Quick Jersey # Search:</label>
                        <input type="number" autoFocus value={playerSearchInput} onChange={(e) => setPlayerSearchInput(e.target.value)} placeholder="Type jersey number to filter..." className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl font-bold outline-none focus:border-blue-500 transition" style={{ borderColor: playerSearchInput ? flowTeamColor : '' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {rosterToDisplay.map(player => (
                            <button key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition group">
                                <span className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full font-black text-xl text-gray-800 group-hover:bg-gray-200 transition" style={{ color: flowTeamColor }}>{player.number}</span>
                                <span className="ml-4 font-bold text-lg text-gray-800 text-left truncate">{player.name}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* BENCH PERSONNEL INJECTION - ONLY SHOW FOR YELLOW CARDS */}
                    {modalStep === 'PLAYER' && activeAction.type === 'Time Penalty' && penaltyData.color === 'Yellow' && (
                        <div className="mt-6">
                            <h3 className="font-bold text-gray-500 mb-3 uppercase text-sm border-b pb-1">Bench Personnel</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {activeBench.map(person => (
                                    <button key={person.id} onClick={() => handlePlayerSelect(person)} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition text-left">
                                        <span className="font-bold text-lg text-gray-800 truncate">{person.name}</span>
                                        <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">({person.role})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {rosterToDisplay.length === 0 && !playerSearchInput && <div className="text-center text-gray-500 font-bold italic py-8">No active roster found.</div>}

                    {modalStep === 'PLAYER' && !playerSearchInput && (
                        <>
                            {activeAction.type === 'Time Penalty' && (
                                <label className="flex items-center space-x-3 mt-6 p-4 bg-gray-200 rounded-xl cursor-pointer">
                                    <input type="checkbox" className="w-6 h-6 accent-blue-600" checked={requiresSubstituteServer} onChange={e => setRequiresSubstituteServer(e.target.checked)} />
                                    <span className="font-bold text-gray-700">Check if penalty will be served by a substitute (e.g. injured/ejected offender)</span>
                                </label>
                            )}
                            <button onClick={() => {
                                if (activeAction.type === 'Log Foul') handlePlayerSelect('Unattributed');
                                else handlePlayerSelect(activeAction.type === 'Goal / Assist' ? 'Own Goal' : 'Team / Bench');
                            }} className={`mt-4 w-full p-4 border-2 border-dashed rounded-xl text-center font-bold transition ${activeAction.type === 'Log Foul' ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-400 bg-white text-gray-600 hover:bg-gray-100'}`}>
                                {activeAction.type === 'Goal / Assist' ? "Own Goal" : (activeAction.type === 'Log Foul' ? "Leave Unattributed (Assign Later)" : "Attribute to Team / Bench")}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}