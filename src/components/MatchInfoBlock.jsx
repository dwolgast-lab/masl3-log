import React from 'react';

export default function MatchInfoBlock({ gameData, handleInputChange }) {
    return (
        <div className="grid grid-cols-5 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Game Number</label>
                <input type="text" name="gameNumber" placeholder="e.g. 25MASL3-001" value={gameData.gameNumber || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50 uppercase" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Date</label>
                <input type="date" name="date" value={gameData.date || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Scheduled KO</label>
                <input type="time" name="scheduledKO" value={gameData.scheduledKO || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Venue</label>
                <input type="text" name="venue" value={gameData.venue || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">City</label>
                <input type="text" name="city" value={gameData.city || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-gray-50" />
            </div>
        </div>
    );
}