import React from 'react';

export default function TeamConfigCard({ 
    type, gameData, handleInputChange, handleTeamSelect, 
    teamsByDivision, cssColor, rosterCount, benchCount, setActiveRosterModal 
}) {
    const isAway = type === 'away';
    const teamNameStr = gameData[`${type}Team`];
    const logoStr = gameData[`${type}Logo`];
    const colorNameStr = gameData[`${type}ColorName`];
    
    const getTeamSelectValue = () => {
        for (const division in teamsByDivision) {
            const found = teamsByDivision[division].find(t => t.name === teamNameStr);
            if (found) return found.id;
        }
        return 'custom';
    };

    return (
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col relative">
            {logoStr && <img src={logoStr} alt={`${type} Logo`} className="absolute top-4 right-4 w-12 h-12 object-contain opacity-80 drop-shadow-sm" />}
            <h3 className="font-black mb-4 uppercase" style={{ color: cssColor }}>{type} TEAM</h3>
            
            <select value={getTeamSelectValue()} onChange={(e) => handleTeamSelect(type, e)} className="w-full p-3 border rounded-lg mb-3 font-bold bg-white shadow-sm outline-none focus:border-blue-500">
                <option value="custom">-- Custom / Manual Entry --</option>
                {Object.keys(teamsByDivision).map(division => (
                    <optgroup key={division} label={`${division} Division`}>
                        {teamsByDivision[division].map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </optgroup>
                ))}
            </select>
            
            <div className="flex space-x-2 mb-4">
                <input type="text" name={`${type}Team`} placeholder="Team Name" value={teamNameStr || ''} onChange={handleInputChange} className="flex-[2] p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" />
                
                {/* MODIFIED: Combined Color Picker Swatch + Text Name Input */}
                <div className="flex-1 flex border rounded bg-white overflow-hidden focus-within:border-blue-500">
                    <input 
                        type="color" 
                        name={`${type}Color`} 
                        value={gameData[`${type}Color`] || (isAway ? '#1e40af' : '#991b1b')} 
                        onChange={handleInputChange} 
                        className="w-10 h-full p-0 border-0 cursor-pointer shrink-0" 
                        title="Dashboard UI Color" 
                    />
                    <input 
                        type="text" 
                        name={`${type}ColorName`} 
                        placeholder="Color Name" 
                        value={colorNameStr || ''} 
                        onChange={handleInputChange} 
                        className="w-full p-2 text-sm outline-none min-w-0" 
                        title="PDF Report Color Name" 
                    />
                </div>
            </div>

            <button onClick={() => setActiveRosterModal(type.toUpperCase())} className="w-full mt-auto py-3 text-white font-bold rounded-lg shadow flex justify-between px-4 hover:opacity-90 transition" style={{ backgroundColor: cssColor }}>
                <span>Edit Roster & Bench</span>
                <span>{rosterCount} Plyrs / {benchCount} Staff</span>
            </button>
        </div>
    );
}