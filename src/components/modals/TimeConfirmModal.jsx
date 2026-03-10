import React from 'react';
import { formatTime } from '../../utils';

export default function TimeConfirmModal({ dialog, onConfirm, onReject }) {
    if (!dialog) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[200] p-6">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-t-8 border-orange-500">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Confirm Time</h3>
                <p className="text-gray-600 mb-6 font-medium text-lg leading-snug">
                    Did you mean to enter <span className="font-black text-green-600 text-xl block mt-1">{formatTime(dialog.suggested)}?</span>
                </p>
                <div className="flex flex-col space-y-3">
                    <button onClick={() => onConfirm(dialog.suggested, dialog.nextStepStr)} className="w-full py-4 bg-green-600 text-white text-lg font-black rounded-xl hover:bg-green-700 shadow-md">
                        Yes, log as {formatTime(dialog.suggested)}
                    </button>
                    <button onClick={() => onReject(dialog.original, dialog.nextStepStr, dialog.isOriginalValid)} className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">
                        No, keep {formatTime(dialog.original)}
                    </button>
                </div>
            </div>
        </div>
    );
}