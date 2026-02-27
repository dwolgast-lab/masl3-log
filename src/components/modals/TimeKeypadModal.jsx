import React from 'react';
import { QUARTERS } from '../../config';
import { formatTime } from '../../utils';

export default function TimeKeypadModal({
    modalStep, setModalStep, activeAction, flowTeamName, flowTeamColor,
    isPeriodRunning, editingEventId, modalQuarter, setModalQuarter,
    timeInput, handleKeypad, validateAndAdvanceTime, goalFlags, setGoalFlags,
    manualTimeMode, setManualTimeMode
}) {
    if (modalStep !== 'TIME' && modalStep !== 'MANUAL_TIME_ENTRY') return null;

    const isManualTime = modalStep === 'MANUAL_TIME_ENTRY';
    const isPPG = manualTimeMode === 'PPG';
    const isRelease = manualTimeMode === 'RELEASE';
    
    let title = '';
    if (isPPG) title = 'Enter PPG Time';
    else if (isRelease) title = 'Edit Release Time';
    else title = activeAction.team === 'SYSTEM' ? activeAction.type : `${flowTeamName} - ${activeAction.type}`;

    let subtitle = '';
    if (isPPG) subtitle = 'No auto-match found. When did the goal happen?';
    else if (isRelease) subtitle = 'Manually override the penalty expiration time.';

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className={`bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center ${isManualTime ? 'border-4 border-blue-500' : ''}`}>
                <h3 className={`text-2xl font-bold mb-1 uppercase ${isManualTime ? 'text-blue-600' : ''}`} style={{ color: !isManualTime && activeAction.team !== 'SYSTEM' ? flowTeamColor : '' }}>
                    {title}
                </h3>
                
                {isManualTime && <p className="text-gray-500 font-bold mb-6 text-center text-sm">{subtitle}</p>}

                {(!isPeriodRunning || editingEventId || isManualTime) ? (
                    <div className="w-full mb-6">
                        <label className={`block text-xs font-bold mb-2 uppercase text-center tracking-widest ${isManualTime ? 'text-blue-800' : 'text-gray-600'}`}>
                            {isPPG ? 'Quarter Scored:' : isRelease ? 'Release Quarter:' : 'Event Quarter'}
                        </label>
                        <div className={`flex rounded-lg p-1 w-full justify-between shadow-inner ${isManualTime ? 'bg-blue-100' : 'bg-gray-200 border border-gray-300'}`}>
                            {QUARTERS.map(q => (
                                <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${modalQuarter === q ? (isManualTime ? 'bg-blue-600 text-white shadow-md' : 'bg-black text-white shadow-md') : (isManualTime ? 'text-blue-800 hover:bg-blue-200' : 'text-gray-600 hover:bg-gray-300')}`}>{q}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 font-bold mb-6">Quarter: <span className="text-black">{modalQuarter}</span></p>
                )}

                <div className={`text-7xl font-mono font-black mb-4 px-6 py-4 rounded-xl tracking-widest text-center w-full border-2 ${isManualTime ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-100'}`} style={{ borderColor: !isManualTime && activeAction.team !== 'SYSTEM' ? flowTeamColor : '' }}>
                    {timeInput.length === 0 ? "00:00" : formatTime(timeInput)}
                </div>

                {activeAction.type === 'Goal / Assist' && !isManualTime && (
                    <div className="flex justify-between w-full mb-4 space-x-2">
                        <button onClick={() => setGoalFlags({...goalFlags, pp: !goalFlags.pp})} className={`flex-1 py-2 text-xs rounded font-bold transition ${goalFlags.pp ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Power Play</button>
                        <button onClick={() => setGoalFlags({...goalFlags, shootout: !goalFlags.shootout})} className={`flex-1 py-2 text-xs rounded font-bold transition ${goalFlags.shootout ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Shootout</button>
                        <button onClick={() => setGoalFlags({...goalFlags, pk: !goalFlags.pk})} className={`flex-1 py-2 text-xs rounded font-bold transition ${goalFlags.pk ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Penalty Kick</button>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 w-full mb-6 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleKeypad(num.toString())} className="bg-gray-200 hover:bg-gray-300 text-2xl font-bold py-4 rounded-lg">{num}</button>
                    ))}
                    <button onClick={() => handleKeypad('clear')} className="bg-red-100 text-red-600 hover:bg-red-200 text-lg font-bold py-4 rounded-lg">Clear</button>
                    <button onClick={() => handleKeypad('0')} className="bg-gray-200 hover:bg-gray-300 text-2xl font-bold py-4 rounded-lg">0</button>
                    <button onClick={() => handleKeypad('del')} className="bg-gray-200 hover:bg-gray-300 text-lg font-bold py-4 rounded-lg">Del</button>
                </div>

                <div className="flex space-x-4 w-full">
                    <button onClick={() => {
                        if (isRelease) {
                            setManualTimeMode(null);
                            setModalStep('EVENT_LOG');
                        } else {
                            setModalStep(null);
                        }
                    }} className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50">Cancel</button>
                    <button onClick={() => {
                        if (isManualTime) validateAndAdvanceTime('FINALIZE_MANUAL_TIME');
                        else {
                            let nextStr = 'PLAYER';
                            if (activeAction.type === 'Time Penalty') nextStr = 'CARD_COLOR';
                            else if (activeAction.type === 'Team Warnings') nextStr = 'WARNING_REASON';
                            else if (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout') nextStr = 'FINALIZE_TEAM_EVENT';
                            validateAndAdvanceTime(nextStr);
                        }
                    }} className={`flex-1 py-3 text-white font-bold rounded-lg shadow ${isManualTime ? 'bg-blue-600 hover:bg-blue-700' : ''}`} style={{ backgroundColor: !isManualTime ? (activeAction.team === 'SYSTEM' ? '#000' : flowTeamColor) : '' }}>
                        {isManualTime ? 'Confirm' : (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout' ? 'Log Event' : 'Next ➔')}
                    </button>
                </div>
            </div>
        </div>
    );
}