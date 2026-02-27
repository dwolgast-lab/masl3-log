import React from 'react';
import { PENALTY_CODES } from '../../config';

export default function PenaltyModal({ modalStep, setModalStep, penaltyData, setPenaltyData, flowTeamColor }) {
    if (modalStep !== 'CARD_COLOR' && modalStep !== 'PENALTY_CODE' && modalStep !== 'PENALTY_CODE_BLUE_FOR_Y6') return null;

    if (modalStep === 'CARD_COLOR') {
        return (
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
        );
    }

    // Y6 REQUIRES A BLUE CARD REASON TO ACCOMPANY IT
    if (modalStep === 'PENALTY_CODE_BLUE_FOR_Y6') {
        return (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
                    <div className={`p-4 text-white flex justify-between items-center shrink-0 bg-blue-600`}>
                        <h2 className="text-2xl font-black uppercase">Select Accompanying Blue Card</h2>
                        <button onClick={() => setModalStep('PENALTY_CODE')} className="font-bold bg-black/20 px-4 py-2 rounded hover:bg-black/30 transition">⬅ Back</button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 bg-gray-50 flex flex-col space-y-2">
                        {PENALTY_CODES['Blue']?.map(item => (
                            <button key={item.code} onClick={() => { setPenaltyData({ ...penaltyData, blueCode: item.code, blueDesc: item.desc }); setModalStep('PLAYER'); }} className="flex items-center p-4 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition text-left">
                                <span className="font-black text-xl w-16 shrink-0" style={{ color: flowTeamColor }}>{item.code}</span>
                                <span className="font-bold text-gray-700">{item.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
                <div className={`p-4 text-white flex justify-between items-center shrink-0 ${penaltyData.color === 'Blue' ? 'bg-blue-600' : penaltyData.color === 'Yellow' ? 'bg-yellow-400 text-black' : 'bg-red-600'}`}>
                    <h2 className="text-2xl font-black uppercase">Select {penaltyData.color} Card Code</h2>
                    <button onClick={() => setModalStep('CARD_COLOR')} className="font-bold bg-black/20 px-4 py-2 rounded hover:bg-black/30 transition">⬅ Back</button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 bg-gray-50 flex flex-col space-y-2">
                    {PENALTY_CODES[penaltyData.color]?.map(item => (
                        <button key={item.code} onClick={() => { 
                            if (item.code === 'Y6') {
                                setPenaltyData({ ...penaltyData, code: item.code, desc: item.desc });
                                setModalStep('PENALTY_CODE_BLUE_FOR_Y6');
                            } else {
                                setPenaltyData({ ...penaltyData, code: item.code, desc: item.desc }); 
                                setModalStep('PLAYER'); 
                            }
                        }} className="flex items-center p-4 bg-white border-2 border-transparent rounded-lg shadow-sm hover:border-gray-300 transition text-left">
                            <span className="font-black text-xl w-16 shrink-0" style={{ color: flowTeamColor }}>{item.code}</span>
                            <span className="font-bold text-gray-700">{item.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}