import React from 'react';

export default function ActivePenaltiesWidget({
    activePenaltiesAway, activePenaltiesHome,
    awayCSSColor, homeCSSColor,
    handlePPGoalScored, handlePenaltyExpired, startEditingReleaseTime
}) {
    const renderCardSquares = (penalty, isJustServing) => {
        if (!penalty) return null;
        if ((penalty.code === 'Y6' || penalty.isCombo) && !isJustServing) return '🟦 🟨';
        if (penalty.color === 'Blue') return '🟦';
        if (penalty.color === 'Yellow') return '🟨';
        if (penalty.color === 'Red') return '🟥';
        return '';
    };

    const PenaltyList = ({ penalties, color, title }) => (
        <div className="w-1/2 p-3 overflow-y-auto border-r-4 border-gray-300 last:border-r-0">
            <h3 className="text-xs font-black text-gray-500 uppercase mb-2">{title}</h3>
            {penalties.map(ev => (
                <div key={ev.id} className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow-sm border-l-4" style={{ borderColor: color }}>
                    <div>
                        <span className="font-bold text-gray-800 mr-2">
                            <span className="mr-1 text-sm">{renderCardSquares(ev.penalty, ev.isJustServing)}</span>
                            #{ev.entity?.number} {ev.entity?.name}
                        </span>
                        {ev.servingPlayer && (
                            <div className="text-xs text-gray-500 font-bold italic mb-1">
                                (Served by: #{ev.servingPlayer.number} {ev.servingPlayer.name})
                            </div>
                        )}
                        <div className="text-xs font-bold text-gray-500">Exp: {ev.releaseTime?.quarter} {ev.releaseTime?.time}</div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        {ev.isReleasable && <button onClick={() => handlePPGoalScored(ev.id)} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 transition">PPG Scored</button>}
                        <button onClick={() => startEditingReleaseTime(ev.id)} className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded border border-yellow-200 hover:bg-yellow-100 transition">Edit Exp.</button>
                        <button onClick={() => handlePenaltyExpired(ev.id)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border border-gray-200 hover:bg-gray-200 transition">Expired</button>
                    </div>
                </div>
            ))}
            {penalties.length === 0 && <p className="text-xs text-gray-400 font-bold italic">No active penalties</p>}
        </div>
    );

    return (
        <div className="h-40 bg-gray-100 border-t-4 border-gray-300 flex shrink-0">
            <PenaltyList penalties={activePenaltiesAway} color={awayCSSColor} title="Away Active Penalties" />
            <PenaltyList penalties={activePenaltiesHome} color={homeCSSColor} title="Home Active Penalties" />
        </div>
    );
}