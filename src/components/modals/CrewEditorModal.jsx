import React from 'react';

export default function CrewEditorModal({ show, onClose, gameData, handleInputChange }) {
    if (!show) return null;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[100] p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black uppercase tracking-wider">Officiating Crew</h2>
                    <button onClick={onClose} className="font-bold bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 shadow transition">
                        Close
                    </button>
                </div>
                
                <div className="p-8 space-y-5 bg-gray-50 flex-1">
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1 uppercase">Crew Chief</label>
                        <input type="text" name="crewChief" value={gameData.crewChief || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1 uppercase">Referee</label>
                        <input type="text" name="referee" value={gameData.referee || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1 uppercase">Assistant Referee</label>
                        <input type="text" name="assistantRef" value={gameData.assistantRef || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-700 mb-1 uppercase">4th Official <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                        <input type="text" name="fourthOfficial" value={gameData.fourthOfficial || ''} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white shadow-sm outline-none focus:border-blue-500 font-medium" placeholder="First and Last Name" />
                    </div>
                </div>

                <div className="p-4 bg-white border-t flex justify-end shrink-0">
                    <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-md hover:bg-blue-700 transition">
                        Save Crew
                    </button>
                </div>
            </div>
        </div>
    );
}