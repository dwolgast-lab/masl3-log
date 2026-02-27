import React from 'react';
import { TEAM_WARNINGS } from '../../config';

export default function WarningModal({ modalStep, flowTeamColor, finalizeWarning, setModalStep }) {
    if (modalStep !== 'WARNING_REASON') return null;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center">
                <h3 className="text-2xl font-black mb-6 uppercase" style={{ color: flowTeamColor }}>Select Reason</h3>
                <div className="flex flex-col w-full space-y-3 mb-8">
                    {TEAM_WARNINGS.map(reason => (
                        <button key={reason} onClick={() => finalizeWarning(reason)} className="w-full py-4 bg-gray-100 text-gray-800 text-lg font-bold rounded-xl shadow-sm border-2 border-transparent hover:border-gray-400 hover:bg-gray-200 transition">
                            {reason}
                        </button>
                    ))}
                </div>
                <button onClick={() => setModalStep('TIME')} className="font-bold text-gray-500 hover:text-gray-800">⬅ Back to Time</button>
            </div>
        </div>
    );
}