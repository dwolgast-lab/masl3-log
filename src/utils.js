import { useState, useEffect } from 'react';

export function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch { return defaultValue; }
    });
    useEffect(() => {
        try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/blocked */ }
    }, [key, value]);
    return [value, setValue];
}

// Length of a period in minutes: quarters are 15:00, OT is 10:00.
export const quarterMinutes = (q) => (q === 'OT' ? 10 : 15);

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
    const playerEvents = gameEvents.filter(ev => ev.team === teamIdentifier && ev.entity?.id === player.id);
    const playerFouls = playerEvents.filter(ev => ev.type === 'Log Foul');
    
    const q1 = playerFouls.filter(ev => ev.quarter === 'Q1').length;
    const q2 = playerFouls.filter(ev => ev.quarter === 'Q2').length;
    const q3 = playerFouls.filter(ev => ev.quarter === 'Q3').length;
    const q4 = playerFouls.filter(ev => ev.quarter === 'Q4').length;
    const ot = playerFouls.filter(ev => ev.quarter === 'OT').length;
    const firstHalf = q1 + q2;
    const secondHalf = q3 + q4 + ot;

    // Track Cards (Ignore 'isJustServing' sub events so they don't get penalized)
    const penaltyEvents = playerEvents.filter(ev => ev.type === 'Time Penalty' && !ev.isJustServing);
    const blueCards = penaltyEvents.filter(ev => ev.penalty?.color === 'Blue' || ev.penalty?.code === 'Y6').length;
    const yellowCards = penaltyEvents.filter(ev => ev.penalty?.color === 'Yellow').length;
    const redCards = penaltyEvents.filter(ev => ev.penalty?.color === 'Red').length;

    return { q1, q2, q3, q4, ot, firstHalf, secondHalf, total: firstHalf + secondHalf, blueCards, yellowCards, redCards };
};
export const ensureVisibleInDark = (hex, isDark) => {
    if (!hex || !isDark) return hex || '#cccccc';
    let r = parseInt(hex.substring(1,3), 16);
    let g = parseInt(hex.substring(3,5), 16);
    let b = parseInt(hex.substring(5,7), 16);

    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luma < 90) {
        const blend = 0.6;
        r = Math.round(r + (255 - r) * blend);
        g = Math.round(g + (255 - g) * blend);
        b = Math.round(b + (255 - b) * blend);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }
    return hex;
};

const parseHex = (hex) => {
    if (typeof hex !== 'string') return null;
    const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(h.substring(i, i + 2), 16));
};
const toHex = (rgb) => `#${rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const relLuminance = ([r, g, b]) => {
    const [R, G, B] = [r, g, b].map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};
const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

// '#000000' or '#ffffff', whichever has higher WCAG contrast against hex
export const readableTextOn = (hex) => {
    const rgb = parseHex(hex);
    if (!rgb) return '#000000';
    const l = relLuminance(rgb);
    return contrast(l, 0) >= contrast(l, 1) ? '#000000' : '#ffffff';
};

// Version of hex usable as TEXT: darkened on light backgrounds until >= 3:1 vs white, lightened (existing behavior) in dark mode
export const textSafeColor = (hex, isDark) => {
    const rgb = parseHex(hex);
    if (!rgb) return hex;
    if (isDark) return ensureVisibleInDark(toHex(rgb), true);
    let cur = rgb;
    for (let i = 0; i < 20 && contrast(1, relLuminance(cur)) < 3; i++) cur = cur.map(v => v * 0.9);
    return toHex(cur);
};
