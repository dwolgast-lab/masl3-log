import React, { useState, useRef, useEffect } from 'react';

// The displayHex allows us to show a pure white bubble in the picker, 
// while sending a darker silver (#9CA3AF) to the UI engine so button text doesn't vanish.
const STANDARD_COLORS = [
    { name: 'White', hex: '#9CA3AF', displayHex: '#FFFFFF' }, 
    { name: 'Black', hex: '#111827' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Sky Blue', hex: '#38BDF8' },
    { name: 'Teal', hex: '#0D9488' },
    { name: 'Green', hex: '#16A34A' },
    { name: 'Yellow', hex: '#EAB308' },
    { name: 'Orange', hex: '#EA580C' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Purple', hex: '#9333EA' },
    { name: 'Brown', hex: '#92400E' }
];

export default function TeamConfigCard({ 
    type, gameData, handleInputChange, handleTeamSelect, 
    teamsByDivision, cssColor, rosterCount, benchCount, setActiveRosterModal 
}) {
    const isAway = type === 'away';
    const teamNameStr = gameData[`${type}Team`];
    const logoStr = gameData[`${type}Logo`];
    const colorNameStr = gameData[`${type}ColorName`] || '';
    
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);
    const [updateQueue, setUpdateQueue] = useState(null);

    // Sequential State Queue: Prevents React from clobbering the Hex code when updating the Name string
    useEffect(() => {
        if (!updateQueue) return;

        if (updateQueue.phase === 'HEX') {
            handleInputChange({ target: { name: `${type}Color`, value: updateQueue.hex } });
            setUpdateQueue({ ...updateQueue, phase: 'NAME' });
        } else if (updateQueue.phase === 'NAME') {
            handleInputChange({ target: { name: `${type}ColorName`, value: updateQueue.name } });
            setUpdateQueue(null);
        }
    }, [updateQueue]); 

    // Close the custom popover if the user clicks anywhere else on the screen
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };
        if (showPicker) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

    const getTeamSelectValue = () => {
        for (const division in teamsByDivision) {
            const found = teamsByDivision[division].find(t => t.name === teamNameStr);
            if (found) return found.id;
        }
        return 'custom';
    };

    const handleColorSelect = (isPrimary, colorObj) => {
        let newHex = gameData[`${type}Color`];
        let parts = colorNameStr.split('/');
        let primName = parts[0] ? parts[0].trim() : (isAway ? 'Away' : 'Home');
        let secName = parts[1] ? parts[1].trim() : '';

        if (isPrimary) {
            newHex = colorObj.hex;
            primName = colorObj.name;
        } else {
            secName = colorObj.name;
        }

        let finalName = primName;
        if (secName && secName !== 'None') {
            finalName = `${primName} / ${secName}`;
        }

        // Drop the update into the sequential queue instead of firing simultaneously
        setUpdateQueue({ hex: newHex, name: finalName, phase: 'HEX' });
    };

    // Derived properties to render the visual swatch inside the button safely
    const parts = colorNameStr.split('/');
    const primName = parts[0] ? parts[0].trim() : '';
    const secName = parts[1] ? parts[1].trim() : '';
    
    const primObj = STANDARD_COLORS.find(c => c.name.toLowerCase() === primName.toLowerCase());
    const secObj = STANDARD_COLORS.find(c => c.name.toLowerCase() === secName.toLowerCase());
    
    const displayPrimaryHex = primObj ? (primObj.displayHex || primObj.hex) : (gameData[`${type}Color`] || (isAway ? '#1e40af' : '#991b1b'));
    const displaySecondaryHex = secObj ? (secObj.displayHex || secObj.hex) : null;
    const currentPrimaryEngineHex = gameData[`${type}Color`] || (isAway ? '#1e40af' : '#991b1b');

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
                <input type="text" name={`${type}Team`} placeholder="Team Name" value={teamNameStr || ''} onChange={handleInputChange} className="flex-[1.2] p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" />
                
                {/* CUSTOM VISUAL COLOR PICKER */}
                <div className="flex-1 relative" ref={pickerRef}>
                    <button 
                        type="button"
                        onClick={() => setShowPicker(!showPicker)}
                        className="w-full h-full flex items-center p-2 border rounded bg-white text-sm outline-none focus:border-blue-500 hover:bg-gray-50 transition shadow-sm"
                        title="Select Jersey Colors"
                    >
                        <div className="w-8 h-5 rounded border shadow-sm shrink-0 mr-2 flex overflow-hidden">
                            <div className="flex-1" style={{ backgroundColor: displayPrimaryHex }}></div>
                            {secName && secName !== 'None' && (
                                <div className="flex-1 border-l border-gray-200/50" style={{ backgroundColor: displaySecondaryHex || displayPrimaryHex }}></div>
                            )}
                        </div>
                        <span className="truncate font-bold text-gray-700 text-xs">{colorNameStr || 'Color...'}</span>
                    </button>

                    {showPicker && (
                        <div className="absolute z-[500] top-full mt-2 right-0 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
                            
                            <h4 className="text-xs font-black text-slate-500 uppercase mb-2">Primary Color</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {STANDARD_COLORS.map(c => (
                                    <button 
                                        key={c.name}
                                        type="button"
                                        onClick={() => handleColorSelect(true, c)}
                                        title={c.name}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${currentPrimaryEngineHex.toUpperCase() === c.hex.toUpperCase() ? 'ring-2 ring-blue-500 border-white' : 'border-gray-200'}`}
                                        style={{ backgroundColor: c.displayHex || c.hex }}
                                    />
                                ))}
                            </div>

                            <h4 className="text-xs font-black text-slate-500 uppercase mb-2">Secondary Trim</h4>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    type="button"
                                    onClick={() => handleColorSelect(false, { name: 'None' })}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-dashed flex items-center justify-center text-[8px] sm:text-[9px] font-black hover:scale-110 transition-transform ${(!secName || secName === 'None') ? 'ring-2 ring-blue-500 border-white text-blue-600' : 'border-slate-300 text-slate-400'}`}
                                >
                                    N/A
                                </button>
                                {STANDARD_COLORS.map(c => (
                                    <button 
                                        key={c.name}
                                        type="button"
                                        onClick={() => handleColorSelect(false, c)}
                                        title={c.name}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${secName === c.name ? 'ring-2 ring-blue-500 border-white' : 'border-gray-200'}`}
                                        style={{ backgroundColor: c.displayHex || c.hex }}
                                    />
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t text-right">
                                <button type="button" onClick={() => setShowPicker(false)} className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow hover:bg-slate-700 transition">Done</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button onClick={() => setActiveRosterModal(type.toUpperCase())} className="w-full mt-auto py-3 text-white font-bold rounded-lg shadow flex justify-between px-4 hover:opacity-90 transition" style={{ backgroundColor: cssColor }}>
                <span>Edit Roster & Bench</span>
                <span>{rosterCount} Plyrs / {benchCount} Staff</span>
            </button>
        </div>
    );
}