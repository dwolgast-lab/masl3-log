import React, { useState } from 'react';
import { formatTime } from '../../utils';

const VR_REASONS = {
    "Power Play Penalties": ["Blue Card Not Given", "Blue Card Given Incorrectly", "Penalty Kick", "Shootout", "Faking or Embellishing"],
    "Direct Red Card": ["Serious foul play or violent conduct"],
    "Foul Not Called": [],
    "Rules Error": ["Invalid Requests", "Other"],
    "Goal/ No Goal": ["Ball Crossing Goal Line", "Time Expiration"]
};

export default function VideoReviewModal({ modalStep, ...props }) {
    if (modalStep !== 'VIDEO_REVIEW') return null;
    return <VideoReviewModalContent {...props} />;
}

// Mounts fresh each time the modal opens, so step/vrData start at their initial values.
function VideoReviewModalContent({ setModalStep, modalQuarter, timeInput, gameData, gameEvents, onSave }) {
    const [step, setStep] = useState('INITIATOR');
    const [vrData, setVrData] = useState({
        initiator: null, team: null, reason: null, subReason: null, otherDesc: '', result: null, flagCollected: false
    });

    // Evaluate Challenge Availability
    const checkVR = (teamId) => {
        if (!gameEvents) return 'Y';
        const vrs = gameEvents.filter(e => e.type === 'Video Review' && e.initiator === 'Coach' && e.team === teamId);
        if (vrs.length === 0) return 'Y';
        const successful = vrs.filter(e => e.result === 'Overturned/Changed').length;
        return (vrs.length === 1 && successful === 1) ? 'Y' : 'N';
    };

    const awayAvailable = checkVR('AWAY') === 'Y';
    const homeAvailable = checkVR('HOME') === 'Y';

    const handleNext = (updates, nextStep) => {
        setVrData(prev => ({ ...prev, ...updates }));
        if (nextStep) setStep(nextStep);
    };

    const commitReview = (finalUpdates = {}) => {
        const finalData = { ...vrData, ...finalUpdates };
        if (finalData.reason === 'Rules Error' && finalData.subReason === 'Other') {
            finalData.subReason = `Other: ${finalData.otherDesc}`;
        }
        onSave({
            id: Date.now(),
            type: 'Video Review',
            quarter: modalQuarter,
            time: formatTime(timeInput),
            team: finalData.team || 'SYSTEM',
            initiator: finalData.initiator,
            reason: finalData.reason,
            subReason: finalData.subReason,
            result: finalData.result,
            flagCollected: finalData.flagCollected
        });
        setModalStep(null);
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-hidden flex flex-col">
                <div className="bg-purple-700 p-4 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black uppercase tracking-wider">Log Video Review</h2>
                    <button onClick={() => setModalStep(null)} className="min-h-11 px-3 text-purple-100 hover:text-white font-bold transition active:scale-[0.97]">✕ Cancel</button>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900 flex-1 overflow-y-auto">
                    {step === 'INITIATOR' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-4">Who initiated the review?</h3>
                            <button onClick={() => handleNext({ initiator: 'Coach' }, 'TEAM')} className="w-full min-h-[52px] py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl font-black text-lg text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-[0.97] active:brightness-95">Coach's Challenge</button>
                            <button onClick={() => handleNext({ initiator: 'Referee', team: 'SYSTEM' }, 'REASON')} className="w-full min-h-[52px] py-3 bg-slate-800 dark:bg-slate-600 text-white rounded-xl font-black text-lg hover:bg-slate-700 dark:hover:bg-slate-500 transition active:scale-[0.97] active:brightness-95">Referee Initiated</button>
                        </div>
                    )}

                    {step === 'TEAM' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-4">Which team challenged?</h3>
                            <button 
                                onClick={() => handleNext({ team: 'AWAY' }, 'REASON')} 
                                disabled={!awayAvailable}
                                className={`w-full min-h-[52px] py-3 border-2 rounded-xl font-black text-lg uppercase transition ${awayAvailable ? 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.97] active:brightness-95' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                            >
                                {gameData.awayTeam || 'AWAY'} {!awayAvailable && <span className="block text-xs mt-1 normal-case">(No Challenges Remaining)</span>}
                            </button>
                            <button 
                                onClick={() => handleNext({ team: 'HOME' }, 'REASON')} 
                                disabled={!homeAvailable}
                                className={`w-full min-h-[52px] py-3 border-2 rounded-xl font-black text-lg uppercase transition ${homeAvailable ? 'bg-slate-100 dark:bg-slate-700 border-slate-500 dark:border-slate-400 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.97] active:brightness-95' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                            >
                                {gameData.homeTeam || 'HOME'} {!homeAvailable && <span className="block text-xs mt-1 normal-case">(No Challenges Remaining)</span>}
                            </button>
                        </div>
                    )}

                    {step === 'REASON' && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-4">Select VR Reason</h3>
                            {Object.keys(VR_REASONS).map(r => (
                                <button key={r} onClick={() => handleNext({ reason: r }, VR_REASONS[r].length > 0 ? 'SUBREASON' : 'RESULT')} className="w-full min-h-[52px] py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition active:scale-[0.97] active:brightness-95">{r}</button>
                            ))}
                        </div>
                    )}

                    {step === 'SUBREASON' && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-4">Select Specification</h3>
                            {VR_REASONS[vrData.reason].map(sub => (
                                <button key={sub} onClick={() => handleNext({ subReason: sub }, sub === 'Other' ? 'OTHER_DESC' : 'RESULT')} className="w-full min-h-[52px] py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition active:scale-[0.97] active:brightness-95">{sub}</button>
                            ))}
                        </div>
                    )}

                    {step === 'OTHER_DESC' && (
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Brief Description</h3>
                            <input type="text" className="w-full min-h-11 p-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl mb-4 font-bold text-base text-slate-800 dark:text-slate-100" value={vrData.otherDesc} onChange={e => setVrData({...vrData, otherDesc: e.target.value})} autoFocus />
                            <button onClick={() => handleNext({}, 'RESULT')} className="w-full min-h-[52px] py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition active:scale-[0.97] active:brightness-95">NEXT ➔</button>
                        </div>
                    )}

                    {step === 'RESULT' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-4">What was the outcome?</h3>
                            <button onClick={() => commitReview({ result: 'Overturned/Changed', flagCollected: false })} className="w-full min-h-[52px] py-3 bg-green-100 dark:bg-green-950 border-2 border-green-500 text-green-800 dark:text-green-300 rounded-xl font-black text-lg hover:bg-green-200 dark:hover:bg-green-900 transition active:scale-[0.97] active:brightness-95">Call Overturned / Changed</button>
                            <button onClick={() => {
                                if (vrData.initiator === 'Coach') handleNext({ result: 'Call Stands' }, 'FLAG');
                                else commitReview({ result: 'Call Stands', flagCollected: false });
                            }} className="w-full min-h-[52px] py-3 bg-red-100 dark:bg-red-950 border-2 border-red-500 text-red-800 dark:text-red-300 rounded-xl font-black text-lg hover:bg-red-200 dark:hover:bg-red-900 transition active:scale-[0.97] active:brightness-95">Call Stands</button>
                        </div>
                    )}

                    {step === 'FLAG' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">Failed Challenge</h3>
                            <p className="text-sm text-center text-slate-600 dark:text-slate-300 mb-4 font-bold">Because the coach's challenge failed, they lose their VR privilege.</p>
                            <button onClick={() => commitReview({ flagCollected: true })} className="w-full min-h-[52px] py-3 bg-yellow-100 dark:bg-yellow-950 border-2 border-yellow-500 text-yellow-800 dark:text-yellow-300 rounded-xl font-black text-lg hover:bg-yellow-200 dark:hover:bg-yellow-900 transition active:scale-[0.97] active:brightness-95">Verify Challenge Flag Collected</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}