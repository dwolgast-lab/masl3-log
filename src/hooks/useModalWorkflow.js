export function useModalWorkflow({
    timeInput, setTimeInput,
    activeAction, setActiveAction,
    setModalStep, setTimeConfirmDialog,
    setModalQuarter,
    quarter, gameData, gameEvents,
    setGoalScorer, setPlayerSearchInput,
    setPenaltyData, setBenchPenaltyEntity,
    setGoalFlags, setRequiresSubstituteServer,
    finalizeEvent, processManualTime
}) {
    const commitTime = (timeStr, nextStepStr) => {
        const mm = parseInt(timeStr.substring(0, 2));
        const ss = parseInt(timeStr.substring(2, 4));
        if (activeAction.type === 'Media Timeout' && (mm * 60 + ss > 8 * 60)) {
            alert("Media Timeouts cannot be taken before 8:00 remaining in the quarter.");
            return;
        }
        setTimeInput(timeStr);
        setActiveAction(prev => ({ ...prev, time: timeStr }));

        if (activeAction.type === 'Video Review') {
            setModalStep('VIDEO_REVIEW');
        } else if (nextStepStr === 'FINALIZE_TEAM_EVENT') {
            finalizeEvent('Team', null, null, timeStr);
        } else if (nextStepStr === 'FINALIZE_MANUAL_TIME') {
            processManualTime(timeStr);
        } else {
            setModalStep(nextStepStr);
        }
    };

    const validateAndAdvanceTime = (nextStepStr) => {
        const raw = timeInput || '';
        const padded = raw.padEnd(4, '0');
        const mm = parseInt(padded.substring(0, 2));
        const ss = parseInt(padded.substring(2, 4));

        const isValid = (m, s) => (m <= 15 && !(m === 15 && s > 0) && s <= 59);
        const isPrimaryValid = isValid(mm, ss);

        const suggRaw = '0' + padded.substring(0, 3);
        const suggMm = parseInt(suggRaw.substring(0, 2));
        const suggSs = parseInt(suggRaw.substring(2, 4));
        const isSuggValid = isValid(suggMm, suggSs);

        let shouldAsk = false;
        if (!isPrimaryValid && isSuggValid) shouldAsk = true;
        else if (isPrimaryValid && isSuggValid && raw.length === 3) shouldAsk = true;
        else if (isPrimaryValid && isSuggValid && raw.length === 4 && raw.endsWith('0') && raw[0] !== '0') shouldAsk = true;

        if (shouldAsk) {
            setTimeConfirmDialog({ original: padded, suggested: suggRaw, nextStepStr, isOriginalValid: isPrimaryValid });
            return;
        }

        if (isPrimaryValid) {
            commitTime(padded, nextStepStr);
        } else {
            alert("Invalid Time. Please enter a valid match time between 15:00 and 00:00.");
        }
    };

    const triggerAction = (teamIdentifier, actionType) => {
        if (actionType === 'Team Timeout') {
            const timeoutsUsed = gameEvents.filter(ev => ev.type === 'Team Timeout' && ev.team === teamIdentifier).length;
            if (timeoutsUsed >= 2) {
                alert(`The ${teamIdentifier === 'AWAY' ? gameData.awayTeam || 'Away' : gameData.homeTeam || 'Home'} team has already used their maximum of 2 timeouts.`);
                return;
            }
        }
        setActiveAction({ team: teamIdentifier, type: actionType, time: null });
        setModalQuarter(quarter);
        setPlayerSearchInput('');
        setGoalScorer(null);
        setPenaltyData({ color: null, code: null, desc: null, blueCode: null, blueDesc: null });
        setBenchPenaltyEntity(null);
        setGoalFlags({ pp: false, shootout: false, pk: false });
        setRequiresSubstituteServer(false);

        if (actionType === 'Log Foul') { setTimeInput(''); setModalStep('PLAYER'); }
        else { setTimeInput(''); setModalStep('TIME'); }
    };

    return { commitTime, validateAndAdvanceTime, triggerAction };
}
