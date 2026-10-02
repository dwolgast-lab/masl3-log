import React from 'react';
import { PENALTY_CODES } from '../../config';
import { readableTextOn } from '../../utils';

const CARD_HEX = { Blue: '#0096FF', Yellow: '#FFCC00', Red: '#ED1C24' };
const cardStyle = (c) => ({ backgroundColor: CARD_HEX[c], color: readableTextOn(CARD_HEX[c]) });

const BACKDROP = "absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4";
const PANEL = "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90dvh] overflow-hidden";
const BODY = "p-4 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900 grid grid-cols-1 lg:landscape:grid-cols-2 gap-2 content-start";
const ROW = "flex items-center min-h-[52px] p-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition active:scale-[0.97] active:brightness-95 text-left";
const BACK = "shrink-0 min-h-11 font-bold px-4 rounded bg-black/20 hover:bg-black/30 transition active:scale-[0.97] active:brightness-95";

const CARD_BTN = "flex items-center justify-center text-center landscape:flex-1 landscape:aspect-[5/7] min-h-24 rounded-xl shadow-lg border-4 border-black/10 text-2xl font-black transition active:scale-[0.97] active:brightness-95";

export default function PenaltyModal({ modalStep, setModalStep, penaltyData, setPenaltyData, flowTeamColor }) {
    if (modalStep !== 'CARD_COLOR' && modalStep !== 'PENALTY_CODE' && modalStep !== 'PENALTY_CODE_BLUE_FOR_Y6') return null;

    if (modalStep === 'CARD_COLOR') {
        const pick = (color) => { setPenaltyData({ ...penaltyData, color }); setModalStep('PENALTY_CODE'); };
        return (
            <div className={BACKDROP}>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[96dvh] overflow-y-auto flex flex-col items-center">
                    <h3 className="text-2xl font-black mb-5 uppercase text-center" style={{ color: flowTeamColor }}>Select Card Color</h3>
                    <div className="flex flex-col landscape:flex-row w-full gap-4 mb-6">
                        <button onClick={() => pick('Blue')} className={CARD_BTN} style={cardStyle('Blue')}>BLUE CARD</button>
                        <button onClick={() => pick('Yellow')} className={CARD_BTN} style={cardStyle('Yellow')}>YELLOW CARD</button>
                        <button onClick={() => pick('Red')} className={CARD_BTN} style={cardStyle('Red')}>RED CARD</button>
                    </div>
                    <button onClick={() => setModalStep('TIME')} className="min-h-11 px-4 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition active:scale-[0.97]">⬅ Back to Time</button>
                </div>
            </div>
        );
    }

    // Y6 REQUIRES A BLUE CARD REASON TO ACCOMPANY IT
    if (modalStep === 'PENALTY_CODE_BLUE_FOR_Y6') {
        return (
            <div className={BACKDROP}>
                <div className={PANEL}>
                    <div className="p-4 flex justify-between items-center gap-3 shrink-0" style={cardStyle('Blue')}>
                        <h2 className="text-2xl font-black uppercase">Select Accompanying Blue Card</h2>
                        <button onClick={() => setModalStep('PENALTY_CODE')} className={BACK}>⬅ Back</button>
                    </div>
                    <div className={BODY}>
                        {PENALTY_CODES['Blue']?.map(item => (
                            <button key={item.code} onClick={() => { setPenaltyData({ ...penaltyData, blueCode: item.code, blueDesc: item.desc }); setModalStep('PLAYER'); }} className={ROW}>
                                <span className="font-black text-xl w-14 shrink-0 tabular-nums" style={{ color: flowTeamColor }}>{item.code}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">{item.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const headerStyle = cardStyle(penaltyData.color);

    return (
        <div className={BACKDROP}>
            <div className={PANEL}>
                <div className="p-4 flex justify-between items-center gap-3 shrink-0" style={headerStyle}>
                    <h2 className="text-2xl font-black uppercase">Select {penaltyData.color} Card Code</h2>
                    <button onClick={() => setModalStep('CARD_COLOR')} className={BACK}>⬅ Back</button>
                </div>
                <div className={BODY}>
                    {PENALTY_CODES[penaltyData.color]?.map(item => (
                        <button key={item.code} onClick={() => {
                            if (item.code === 'Y6') {
                                setPenaltyData({ ...penaltyData, code: item.code, desc: item.desc });
                                setModalStep('PENALTY_CODE_BLUE_FOR_Y6');
                            } else {
                                setPenaltyData({ ...penaltyData, code: item.code, desc: item.desc });
                                setModalStep('PLAYER');
                            }
                        }} className={ROW}>
                            <span className="font-black text-xl w-14 shrink-0 tabular-nums" style={{ color: flowTeamColor }}>{item.code}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{item.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
