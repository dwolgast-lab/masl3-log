import React from 'react';
import { QUARTERS } from '../../config';
import { formatTime, readableTextOn } from '../../utils';

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
    const isMajorRelease = manualTimeMode === 'MAJOR_RELEASE';

    let title = '';
    if (isPPG) title = 'Enter PPG Time';
    else if (isRelease) title = 'Edit Release Time';
    else if (isMajorRelease) title = 'Log Major Penalty Release';
    else title = activeAction.team === 'SYSTEM' ? activeAction.type : `${flowTeamName} - ${activeAction.type}`;

    let subtitle = '';
    if (isPPG) subtitle = 'No auto-match found. When did the goal happen?';
    else if (isRelease) subtitle = 'Manually override the penalty expiration time.';
    else if (isMajorRelease) subtitle = 'Enter the stoppage time when the player was released (first stoppage after 7 min).';

    const primaryBg = isManualTime ? null : (activeAction.team === 'SYSTEM' ? '#000000' : flowTeamColor);
    const flagBtn = (on) => `flex-1 min-h-11 px-1 text-sm rounded-lg font-bold transition active:scale-[0.97] active:brightness-95 ${on ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}`;
    const digitKey = 'min-h-16 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 text-3xl font-bold tabular-nums rounded-xl border border-slate-300 dark:border-slate-600 transition active:scale-[0.97] active:brightness-95';

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-5 rounded-2xl shadow-2xl w-full max-w-md max-h-[96dvh] overflow-y-auto flex flex-col items-center ${isManualTime ? 'border-4 border-blue-500' : ''}`}>
                <h3 className={`text-2xl font-black mb-1 uppercase text-center ${isManualTime ? 'text-blue-600 dark:text-blue-400' : ''}`} style={{ color: !isManualTime && activeAction.team !== 'SYSTEM' ? flowTeamColor : '' }}>
                    {title}
                </h3>

                {isManualTime && <p className="text-slate-500 dark:text-slate-400 font-bold mb-3 text-center text-sm">{subtitle}</p>}

                {(!isPeriodRunning || editingEventId || isManualTime) ? (
                    <div className="w-full mb-3">
                        <label className={`block text-xs font-bold mb-1.5 uppercase text-center tracking-widest ${isManualTime ? 'text-blue-800 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            {isPPG ? 'Quarter Scored:' : (isRelease || isMajorRelease) ? 'Release Quarter:' : 'Event Quarter'}
                        </label>
                        <div className={`flex rounded-lg p-1 w-full justify-between gap-1 shadow-inner ${isManualTime ? 'bg-blue-100 dark:bg-blue-950' : 'bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700'}`}>
                            {QUARTERS.map(q => (
                                <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 min-h-11 rounded-md font-bold text-sm transition active:scale-[0.97] ${modalQuarter === q ? (isManualTime ? 'bg-blue-600 text-white shadow-md' : 'bg-black text-white dark:bg-white dark:text-black shadow-md') : (isManualTime ? 'text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700')}`}>{q}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-2">Quarter: <span className="text-black dark:text-white">{modalQuarter}</span></p>
                )}

                <div className={`text-6xl font-mono font-black mb-3 px-4 py-2 rounded-xl tracking-widest tabular-nums text-center w-full border-2 ${isManualTime ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700'}`} style={{ borderColor: !isManualTime && activeAction.team !== 'SYSTEM' ? flowTeamColor : '' }}>
                    {timeInput.length === 0 ? "00:00" : formatTime(timeInput)}
                </div>

                {activeAction.type === 'Goal / Assist' && !isManualTime && (
                    <div className="flex justify-between w-full mb-3 gap-2">
                        <button aria-pressed={!!goalFlags.pp} onClick={() => setGoalFlags({...goalFlags, pp: !goalFlags.pp})} className={flagBtn(goalFlags.pp)}>Power Play</button>
                        <button aria-pressed={!!goalFlags.shootout} onClick={() => setGoalFlags({...goalFlags, shootout: !goalFlags.shootout})} className={flagBtn(goalFlags.shootout)}>Shootout</button>
                        <button aria-pressed={!!goalFlags.pk} onClick={() => setGoalFlags({...goalFlags, pk: !goalFlags.pk})} className={flagBtn(goalFlags.pk)}>Penalty Kick</button>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 w-full mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleKeypad(num.toString())} className={digitKey}>{num}</button>
                    ))}
                    <button onClick={() => handleKeypad('clear')} className="min-h-16 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 text-xl font-bold rounded-xl border border-red-300 dark:border-red-800 transition active:scale-[0.97] active:brightness-95">Clear</button>
                    <button onClick={() => handleKeypad('0')} className={digitKey}>0</button>
                    <button onClick={() => handleKeypad('del')} className="min-h-16 bg-slate-300 text-slate-800 hover:bg-slate-400 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 text-xl font-bold rounded-xl transition active:scale-[0.97] active:brightness-95">Del</button>
                </div>

                <div className="flex gap-3 w-full">
                    <button onClick={() => {
                        if (isRelease) {
                            setManualTimeMode(null);
                            setModalStep('EVENT_LOG');
                        } else {
                            setModalStep(null);
                        }
                    }} className="flex-1 min-h-[52px] border-2 border-red-500 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition active:scale-[0.97] active:brightness-95">Cancel</button>

                    <button onClick={() => {
                        if (isManualTime) validateAndAdvanceTime('FINALIZE_MANUAL_TIME');
                        else {
                            let nextStr = 'PLAYER';
                            if (activeAction.type === 'Time Penalty') nextStr = 'CARD_COLOR';
                            else if (activeAction.type === 'Team Warnings') nextStr = 'WARNING_REASON';
                            else if (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout') nextStr = 'FINALIZE_TEAM_EVENT';
                            validateAndAdvanceTime(nextStr);
                        }
                    }} className={`flex-1 min-h-[52px] font-black rounded-lg shadow transition active:scale-[0.97] active:brightness-95 ${isManualTime ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`} style={!isManualTime ? { backgroundColor: primaryBg, color: readableTextOn(primaryBg) } : undefined}>
                        {isManualTime ? 'Confirm' : (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout' ? 'Log Event' : 'Next ➔')}
                    </button>
                </div>
            </div>
        </div>
    );
}
