/* =========================================================================
 * MASL 4th Official Log App
 * Author: Dave Wolgast
 * Version: 0.76
 * ========================================================================= */

import { useState, useEffect } from 'react';
import { useStickyState, formatTime, toElapsedSeconds, calcReleaseTime, calcInjuryReturn, getTeamColor } from './utils';
import { generateAlternatePDF } from './alternatePdfEngine';

import PregameSetup from './views/PregameSetup';
import InGameDashboard from './views/InGameDashboard';
import TimerOverlay from './components/TimerOverlay';
import AlertOverlay from './components/AlertOverlay';
import FoulSummary from './components/FoulSummary';
import EventLog from './components/EventLog';

import WarningModal from './components/modals/WarningModal';
import PenaltyModal from './components/modals/PenaltyModal';
import TimeKeypadModal from './components/modals/TimeKeypadModal';
import PlayerSelectModal from './components/modals/PlayerSelectModal';
import TimeConfirmModal from './components/modals/TimeConfirmModal';

const APP_VERSION = "0.76";

let audioCtx = null;
const initAudio = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
};

const playBells = (count) => {
    if (!audioCtx) return;
    for (let i = 0; i < count; i++) {
        const startTime = audioCtx.currentTime + (i * 0.6); 
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = 'sine'; osc1.frequency.value = 1046.50; 
        osc2.type = 'sine'; osc2.frequency.value = 2093.00; 
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
        osc1.start(startTime); osc2.start(startTime);
        osc1.stop(startTime + 0.6); osc2.stop(startTime + 0.6);
    }
};

export default function App() {
    const [currentView, setCurrentView] = useStickyState('pregame', 'masl-view'); 
    const [gameData, setGameData] = useStickyState({
        date: new Date().toISOString().split('T')[0], scheduledKO: '', gameNumber: '', venue: '', city: '', league: 'MASL3', 
        awayTeam: '', awayColor: '', awayColorName: '', awayLogo: '', 
        homeTeam: '', homeColor: '', homeColorName: '', homeLogo: '', 
        crewChief: '', referee: '', assistantRef: '', fourthOfficial: ''
    }, 'masl-data');

    const [awayRoster, setAwayRoster] = useStickyState([], 'masl-awayRoster');
    const [homeRoster, setHomeRoster] = useStickyState([], 'masl-homeRoster');
    const [awayBench, setAwayBench] = useStickyState([], 'masl-awayBench');
    const [homeBench, setHomeBench] = useStickyState([], 'masl-homeBench');
    const [quarter, setQuarter] = useStickyState('Q1', 'masl-quarter');
    const [isPeriodRunning, setIsPeriodRunning] = useStickyState(false, 'masl-period-running');
    const [gameEvents, setGameEvents] = useStickyState([], 'masl-events'); 

    const [activeRosterModal, setActiveRosterModal] = useState(null); 
    const [showStartersModal, setShowStartersModal] = useState(false);
    const [newPlayer, setNewPlayer] = useState({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false });
    const [newBench, setNewBench] = useState({ name: '', role: 'Head Coach' });
    const [modalStep, setModalStep] = useState(null); 
    const [activeAction, setActiveAction] = useState({ team: '', type: '', time: null });
    const [timeInput, setTimeInput] = useState('');
    const [modalQuarter, setModalQuarter] = useState('Q1'); 
    const [playerSearchInput, setPlayerSearchInput] = useState('');
    const [editingEventId, setEditingEventId] = useState(null);
    const [summaryTeam, setSummaryTeam] = useState(null); 
    const [foulAlert, setFoulAlert] = useState(null); 
    const [goalScorer, setGoalScorer] = useState(null);
    const [penaltyData, setPenaltyData] = useState({ color: null, code: null, desc: null, blueCode: null, blueDesc: null });
    const [benchPenaltyEntity, setBenchPenaltyEntity] = useState(null); 
    const [targetPenaltyId, setTargetPenaltyId] = useState(null); 
    const [manualTimeMode, setManualTimeMode] = useState(null); 
    const [goalFlags, setGoalFlags] = useState({ pp: false, shootout: false, pk: false });
    const [requiresSubstituteServer, setRequiresSubstituteServer] = useState(false);
    const [appTimer, setAppTimer] = useState({ active: false, time: 0, initialTime: 0, label: '', minimized: false });

    const [timeConfirmDialog, setTimeConfirmDialog] = useState(null);
    const [lastAddedEventId, setLastAddedEventId] = useState(null);

    const awayScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'AWAY').length;
    const homeScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'HOME').length;
    const awayCSSColor = getTeamColor(gameData.awayColor, '#1e40af'); 
    const homeCSSColor = getTeamColor(gameData.homeColor, '#991b1b'); 
    const activePenaltiesAway = gameEvents.filter(ev => ev.type === 'Time Penalty' && ev.team === 'AWAY' && !ev.clearedFromBoard && (ev.releaseTime || ev.majorReleaseTime));
    const activePenaltiesHome = gameEvents.filter(ev => ev.type === 'Time Penalty' && ev.team === 'HOME' && !ev.clearedFromBoard && (ev.releaseTime || ev.majorReleaseTime));
    const flowTeamRoster = activeAction.team === 'AWAY' ? awayRoster : homeRoster;
    const flowTeamColor = activeAction.team === 'AWAY' ? awayCSSColor : homeCSSColor;
    const flowTeamName = activeAction.team === 'AWAY' ? (gameData.awayTeam || 'AWAY') : (gameData.homeTeam || 'HOME');
    const filteredFlowRoster = playerSearchInput ? flowTeamRoster.filter(p => p.number.startsWith(playerSearchInput)) : flowTeamRoster;
    const activeBench = activeAction.team === 'AWAY' ? awayBench : homeBench;

    useEffect(() => {
        let interval = null;
        if (appTimer.active) {
            interval = setInterval(() => {
                setAppTimer(prev => {
                    const newTime = prev.time - 1;
                    const elapsed = prev.initialTime - newTime;
                    const isTimeout = prev.label === 'MEDIA TIMEOUT' || prev.label === 'TEAM TIMEOUT';
                    let nextState = { ...prev, time: newTime };
                    if (!prev.minimized && elapsed === 15) nextState.minimized = true;
                    
                    if (isTimeout) {
                        if (newTime === 30) playBells(1);
                        if (newTime === 15) playBells(2);
                        if (newTime === 0) playBells(4);
                        if (newTime <= -15) return { active: false, time: 0, initialTime: 0, label: '', minimized: false };
                    } else {
                        if (newTime <= 0) return { active: false, time: 0, initialTime: 0, label: '', minimized: false };
                    }
                    return nextState;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [appTimer.active]);

    const handleInputChange = (e) => setGameData({ ...gameData, [e.target.name]: e.target.value });
    const handleKeypad = (num) => {
        if (num === 'clear') setTimeInput('');
        else if (num === 'del') setTimeInput(prev => prev.slice(0, -1));
        else if (timeInput.length < 4) setTimeInput(prev => prev + num);
    };

    const commitTime = (timeStr, nextStepStr) => {
        let mm = parseInt(timeStr.substring(0, 2));
        let ss = parseInt(timeStr.substring(2, 4));
        if (activeAction.type === 'Media Timeout' && (mm * 60 + ss > 8 * 60)) {
            alert("Media Timeouts cannot be taken before 8:00 remaining in the quarter.");
            return; 
        }
        setTimeInput(timeStr); 
        setActiveAction(prev => ({ ...prev, time: timeStr }));
        
        if (nextStepStr === 'FINALIZE_TEAM_EVENT') finalizeEvent('Team', null, null, timeStr);
        else if (nextStepStr === 'FINALIZE_MANUAL_TIME') processManualTime(timeStr);
        else setModalStep(nextStepStr);
    };

    const validateAndAdvanceTime = (nextStepStr) => {
        let raw = timeInput || '';
        let padded = raw.padEnd(4, '0');
        let mm = parseInt(padded.substring(0, 2));
        let ss = parseInt(padded.substring(2, 4));

        const isValid = (m, s) => (m <= 15 && !(m === 15 && s > 0) && s <= 59);
        let isPrimaryValid = isValid(mm, ss);

        let suggRaw = '0' + padded.substring(0, 3);
        let suggMm = parseInt(suggRaw.substring(0, 2));
        let suggSs = parseInt(suggRaw.substring(2, 4));
        let isSuggValid = isValid(suggMm, suggSs);

        let shouldAsk = false;
        
        if (!isPrimaryValid && isSuggValid) {
            shouldAsk = true; 
        } else if (isPrimaryValid && isSuggValid && raw.length === 3) {
            shouldAsk = true; 
        } else if (isPrimaryValid && isSuggValid && raw.length === 4 && raw.endsWith('0') && raw[0] !== '0') {
            shouldAsk = true; 
        }

        if (shouldAsk) {
            setTimeConfirmDialog({ original: padded, suggested: suggRaw, nextStepStr: nextStepStr, isOriginalValid: isPrimaryValid });
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
        setModalQuarter(quarter); setPlayerSearchInput(''); setGoalScorer(null); 
        setPenaltyData({ color: null, code: null, desc: null, blueCode: null, blueDesc: null }); 
        setBenchPenaltyEntity(null); setGoalFlags({ pp: false, shootout: false, pk: false }); setRequiresSubstituteServer(false);
        if (actionType === 'Log Foul') { setTimeInput(''); setModalStep('PLAYER'); } 
        else { setTimeInput(''); setModalStep('TIME'); }
    };

    const clearAllGameData = () => {
        if(window.confirm("WARNING: This will permanently delete all rosters, settings, and game logs. Are you starting a new game?")) { localStorage.clear(); window.location.reload(); }
    };

    const togglePeriod = () => {
        const realTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        if (!isPeriodRunning) {
            setIsPeriodRunning(true);
            setGameEvents([{ id: Date.now(), type: 'Period Marker', quarter: quarter, action: 'Start', realTime: realTime, team: 'SYSTEM', entity: `Start ${quarter}` }, ...gameEvents]);
            alert(`${quarter} has officially started.`);
        } else {
            setIsPeriodRunning(false);
            setGameEvents([{ id: Date.now(), type: 'Period Marker', quarter: quarter, action: 'End', realTime: realTime, team: 'SYSTEM', entity: `End ${quarter}` }, ...gameEvents]);
            const unattributed = gameEvents.filter(ev => ev.quarter === quarter && ev.type === 'Log Foul' && ev.entity === 'Unattributed');
            if (unattributed.length > 0) alert(`WARNING: There are ${unattributed.length} Unattributed Foul(s) in ${quarter}. Please assign them via the Game Log.`);

            if (quarter === 'Q1' || quarter === 'Q3') {
                setAppTimer({ active: true, time: 180, initialTime: 180, label: 'QUARTER BREAK', minimized: false }); 
            } else if (quarter === 'Q2') {
                const isProLeague = ['MASL', 'MASL2'].includes(gameData.league);
                const htSeconds = isProLeague ? 900 : 600;
                setAppTimer({ active: true, time: htSeconds, initialTime: htSeconds, label: 'HALFTIME', minimized: false }); 
            } else if (quarter === 'Q4') {
                alert("The 4th Quarter has ended. If going to OT, please change the quarter manually.");
            }

            const nextQ = quarter === 'Q1' ? 'Q2' : quarter === 'Q2' ? 'Q3' : quarter === 'Q3' ? 'Q4' : quarter === 'Q4' ? 'OT' : 'END';
            if (nextQ !== 'END') setQuarter(nextQ);
        }
    };

    const handlePlayerSelect = (entity) => {
        if (modalStep === 'PLAYER') {
            if (activeAction.type === 'Goal / Assist') {
                if (entity === 'Own Goal') finalizeEvent(entity, 'Unassisted'); 
                else { setGoalScorer(entity); setPlayerSearchInput(''); setModalStep('ASSIST'); }
            } else if (activeAction.type === 'Time Penalty') {
                finalizeEvent(entity);
            } else { finalizeEvent(entity); }
        } else if (modalStep === 'ASSIST') {
            if (goalScorer && typeof goalScorer !== 'string' && goalScorer.id === entity.id) alert("The goal scorer cannot also be credited with the assist.");
            else finalizeEvent(goalScorer, entity);
        } else if (modalStep === 'SERVING_PLAYER') {
            finalizeEvent(benchPenaltyEntity, null, entity);
        }
    };

    const finalizeWarning = (reason) => {
        const finalTimeRaw = activeAction.time || timeInput;
        const finalTimeStr = finalTimeRaw ? (finalTimeRaw.length === 0 ? "00:00" : formatTime(finalTimeRaw)) : "00:00";

        const WARNING_TO_YELLOW_MAP = {
            'Bench Dissent': 'Y2',
            'Delay of Game': 'Y14',
            'Embellishment': 'Y7',
            'Encroachment': 'Y15',
            'Shootout/PK': 'Y12'
        };

        if (editingEventId) {
            setGameEvents(gameEvents.map(ev => ev.id === editingEventId ? {
                ...ev, quarter: modalQuarter, time: finalTimeStr, warningReason: reason
            } : ev));
            setEditingEventId(null); setModalStep('EVENT_LOG');
        } else {
            const prevWarningCount = gameEvents.filter(ev => ev.type === 'Team Warnings' && ev.team === activeAction.team && ev.warningReason === reason).length;
            const newEventId = Date.now();
            const newEvent = { id: newEventId, team: activeAction.team, type: activeAction.type, quarter: modalQuarter, time: finalTimeStr, entity: 'Team / Bench', warningReason: reason };
            
            setGameEvents([newEvent, ...gameEvents]);
            setLastAddedEventId(newEventId);
            
            if (prevWarningCount >= 1) {
                const mappedCode = WARNING_TO_YELLOW_MAP[reason] || 'Y';
                setActiveAction({ team: activeAction.team, type: 'Time Penalty', time: finalTimeRaw });
                setPenaltyData({ color: 'Yellow', code: mappedCode, desc: `2nd Warning: ${reason}`, blueCode: null, blueDesc: null });
                setModalStep('PLAYER'); 
                return; 
            }
            setModalStep(null);
        }
    };

    const finalizeEvent = (selectedEntity, assistEntity = null, servingPlayerEntity = null, overrideTimeStr = null) => {
        const finalTimeRaw = overrideTimeStr || activeAction.time || timeInput;
        const finalTimeStr = finalTimeRaw ? (finalTimeRaw.length === 0 ? "00:00" : formatTime(finalTimeRaw)) : "00:00";

        if (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout') {
            const newId = Date.now();
            setGameEvents([{ id: newId, team: activeAction.team, type: activeAction.type, quarter: modalQuarter, time: finalTimeStr, entity: 'Team' }, ...gameEvents]);
            setLastAddedEventId(newId);
            setModalStep(null); initAudio(); 
            if (activeAction.type === 'Media Timeout') setAppTimer({ active: true, time: 90, initialTime: 90, label: 'MEDIA TIMEOUT', minimized: false });
            if (activeAction.type === 'Team Timeout') setAppTimer({ active: true, time: 60, initialTime: 60, label: 'TEAM TIMEOUT', minimized: false });
            return;
        }

        let updatedEvents = [...gameEvents];
        let primaryAddedId = Date.now();

        let existingBlueCombo = null;
        if (!editingEventId && activeAction.type === 'Time Penalty' && penaltyData.color === 'Yellow' && penaltyData.code !== 'Y6' && selectedEntity?.id) {
            existingBlueCombo = updatedEvents.find(ev => 
                ev.type === 'Time Penalty' && ev.entity?.id === selectedEntity.id && 
                ev.penalty?.color === 'Blue' && !ev.isJustServing && !ev.clearedFromBoard
            );
        }

        if (existingBlueCombo) {
            const newOffenderRelease = calcReleaseTime(existingBlueCombo.releaseTime.quarter, existingBlueCombo.releaseTime.time, 5);
            
            updatedEvents = updatedEvents.map(ev => 
                ev.id === existingBlueCombo.id ? { 
                    ...ev, 
                    isReleasable: false, 
                    releaseTime: newOffenderRelease, 
                    penalty: { ...ev.penalty, desc: ev.penalty.desc + ` (+ ${penaltyData.code})`, isCombo: true } 
                } : ev
            );

            const serverEvent = {
                id: primaryAddedId + 1, team: activeAction.team, type: 'Time Penalty', quarter: modalQuarter, time: finalTimeStr,
                entity: servingPlayerEntity, servingPlayer: null, assist: null, 
                penalty: { color: 'Blue', code: existingBlueCombo.penalty.code, desc: `Serving Power Play for ${selectedEntity.name || '#' + selectedEntity.number}` }, 
                goalFlags: null, eligibleReturnTime: null, 
                isReleasable: true, 
                releaseTime: existingBlueCombo.releaseTime,
                majorReleaseTime: null, actualReleaseTime: null,
                clearedFromBoard: false, isJustServing: true
            };

            const yellowEvent = {
                id: primaryAddedId, team: activeAction.team, type: 'Time Penalty', quarter: modalQuarter, time: finalTimeStr,
                entity: selectedEntity, servingPlayer: servingPlayerEntity, assist: null, penalty: penaltyData, goalFlags: null, eligibleReturnTime: null,
                isReleasable: false, releaseTime: null, majorReleaseTime: null, actualReleaseTime: null, clearedFromBoard: true 
            };
            
            updatedEvents = [serverEvent, yellowEvent, ...updatedEvents];
        } 
        else if (!editingEventId && activeAction.type === 'Time Penalty' && penaltyData.code === 'Y6') {
            const offenderEvent = {
                id: primaryAddedId, team: activeAction.team, type: 'Time Penalty', quarter: modalQuarter, time: finalTimeStr,
                entity: selectedEntity, servingPlayer: null, assist: null, 
                penalty: penaltyData, goalFlags: null, eligibleReturnTime: null,
                isReleasable: false, releaseTime: calcReleaseTime(modalQuarter, finalTimeStr, 7), majorReleaseTime: null, actualReleaseTime: null,
                clearedFromBoard: false
            };
            const serverEvent = {
                id: primaryAddedId + 1, team: activeAction.team, type: 'Time Penalty', quarter: modalQuarter, time: finalTimeStr,
                entity: servingPlayerEntity, servingPlayer: null, assist: null, 
                penalty: { color: 'Blue', code: penaltyData.blueCode, desc: `Serving ${penaltyData.blueCode} for ${selectedEntity.name || '#' + selectedEntity.number}` }, 
                goalFlags: null, eligibleReturnTime: null,
                isReleasable: true, releaseTime: calcReleaseTime(modalQuarter, finalTimeStr, 2), majorReleaseTime: null, actualReleaseTime: null,
                clearedFromBoard: false, isJustServing: true
            };
            updatedEvents = [serverEvent, offenderEvent, ...gameEvents];
        } 
        else if (!editingEventId) {
            let duration = 0, isReleasable = false, releaseTime = null; 
            if (activeAction.type === 'Time Penalty' && penaltyData.color) {
                const isBenchStaff = activeBench.some(b => b.id === selectedEntity?.id) || selectedEntity === 'Team / Bench';
                if (isBenchStaff && penaltyData.code !== 'B1') { duration = 0; } 
                else {
                    if (penaltyData.color === 'Blue') { duration = 2; isReleasable = true; }
                    else if (penaltyData.color === 'Yellow') { duration = 5; isReleasable = false; } 
                    else if (penaltyData.color === 'Red') { if (penaltyData.code !== 'R8' && penaltyData.code !== 'R9') { duration = 2; isReleasable = true; } }
                }
                if (duration > 0) releaseTime = calcReleaseTime(modalQuarter, finalTimeStr, duration);
            }
            let eligibleReturnTime = null;
            if (activeAction.type === 'Injury') eligibleReturnTime = calcInjuryReturn(modalQuarter, finalTimeStr);

            updatedEvents = [{ 
                id: primaryAddedId, team: activeAction.team, type: activeAction.type, quarter: modalQuarter, time: activeAction.type === 'Log Foul' ? null : finalTimeStr,
                entity: selectedEntity, servingPlayer: servingPlayerEntity, assist: assistEntity, penalty: activeAction.type === 'Time Penalty' ? penaltyData : null,
                goalFlags: activeAction.type === 'Goal / Assist' ? goalFlags : null, eligibleReturnTime: eligibleReturnTime, clearedInjury: false,
                isReleasable: isReleasable, releaseTime: releaseTime, majorReleaseTime: null, actualReleaseTime: null, clearedFromBoard: false 
            }, ...gameEvents];
        } 
        else {
            updatedEvents = gameEvents.map(ev => {
                if (ev.id === editingEventId) {
                    let duration = 0;
                    if (ev.type === 'Time Penalty' && ev.penalty) {
                        if (ev.penalty.code === 'Y6' && !ev.isJustServing) duration = 7;
                        else if (ev.isJustServing) duration = 2;
                        else if (ev.penalty.color === 'Blue') duration = 2;
                        else if (ev.penalty.color === 'Yellow') duration = 5;
                        else if (ev.penalty.color === 'Red' && ev.penalty.code !== 'R8' && ev.penalty.code !== 'R9') duration = 2;
                    }
                    let rTime = ev.releaseTime;
                    if (duration > 0 && !ev.clearedFromBoard) rTime = calcReleaseTime(modalQuarter, finalTimeStr, duration);
                    let eReturn = ev.eligibleReturnTime;
                    if (ev.type === 'Injury' && !ev.clearedInjury) eReturn = calcInjuryReturn(modalQuarter, finalTimeStr);

                    return { ...ev, quarter: modalQuarter, time: ev.type === 'Log Foul' ? null : finalTimeStr, entity: selectedEntity, assist: assistEntity, servingPlayer: servingPlayerEntity, releaseTime: rTime, eligibleReturnTime: eReturn };
                }
                return ev;
            });
            setEditingEventId(null);
        }

        if (activeAction.type === 'Goal / Assist' && !editingEventId && goalFlags.pp) {
            const oppTeam = activeAction.team === 'AWAY' ? 'HOME' : 'AWAY';
            const targetEventIndex = [...updatedEvents].reverse().findIndex(ev => ev.type === 'Time Penalty' && ev.team === oppTeam && ev.isReleasable && !ev.actualReleaseTime);
            if (targetEventIndex !== -1) {
                const actualIndex = updatedEvents.length - 1 - targetEventIndex;
                updatedEvents[actualIndex] = { ...updatedEvents[actualIndex], actualReleaseTime: { quarter: modalQuarter, time: finalTimeStr } };
            }
        }
        
        setGameEvents(updatedEvents);
        if (!editingEventId) setLastAddedEventId(primaryAddedId);
        
        if (['Log Foul', 'Time Penalty'].includes(activeAction.type) && selectedEntity !== 'Unattributed') {
            const isFirstHalf = modalQuarter === 'Q1' || modalQuarter === 'Q2';
            const playerFouls = updatedEvents.filter(ev => ev.type === 'Log Foul' && ev.team === activeAction.team && ev.entity?.id === selectedEntity.id);
            const halfFouls = playerFouls.filter(ev => isFirstHalf ? (ev.quarter === 'Q1' || ev.quarter === 'Q2') : (ev.quarter === 'Q3' || ev.quarter === 'Q4' || ev.quarter === 'OT')).length;

            if (activeAction.type === 'Log Foul') {
                if (playerFouls.length === 6) setFoulAlert({ type: 'red', player: selectedEntity, title: 'EJECTION REQUIRED', message: "6th Foul of the Game. Player must be ejected." });
                else if (playerFouls.length === 5) setFoulAlert({ type: 'warning', title: 'WARNING: 5th Foul', player: selectedEntity, message: "Player has 5 total fouls. One foul away from ejection." });
                else if (halfFouls === 4) setFoulAlert({ type: 'blue', player: selectedEntity, title: 'BLUE CARD REQUIRED', message: "4th Foul in this Half. Issue a Blue Card time penalty." });
                else if (halfFouls === 3) setFoulAlert({ type: 'warning', title: 'WARNING: 3rd Foul', player: selectedEntity, message: "Player has 3 fouls in this half." });
            }

            if (activeAction.type === 'Time Penalty' && !editingEventId) {
                const playerPenalties = updatedEvents.filter(ev => ev.type === 'Time Penalty' && ev.entity?.id === selectedEntity.id && !ev.isJustServing);
                let pCount = 0;
                playerPenalties.forEach(p => { pCount += 1; if (p.penalty?.code === 'Y6') pCount += 1; });

                if (pCount >= 3) setFoulAlert({ type: 'red', player: selectedEntity, title: 'EJECTION REQUIRED', message: "This individual has accumulated 3 penalties and must be ejected from the match." });
                else if (pCount === 2) setFoulAlert({ type: 'warning', player: selectedEntity, title: 'WARNING: 2 PENALTIES', message: "This individual has accumulated 2 penalties. One more penalty will result in an ejection." });
            }
        }
        if(editingEventId) setModalStep('EVENT_LOG'); else setModalStep(null);
    };

    const handlePPGoalScored = (eventId) => {
        const penalty = gameEvents.find(ev => ev.id === eventId);
        if (!penalty || !penalty.releaseTime) return;
        const penaltyElapsed = toElapsedSeconds(penalty.quarter, penalty.time);
        const releaseElapsed = toElapsedSeconds(penalty.releaseTime.quarter, penalty.releaseTime.time);
        const oppTeam = penalty.team === 'AWAY' ? 'HOME' : 'AWAY';
        const ppGoals = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === oppTeam && ev.goalFlags?.pp);
        ppGoals.sort((a, b) => toElapsedSeconds(b.quarter, b.time) - toElapsedSeconds(a.quarter, a.time));
        const validGoal = ppGoals.find(g => { const gElapsed = toElapsedSeconds(g.quarter, g.time); return gElapsed >= penaltyElapsed && gElapsed <= releaseElapsed; });

        if (validGoal) {
            setGameEvents(gameEvents.map(ev => ev.id === eventId ? { ...ev, actualReleaseTime: { quarter: validGoal.quarter, time: validGoal.time }, clearedFromBoard: true } : ev));
            alert(`Penalty successfully released based on PPG at ${validGoal.quarter} ${validGoal.time}.`);
        } else {
            setModalQuarter(quarter); setTargetPenaltyId(eventId); setTimeInput(''); 
            setManualTimeMode('PPG'); setModalStep('MANUAL_TIME_ENTRY');
        }
    };

    const startEditingReleaseTime = (eventId) => {
        const ev = gameEvents.find(e => e.id === eventId);
        if (ev && ev.releaseTime) {
            setTargetPenaltyId(eventId); setModalQuarter(ev.releaseTime.quarter);
            setTimeInput(ev.releaseTime.time.replace(':', ''));
            setManualTimeMode('RELEASE'); setModalStep('MANUAL_TIME_ENTRY');
        }
    }

    const processManualTime = (validTimeStr) => {
        if (manualTimeMode === 'PPG') {
            setGameEvents(gameEvents.map(ev => ev.id === targetPenaltyId ? { ...ev, actualReleaseTime: { quarter: modalQuarter, time: formatTime(validTimeStr) }, clearedFromBoard: true } : ev));
            setModalStep(null);
        } else if (manualTimeMode === 'RELEASE') {
            setGameEvents(gameEvents.map(ev => ev.id === targetPenaltyId ? { ...ev, releaseTime: { quarter: modalQuarter, time: formatTime(validTimeStr) } } : ev));
            setModalStep('EVENT_LOG');
        }
        setTargetPenaltyId(null); setManualTimeMode(null);
    };

    const handlePenaltyExpired = (eventId) => setGameEvents(gameEvents.map(ev => ev.id === eventId ? { ...ev, clearedFromBoard: true } : ev));

    const deleteEvent = (id) => {
        if(window.confirm("Are you sure you want to delete this event?")) setGameEvents(gameEvents.filter(ev => ev.id !== id));
    };

    const startEditingEvent = (event) => {
        setActiveAction({ team: event.team, type: event.type, time: null });
        setEditingEventId(event.id); setModalQuarter(event.quarter); setGoalScorer(null); setPlayerSearchInput('');
        if (event.time) setTimeInput(event.time.replace(':', '')); else setTimeInput('');
        if (event.type === 'Time Penalty' && event.penalty) setPenaltyData(event.penalty);
        if (event.type === 'Goal / Assist' && event.goalFlags) setGoalFlags(event.goalFlags);
        if (event.type === 'Log Foul') setModalStep('PLAYER'); else setModalStep('TIME');
    };

    // --- REVERSE-CHRONOLOGICAL GAME LOG SORTER ---
    // Enforces Newest-First display for live operations, with forced boundaries for Quarters
    const quarterOrder = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4, 'OT': 5 };
    const getEventSortTime = (ev) => {
        // Force Start to bottom (older than 15:00) and End to top (newer than 00:00)
        if (ev.type === 'Period Marker') return ev.action === 'Start' ? '99:99' : '-01:00';
        return ev.time || "00:00";
    };

    const sortedGameEvents = [...gameEvents].sort((a, b) => {
        const qA = quarterOrder[a.quarter] || 0;
        const qB = quarterOrder[b.quarter] || 0;
        
        // 1. Sort by Quarter Descending (OT -> Q4 -> Q3...)
        if (qA !== qB) return qB - qA;
        
        // 2. Sort by Time Ascending (-01:00 -> 00:00 -> 15:00 -> 99:99)
        const timeA = getEventSortTime(a);
        const timeB = getEventSortTime(b);
        if (timeA !== timeB) return timeA.localeCompare(timeB);
        
        // 3. Fallback to entry ID to keep simultaneous events in exact entered order
        return b.id - a.id;
    });

    if (currentView === 'pregame') {
        return (
            <PregameSetup 
                appVersion={APP_VERSION}
                gameData={gameData} setGameData={setGameData} handleInputChange={handleInputChange} 
                awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor}
                awayRoster={awayRoster} setAwayRoster={setAwayRoster} homeRoster={homeRoster} setHomeRoster={setHomeRoster} 
                awayBench={awayBench} setAwayBench={setAwayBench} homeBench={homeBench} setHomeBench={setHomeBench}
                activeRosterModal={activeRosterModal} setActiveRosterModal={setActiveRosterModal} showStartersModal={showStartersModal} setShowStartersModal={setShowStartersModal}
                newPlayer={newPlayer} setNewPlayer={setNewPlayer} newBench={newBench} setNewBench={setNewBench} 
                setCurrentView={setCurrentView} clearAllGameData={clearAllGameData} 
                onExportPDF={() => generateAlternatePDF(gameData, homeRoster, awayRoster, homeBench, awayBench, gameEvents)}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans relative bg-gray-100 overflow-hidden">
            <TimerOverlay appTimer={appTimer} setAppTimer={setAppTimer} />
            <AlertOverlay foulAlert={foulAlert} setFoulAlert={setFoulAlert} />

            <InGameDashboard 
                gameData={gameData} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor}
                awayScore={awayScore} homeScore={homeScore} quarter={quarter} gameEvents={gameEvents}
                setModalStep={setModalStep} setSummaryTeam={setSummaryTeam} triggerAction={triggerAction}
                activePenaltiesAway={activePenaltiesAway} activePenaltiesHome={activePenaltiesHome}
                handlePPGoalScored={handlePPGoalScored} handlePenaltyExpired={handlePenaltyExpired}
                togglePeriod={togglePeriod} isPeriodRunning={isPeriodRunning} setCurrentView={setCurrentView}
                handleInjuryCleared={(id) => setGameEvents(gameEvents.map(ev => ev.id === id ? { ...ev, clearedInjury: true } : ev))}
                lastAddedEventId={lastAddedEventId} setLastAddedEventId={setLastAddedEventId}
                startEditingEvent={startEditingEvent} deleteEvent={deleteEvent}
                startEditingReleaseTime={startEditingReleaseTime}
            />

            {modalStep === 'FOUL_SUMMARY' && (
                <FoulSummary summaryTeam={summaryTeam} gameData={gameData} awayRoster={awayRoster} homeRoster={homeRoster} gameEvents={gameEvents} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} onClose={() => setModalStep(null)} />
            )}

            {modalStep === 'EVENT_LOG' && (
                <EventLog gameEvents={sortedGameEvents} setModalStep={setModalStep} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} gameData={gameData} startEditingEvent={startEditingEvent} deleteEvent={deleteEvent} startEditingReleaseTime={startEditingReleaseTime} />
            )}

            <TimeKeypadModal 
                modalStep={modalStep} setModalStep={setModalStep} activeAction={activeAction} flowTeamName={flowTeamName} flowTeamColor={flowTeamColor}
                isPeriodRunning={isPeriodRunning} editingEventId={editingEventId} modalQuarter={modalQuarter} setModalQuarter={setModalQuarter}
                timeInput={timeInput} handleKeypad={handleKeypad} validateAndAdvanceTime={validateAndAdvanceTime} goalFlags={goalFlags} setGoalFlags={setGoalFlags}
                manualTimeMode={manualTimeMode} setManualTimeMode={setManualTimeMode}
            />

            <WarningModal modalStep={modalStep} flowTeamColor={flowTeamColor} finalizeWarning={finalizeWarning} setModalStep={setModalStep} />

            <PenaltyModal modalStep={modalStep} setModalStep={setModalStep} penaltyData={penaltyData} setPenaltyData={setPenaltyData} flowTeamColor={flowTeamColor} />

            <PlayerSelectModal 
                modalStep={modalStep} setModalStep={setModalStep} activeAction={activeAction} flowTeamColor={flowTeamColor} modalQuarter={modalQuarter} timeInput={timeInput}
                penaltyData={penaltyData} editingEventId={editingEventId} playerSearchInput={playerSearchInput} setPlayerSearchInput={setPlayerSearchInput} filteredFlowRoster={filteredFlowRoster}
                handlePlayerSelect={handlePlayerSelect} activeBench={activeBench} requiresSubstituteServer={requiresSubstituteServer} setRequiresSubstituteServer={setRequiresSubstituteServer}
                benchPenaltyEntity={benchPenaltyEntity} setBenchPenaltyEntity={setBenchPenaltyEntity} goalScorer={goalScorer} isPeriodRunning={isPeriodRunning} setModalQuarter={setModalQuarter} gameEvents={gameEvents}
            />

            <TimeConfirmModal 
                dialog={timeConfirmDialog} 
                onConfirm={(suggested, nextStepStr) => { 
                    commitTime(suggested, nextStepStr); 
                    setTimeConfirmDialog(null); 
                }}
                onReject={(original, nextStepStr, isValid) => {
                    if (isValid) commitTime(original, nextStepStr);
                    else alert("Invalid Time. Please enter a valid match time.");
                    setTimeConfirmDialog(null);
                }}
            />
            
            <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 z-[1000] drop-shadow-md">Author: Dave Wolgast | v{APP_VERSION}</div>
        </div>
    );
}