/* =========================================================================
 * MASL 3 4th Official Log App
 * Author: Dave Wolgast
 * Version: 0.22
 * ========================================================================= */

import { useState, useEffect } from 'react'
import { PENALTY_CODES, TEAM_WARNINGS, ACTION_BUTTONS, QUARTERS, BENCH_ROLES } from './config'
import { 
    useStickyState, formatTimer, formatTime, toElapsedSeconds, 
    calcReleaseTime, calcInjuryReturn, getTeamColor, getPlayerFouls 
} from './utils'
import { generatePDF } from './pdfEngine'

const APP_VERSION = "0.22";

// --- WEB AUDIO API: SYNTHETIC DESK BELL ---
let audioCtx = null;
const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
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
    // --- STATE MANAGEMENT ---
    const [currentView, setCurrentView] = useStickyState('pregame', 'masl-view'); 

    const [gameData, setGameData] = useStickyState({
        date: new Date().toISOString().split('T')[0],
        venue: '', city: '', awayTeam: '', awayColor: '', homeTeam: '', homeColor: '',
        crewChief: '', referee: '', assistantRef: '', fourthOfficial: ''
    }, 'masl-data');

    const [awayRoster, setAwayRoster] = useStickyState([], 'masl-awayRoster');
    const [homeRoster, setHomeRoster] = useStickyState([], 'masl-homeRoster');
    const [awayBench, setAwayBench] = useStickyState([], 'masl-awayBench');
    const [homeBench, setHomeBench] = useStickyState([], 'masl-homeBench');
    
    const [quarter, setQuarter] = useStickyState('Q1', 'masl-quarter');
    const [isPeriodRunning, setIsPeriodRunning] = useStickyState(false, 'masl-period-running');
    const [gameEvents, setGameEvents] = useStickyState([], 'masl-events'); 

    // Temporary UI states 
    const [activeRosterModal, setActiveRosterModal] = useState(null); 
    const [showStartersModal, setShowStartersModal] = useState(false);
    const [newPlayer, setNewPlayer] = useState({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false });
    const [newBench, setNewBench] = useState({ name: '', role: 'Head Coach' });
    
    const [modalStep, setModalStep] = useState(null); 
    const [activeAction, setActiveAction] = useState({ team: '', type: '', time: null });
    const [timeInput, setTimeInput] = useState('');
    const [modalQuarter, setModalQuarter] = useState('Q1'); // Contextual Quarter for Data Entry
    const [playerSearchInput, setPlayerSearchInput] = useState('');
    const [editingEventId, setEditingEventId] = useState(null);
    const [summaryTeam, setSummaryTeam] = useState(null); 
    const [foulAlert, setFoulAlert] = useState(null); 
    
    const [goalScorer, setGoalScorer] = useState(null);
    const [penaltyData, setPenaltyData] = useState({ color: null, code: null, desc: null });
    const [benchPenaltyEntity, setBenchPenaltyEntity] = useState(null); 
    const [releasingPenaltyId, setReleasingPenaltyId] = useState(null); 
    
    const [goalFlags, setGoalFlags] = useState({ pp: false, shootout: false, pk: false });
    const [requiresSubstituteServer, setRequiresSubstituteServer] = useState(false);
    
    const [appTimer, setAppTimer] = useState({ active: false, time: 0, initialTime: 0, label: '', minimized: false });

    // --- SCORE CALCULATORS ---
    const awayScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'AWAY').length;
    const homeScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'HOME').length;

    // --- MATH ENGINES (Timer Tick & Bell Triggers) ---
    useEffect(() => {
        let interval = null;
        if (appTimer.active) {
            interval = setInterval(() => {
                setAppTimer(prev => {
                    const newTime = prev.time - 1;
                    const elapsed = prev.initialTime - newTime;
                    const isTimeout = prev.label === 'MEDIA TIMEOUT' || prev.label === 'TEAM TIMEOUT';
                    
                    let nextState = { ...prev, time: newTime };
                    
                    if (!prev.minimized && elapsed === 15) {
                        nextState.minimized = true;
                    }
                    
                    if (isTimeout) {
                        if (newTime === 30) playBells(1);
                        if (newTime === 15) playBells(2);
                        if (newTime === 0) playBells(4);
                        if (newTime <= -15) { 
                            return { active: false, time: 0, initialTime: 0, label: '', minimized: false };
                        }
                    } else {
                        if (newTime <= 0) {
                            return { active: false, time: 0, initialTime: 0, label: '', minimized: false };
                        }
                    }
                    return nextState;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [appTimer.active]);

    // --- HANDLERS ---
    const handleInputChange = (e) => setGameData({ ...gameData, [e.target.name]: e.target.value });
    const handleKeypad = (num) => {
        if (num === 'clear') setTimeInput('');
        else if (num === 'del') setTimeInput(prev => prev.slice(0, -1));
        else if (timeInput.length < 4) setTimeInput(prev => prev + num);
    };

    const validateAndAdvanceTime = (nextStepStr) => {
        let raw = timeInput || '';
        let padded = raw.padEnd(4, '0');
        let mm = parseInt(padded.substring(0, 2));
        let ss = parseInt(padded.substring(2, 4));

        const isValid = (m, s) => {
            if (m > 15) return false;
            if (m === 15 && s > 0) return false;
            if (s > 59) return false;
            return true;
        };

        if (isValid(mm, ss)) {
            setTimeInput(padded);
            setActiveAction(prev => ({ ...prev, time: padded }));
            if (nextStepStr === 'FINALIZE_TEAM_EVENT') finalizeEvent('Team', null, null, padded);
            else if (nextStepStr === 'FINALIZE_MANUAL_PPG') processManualPPG(padded);
            else setModalStep(nextStepStr);
            return;
        }

        let suggRaw = '0' + padded.substring(0, 3);
        let suggMm = parseInt(suggRaw.substring(0, 2));
        let suggSs = parseInt(suggRaw.substring(2, 4));
        
        if (isValid(suggMm, suggSs)) {
            const suggFormat = `${String(suggMm).padStart(2, '0')}:${String(suggSs).padStart(2, '0')}`;
            if (window.confirm(`Invalid time entered (${formatTime(padded)}).\n\nDid you mean ${suggFormat}?`)) {
                setTimeInput(suggRaw);
                setActiveAction(prev => ({ ...prev, time: suggRaw }));
                if (nextStepStr === 'FINALIZE_TEAM_EVENT') finalizeEvent('Team', null, null, suggRaw);
                else if (nextStepStr === 'FINALIZE_MANUAL_PPG') processManualPPG(suggRaw);
                else setModalStep(nextStepStr);
            }
        } else {
            alert("Invalid Time. Please enter a valid match time between 15:00 and 00:00.");
        }
    };

    const triggerAction = (teamIdentifier, actionType) => {
        setActiveAction({ team: teamIdentifier, type: actionType, time: null });
        setModalQuarter(quarter); // Set data-entry quarter to match global clock
        setPlayerSearchInput('');
        setGoalScorer(null); 
        setPenaltyData({ color: null, code: null, desc: null }); 
        setBenchPenaltyEntity(null);
        setGoalFlags({ pp: false, shootout: false, pk: false });
        setRequiresSubstituteServer(false);
        
        if (actionType === 'Log Foul') {
            setTimeInput(''); 
            setModalStep('PLAYER');
        } else {
            setTimeInput('');
            setModalStep('TIME');
        }
    };

    const clearAllGameData = () => {
        if(window.confirm("WARNING: This will permanently delete all rosters, settings, and game logs. Are you starting a new game?")) {
            localStorage.clear();
            window.location.reload(); 
        }
    };

    // --- EVENT LOGGING, EDITING & ALERTS ---
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
            if (unattributed.length > 0) {
                alert(`WARNING: There are ${unattributed.length} Unattributed Foul(s) in ${quarter}. Please assign them to a player via the Game Log before generating the final report.`);
            }

            if (quarter === 'Q1' || quarter === 'Q3') {
                setAppTimer({ active: true, time: 180, initialTime: 180, label: 'QUARTER BREAK', minimized: false }); 
            } else if (quarter === 'Q2') {
                setAppTimer({ active: true, time: 600, initialTime: 600, label: 'HALFTIME', minimized: false }); 
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
                else {
                    setGoalScorer(entity);
                    setPlayerSearchInput('');
                    setModalStep('ASSIST'); 
                }
            } else if (activeAction.type === 'Time Penalty') {
                const needsServer = requiresSubstituteServer || penaltyData.code === 'B1' || (entity && entity.isGK) || entity === 'Team / Bench';
                if (needsServer) {
                    setBenchPenaltyEntity(entity);
                    setPlayerSearchInput('');
                    setModalStep('SERVING_PLAYER'); 
                } else {
                    finalizeEvent(entity);
                }
            } else {
                finalizeEvent(entity);
            }
        } else if (modalStep === 'ASSIST') {
            if (goalScorer && typeof goalScorer !== 'string' && goalScorer.id === entity.id) {
                alert("The goal scorer cannot also be credited with the assist.");
            } else {
                finalizeEvent(goalScorer, entity);
            }
        } else if (modalStep === 'SERVING_PLAYER') {
            finalizeEvent(benchPenaltyEntity, null, entity);
        }
    };

    const finalizeWarning = (reason) => {
        const prevWarning = gameEvents.find(ev => ev.type === 'Team Warnings' && ev.team === activeAction.team && ev.warningReason === reason);
        const finalTimeRaw = activeAction.time || timeInput;
        const finalTimeStr = finalTimeRaw ? (finalTimeRaw.length === 0 ? "00:00" : formatTime(finalTimeRaw)) : "00:00";

        const newEvent = {
            id: Date.now(), team: activeAction.team, type: activeAction.type,
            quarter: modalQuarter, time: finalTimeStr,
            entity: 'Team / Bench', warningReason: reason
        };
        
        setGameEvents([newEvent, ...gameEvents]);
        
        if (prevWarning) {
            setFoulAlert({
                type: 'yellow', title: 'WARNING ESCALATION', player: { number: 'TEAM', name: 'WARNING' },
                message: `Second warning given for [${reason}]. Issue a 5-Minute Yellow Card to the player or coach who committed the offense.`
            });
        }
        setModalStep(null);
    };

    const finalizeEvent = (selectedEntity, assistEntity = null, servingPlayerEntity = null, overrideTimeStr = null) => {
        const finalTimeRaw = overrideTimeStr || activeAction.time || timeInput;
        const finalTimeStr = finalTimeRaw ? (finalTimeRaw.length === 0 ? "00:00" : formatTime(finalTimeRaw)) : "00:00";

        if (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout') {
            const newEvent = {
                id: Date.now(), team: activeAction.team, type: activeAction.type,
                quarter: modalQuarter, time: finalTimeStr, entity: 'Team'
            };
            setGameEvents([newEvent, ...gameEvents]);
            setModalStep(null);
            
            initAudio(); 
            if (activeAction.type === 'Media Timeout') setAppTimer({ active: true, time: 90, initialTime: 90, label: 'MEDIA TIMEOUT', minimized: false });
            if (activeAction.type === 'Team Timeout') setAppTimer({ active: true, time: 60, initialTime: 60, label: 'TEAM TIMEOUT', minimized: false });
            return;
        }

        let updatedEvents = [...gameEvents];
        let duration = 0;
        let isReleasable = false;
        let releaseTime = null;
        let majorReleaseTime = null; 

        if (activeAction.type === 'Time Penalty' && penaltyData.color) {
            const isBenchStaff = activeBench.some(b => b.id === selectedEntity?.id) || selectedEntity === 'Team / Bench';
            if (isBenchStaff && penaltyData.code !== 'B1') {
                duration = 0; 
            } else {
                if (penaltyData.color === 'Blue') { duration = 2; isReleasable = true; }
                else if (penaltyData.color === 'Yellow') {
                    duration = 5; isReleasable = false;
                    if (penaltyData.code === 'Y6') { 
                        duration = 2; majorReleaseTime = calcReleaseTime(modalQuarter, finalTimeStr, 7); 
                    }
                } else if (penaltyData.color === 'Red') {
                    if (penaltyData.code !== 'R8' && penaltyData.code !== 'R9') {
                        duration = 2; isReleasable = true;
                    }
                }
            }
            if (duration > 0) releaseTime = calcReleaseTime(modalQuarter, finalTimeStr, duration);
        }

        let eligibleReturnTime = null;
        if (activeAction.type === 'Injury') eligibleReturnTime = calcInjuryReturn(modalQuarter, finalTimeStr);

        if (editingEventId) {
            updatedEvents = gameEvents.map(ev => ev.id === editingEventId ? { 
                ...ev, 
                quarter: modalQuarter,
                time: activeAction.type === 'Log Foul' ? null : finalTimeStr,
                entity: selectedEntity, 
                assist: assistEntity, 
                servingPlayer: servingPlayerEntity,
                releaseTime: releaseTime || ev.releaseTime, 
                majorReleaseTime: majorReleaseTime || ev.majorReleaseTime,
                eligibleReturnTime: eligibleReturnTime || ev.eligibleReturnTime
            } : ev);
            setEditingEventId(null);
        } else {
            const newEvent = {
                id: Date.now(), team: activeAction.team, type: activeAction.type,
                quarter: modalQuarter, time: activeAction.type === 'Log Foul' ? null : finalTimeStr,
                entity: selectedEntity, servingPlayer: servingPlayerEntity, assist: assistEntity, 
                penalty: activeAction.type === 'Time Penalty' ? penaltyData : null,
                goalFlags: activeAction.type === 'Goal / Assist' ? goalFlags : null,
                eligibleReturnTime: eligibleReturnTime,
                isReleasable: isReleasable, releaseTime: releaseTime, majorReleaseTime: majorReleaseTime, actualReleaseTime: null,
                clearedFromBoard: false
            };
            updatedEvents = [newEvent, ...gameEvents];
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
        
        if (activeAction.type === 'Log Foul' && selectedEntity !== 'Unattributed') {
            const isFirstHalf = modalQuarter === 'Q1' || modalQuarter === 'Q2';
            const playerFouls = updatedEvents.filter(ev => ev.type === 'Log Foul' && ev.team === activeAction.team && ev.entity?.id === selectedEntity.id);
            const halfFouls = playerFouls.filter(ev => isFirstHalf ? (ev.quarter === 'Q1' || ev.quarter === 'Q2') : (ev.quarter === 'Q3' || ev.quarter === 'Q4' || ev.quarter === 'OT')).length;
            const totalFouls = playerFouls.length;

            if (totalFouls === 6) setFoulAlert({ type: 'red', player: selectedEntity, message: "6th Foul of the Game. Player must be ejected." });
            else if (totalFouls === 5) setFoulAlert({ type: 'warning', title: 'WARNING: 5th Foul', player: selectedEntity, message: "Player has 5 total fouls. One foul away from ejection." });
            else if (halfFouls === 4) setFoulAlert({ type: 'blue', player: selectedEntity, message: "4th Foul in this Half. Issue a Blue Card time penalty." });
            else if (halfFouls === 3) setFoulAlert({ type: 'warning', title: 'WARNING: 3rd Foul', player: selectedEntity, message: "Player has 3 fouls in this half." });
        }

        if(editingEventId) setModalStep('EVENT_LOG');
        else setModalStep(null);
    };

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
            setGameEvents(gameEvents.map(ev => ev.id === eventId ? { ...ev, actualReleaseTime: { quarter: validGoal.quarter, time: validGoal.time }, clearedFromBoard: true } : ev));
            alert(`Penalty successfully released based on PPG at ${validGoal.quarter} ${validGoal.time}.`);
        } else {
            setModalQuarter(quarter);
            setReleasingPenaltyId(eventId);
            setTimeInput('');
            setModalStep('MANUAL_PPG_TIME');
        }
    };

    const processManualPPG = (validTimeStr) => {
        setGameEvents(gameEvents.map(ev => ev.id === releasingPenaltyId ? { ...ev, actualReleaseTime: { quarter: modalQuarter, time: formatTime(validTimeStr) }, clearedFromBoard: true } : ev));
        setReleasingPenaltyId(null);
        setModalStep(null);
    };

    const handlePenaltyExpired = (eventId) => {
        setGameEvents(gameEvents.map(ev => ev.id === eventId ? { ...ev, clearedFromBoard: true } : ev));
    };

    const deleteEvent = (id) => {
        if(window.confirm("Are you sure you want to delete this event?")) {
            setGameEvents(gameEvents.filter(ev => ev.id !== id));
        }
    };

    const startEditingEvent = (event) => {
        setActiveAction({ team: event.team, type: event.type, time: null });
        setEditingEventId(event.id);
        setModalQuarter(event.quarter);
        setGoalScorer(null);
        setPlayerSearchInput('');
        
        if (event.time) setTimeInput(event.time.replace(':', ''));
        else setTimeInput('');
        
        if (event.type === 'Time Penalty' && event.penalty) setPenaltyData(event.penalty);
        if (event.type === 'Goal / Assist' && event.goalFlags) setGoalFlags(event.goalFlags);

        if (event.type === 'Log Foul') setModalStep('PLAYER');
        else setModalStep('TIME');
    };

    const awayCSSColor = getTeamColor(gameData.awayColor, '#1e40af'); 
    const homeCSSColor = getTeamColor(gameData.homeColor, '#991b1b'); 

    // --- ROSTER LOGIC ---
    const handleAddPlayer = () => {
        if (!newPlayer.number || !newPlayer.name) return alert("Please enter both a jersey number and a name.");
        const currentRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
        const setRoster = activeRosterModal === 'AWAY' ? setAwayRoster : setHomeRoster;

        if (currentRoster.length >= 17) return alert("Max 17 total players.");
        if (!newPlayer.isGK && currentRoster.filter(p => !p.isGK).length >= 15) return alert("Max 15 Field Players.");
        if (currentRoster.some(p => p.number === newPlayer.number)) return alert("Jersey number already exists.");
        
        if (newPlayer.isStarter) {
            if (newPlayer.isGK && currentRoster.filter(p => p.isGK && p.isStarter).length >= 1) return alert("Only 1 Starting Goalkeeper allowed.");
            if (!newPlayer.isGK && currentRoster.filter(p => !p.isGK && p.isStarter).length >= 5) return alert("Max 5 Starting Field Players allowed.");
        }
        if (newPlayer.isCaptain && currentRoster.some(p => p.isCaptain)) return alert("A team can only have ONE designated Captain.");

        const updated = [...currentRoster, { ...newPlayer, id: Date.now() }].sort((a, b) => parseInt(a.number) - parseInt(b.number));
        setRoster(updated);
        setNewPlayer({ number: '', name: '', isGK: false, isStarter: false, isCaptain: false }); 
    };

    const handleAddBench = () => {
        if (!newBench.name) return alert("Please enter name.");
        const currentBench = activeRosterModal === 'AWAY' ? awayBench : homeBench;
        const setBench = activeRosterModal === 'AWAY' ? setAwayBench : setHomeBench;
        
        if (currentBench.length >= 5) return alert("Max 5 bench personnel.");
        if (newBench.role === 'Head Coach' && currentBench.some(b => b.role === 'Head Coach')) return alert("A team can only have ONE designated Head Coach.");
        
        setBench([...currentBench, { ...newBench, id: Date.now() }]);
        setNewBench({ name: '', role: 'Assistant Coach' });
    };

    const removePlayer = (id) => activeRosterModal === 'AWAY' ? setAwayRoster(awayRoster.filter(p => p.id !== id)) : setHomeRoster(homeRoster.filter(p => p.id !== id));
    const removeBench = (id) => activeRosterModal === 'AWAY' ? setAwayBench(awayBench.filter(b => b.id !== id)) : setHomeBench(homeBench.filter(b => b.id !== id));

    const activeRoster = activeRosterModal === 'AWAY' ? awayRoster : homeRoster;
    const activeBench = activeRosterModal === 'AWAY' ? awayBench : homeBench;
    
    const flowTeamRoster = activeAction.team === 'AWAY' ? awayRoster : homeRoster;
    const flowTeamColor = activeAction.team === 'AWAY' ? awayCSSColor : homeCSSColor;
    const flowTeamName = activeAction.team === 'AWAY' ? (gameData.awayTeam || 'AWAY') : (gameData.homeTeam || 'HOME');
    
    const filteredFlowRoster = playerSearchInput ? flowTeamRoster.filter(p => p.number.startsWith(playerSearchInput)) : flowTeamRoster;
    const getSortedStarters = (roster) => roster.filter(p => p.isStarter).sort((a, b) => {
        if (a.isGK && !b.isGK) return -1;
        if (!a.isGK && b.isGK) return 1;
        return parseInt(a.number) - parseInt(b.number);
    });

    const activePenaltiesAway = gameEvents.filter(ev => ev.type === 'Time Penalty' && ev.team === 'AWAY' && !ev.clearedFromBoard && (ev.releaseTime || ev.majorReleaseTime));
    const activePenaltiesHome = gameEvents.filter(ev => ev.type === 'Time Penalty' && ev.team === 'HOME' && !ev.clearedFromBoard && (ev.releaseTime || ev.majorReleaseTime));

    // --- VIEW 1: PRE-GAME SETUP ---
    if (currentView === 'pregame') {
        return (
            <div className="min-h-screen bg-gray-100 p-8 font-sans relative flex flex-col items-center">
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                        <h1 className="text-3xl font-black tracking-wider">MASL3 PRE-GAME SETUP</h1>
                        <span className="font-bold text-slate-300">4th Official Log</span>
                    </div>

                    <div className="p-8 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-slate-700 border-b-2 border-slate-200 pb-2 mb-4">Match Information</h2>
                            <div className="grid grid-cols-4 gap-4">
                                <div><label className="block text-sm font-bold text-gray-600 mb-1">Date</label><input type="date" name="date" value={gameData.date} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                                <div><label className="block text-sm font-bold text-gray-600 mb-1">Scheduled KO</label><input type="time" name="scheduledKO" onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                                <div><label className="block text-sm font-bold text-gray-600 mb-1">Venue</label><input type="text" name="venue" value={gameData.venue} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                                <div><label className="block text-sm font-bold text-gray-600 mb-1">City</label><input type="text" name="city" value={gameData.city} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" /></div>
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-2 mb-4">
                                <h2 className="text-xl font-bold text-slate-700">Teams & Rosters</h2>
                                <button onClick={() => setShowStartersModal(true)} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition">
                                    👀 View Starting Lineups
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                    <h3 className="font-black mb-4 uppercase" style={{ color: awayCSSColor }}>AWAY TEAM</h3>
                                    <input type="text" name="awayTeam" placeholder="Team Name" value={gameData.awayTeam} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-3" />
                                    <input type="text" name="awayColor" placeholder="Uniform Color (e.g. Navy / White)" value={gameData.awayColor} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-4" />
                                    <button onClick={() => setActiveRosterModal('AWAY')} className="w-full py-3 text-white font-bold rounded-lg shadow flex justify-between px-4" style={{ backgroundColor: awayCSSColor }}>
                                        <span>Edit Roster & Bench</span>
                                        <span>{awayRoster.length} Plyrs / {awayBench.length} Staff</span>
                                    </button>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                    <h3 className="font-black mb-4 uppercase" style={{ color: homeCSSColor }}>HOME TEAM</h3>
                                    <input type="text" name="homeTeam" placeholder="Team Name" value={gameData.homeTeam} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-3" />
                                    <input type="text" name="homeColor" placeholder="Uniform Color (e.g. Orange / Black)" value={gameData.homeColor} onChange={handleInputChange} className="w-full p-3 border rounded-lg mb-4" />
                                    <button onClick={() => setActiveRosterModal('HOME')} className="w-full py-3 text-white font-bold rounded-lg shadow flex justify-between px-4" style={{ backgroundColor: homeCSSColor }}>
                                        <span>Edit Roster & Bench</span>
                                        <span>{homeRoster.length} Plyrs / {homeBench.length} Staff</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
                        <span className="text-sm font-bold text-green-600 flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span> Auto-Saving Enabled
                        </span>
                        <button onClick={() => setCurrentView('ingame')} className="px-8 py-4 bg-green-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-green-700 transition">
                            PROCEED TO KICKOFF ➔
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-5xl flex justify-between px-4">
                    <button onClick={clearAllGameData} className="text-red-500 font-bold border-b border-transparent hover:border-red-500 transition">
                        ⚠️ End Match & Wipe All Data
                    </button>
                    <button onClick={() => generatePDF(gameData, homeRoster, awayRoster, gameEvents)} className="px-6 py-3 bg-blue-600 text-white font-black rounded-lg shadow-lg hover:bg-blue-700 transition">
                        📥 Export Official PDF Worksheet
                    </button>
                </div>

                {/* MODALS RETAINED FOR BREVITY */}
                {showStartersModal && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6 py-12">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[80vh] overflow-hidden">
                            <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
                                <h2 className="text-2xl font-black uppercase">STARTING LINEUPS</h2>
                                <button onClick={() => setShowStartersModal(false)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Close</button>
                            </div>
                            <div className="flex flex-1 overflow-hidden">
                                <div className="w-1/2 flex flex-col border-r bg-gray-50">
                                    <div className="p-4 text-center text-white font-black text-xl uppercase shrink-0 shadow-sm" style={{ backgroundColor: awayCSSColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{gameData.awayTeam || 'AWAY TEAM'}</div>
                                    <div className="p-6 overflow-y-auto flex-1 space-y-3">
                                        {getSortedStarters(awayRoster).map(player => (
                                            <div key={player.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full font-black text-lg text-gray-800 border" style={{ borderColor: awayCSSColor }}>{player.number}</span>
                                                <span className="ml-4 font-bold text-xl text-gray-800">{player.name}</span>
                                                <div className="ml-auto flex space-x-1">
                                                    {player.isGK && <span className="bg-orange-100 text-orange-800 text-xs font-black px-2 py-1 rounded">GK</span>}
                                                    {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2 py-1 rounded">© Capt</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-1/2 flex flex-col bg-gray-50">
                                    <div className="p-4 text-center text-white font-black text-xl uppercase shrink-0 shadow-sm" style={{ backgroundColor: homeCSSColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{gameData.homeTeam || 'HOME TEAM'}</div>
                                    <div className="p-6 overflow-y-auto flex-1 space-y-3">
                                        {getSortedStarters(homeRoster).map(player => (
                                            <div key={player.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full font-black text-lg text-gray-800 border" style={{ borderColor: homeCSSColor }}>{player.number}</span>
                                                <span className="ml-4 font-bold text-xl text-gray-800">{player.name}</span>
                                                <div className="ml-auto flex space-x-1">
                                                    {player.isGK && <span className="bg-orange-100 text-orange-800 text-xs font-black px-2 py-1 rounded">GK</span>}
                                                    {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2 py-1 rounded">© Capt</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeRosterModal && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-6 py-12">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-full max-h-[90vh] overflow-hidden">
                            <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: activeRosterModal === 'AWAY' ? awayCSSColor : homeCSSColor }}>
                                <h2 className="text-2xl font-black uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                    {(activeRosterModal === 'AWAY' ? gameData.awayTeam : gameData.homeTeam) || `${activeRosterModal} TEAM`} PERSONNEL
                                </h2>
                                <button onClick={() => setActiveRosterModal(null)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Done</button>
                            </div>
                            <div className="flex flex-1 overflow-hidden bg-gray-50">
                                <div className="w-2/3 border-r flex flex-col h-full">
                                    <div className="p-4 bg-white border-b shrink-0">
                                        <div className="flex gap-3 items-end">
                                            <div className="w-20"><label className="block text-xs font-bold text-gray-600 mb-1">Jersey #</label><input type="number" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="00" /></div>
                                            <div className="flex-1"><label className="block text-xs font-bold text-gray-600 mb-1">Player Name</label><input type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Last Name, First Name" /></div>
                                            <div className="flex flex-col space-y-1 pb-1">
                                                <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isGK} onChange={e => setNewPlayer({...newPlayer, isGK: e.target.checked})} className="w-4 h-4 accent-orange-500" /><span className="font-bold text-xs text-gray-700">GK</span></label>
                                                <div className="flex space-x-3">
                                                    <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isStarter} onChange={e => setNewPlayer({...newPlayer, isStarter: e.target.checked})} className="w-4 h-4 accent-green-600" /><span className="font-bold text-xs text-gray-700">Starter</span></label>
                                                    <label className="flex items-center space-x-1"><input type="checkbox" checked={newPlayer.isCaptain} onChange={e => setNewPlayer({...newPlayer, isCaptain: e.target.checked})} className="w-4 h-4 accent-yellow-500" /><span className="font-bold text-xs text-gray-700">Capt.</span></label>
                                                </div>
                                            </div>
                                            <button onClick={handleAddPlayer} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 shadow">+ Add</button>
                                        </div>
                                    </div>
                                    <div className="p-4 overflow-y-auto flex-1">
                                        <div className="space-y-2">
                                            {activeRosterModal === 'AWAY' ? awayRoster.map(player => (
                                                <div key={player.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-full font-black text-sm text-slate-700">{player.number}</span>
                                                        <span className="font-bold text-sm text-gray-800">{player.name}</span>
                                                        <div className="flex space-x-1 ml-2">
                                                            {player.isGK && <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-orange-200">GK</span>}
                                                            {player.isStarter && <span className="bg-green-100 text-green-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-200">STARTER</span>}
                                                            {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-300">© CAPTAIN</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removePlayer(player.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                                </div>
                                            )) : homeRoster.map(player => (
                                                <div key={player.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="w-8 h-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-full font-black text-sm text-slate-700">{player.number}</span>
                                                        <span className="font-bold text-sm text-gray-800">{player.name}</span>
                                                        <div className="flex space-x-1 ml-2">
                                                            {player.isGK && <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-orange-200">GK</span>}
                                                            {player.isStarter && <span className="bg-green-100 text-green-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-200">STARTER</span>}
                                                            {player.isCaptain && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-300">© CAPTAIN</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removePlayer(player.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/3 flex flex-col h-full bg-slate-50">
                                    <div className="p-4 bg-white border-b shrink-0">
                                        <div className="flex flex-col gap-2">
                                            <input type="text" value={newBench.name} onChange={e => setNewBench({...newBench, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm" placeholder="Staff Name" />
                                            <select value={newBench.role} onChange={e => setNewBench({...newBench, role: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm font-bold">
                                                {BENCH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                            </select>
                                            <button onClick={handleAddBench} className="w-full py-2 bg-slate-800 text-white text-sm font-bold rounded">+ Add Staff</button>
                                        </div>
                                    </div>
                                    <div className="p-4 overflow-y-auto flex-1">
                                        <div className="space-y-2">
                                            {activeRosterModal === 'AWAY' ? awayBench.map(person => (
                                                <div key={person.id} className="flex flex-col p-2 bg-white border border-gray-200 rounded shadow-sm relative">
                                                    <span className="font-bold text-sm text-gray-800">{person.name}</span>
                                                    <span className="text-[10px] font-black mt-1 uppercase w-fit px-1.5 py-0.5 bg-gray-100 text-gray-600 border">{person.role}</span>
                                                    <button onClick={() => removeBench(person.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                                </div>
                                            )) : homeBench.map(person => (
                                                <div key={person.id} className="flex flex-col p-2 bg-white border border-gray-200 rounded shadow-sm relative">
                                                    <span className="font-bold text-sm text-gray-800">{person.name}</span>
                                                    <span className="text-[10px] font-black mt-1 uppercase w-fit px-1.5 py-0.5 bg-gray-100 text-gray-600 border">{person.role}</span>
                                                    <button onClick={() => removeBench(person.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded font-bold transition">Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 z-50">Author: Dave Wolgast | v{APP_VERSION}</div>
            </div>
        );
    }

    // --- VIEW 2: IN-GAME DASHBOARD ---
    return (
        <div className="flex flex-col h-screen font-sans relative bg-gray-100 overflow-hidden">
            
            {/* MINIMIZED FLOATING TIMER BANNER */}
            {appTimer.active && appTimer.minimized && (
                <div className="bg-slate-900 text-white flex justify-between items-center px-8 py-3 shadow-lg z-40 border-b border-slate-950">
                    <div className="flex items-center space-x-6">
                        <span className="font-black tracking-widest text-blue-400 uppercase text-sm">{appTimer.label}</span>
                        <span className="text-3xl font-mono font-black tabular-nums tracking-wider">{appTimer.time > 0 ? formatTimer(appTimer.time) : "0:00"}</span>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={() => setAppTimer(prev => ({...prev, minimized: false}))} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-sm shadow transition">
                            ⤢ Expand Fullscreen
                        </button>
                        <button onClick={() => setAppTimer({active: false, time: 0, initialTime: 0, label: '', minimized: false})} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold text-sm shadow transition">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* FULLSCREEN AUTOMATED TIMER OVERLAY */}
            {appTimer.active && !appTimer.minimized && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-md p-8">
                    <div className="bg-white rounded-3xl p-16 flex flex-col items-center shadow-2xl border-4 border-slate-800 w-full max-w-2xl relative">
                        <button onClick={() => setAppTimer(prev => ({ ...prev, minimized: true }))} className="absolute top-6 right-8 text-gray-400 hover:text-gray-800 font-bold flex items-center bg-gray-100 px-4 py-2 rounded-lg transition">
                            ⬇ Minimize to Top
                        </button>
                        <h2 className="text-4xl font-black uppercase text-gray-800 mb-6 tracking-widest">{appTimer.label}</h2>
                        
                        <div className="text-9xl font-mono font-black text-blue-600 mb-12 tracking-tighter tabular-nums drop-shadow-md flex flex-col items-center">
                            {appTimer.time > 0 ? formatTimer(appTimer.time) : "0:00"}
                            {appTimer.time <= 0 && <span className="text-red-500 text-3xl mt-4 animate-pulse uppercase tracking-widest">Expired</span>}
                        </div>
                        
                        <div className="flex space-x-6 w-full">
                            <button onClick={() => setAppTimer({ active: false, time: 0, initialTime: 0, label: '', minimized: false })} className="flex-1 py-5 bg-blue-600 font-black text-xl text-white rounded-2xl shadow-xl hover:bg-blue-700 transition">
                                Close Timer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GLOBAL FOUL ALERT OVERLAY */}
            {foulAlert && (
                <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-center flex flex-col animate-[pulse_1.5s_ease-in-out_infinite]">
                        {foulAlert.type === 'blue' && <div className="bg-blue-600 text-white p-6"><h2 className="text-4xl font-black uppercase tracking-wider">Blue Card</h2></div>}
                        {foulAlert.type === 'yellow' && <div className="bg-yellow-400 text-black p-6"><h2 className="text-4xl font-black uppercase tracking-wider">Yellow Card</h2></div>}
                        {foulAlert.type === 'red' && <div className="bg-red-600 text-white p-6"><h2 className="text-4xl font-black uppercase tracking-wider">Red Card</h2></div>}
                        {foulAlert.type === 'warning' && <div className="bg-yellow-400 text-black p-6"><h2 className="text-3xl font-black uppercase tracking-wider">{foulAlert.title}</h2></div>}
                        <div className="p-8">
                            <p className="text-3xl font-black text-gray-800 mb-2">#{foulAlert.player?.number} {foulAlert.player?.name}</p>
                            <p className="text-xl font-bold text-gray-600 mb-8">{foulAlert.message}</p>
                            <button onClick={() => setFoulAlert(null)} className="w-full py-4 bg-slate-800 text-white font-black text-xl rounded-xl hover:bg-slate-700 transition shadow-lg">Acknowledge</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center p-4 bg-white shadow z-10">
                <button onClick={() => setCurrentView('pregame')} className="px-4 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100">⚙️ Setup</button>
                <h1 className="text-4xl font-black tracking-wider uppercase flex items-center">
                    <span style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY'}</span> 
                    <span className="text-gray-400 mx-4 font-mono text-5xl bg-gray-100 px-4 py-1 rounded-xl shadow-inner border border-gray-200">{awayScore} - {homeScore}</span> 
                    <span style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME'}</span>
                </h1>
                <div className="flex bg-gray-200 rounded-lg p-1">
                    {QUARTERS.map(q => (
                        <button key={q} className={`px-6 py-2 rounded-md font-bold transition-colors ${quarter === q ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`} onClick={() => setQuarter(q)}>{q}</button>
                    ))}
                </div>
                <button onClick={() => setModalStep('EVENT_LOG')} className="flex items-center px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow hover:bg-slate-700">
                    Game Log <span className="ml-2 bg-white text-slate-800 px-2 py-0.5 rounded-full text-sm">{gameEvents.length}</span>
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 p-4 flex flex-col border-r-4 border-gray-800 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase" style={{ color: awayCSSColor }}>{gameData.awayTeam || 'AWAY TEAM'}</h2>
                        <button onClick={() => {setSummaryTeam('AWAY'); setModalStep('FOUL_SUMMARY');}} className="px-4 py-2 font-bold rounded shadow-sm border" style={{ color: awayCSSColor, borderColor: awayCSSColor }}>Foul Summary</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {ACTION_BUTTONS.map(btn => (
                            <button key={btn} onClick={() => triggerAction('AWAY', btn)} style={{ borderColor: awayCSSColor, color: awayCSSColor }} className="w-full py-4 bg-white border-[3px] text-lg font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-1/2 p-4 flex flex-col bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-black uppercase" style={{ color: homeCSSColor }}>{gameData.homeTeam || 'HOME TEAM'}</h2>
                        <button onClick={() => {setSummaryTeam('HOME'); setModalStep('FOUL_SUMMARY');}} className="px-4 py-2 font-bold rounded shadow-sm border" style={{ color: homeCSSColor, borderColor: homeCSSColor }}>Foul Summary</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {ACTION_BUTTONS.map(btn => (
                            <button key={btn} onClick={() => triggerAction('HOME', btn)} style={{ borderColor: homeCSSColor, color: homeCSSColor }} className="w-full py-4 bg-white border-[3px] text-lg font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ACTIVE PENALTIES DASHBOARD */}
            <div className="h-40 bg-gray-100 border-t-4 border-gray-300 flex">
                <div className="w-1/2 p-3 border-r-4 border-gray-300 overflow-y-auto">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">Away Active Penalties</h3>
                    {activePenaltiesAway.map(ev => (
                        <div key={ev.id} className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow-sm border-l-4" style={{ borderColor: awayCSSColor }}>
                            <div>
                                <span className="font-bold text-gray-800 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                                {ev.servingPlayer && (
                                    <div className="text-xs text-gray-500 font-bold italic mb-1">
                                        (Served by: #{ev.servingPlayer.number} {ev.servingPlayer.name})
                                    </div>
                                )}
                                <div className="text-xs font-bold text-gray-500">Exp: {ev.releaseTime?.quarter} {ev.releaseTime?.time}</div>
                            </div>
                            <div className="flex flex-col space-y-1">
                                {ev.isReleasable && <button onClick={() => handlePPGoalScored(ev.id)} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 transition">PPG Scored</button>}
                                <button onClick={() => handlePenaltyExpired(ev.id)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border border-gray-200 hover:bg-gray-200 transition">Expired</button>
                            </div>
                        </div>
                    ))}
                    {activePenaltiesAway.length === 0 && <p className="text-xs text-gray-400 font-bold italic">No active penalties</p>}
                </div>
                <div className="w-1/2 p-3 overflow-y-auto">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-2">Home Active Penalties</h3>
                    {activePenaltiesHome.map(ev => (
                        <div key={ev.id} className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow-sm border-l-4" style={{ borderColor: homeCSSColor }}>
                            <div>
                                <span className="font-bold text-gray-800 mr-2">#{ev.entity?.number} {ev.entity?.name}</span>
                                {ev.servingPlayer && (
                                    <div className="text-xs text-gray-500 font-bold italic mb-1">
                                        (Served by: #{ev.servingPlayer.number} {ev.servingPlayer.name})
                                    </div>
                                )}
                                <div className="text-xs font-bold text-gray-500">Exp: {ev.releaseTime?.quarter} {ev.releaseTime?.time}</div>
                            </div>
                            <div className="flex flex-col space-y-1">
                                {ev.isReleasable && <button onClick={() => handlePPGoalScored(ev.id)} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 transition">PPG Scored</button>}
                                <button onClick={() => handlePenaltyExpired(ev.id)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border border-gray-200 hover:bg-gray-200 transition">Expired</button>
                            </div>
                        </div>
                    ))}
                    {activePenaltiesHome.length === 0 && <p className="text-xs text-gray-400 font-bold italic">No active penalties</p>}
                </div>
            </div>

            {/* DYNAMIC GLOBAL FOOTER */}
            <footer className="flex justify-between items-center p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 border-t-2 border-gray-200">
                <button onClick={togglePeriod} className={`px-12 py-3 border-2 font-black tracking-wide rounded-lg transition shadow-sm ${isPeriodRunning ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100' : 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'}`}>
                    {isPeriodRunning ? `⏹ END ${quarter}` : `▶ START ${quarter}`}
                </button>
                <button onClick={() => triggerAction('SYSTEM', 'Media Timeout')} className="px-8 py-3 bg-orange-500 text-white font-black text-lg rounded-lg shadow hover:bg-orange-600 transition">
                    MEDIA TIMEOUT
                </button>
            </footer>

            {/* FLOW MODAL 1: TIME KEYPAD */}
            {modalStep === 'TIME' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center">
                        <h3 className="text-2xl font-bold mb-1 uppercase" style={{ color: activeAction.team === 'SYSTEM' ? '#000' : flowTeamColor }}>
                            {activeAction.team === 'SYSTEM' ? '' : `${flowTeamName} - `}{activeAction.type}
                        </h3>
                        
                        {(!isPeriodRunning || editingEventId) ? (
                            <div className="w-full mb-6">
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase text-center tracking-widest">Event Quarter</label>
                                <div className="flex bg-gray-200 rounded-lg p-1 w-full justify-between shadow-inner border border-gray-300">
                                    {QUARTERS.map(q => (
                                        <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${modalQuarter === q ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-300'}`}>{q}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 font-bold mb-6">Quarter: <span className="text-black">{modalQuarter}</span></p>
                        )}

                        <div className="text-7xl font-mono font-black mb-4 bg-gray-100 px-6 py-4 rounded-xl tracking-widest text-center w-full border-2" style={{ borderColor: activeAction.team === 'SYSTEM' ? '#ccc' : flowTeamColor }}>
                            {timeInput.length === 0 ? "00:00" : formatTime(timeInput)}
                        </div>

                        {activeAction.type === 'Goal / Assist' && (
                            <div className="flex justify-between w-full mb-4 space-x-2">
                                <button onClick={() => setGoalFlags({...goalFlags, pp: !goalFlags.pp})} className={`flex-1 py-2 text-xs rounded font-bold transition ${goalFlags.pp ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Power Play</button>
                                <button onClick={() => setGoalFlags({...goalFlags, shootout: !goalFlags.shootout})} className={`flex-1 py-2 text-xs rounded font-bold transition ${goalFlags.shootout ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Shootout</button>
                                <button onClick={() => setGoalFlags({...goalFlags, pk: !goalFlags.pk})} className={`flex-1 py-2 text-xs rounded font-bold transition ${goalFlags.pk ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Penalty Kick</button>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3 w-full mb-6 mt-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handleKeypad(num.toString())} className="bg-gray-200 hover:bg-gray-300 text-2xl font-bold py-4 rounded-lg">{num}</button>
                            ))}
                            <button onClick={() => handleKeypad('clear')} className="bg-red-100 text-red-600 hover:bg-red-200 text-lg font-bold py-4 rounded-lg">Clear</button>
                            <button onClick={() => handleKeypad('0')} className="bg-gray-200 hover:bg-gray-300 text-2xl font-bold py-4 rounded-lg">0</button>
                            <button onClick={() => handleKeypad('del')} className="bg-gray-200 hover:bg-gray-300 text-lg font-bold py-4 rounded-lg">Del</button>
                        </div>

                        <div className="flex space-x-4 w-full">
                            <button onClick={() => setModalStep(null)} className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50">Cancel</button>
                            <button onClick={() => {
                                let nextStr = 'PLAYER';
                                if (activeAction.type === 'Time Penalty') nextStr = 'CARD_COLOR';
                                else if (activeAction.type === 'Team Warnings') nextStr = 'WARNING_REASON';
                                else if (activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout') nextStr = 'FINALIZE_TEAM_EVENT';
                                validateAndAdvanceTime(nextStr);
                            }} className="flex-1 py-3 text-white font-bold rounded-lg shadow" style={{ backgroundColor: activeAction.team === 'SYSTEM' ? '#000' : flowTeamColor }}>
                                {activeAction.type === 'Team Timeout' || activeAction.type === 'Media Timeout' ? 'Log Event' : 'Next ➔'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 1.1: MANUAL PPG TIME KEYPAD */}
            {modalStep === 'MANUAL_PPG_TIME' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center border-4 border-blue-500">
                        <h3 className="text-2xl font-bold mb-1 uppercase text-blue-600">Enter PPG Time</h3>
                        <p className="text-gray-500 font-bold mb-6 text-center text-sm">No auto-match found. When did the goal happen?</p>

                        <div className="w-full mb-6">
                            <label className="block text-xs font-bold text-blue-800 mb-2 uppercase text-center tracking-widest">Quarter Scored:</label>
                            <div className="flex bg-blue-100 rounded-lg p-1 w-full justify-between shadow-inner">
                                {QUARTERS.map(q => (
                                    <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${modalQuarter === q ? 'bg-blue-600 text-white shadow-md' : 'text-blue-800 hover:bg-blue-200'}`}>{q}</button>
                                ))}
                            </div>
                        </div>

                        <div className="text-7xl font-mono font-black mb-6 bg-blue-50 px-6 py-4 rounded-xl tracking-widest text-center w-full border-2 border-blue-200 text-blue-700">
                            {timeInput.length === 0 ? "00:00" : formatTime(timeInput)}
                        </div>

                        <div className="grid grid-cols-3 gap-3 w-full mb-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handleKeypad(num.toString())} className="bg-gray-200 hover:bg-gray-300 text-2xl font-bold py-4 rounded-lg">{num}</button>
                            ))}
                            <button onClick={() => handleKeypad('clear')} className="bg-red-100 text-red-600 hover:bg-red-200 text-lg font-bold py-4 rounded-lg">Clear</button>
                            <button onClick={() => handleKeypad('0')} className="bg-gray-200 hover:bg-gray-300 text-2xl font-bold py-4 rounded-lg">0</button>
                            <button onClick={() => handleKeypad('del')} className="bg-gray-200 hover:bg-gray-300 text-lg font-bold py-4 rounded-lg">Del</button>
                        </div>

                        <div className="flex space-x-4 w-full">
                            <button onClick={() => setModalStep(null)} className="flex-1 py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50">Cancel</button>
                            <button onClick={() => validateAndAdvanceTime('FINALIZE_MANUAL_PPG')} className="flex-1 py-3 text-white font-bold rounded-lg shadow bg-blue-600 hover:bg-blue-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 1.2: SELECT WARNING REASON */}
            {modalStep === 'WARNING_REASON' && (
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
            )}

            {/* FLOW MODAL 1.5: TIME PENALTY - SELECT CARD COLOR */}
            {modalStep === 'CARD_COLOR' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center">
                        <h3 className="text-2xl font-black mb-6 uppercase" style={{ color: flowTeamColor }}>Select Card Color</h3>
                        <div className="flex flex-col w-full space-y-4 mb-8">
                            <button onClick={() => { setPenaltyData({ ...penaltyData, color: 'Blue' }); setModalStep('PENALTY_CODE'); }} className="w-full py-6 bg-blue-600 text-white text-2xl font-black rounded-xl shadow hover:bg-blue-700 transition">BLUE CARD</button>
                            <button onClick={() => { setPenaltyData({ ...penaltyData, color: 'Yellow' }); setModalStep('PENALTY_CODE'); }} className="w-full py-6 bg-yellow-400 text-black text-2xl font-black rounded-xl shadow hover:bg-yellow-500 transition">YELLOW CARD</button>
                            <button onClick={() => { setPenaltyData({ ...penaltyData, color: 'Red' }); setModalStep('PENALTY_CODE'); }} className="w-full py-6 bg-red-600 text-white text-2xl font-black rounded-xl shadow hover:bg-red-700 transition">RED CARD</button>
                        </div>
                        <button onClick={() => setModalStep('TIME')} className="font-bold text-gray-500 hover:text-gray-800">⬅ Back to Time</button>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 1.6: TIME PENALTY - SELECT EXACT PENALTY CODE */}
            {modalStep === 'PENALTY_CODE' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
                        <div className={`p-4 text-white flex justify-between items-center shrink-0 ${penaltyData.color === 'Blue' ? 'bg-blue-600' : penaltyData.color === 'Yellow' ? 'bg-yellow-400 text-black' : 'bg-red-600'}`}>
                            <h2 className="text-2xl font-black uppercase">Select {penaltyData.color} Card Code</h2>
                            <button onClick={() => setModalStep('CARD_COLOR')} className="font-bold bg-black/20 px-4 py-2 rounded hover:bg-black/30 transition">⬅ Back</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50 flex flex-col space-y-2">
                            {PENALTY_CODES[penaltyData.color]?.map(item => (
                                <button key={item.code} onClick={() => { setPenaltyData({ ...penaltyData, code: item.code, desc: item.desc }); setModalStep('PLAYER'); }} className="flex items-center p-4 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition text-left">
                                    <span className="font-black text-xl w-16 shrink-0" style={{ color: flowTeamColor }}>{item.code}</span>
                                    <span className="font-bold text-gray-700">{item.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 2: PLAYER SELECTION */}
            {modalStep === 'PLAYER' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: flowTeamColor }}>
                            <div className="flex flex-col" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                <h2 className="text-2xl font-black uppercase">
                                    {editingEventId ? "EDIT PLAYER" : (activeAction.type === 'Goal / Assist' ? "SELECT GOAL SCORER" : "SELECT OFFENDER")}
                                </h2>
                                <span className="text-sm font-bold opacity-80">
                                    {activeAction.type === 'Log Foul' ? 'FOUL' : activeAction.type} - {modalQuarter} {activeAction.type !== 'Log Foul' && (activeAction.time || timeInput) ? `@ ${formatTime(activeAction.time || timeInput)}` : ''}
                                    {penaltyData.code ? ` [Code: ${penaltyData.code}]` : ''}
                                </span>
                            </div>
                            <button onClick={() => {
                                if (editingEventId) setModalStep('EVENT_LOG');
                                else if (activeAction.type === 'Log Foul') setModalStep(null);
                                else if (activeAction.type === 'Time Penalty') setModalStep('PENALTY_CODE');
                                else setModalStep('TIME');
                            }} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">
                                {editingEventId ? "Cancel Edit" : (activeAction.type === 'Log Foul' ? "Cancel Foul" : "⬅ Back")}
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col">
                            
                            {activeAction.type === 'Log Foul' && (!isPeriodRunning || editingEventId) && (
                                <div className="w-full mb-6">
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase text-center tracking-widest">Event Quarter</label>
                                    <div className="flex bg-gray-200 rounded-lg p-1 w-full justify-between shadow-inner border border-gray-300">
                                        {QUARTERS.map(q => (
                                            <button key={q} onClick={() => setModalQuarter(q)} className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${modalQuarter === q ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-300'}`}>{q}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">Quick Jersey # Search:</label>
                                <input type="number" autoFocus value={playerSearchInput} onChange={(e) => setPlayerSearchInput(e.target.value)} placeholder="Type jersey number to filter..." className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl font-bold outline-none focus:border-blue-500 transition" style={{ borderColor: playerSearchInput ? flowTeamColor : '' }} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {filteredFlowRoster.map(player => (
                                    <button key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition group">
                                        <span className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full font-black text-xl text-gray-800 group-hover:bg-gray-200 transition" style={{ color: flowTeamColor }}>{player.number}</span>
                                        <span className="ml-4 font-bold text-lg text-gray-800 text-left truncate">{player.name}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {/* BENCH PERSONNEL INJECTION FOR Y/R CARDS */}
                            {activeAction.type === 'Time Penalty' && (penaltyData.color === 'Yellow' || penaltyData.color === 'Red') && (
                                <div className="mt-6">
                                    <h3 className="font-bold text-gray-500 mb-3 uppercase text-sm border-b pb-1">Bench Personnel</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {activeBench.map(person => (
                                            <button key={person.id} onClick={() => handlePlayerSelect(person)} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition text-left">
                                                <span className="font-bold text-lg text-gray-800 truncate">{person.name}</span>
                                                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">({person.role})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredFlowRoster.length === 0 && !playerSearchInput && <div className="text-center text-gray-500 font-bold italic py-8">No active roster found.</div>}

                            {!playerSearchInput && (
                                <>
                                    {activeAction.type === 'Time Penalty' && (
                                        <label className="flex items-center space-x-3 mt-6 p-4 bg-gray-200 rounded-xl cursor-pointer">
                                            <input type="checkbox" className="w-6 h-6 accent-blue-600" checked={requiresSubstituteServer} onChange={e => setRequiresSubstituteServer(e.target.checked)} />
                                            <span className="font-bold text-gray-700">Check if penalty will be served by a substitute (e.g. injured/ejected offender)</span>
                                        </label>
                                    )}

                                    <button onClick={() => {
                                        if (activeAction.type === 'Log Foul') handlePlayerSelect('Unattributed');
                                        else handlePlayerSelect(activeAction.type === 'Goal / Assist' ? 'Own Goal' : 'Team / Bench');
                                    }} className={`mt-4 w-full p-4 border-2 border-dashed rounded-xl text-center font-bold transition ${activeAction.type === 'Log Foul' ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-400 bg-white text-gray-600 hover:bg-gray-100'}`}>
                                        {activeAction.type === 'Goal / Assist' ? "Own Goal" : (activeAction.type === 'Log Foul' ? "Leave Unattributed (Assign Later)" : "Attribute to Team / Bench")}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 2.1: SELECT PENALTY SERVING PLAYER */}
            {modalStep === 'SERVING_PLAYER' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: flowTeamColor }}>
                            <div className="flex flex-col" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                <h2 className="text-2xl font-black uppercase">WHO IS SERVING PENALTY?</h2>
                                <span className="text-sm font-bold opacity-80">Please select the player reporting to the penalty box</span>
                            </div>
                            <button onClick={() => setModalStep('PLAYER')} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">⬅ Back</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">Quick Jersey # Search:</label>
                                <input type="number" autoFocus value={playerSearchInput} onChange={(e) => setPlayerSearchInput(e.target.value)} placeholder="Type jersey number to filter..." className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl font-bold outline-none focus:border-blue-500 transition" style={{ borderColor: playerSearchInput ? flowTeamColor : '' }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {filteredFlowRoster.filter(p => p.id !== benchPenaltyEntity?.id).map(player => (
                                    <button key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition group">
                                        <span className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full font-black text-xl text-gray-800 group-hover:bg-gray-200 transition" style={{ color: flowTeamColor }}>{player.number}</span>
                                        <span className="ml-4 font-bold text-lg text-gray-800 text-left truncate">{player.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 2.5: ASSIST SELECTION */}
            {modalStep === 'ASSIST' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: flowTeamColor }}>
                            <div className="flex flex-col" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                <h2 className="text-2xl font-black uppercase">SELECT ASSIST</h2>
                                <span className="text-sm font-bold opacity-80">
                                    Goal by: {typeof goalScorer === 'string' ? goalScorer : `#${goalScorer?.number} ${goalScorer?.name}`}
                                </span>
                            </div>
                            <button onClick={() => setModalStep('PLAYER')} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">⬅ Back to Scorer</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col">
                            <button onClick={() => handlePlayerSelect('Unassisted')} className="mb-6 w-full p-4 border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl text-center font-bold text-blue-700 hover:bg-blue-100 transition">UNASSISTED</button>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">Quick Jersey # Search:</label>
                                <input type="number" autoFocus value={playerSearchInput} onChange={(e) => setPlayerSearchInput(e.target.value)} placeholder="Type jersey number to filter..." className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl font-bold outline-none focus:border-blue-500 transition" style={{ borderColor: playerSearchInput ? flowTeamColor : '' }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {filteredFlowRoster.map(player => (
                                    <button key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition group">
                                        <span className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full font-black text-xl text-gray-800 group-hover:bg-gray-200 transition" style={{ color: flowTeamColor }}>{player.number}</span>
                                        <span className="ml-4 font-bold text-lg text-gray-800 text-left truncate">{player.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 3: FOUL SUMMARY */}
            {modalStep === 'FOUL_SUMMARY' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: summaryTeam === 'AWAY' ? awayCSSColor : homeCSSColor }}>
                            <h2 className="text-2xl font-black uppercase" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{(summaryTeam === 'AWAY' ? gameData.awayTeam : gameData.homeTeam) || summaryTeam} - FOUL SUMMARY</h2>
                            <button onClick={() => setModalStep(null)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 shadow transition">Close</button>
                        </div>
                        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white p-6">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="py-3 px-2 font-bold text-gray-600">Player</th>
                                        <th className="py-3 px-2 font-bold text-gray-500 text-center border-l bg-gray-50">Q1</th>
                                        <th className="py-3 px-2 font-bold text-gray-500 text-center bg-gray-50">Q2</th>
                                        <th className="py-3 px-2 font-bold text-gray-800 text-center bg-gray-200">1st Half</th>
                                        <th className="py-3 px-2 font-bold text-gray-500 text-center border-l bg-gray-50">Q3</th>
                                        <th className="py-3 px-2 font-bold text-gray-500 text-center bg-gray-50">Q4</th>
                                        <th className="py-3 px-2 font-bold text-gray-500 text-center bg-gray-50">OT</th>
                                        <th className="py-3 px-2 font-bold text-gray-800 text-center bg-gray-200">2nd Half/OT</th>
                                        <th className="py-3 px-2 font-black text-gray-900 text-center border-l-4 border-gray-800 bg-gray-100 text-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(summaryTeam === 'AWAY' ? awayRoster : homeRoster).map(player => {
                                        const fouls = getPlayerFouls(player, summaryTeam, gameEvents);
                                        if (fouls.total === 0) return null; 
                                        return (
                                            <tr key={player.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-2 flex items-center">
                                                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-black text-sm mr-3 border" style={{ borderColor: summaryTeam === 'AWAY' ? awayCSSColor : homeCSSColor }}>{player.number}</span>
                                                    <span className="font-bold text-gray-800">{player.name}</span>
                                                </td>
                                                <td className="py-3 px-2 text-center text-gray-600 border-l bg-gray-50">{fouls.q1 || '-'}</td>
                                                <td className="py-3 px-2 text-center text-gray-600 bg-gray-50">{fouls.q2 || '-'}</td>
                                                <td className={`py-3 px-2 text-center font-bold text-lg bg-gray-200 ${fouls.firstHalf === 4 ? 'text-blue-600' : (fouls.firstHalf >= 3 ? 'text-red-500' : 'text-gray-800')}`}>{fouls.firstHalf}</td>
                                                <td className="py-3 px-2 text-center text-gray-600 border-l bg-gray-50">{fouls.q3 || '-'}</td>
                                                <td className="py-3 px-2 text-center text-gray-600 bg-gray-50">{fouls.q4 || '-'}</td>
                                                <td className="py-3 px-2 text-center text-gray-600 bg-gray-50">{fouls.ot || '-'}</td>
                                                <td className={`py-3 px-2 text-center font-bold text-lg bg-gray-200 ${fouls.secondHalf === 4 ? 'text-blue-600' : (fouls.secondHalf >= 3 ? 'text-red-500' : 'text-gray-800')}`}>{fouls.secondHalf}</td>
                                                <td className={`py-3 px-2 text-center font-black text-xl border-l-4 border-gray-800 bg-gray-100 ${fouls.total >= 5 ? 'text-red-600' : 'text-gray-900'}`}>{fouls.total}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {gameEvents.filter(ev => ev.type === 'Log Foul' && ev.team === summaryTeam).length === 0 && (
                                <div className="text-center text-gray-400 py-12 font-bold italic">No fouls logged for this team yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FLOW MODAL 4: GAME EVENT LOG */}
            {modalStep === 'EVENT_LOG' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="p-4 bg-slate-800 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-2xl font-black uppercase">Official Game Log</h2>
                            <button onClick={() => setModalStep(null)} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 shadow transition">Close</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
                            {gameEvents.length === 0 && <div className="text-center text-gray-400 py-12 font-bold italic">No events logged yet.</div>}
                            
                            {gameEvents.map(event => (
                                <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                    
                                    {event.type === 'Period Marker' ? (
                                        <div className="flex items-center space-x-6 w-full">
                                            <div className="flex flex-col items-center justify-center bg-gray-200 w-16 h-16 rounded-lg">
                                                <span className="text-xs font-bold text-gray-600">{event.quarter}</span>
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">MATCH CLOCK</span>
                                                <span className="text-xl font-black text-gray-800 uppercase">{event.action} {event.quarter}</span>
                                                <span className="font-bold text-blue-600 mt-1">⏱ Real-world time: {event.realTime}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-6">
                                            <div className="flex flex-col items-center justify-center bg-gray-100 w-16 h-16 rounded-lg shrink-0">
                                                <span className="text-xs font-bold text-gray-500">{event.quarter}</span>
                                                {event.time && <span className="font-black text-gray-800">{event.time}</span>}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                    {event.team !== 'SYSTEM' && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: event.team === 'AWAY' ? awayCSSColor : homeCSSColor }}></span>}
                                                    <span className="font-bold text-gray-500 uppercase text-xs">
                                                        {event.team === 'SYSTEM' ? 'SYSTEM' : (event.team === 'AWAY' ? gameData.awayTeam || 'AWAY' : gameData.homeTeam || 'HOME')}
                                                    </span>
                                                </div>
                                                
                                                <span className="text-xl font-black text-gray-800 uppercase flex items-center">
                                                    {event.type === 'Log Foul' ? 'FOUL' : event.type}
                                                </span>
                                                
                                                {event.penalty?.code && (
                                                    <div className="text-sm font-bold mt-1" style={{ color: event.penalty.color === 'Yellow' ? '#b45309' : event.penalty.color.toLowerCase() }}>
                                                        [{event.penalty.code} - {event.penalty.desc}]
                                                    </div>
                                                )}
                                                {event.type === 'Team Warnings' && event.warningReason && (
                                                    <div className="text-sm font-bold mt-1 text-orange-600">
                                                        [Reason: {event.warningReason}]
                                                    </div>
                                                )}
                                                
                                                <span className="font-bold text-gray-600 mt-1 flex items-center flex-wrap">
                                                    {typeof event.entity === 'string' ? event.entity : `#${event.entity?.number} - ${event.entity?.name}`}
                                                    
                                                    {event.servingPlayer && (
                                                        <span className="text-sm font-bold text-gray-500 ml-2 italic">
                                                            (Served by: #{event.servingPlayer.number} {event.servingPlayer.name})
                                                        </span>
                                                    )}

                                                    {event.assist && (
                                                        <span className="text-sm font-bold text-blue-600 ml-2 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                            {typeof event.assist === 'string' ? `(${event.assist})` : `(Ast: #${event.assist?.number} ${event.assist?.name})`}
                                                        </span>
                                                    )}

                                                    {event.goalFlags && (event.goalFlags.pp || event.goalFlags.shootout || event.goalFlags.pk) && (
                                                        <span className="text-xs font-black text-purple-600 ml-2 border border-purple-300 bg-purple-50 px-2 py-0.5 rounded">
                                                            {[event.goalFlags.pp ? 'PP' : '', event.goalFlags.shootout ? 'SO' : '', event.goalFlags.pk ? 'PK' : ''].filter(Boolean).join(', ')}
                                                        </span>
                                                    )}
                                                </span>

                                                {event.type === 'Injury' && event.eligibleReturnTime && (
                                                    <div className="mt-2 text-xs font-bold p-2 bg-green-50 text-green-700 rounded-md border border-green-200 inline-block">
                                                        Eligible to Return: {event.eligibleReturnTime.quarter} at {event.eligibleReturnTime.time}
                                                    </div>
                                                )}

                                                {event.type === 'Time Penalty' && event.releaseTime && (
                                                    <div className="mt-2 text-xs font-bold p-2 bg-gray-100 rounded-md border inline-block">
                                                        {event.actualReleaseTime ? (
                                                            <span className="text-green-600">
                                                                <strike className="text-gray-400 mr-2">Exp: {event.releaseTime.quarter} {event.releaseTime.time}</strike>
                                                                Released Early: {event.actualReleaseTime.quarter} {event.actualReleaseTime.time} (PPG)
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-700">
                                                                {event.majorReleaseTime ? 'Teammate Release' : 'Scheduled Release'}: {event.releaseTime.quarter} {event.releaseTime.time}
                                                                {event.majorReleaseTime && ` | Offender Release: ${event.majorReleaseTime.quarter} ${event.majorReleaseTime.time}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex space-x-3 shrink-0 ml-4">
                                        {event.entity && event.type !== 'Period Marker' && event.entity !== 'Team' && (
                                            <button onClick={() => startEditingEvent(event)} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition">Edit</button>
                                        )}
                                        <button onClick={() => deleteEvent(event.id)} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* VERSION INDICATOR */}
            <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 z-[1000] drop-shadow-md">
                Author: Dave Wolgast | v{APP_VERSION}
            </div>
        </div>
    );
}