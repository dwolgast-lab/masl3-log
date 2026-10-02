import React from 'react';

const CARD_BG = { Blue: '#0096FF', Yellow: '#FFCC00', Red: '#ED1C24' };

const Card = ({ color }) => (
    <div className="w-3 h-4 rounded-sm border border-black/20 shadow-sm shrink-0" style={{ backgroundColor: color }}></div>
);

const renderCards = (penalty, isJustServing) => {
    if (!penalty) return null;
    if ((penalty.code === 'Y6' || penalty.isCombo) && !isJustServing) {
        return <><Card color={CARD_BG.Blue} /><Card color={CARD_BG.Yellow} /></>;
    }
    if (CARD_BG[penalty.color]) return <Card color={CARD_BG[penalty.color]} />;
    return null;
};

const isMajorOffender = (ev) => ev.penalty?.code === 'Y6' && !ev.isJustServing && !ev.isReleasable;

const btn = "min-h-11 px-3 text-sm font-bold rounded border transition active:scale-[0.97] active:brightness-95";

const PenaltyList = ({ penalties, color, title, handlePPGoalScored, handlePenaltyExpired, handleMajorPenaltyRelease, startEditingReleaseTime }) => (
    <div className="w-1/2 p-3 overflow-y-auto border-r-4 border-slate-300 dark:border-slate-700 last:border-r-0">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{title}</h3>
        {penalties.map(ev => {
            const isMajor = isMajorOffender(ev);
            return (
                <div key={ev.id} className="bg-white dark:bg-slate-800 p-2 mb-2 rounded shadow-sm border-l-4" style={{ borderColor: color }}>
                    <div className="flex flex-wrap items-center gap-x-3">
                        <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span className="flex gap-0.5">{renderCards(ev.penalty, ev.isJustServing)}</span>
                            #{ev.entity?.number} {ev.entity?.name}
                        </span>
                        <span className="text-sm font-bold tabular-nums text-slate-500 dark:text-slate-400">
                            {isMajor ? 'Earliest: ' : 'Exp: '}
                            {ev.releaseTime?.quarter} {ev.releaseTime?.time}
                        </span>
                    </div>
                    {ev.servingPlayer && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-bold italic">
                            (Served by: #{ev.servingPlayer.number} {ev.servingPlayer.name})
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {ev.isReleasable && (
                            <button onClick={() => handlePPGoalScored(ev.id)} className={`${btn} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800`}>PPG Scored</button>
                        )}
                        {isMajor && (
                            <button onClick={() => handleMajorPenaltyRelease(ev.id)} className={`${btn} bg-green-50 text-green-700 border-green-300 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800`}>Released</button>
                        )}
                        {!isMajor && (
                            <button onClick={() => startEditingReleaseTime(ev.id)} className={`${btn} bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800`}>Edit Exp.</button>
                        )}
                        <button onClick={() => handlePenaltyExpired(ev.id)} className={`${btn} bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600`}>Expired</button>
                    </div>
                </div>
            );
        })}
        {penalties.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic">No active penalties</p>}
    </div>
);

export default function ActivePenaltiesWidget({
    activePenaltiesAway, activePenaltiesHome,
    awayCSSColor, homeCSSColor,
    handlePPGoalScored, handlePenaltyExpired, handleMajorPenaltyRelease, startEditingReleaseTime
}) {
    const handlers = { handlePPGoalScored, handlePenaltyExpired, handleMajorPenaltyRelease, startEditingReleaseTime };

    if (activePenaltiesAway.length === 0 && activePenaltiesHome.length === 0) {
        return (
            <div className="h-10 flex items-center px-4 bg-slate-100 dark:bg-slate-900 border-t-4 border-slate-300 dark:border-slate-700 shrink-0">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">No active penalties</span>
            </div>
        );
    }

    return (
        <div className="max-h-[30dvh] bg-slate-100 dark:bg-slate-900 border-t-4 border-slate-300 dark:border-slate-700 flex shrink-0 overflow-hidden">
            <PenaltyList penalties={activePenaltiesAway} color={awayCSSColor} title="Away Active Penalties" {...handlers} />
            <PenaltyList penalties={activePenaltiesHome} color={homeCSSColor} title="Home Active Penalties" {...handlers} />
        </div>
    );
}
