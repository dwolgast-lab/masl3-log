import React from 'react';
import { TEAM_WARNINGS } from '../../config';

export default function WarningModal({ modalStep, flowTeamColor, finalizeWarning, setModalStep }) {
    if (modalStep !== 'WARNING_REASON') return null;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto flex flex-col items-center">
                <h3 className="text-2xl font-black mb-5 uppercase" style={{ color: flowTeamColor }}>Select Reason</h3>
                <div className="flex flex-col w-full gap-3 mb-5">
                    {TEAM_WARNINGS.map(reason => (
                        <button key={reason} onClick={() => finalizeWarning(reason)} className="w-full min-h-14 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-lg font-bold rounded-xl shadow-sm border-2 border-transparent hover:border-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-[0.97] active:brightness-95">
                            {reason}
                        </button>
                    ))}
                </div>
                <button onClick={() => setModalStep('TIME')} className="min-h-11 px-4 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition active:scale-[0.97]">⬅ Back to Time</button>
            </div>
        </div>
    );
}
