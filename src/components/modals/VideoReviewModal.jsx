import React, { useState, useEffect } from 'react';
import { formatTime } from '../../utils';

const VR_REASONS = {
    "Power Play Penalties": ["Blue Card Not Given", "Blue Card Given Incorrectly", "Penalty Kick", "Shootout", "Faking or Embellishing"],
    "Direct Red Card": ["Serious foul play or violent conduct"],
    "Foul Not Called": [],
    "Rules Error": ["Invalid Requests", "Other"],
    "Goal/ No Goal": ["Ball Crossing Goal Line", "Time Expiration"]
};

export default function VideoReviewModal({ modalStep, setModalStep, activeAction, modalQuarter, timeInput, gameData, onSave }) {
    const [step, setStep] = useState('INITIATOR');
    const [vrData, setVrData] = useState({
        initiator: null, team: null, reason: null, subReason: null, otherDesc: '', result: null, flagCollected: false
    });

    // BUGFIX: Force reset the wizard state every time the modal is opened
    useEffect(() => {
        if (modalStep === 'VIDEO_REVIEW') {
            setStep('INITIATOR');
            setVrData({ initiator: null, team: null, reason: null, subReason: null, otherDesc: '', result: null, flagCollected: false });
        }
    }, [modalStep]);

    if (modalStep !== 'VIDEO_REVIEW') return null;

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="bg-purple-700 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-wider">Log Video Review</h2>
                    <button onClick={() => setModalStep(null)} className="text-purple-200 hover:text-white font-bold">✕ Cancel</button>
                </div>

                <div className="p-6 bg-gray-50 flex-1">
                    {step === 'INITIATOR' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Who initiated the review?</h3>
                            <button onClick={() => handleNext({ initiator: 'Coach' }, 'TEAM')} className="w-full py-4 bg-white border-2 border-gray-300 rounded-xl font-black text-lg text-gray-800 hover:bg-gray-100">Coach's Challenge</button>
                            <button onClick={() => handleNext({ initiator: 'Referee', team: 'SYSTEM' }, 'REASON')} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-lg hover:bg-slate-700">Referee Initiated</button>
                        </div>
                    )}

                    {step === 'TEAM' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Which team challenged?</h3>
                            <button onClick={() => handleNext({ team: 'AWAY' }, 'REASON')} className="w-full py-4 bg-blue-50 border-2 border-blue-500 text-blue-800 rounded-xl font-black text-lg uppercase hover:bg-blue-100">{gameData.awayTeam || 'AWAY'}</button>
                            <button onClick={() => handleNext({ team: 'HOME' }, 'REASON')} className="w-full py-4 bg-red-50 border-2 border-red-500 text-red-800 rounded-xl font-black text-lg uppercase hover:bg-red-100">{gameData.homeTeam || 'HOME'}</button>
                        </div>
                    )}

                    {step === 'REASON' && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Select VR Reason</h3>
                            {Object.keys(VR_REASONS).map(r => (
                                <button key={r} onClick={() => handleNext({ reason: r }, VR_REASONS[r].length > 0 ? 'SUBREASON' : 'RESULT')} className="w-full py-3 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-100 text-gray-800">{r}</button>
                            ))}
                        </div>
                    )}

                    {step === 'SUBREASON' && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Select Specification</h3>
                            {VR_REASONS[vrData.reason].map(sub => (
                                <button key={sub} onClick={() => handleNext({ subReason: sub }, sub === 'Other' ? 'OTHER_DESC' : 'RESULT')} className="w-full py-3 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-100 text-gray-800">{sub}</button>
                            ))}
                        </div>
                    )}

                    {step === 'OTHER_DESC' && (
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Brief Description</h3>
                            <input type="text" className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4 font-bold text-gray-800" value={vrData.otherDesc} onChange={e => setVrData({...vrData, otherDesc: e.target.value})} autoFocus />
                            <button onClick={() => handleNext({}, 'RESULT')} className="w-full py-3 bg-purple-600 text-white font-black rounded-xl">NEXT ➔</button>
                        </div>
                    )}

                    {step === 'RESULT' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">What was the outcome?</h3>
                            <button onClick={() => commitReview({ result: 'Overturned/Changed', flagCollected: false })} className="w-full py-4 bg-green-100 border-2 border-green-500 text-green-800 rounded-xl font-black text-lg hover:bg-green-200">Call Overturned / Changed</button>
                            <button onClick={() => {
                                if (vrData.initiator === 'Coach') handleNext({ result: 'Call Stands' }, 'FLAG');
                                else commitReview({ result: 'Call Stands', flagCollected: false });
                            }} className="w-full py-4 bg-red-100 border-2 border-red-500 text-red-800 rounded-xl font-black text-lg hover:bg-red-200">Call Stands</button>
                        </div>
                    )}

                    {step === 'FLAG' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Failed Challenge</h3>
                            <p className="text-sm text-center text-gray-600 mb-4 font-bold">Because the coach's challenge failed, they lose their VR privilege.</p>
                            <button onClick={() => commitReview({ flagCollected: true })} className="w-full py-4 bg-yellow-100 border-2 border-yellow-500 text-yellow-800 rounded-xl font-black text-lg hover:bg-yellow-200">Verify Challenge Flag Collected</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}