// src/utils.js
import { useState, useEffect } from 'react';

export function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}

export const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatTime = (input) => {
    const padded = input.padEnd(4, '0');
    return `${padded.substring(0, 2)}:${padded.substring(2, 4)}`;
};

export const toElapsedSeconds = (q, timeStr) => {
    if (!timeStr) return 0;
    const [m, s] = timeStr.split(':').map(Number);
    const quarterSecs = m * 60 + s; 
    
    let base = 0;
    if (q === 'Q1') base = 0;
    else if (q === 'Q2') base = 15 * 60;
    else if (q === 'Q3') base = 30 * 60;
    else if (q === 'Q4') base = 45 * 60;
    else if (q === 'OT') base = 60 * 60;
    
    const quarterDuration = (q === 'OT') ? 10 * 60 : 15 * 60;
    return base + (quarterDuration - quarterSecs);
};

export const calcReleaseTime = (startQuarter, startTime, durationMins) => {
    if (!startTime || !durationMins) return null;
    const [min, sec] = startTime.split(':').map(Number);
    let remSecs = (min * 60 + sec) - (durationMins * 60);
    let q = startQuarter;

    while (remSecs < 0) {
        if (q === 'Q1') { q = 'Q2'; remSecs += 15 * 60; }
        else if (q === 'Q2') { q = 'Q3'; remSecs += 15 * 60; }
        else if (q === 'Q3') { q = 'Q4'; remSecs += 15 * 60; }
        else if (q === 'Q4') { q = 'OT'; remSecs += 10 * 60; } 
        else { q = 'END'; remSecs = 0; break; } 
    }

    const eMin = Math.floor(remSecs / 60);
    const eSec = remSecs % 60;
    return { quarter: q, time: `${String(eMin).padStart(2,'0')}:${String(eSec).padStart(2,'0')}` };
};

export const calcInjuryReturn = (q, t) => {
    if (!t) return null;
    const [m, s] = t.split(':').map(Number);
    const totalSecs = m * 60 + s;
    if (totalSecs <= 120) {
        const nextQ = q === 'Q1' ? 'Q2' : q === 'Q2' ? 'Q3' : q === 'Q3' ? 'Q4' : 'OT';
        if (nextQ === 'OT') return { quarter: 'OT', time: '10:00' };
        return { quarter: nextQ, time: '15:00' };
    } else {
        const rem = totalSecs - 120;
        return { quarter: q, time: `${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}` };
    }
};

export const getTeamColor = (colorString, defaultColor) => {
    if (!colorString) return defaultColor;
    if (colorString.trim().toLowerCase() === 'white' || colorString.trim() === '#ffffff') return '#000000'; 
    const parts = colorString.split(/[/,]/).map(c => c.trim().replace(/\s+/g, '').toLowerCase());
    const primary = parts[0];
    if (primary === 'white' || primary === '#ffffff') return (parts.length > 1 && parts[1]) ? parts[1] : '#000000';
    return primary || defaultColor;
};

export const getPlayerFouls = (player, teamIdentifier, gameEvents) => {
    const playerFouls = gameEvents.filter(ev => ev.type === 'Log Foul' && ev.team === teamIdentifier && ev.entity?.id === player.id);
    const q1 = playerFouls.filter(ev => ev.quarter === 'Q1').length;
    const q2 = playerFouls.filter(ev => ev.quarter === 'Q2').length;
    const q3 = playerFouls.filter(ev => ev.quarter === 'Q3').length;
    const q4 = playerFouls.filter(ev => ev.quarter === 'Q4').length;
    const ot = playerFouls.filter(ev => ev.quarter === 'OT').length;
    const firstHalf = q1 + q2;
    const secondHalf = q3 + q4 + ot;
    return { q1, q2, q3, q4, ot, firstHalf, secondHalf, total: firstHalf + secondHalf };
};