import React from 'react';

export default function ActiveInjuriesWidget({ activeInjuries, handleInjuryCleared }) {
    if (!activeInjuries || activeInjuries.length === 0) return null;

    return (
        <div className="bg-red-50 border-t-4 border-red-300 flex flex-col p-3 overflow-x-auto min-h-24 shrink-0">
            <h3 className="text-xs font-black text-red-800 uppercase mb-2 shrink-0">Active Injuries (Return Eligibility)</h3>
            <div className="flex space-x-4">
                {activeInjuries.map(ev => (
                    <div key={ev.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border-l-4 border-red-500 min-w-[250px]">
                        <div>
                            <span className="font-bold text-gray-800 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                            <div className="text-xs font-bold text-red-600 mt-1">Return: {ev.eligibleReturnTime.quarter} @ {ev.eligibleReturnTime.time}</div>
                        </div>
                        <button onClick={() => handleInjuryCleared(ev.id)} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200 hover:bg-red-200 transition ml-4">Dismiss</button>
                    </div>
                ))}
            </div>
        </div>
    );
}