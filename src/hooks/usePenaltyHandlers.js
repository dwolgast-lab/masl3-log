import { formatTime, toElapsedSeconds } from '../utils';

export function usePenaltyHandlers({
    gameEvents, setGameEvents,
    quarter, modalQuarter, setModalQuarter,
    targetPenaltyId, setTargetPenaltyId,
    setModalStep, setManualTimeMode, setTimeInput,
    manualTimeMode
}) {
    const handlePPGoalScored = (eventId) => {
        const penalty = gameEvents.find(ev => ev.id === eventId);
        if (!penalty || !penalty.releaseTime) return;
        const penaltyElapsed = toElapsedSeconds(penalty.quarter, penalty.time);
        const releaseElapsed = toElapsedSeconds(penalty.releaseTime.quarter, penalty.releaseTime.time);
        const oppTeam = penalty.team === 'AWAY' ? 'HOME' : 'AWAY';
        const ppGoals = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === oppTeam && ev.goalFlags?.pp);
        ppGoals.sort((a, b) => toElapsedSeconds(b.quarter, b.time) - toElapsedSeconds(a.quarter, a.time));
        const validGoal = ppGoals.find(g => {
            const gElapsed = toElapsedSeconds(g.quarter, g.time);
            return gElapsed >= penaltyElapsed && gElapsed <= releaseElapsed;
        });

        if (validGoal) {
            setGameEvents(gameEvents.map(ev => ev.id === eventId
                ? { ...ev, actualReleaseTime: { quarter: validGoal.quarter, time: validGoal.time }, clearedFromBoard: true }
                : ev
            ));
            alert(`Penalty successfully released based on PPG at ${validGoal.quarter} ${validGoal.time}.`);
        } else {
            setModalQuarter(quarter);
            setTargetPenaltyId(eventId);
            setTimeInput('');
            setManualTimeMode('PPG');
            setModalStep('MANUAL_TIME_ENTRY');
        }
    };

    const startEditingReleaseTime = (eventId) => {
        const ev = gameEvents.find(e => e.id === eventId);
        if (ev && ev.releaseTime) {
            setTargetPenaltyId(eventId);
            setModalQuarter(ev.releaseTime.quarter);
            setTimeInput(ev.releaseTime.time.replace(':', ''));
            setManualTimeMode('RELEASE');
            setModalStep('MANUAL_TIME_ENTRY');
        }
    };

    const handleMajorPenaltyRelease = (eventId) => {
        const ev = gameEvents.find(e => e.id === eventId);
        if (ev && ev.releaseTime) {
            setTargetPenaltyId(eventId);
            setModalQuarter(ev.releaseTime.quarter);
            setTimeInput('');
            setManualTimeMode('MAJOR_RELEASE');
            setModalStep('MANUAL_TIME_ENTRY');
        }
    };

    const processManualTime = (validTimeStr) => {
        if (manualTimeMode === 'PPG') {
            setGameEvents(gameEvents.map(ev => ev.id === targetPenaltyId
                ? { ...ev, actualReleaseTime: { quarter: modalQuarter, time: formatTime(validTimeStr) }, clearedFromBoard: true }
                : ev
            ));
            setModalStep(null);
        } else if (manualTimeMode === 'RELEASE') {
            setGameEvents(gameEvents.map(ev => ev.id === targetPenaltyId
                ? { ...ev, releaseTime: { quarter: modalQuarter, time: formatTime(validTimeStr) } }
                : ev
            ));
            setModalStep('EVENT_LOG');
        } else if (manualTimeMode === 'MAJOR_RELEASE') {
            setGameEvents(gameEvents.map(ev => ev.id === targetPenaltyId
                ? { ...ev, majorReleaseTime: { quarter: modalQuarter, time: formatTime(validTimeStr) }, clearedFromBoard: true }
                : ev
            ));
            setModalStep(null);
        }
        setTargetPenaltyId(null);
        setManualTimeMode(null);
    };

    const handlePenaltyExpired = (eventId) => setGameEvents(
        gameEvents.map(ev => ev.id === eventId ? { ...ev, clearedFromBoard: true } : ev)
    );

    return { handlePPGoalScored, startEditingReleaseTime, handleMajorPenaltyRelease, processManualTime, handlePenaltyExpired };
}
