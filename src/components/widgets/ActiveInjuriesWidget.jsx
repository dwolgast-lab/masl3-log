import React from 'react';

export default function ActiveInjuriesWidget({ activeInjuries, handleInjuryCleared }) {
    if (!activeInjuries || activeInjuries.length === 0) return null;

    return (
        <div className="bg-red-50 border-t-4 border-red-300 dark:bg-red-950/40 dark:border-red-900 flex flex-col p-3 overflow-x-auto shrink-0">
            <h3 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase mb-2 shrink-0">Active Injuries (Return Eligibility)</h3>
            <div className="flex gap-4">
                {activeInjuries.map(ev => (
                    <div key={ev.id} className="flex justify-between items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded shadow-sm border-l-4 border-red-500 min-w-[250px]">
                        <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                            <div className="text-sm font-bold tabular-nums text-red-600 dark:text-red-300 mt-1">Return: {ev.eligibleReturnTime.quarter} @ {ev.eligibleReturnTime.time}</div>
                        </div>
                        <button onClick={() => handleInjuryCleared(ev.id)} className="min-h-11 px-4 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-sm font-bold rounded border border-red-200 dark:border-red-800 hover:bg-red-200 transition active:scale-[0.97] active:brightness-95">Dismiss</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
