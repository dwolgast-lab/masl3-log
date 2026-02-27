/* =========================================================================
 * MASL 3 4th Official Log App
 * Author: Dave Wolgast
 * Version: 0.23 (Refactoring Phase 2)
 * ========================================================================= */

import { useState, useEffect } from 'react'
import { PENALTY_CODES, TEAM_WARNINGS, QUARTERS } from './config'
import { 
    useStickyState, formatTime, toElapsedSeconds, 
    calcReleaseTime, calcInjuryReturn, getTeamColor
} from './utils'
import { generatePDF } from './pdfEngine'

// --- IMPORT EXTRACTED UI COMPONENTS ---
import TimerOverlay from './components/TimerOverlay';
import AlertOverlay from './components/AlertOverlay';
import FoulSummary from './components/FoulSummary';
import EventLog from './components/EventLog';
import PregameSetup from './views/PregameSetup';
import InGameDashboard from './views/InGameDashboard';

const APP_VERSION = "0.23";

// --- WEB AUDIO API: SYNTHETIC DESK BELL ---
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

    // UI States
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
        setModalQuarter(quarter); 
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

            if (quarter === 'Q1' || quarter === 'Q3') setAppTimer({ active: true, time: 180, initialTime: 180, label: 'QUARTER BREAK', minimized: false }); 
            else if (quarter === 'Q2') setAppTimer({ active: true, time: 600, initialTime: 600, label: 'HALFTIME', minimized: false }); 
            else if (quarter === 'Q4') alert("The 4th Quarter has ended. If going to OT, please change the quarter manually.");

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
                    if (penaltyData.code === 'Y6') { duration = 2; majorReleaseTime = calcReleaseTime(modalQuarter, finalTimeStr, 7); }
                } else if (penaltyData.color === 'Red') {
                    if (penaltyData.code !== 'R8' && penaltyData.code !== 'R9') { duration = 2; isReleasable = true; }
                }
            }
            if (duration > 0) releaseTime = calcReleaseTime(modalQuarter, finalTimeStr, duration);
        }

        let eligibleReturnTime = null;
        if (activeAction.type === 'Injury') eligibleReturnTime = calcInjuryReturn(modalQuarter, finalTimeStr);

        if (editingEventId) {
            updatedEvents = gameEvents.map(ev => ev.id === editingEventId ? { 
                ...ev, quarter: modalQuarter, time: activeAction.type === 'Log Foul' ? null : finalTimeStr,
                entity: selectedEntity, assist: assistEntity, servingPlayer: servingPlayerEntity,
                releaseTime: releaseTime || ev.releaseTime, majorReleaseTime: majorReleaseTime || ev.majorReleaseTime,
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

    const activePenaltiesAway = gameEvents.filter(ev => ev.type === 'Time Penalty' && ev.team === 'AWAY' && !ev.clearedFromBoard && (ev.releaseTime || ev.majorReleaseTime));
    const activePenaltiesHome = gameEvents.filter(ev => ev.type === 'Time Penalty' && ev.team === 'HOME' && !ev.clearedFromBoard && (ev.releaseTime || ev.majorReleaseTime));

    const flowTeamRoster = activeAction.team === 'AWAY' ? awayRoster : homeRoster;
    const flowTeamColor = activeAction.team === 'AWAY' ? awayCSSColor : homeCSSColor;
    const flowTeamName = activeAction.team === 'AWAY' ? (gameData.awayTeam || 'AWAY') : (gameData.homeTeam || 'HOME');
    const filteredFlowRoster = playerSearchInput ? flowTeamRoster.filter(p => p.number.startsWith(playerSearchInput)) : flowTeamRoster;

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

    // --- VIEW RENDERING ---
    if (currentView === 'pregame') {
        return (
            <PregameSetup 
                gameData={gameData} handleInputChange={handleInputChange}
                awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor}
                awayRoster={awayRoster} homeRoster={homeRoster}
                awayBench={awayBench} homeBench={homeBench}
                activeRosterModal={activeRosterModal} setActiveRosterModal={setActiveRosterModal}
                showStartersModal={showStartersModal} setShowStartersModal={setShowStartersModal}
                newPlayer={newPlayer} setNewPlayer={setNewPlayer} handleAddPlayer={handleAddPlayer} removePlayer={(id) => activeRosterModal === 'AWAY' ? setAwayRoster(awayRoster.filter(p => p.id !== id)) : setHomeRoster(homeRoster.filter(p => p.id !== id))}
                newBench={newBench} setNewBench={setNewBench} handleAddBench={handleAddBench} removeBench={(id) => activeRosterModal === 'AWAY' ? setAwayBench(awayBench.filter(b => b.id !== id)) : setHomeBench(homeBench.filter(b => b.id !== id))}
                setCurrentView={setCurrentView} clearAllGameData={clearAllGameData}
                onExportPDF={() => generatePDF(gameData, homeRoster, awayRoster, gameEvents)}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans relative bg-gray-100 overflow-hidden">
            
            {/* EXTRACTED: OVERLAYS */}
            <TimerOverlay appTimer={appTimer} setAppTimer={setAppTimer} />
            <AlertOverlay foulAlert={foulAlert} setFoulAlert={setFoulAlert} />

            {/* EXTRACTED: MAIN DASHBOARD */}
            <InGameDashboard 
                gameData={gameData} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor}
                awayScore={awayScore} homeScore={homeScore} quarter={quarter} gameEvents={gameEvents}
                setModalStep={setModalStep} setSummaryTeam={setSummaryTeam} triggerAction={triggerAction}
                activePenaltiesAway={activePenaltiesAway} activePenaltiesHome={activePenaltiesHome}
                handlePPGoalScored={handlePPGoalScored} handlePenaltyExpired={handlePenaltyExpired}
                togglePeriod={togglePeriod} isPeriodRunning={isPeriodRunning} setCurrentView={setCurrentView}
            />

            {/* EXTRACTED: FOUL SUMMARY MODAL */}
            {modalStep === 'FOUL_SUMMARY' && (
                <FoulSummary 
                    summaryTeam={summaryTeam} gameData={gameData}
                    awayRoster={awayRoster} homeRoster={homeRoster}
                    gameEvents={gameEvents} awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor}
                    onClose={() => setModalStep(null)}
                />
            )}

            {/* EXTRACTED: EVENT LOG MODAL */}
            {modalStep === 'EVENT_LOG' && (
                <EventLog 
                    gameEvents={gameEvents} setModalStep={setModalStep}
                    awayCSSColor={awayCSSColor} homeCSSColor={homeCSSColor} gameData={gameData}
                    startEditingEvent={startEditingEvent} deleteEvent={deleteEvent}
                />
            )}

            {/* KEEPING ACTION MODALS IN APP.JSX FOR NOW DUE TO HIGH STATE COUPLING */}
            
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
                                    <button key={player.id} onClick={() => {
                                        if (goalScorer && typeof goalScorer !== 'string' && goalScorer.id === player.id) {
                                            alert("The goal scorer cannot also be credited with the assist.");
                                        } else {
                                            handlePlayerSelect(player);
                                        }
                                    }} className="flex items-center p-3 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition group">
                                        <span className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full font-black text-xl text-gray-800 group-hover:bg-gray-200 transition" style={{ color: flowTeamColor }}>{player.number}</span>
                                        <span className="ml-4 font-bold text-lg text-gray-800 text-left truncate">{player.name}</span>
                                    </button>
                                ))}
                            </div>
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