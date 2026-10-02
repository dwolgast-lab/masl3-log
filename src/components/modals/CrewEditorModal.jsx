import React from 'react';

export default function CrewEditorModal({ show, onClose, gameData, handleInputChange }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
                <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white flex justify-between items-center gap-3 shrink-0">
                    <h2 className="text-xl font-black uppercase tracking-wider">Officiating Crew</h2>
                    <button onClick={onClose} className="min-h-11 min-w-11 font-bold bg-slate-900 dark:bg-slate-700 text-white px-4 rounded hover:bg-slate-700 shadow active:scale-[0.97] active:brightness-95 transition">
                        Close
                    </button>
                </div>
                
                <div className="p-5 md:p-8 space-y-5 bg-slate-50 dark:bg-slate-800 flex-1 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 uppercase">Crew Chief</label>
                        <input type="text" name="crewChief" value={gameData.crewChief || ''} onChange={handleInputChange} className="w-full min-h-11 px-3 text-base border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 uppercase">Referee</label>
                        <input type="text" name="referee" value={gameData.referee || ''} onChange={handleInputChange} className="w-full min-h-11 px-3 text-base border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 uppercase">Assistant Referee</label>
                        <input type="text" name="assistantRef" value={gameData.assistantRef || ''} onChange={handleInputChange} className="w-full min-h-11 px-3 text-base border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 uppercase">4th Official <span className="text-slate-400 font-normal normal-case">(Optional)</span></label>
                        <input type="text" name="fourthOfficial" value={gameData.fourthOfficial || ''} onChange={handleInputChange} className="w-full min-h-11 px-3 text-base border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end shrink-0">
                    <button onClick={onClose} className="min-h-11 px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.97] active:brightness-95 transition">
                        Save Crew
                    </button>
                </div>
            </div>
        </div>
    );
}
