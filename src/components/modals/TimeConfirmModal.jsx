import React from 'react';
import { formatTime } from '../../utils';

export default function TimeConfirmModal({ dialog, onConfirm, onReject }) {
    if (!dialog) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full text-center border-t-8 border-orange-500">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Confirm Time</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-5 font-medium text-lg leading-snug">
                    Did you mean to enter <span className="font-black text-green-600 dark:text-green-400 text-3xl tabular-nums block mt-1">{formatTime(dialog.suggested)}?</span>
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => onConfirm(dialog.suggested, dialog.nextStepStr)} className="w-full min-h-[52px] py-3 bg-green-600 text-white text-lg font-black rounded-xl hover:bg-green-700 shadow-md tabular-nums transition active:scale-[0.97] active:brightness-95">
                        Yes, log as {formatTime(dialog.suggested)}
                    </button>
                    <button onClick={() => onReject(dialog.original, dialog.nextStepStr, dialog.isOriginalValid)} className="w-full min-h-[52px] py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 tabular-nums transition active:scale-[0.97] active:brightness-95">
                        No, keep {formatTime(dialog.original)}
                    </button>
                </div>
            </div>
        </div>
    );
}
