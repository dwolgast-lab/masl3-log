import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LEAGUES } from './config';

const PALE_BLUE = [142, 197, 255];
const PALE_YELLOW = [255, 240, 133];
const PALE_RED = [255, 138, 140];

export const generateAlternatePDF = async (gameData, homeRoster, awayRoster, homeBench, awayBench, gameEvents) => {
    const doc = new jsPDF('p', 'pt', 'letter');
    
    // 1. Data Mapping & Configuration
    const awayScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'AWAY').length;
    const homeScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'HOME').length;
    const awayName = gameData.awayTeam || 'Away Team';
    const homeName = gameData.homeTeam || 'Home Team';

    const getRealTime = (q, action) => gameEvents.find(e => e.type === 'Period Marker' && e.quarter === q && e.action === action)?.realTime || '---';
    const getMedia = (q) => gameEvents.find(e => e.type === 'Media Timeout' && e.quarter === q)?.time || '---';

    const activeLeague = LEAGUES.find(l => l.id === gameData.league);
    const leagueName = activeLeague ? activeLeague.name : (gameData.league || 'MASL');
    const titleText = `${leagueName.toUpperCase()} GAME WORKSHEET`;

    // 2. Pre-Load League Logo
    let loadedLogo = null;
    let logoWidth = 0;
    let logoHeight = 35;
    
    if (activeLeague && activeLeague.logo) {
        try {
            const img = new Image();
            img.src = activeLeague.logo;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            loadedLogo = img;
            logoWidth = logoHeight * (img.width / img.height);
        } catch (e) {
            console.error("Could not load logo for PDF", e);
        }
    }

    let currentY = 70; // Leave room for the global header

    // --- PAGE 1: MATCH INFO & HOME TEAM ---
    doc.autoTable({
        startY: currentY,
        body: [
            ['Date:', gameData.date || '---', 'Sched. KO:', gameData.scheduledKO || '---', 'Game #:', gameData.gameNumber || '---'],
            ['Venue:', gameData.venue || '---', 'City:', gameData.city || '---', '', '']
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [245,245,245] }, 2: { fontStyle: 'bold', fillColor: [245,245,245] }, 4: { fontStyle: 'bold', fillColor: [245,245,245] } }
    });
    currentY = doc.lastAutoTable.finalY + 5;

    doc.autoTable({
        startY: currentY,
        head: [['Half 1 Kickoff', 'Half 1 End', 'Half 2 Kickoff', 'End of Game']],
        body: [[getRealTime('Q1', 'Start'), getRealTime('Q2', 'End'), getRealTime('Q3', 'Start'), gameEvents.slice().reverse().find(e => e.type === 'Period Marker' && e.action === 'End')?.realTime || '---']],
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' },
        bodyStyles: { halign: 'center', fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
    });
    currentY = doc.lastAutoTable.finalY + 5;

    doc.autoTable({
        startY: currentY,
        head: [['Crew Chief', 'Referee', 'Assistant Referee', '4th Official']],
        body: [[gameData.crewChief || '---', gameData.referee || '---', gameData.assistantRef || '---', gameData.fourthOfficial || '---']],
        theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 9, cellPadding: 4 }
    });
    currentY = doc.lastAutoTable.finalY + 5;

    doc.autoTable({
        startY: currentY,
        head: [['Home Team', 'Score', 'Away Team', 'Score']],
        body: [[homeName, homeScore, awayName, awayScore]],
        theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center', fontStyle: 'bold' }, styles: { fontSize: 11, cellPadding: 4 }
    });
    currentY = doc.lastAutoTable.finalY + 5;

    doc.autoTable({
        startY: currentY,
        head: [['Media Q1', 'Media Q2', 'Media Q3', 'Media Q4']],
        body: [[getMedia('Q1'), getMedia('Q2'), getMedia('Q3'), getMedia('Q4')]],
        theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 9, cellPadding: 4 }
    });
    currentY = doc.lastAutoTable.finalY + 20;

    // --- TEAM DATA GENERATOR ---
    const renderTeamData = (teamId, teamName, teamColor, roster, bench) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 20, 20);
        doc.text(`${teamName.toUpperCase()} DATA`, 40, currentY);
        currentY += 10;

        // Goals
        const goals = gameEvents.filter(e => e.team === teamId && e.type === 'Goal / Assist').map(e => [e.quarter, e.time, e.entity?.name || '', e.assist?.name || '']);
        if (goals.length === 0) goals.push(['', '', 'None', '']);
        doc.autoTable({ startY: currentY, head: [['Goals - Quarter', 'Time', 'Goal', 'Assist']], body: goals, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
        currentY = doc.lastAutoTable.finalY + 5;

        // Timeouts & Warnings (Side by Side illusion)
        const timeouts = gameEvents.filter(e => e.team === teamId && e.type === 'Team Timeout').map(e => [e.quarter, e.time]);
        if (timeouts.length === 0) timeouts.push(['---', '---']);
        doc.autoTable({ startY: currentY, head: [['Timeouts (2 Per Game) - Quarter', 'Time']], body: timeouts, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
        currentY = doc.lastAutoTable.finalY + 5;

        const warnings = gameEvents.filter(e => e.team === teamId && e.type === 'Team Warnings').map(e => [e.warningReason, e.quarter, e.time]);
        if (warnings.length === 0) warnings.push(['None', '', '']);
        doc.autoTable({ startY: currentY, head: [['Team Warnings - Reason', 'Quarter', 'Time']], body: warnings, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
        currentY = doc.lastAutoTable.finalY + 5;

        // Penalties (Players)
        const playerPens = gameEvents.filter(e => e.team === teamId && e.type === 'Time Penalty' && roster.some(p => p.id === e.entity?.id) && !e.isJustServing).map(e => {
            let color = null;
            if (e.penalty?.color === 'Blue') color = PALE_BLUE;
            if (e.penalty?.color === 'Yellow') color = PALE_YELLOW;
            if (e.penalty?.color === 'Red') color = PALE_RED;
            return [
                e.entity?.number || '', e.entity?.name || '', 
                color ? { content: e.penalty?.code || '', styles: { fillColor: color } } : (e.penalty?.code || ''),
                e.penalty?.desc || '', e.quarter, e.time, e.releaseTime ? `${e.releaseTime.quarter} ${e.releaseTime.time}` : '---'
            ];
        });
        if (playerPens.length === 0) playerPens.push(['', '', '', 'None', '', '', '']);
        doc.autoTable({ startY: currentY, head: [['Player Penalties - No.', 'Name', 'Code', 'Reason', 'Quarter', 'Time In', 'Time Out']], body: playerPens, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
        currentY = doc.lastAutoTable.finalY + 5;

        // Penalties (Coaches)
        const coachPens = bench.map(c => {
            const count = gameEvents.filter(e => e.team === teamId && e.type === 'Time Penalty' && e.entity?.id === c.id).length;
            return [c.name, c.role, count];
        });
        if (coachPens.length === 0) coachPens.push(['None', '', '']);
        doc.autoTable({ startY: currentY, head: [['Coach Penalties - Name', 'Position', 'Number of Penalties']], body: coachPens, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
        currentY = doc.lastAutoTable.finalY + 5;

        // Fouls
        const foulData = roster.map(p => {
            const f = gameEvents.filter(e => e.type === 'Log Foul' && e.team === teamId && e.entity?.id === p.id);
            const pens = gameEvents.filter(e => e.type === 'Time Penalty' && e.team === teamId && e.entity?.id === p.id && !e.isJustServing).length || '';
            return [p.number, p.name, f.filter(e => e.quarter === 'Q1').length || '', f.filter(e => e.quarter === 'Q2').length || '', f.filter(e => e.quarter === 'Q3').length || '', f.filter(e => e.quarter === 'Q4').length || '', f.filter(e => e.quarter === 'OT').length || '', pens];
        });
        if (foulData.length === 0) foulData.push(['', 'None', '', '', '', '', '', '']);
        doc.autoTable({ startY: currentY, head: [['Fouls - No.', 'Name', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'Penalties']], body: foulData, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3, halign: 'center' }, columnStyles: { 1: { halign: 'left' } } });
        currentY = doc.lastAutoTable.finalY + 5;

        // Injuries
        const injuries = gameEvents.filter(e => e.team === teamId && e.type === 'Injury').map(e => [e.entity?.number || '', e.entity?.name || '', e.quarter, e.time, e.eligibleReturnTime ? `${e.eligibleReturnTime.quarter} ${e.eligibleReturnTime.time}` : '']);
        if (injuries.length === 0) injuries.push(['', 'None', '', '', '']);
        doc.autoTable({ startY: currentY, head: [['Injuries - No.', 'Name', 'Quarter', 'Time Off', 'Time Returned']], body: injuries, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
        currentY = doc.lastAutoTable.finalY + 15;
    };

    // Render Home Team (Page 1)
    renderTeamData('HOME', homeName, gameData.homeColor, homeRoster, homeBench);

    // --- PAGE 2: AWAY TEAM ---
    doc.addPage();
    currentY = 70;
    renderTeamData('AWAY', awayName, gameData.awayColor, awayRoster, awayBench);

    // --- PAGE 3+: GAME LOG (CHRONOLOGICAL) ---
    doc.addPage();
    currentY = 70;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GAME LOG (CHRONOLOGICAL)', 40, currentY);
    currentY += 10;

    // Report-specific sorting: Quarter Ascending, Time Descending
    const quarterOrder = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4, 'OT': 5 };
    const sortedLog = [...gameEvents].sort((a, b) => {
        const qA = quarterOrder[a.quarter] || 99;
        const qB = quarterOrder[b.quarter] || 99;
        if (qA !== qB) return qA - qB;
        
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return timeB.localeCompare(timeA); 
    });

    const logBody = sortedLog.map(ev => {
        let eventName = ev.type;
        let color = null;
        let num = ev.entity?.number || '';
        let name = ev.entity?.name || (typeof ev.entity === 'string' ? ev.entity : '');
        let desc = '';

        if (ev.type === 'Time Penalty' && ev.penalty) {
            eventName = `Penalty (${ev.penalty.code})`;
            if (ev.penalty.color === 'Blue') color = PALE_BLUE;
            if (ev.penalty.color === 'Yellow') color = PALE_YELLOW;
            if (ev.penalty.color === 'Red') color = PALE_RED;
            desc = ev.penalty.desc;
        } else if (ev.type === 'Goal / Assist') {
            desc = ev.assist ? `Assist: ${ev.assist.name}` : 'Unassisted';
        } else if (ev.type === 'Team Warnings') {
            desc = ev.warningReason;
        } else if (ev.type === 'Period Marker') {
            desc = `${ev.action} ${ev.quarter}`;
        } else if (ev.type === 'Log Foul') {
            desc = 'Foul Logged';
        }
        
        return [
            ev.quarter,
            ev.time || '',
            color ? { content: eventName, styles: { fillColor: color } } : eventName,
            ev.team === 'SYSTEM' ? '' : (ev.team === 'AWAY' ? awayName : homeName),
            num,
            name,
            desc
        ];
    });

    doc.autoTable({ 
        startY: currentY, 
        margin: { top: 70 }, // Leave room for header on auto-generated overflow pages
        head: [['Quarter', 'Time', 'Event', 'Team', 'No.', 'Player', 'Description']], 
        body: logBody, 
        theme: 'grid', 
        headStyles: { fillColor: [40, 40, 40] }, 
        styles: { fontSize: 8, cellPadding: 4 } 
    });

    // --- GLOBAL PAGE HEADER INJECTION ---
    // Loops through every page and perfectly stamps the logo, title, and page numbers.
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Draw Header Text
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 20, 20);
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleWidth = doc.getTextWidth(titleText);
        doc.text(titleText, (pageWidth - titleWidth) / 2, 40);

        // Draw Pre-Loaded Logo
        if (loadedLogo) {
            doc.addImage(loadedLogo, 'PNG', 40, 18, logoWidth, logoHeight);
        }
        
        // Page Numbers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 80, doc.internal.pageSize.getHeight() - 20);
    }

    doc.save(`MASL_GameLog_${gameData.gameNumber || 'Report'}.pdf`);
};