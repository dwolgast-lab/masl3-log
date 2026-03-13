import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LEAGUES } from './config';

// Exact MASL Brand Colors for PDF drawing [R, G, B]
const CARD_COLORS = {
    Blue: [0, 150, 255],
    Yellow: [255, 204, 0],
    Red: [220, 38, 38]
};

export const generateAlternatePDF = async (gameData, homeRoster, awayRoster, homeBench, awayBench, gameEvents) => {
    try {
        const doc = new jsPDF('p', 'pt', 'letter');
        const pageHeight = doc.internal.pageSize.getHeight();
        let currentY = 80; // Starting Y coordinate below header

        const checkSpace = (neededSpace) => {
            if (currentY + neededSpace > pageHeight - 50) {
                doc.addPage();
                currentY = 80;
            }
        };
        
        const awayScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'AWAY').length;
        const homeScore = gameEvents.filter(ev => ev.type === 'Goal / Assist' && ev.team === 'HOME').length;
        const awayName = gameData.awayTeam || 'Away Team';
        const homeName = gameData.homeTeam || 'Home Team';

        const getRealTime = (q, action) => gameEvents.find(e => e.type === 'Period Marker' && e.quarter === q && e.action === action)?.realTime || '---';
        const getMedia = (q) => gameEvents.find(e => e.type === 'Media Timeout' && e.quarter === q)?.time || '---';

        const activeLeague = LEAGUES.find(l => l.id === gameData.league);
        const leagueName = activeLeague ? activeLeague.name : (gameData.league || 'MASL');
        const titleText = `${leagueName.toUpperCase()} GAME WORKSHEET`;

        // Pre-Load Images
        const loadImg = async (src) => {
            if (!src) return null;
            try {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = src;
                await new Promise((res, rej) => { img.onload = () => res(img); img.onerror = rej; });
                return img;
            } catch(e) { return null; }
        };

        const leagueLogoImg = await loadImg(activeLeague?.logo);
        const awayLogoImg = await loadImg(gameData.awayLogo);
        const homeLogoImg = await loadImg(gameData.homeLogo);
        
        let leagueLogoWidth = 0;
        let leagueLogoHeight = 20; 
        if (leagueLogoImg) {
            leagueLogoWidth = leagueLogoHeight * (leagueLogoImg.width / leagueLogoImg.height);
        }

        // Global Chronological Sorter
        const quarterOrder = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4, 'OT': 5 };
        const getEventSortTime = (ev) => {
            if (ev.type === 'Period Marker') return ev.action === 'Start' ? '99:99' : '-01:00';
            return ev.time || "00:00";
        };

        const chronoSort = (a, b) => {
            const qA = quarterOrder[a.quarter] || 99;
            const qB = quarterOrder[b.quarter] || 99;
            if (qA !== qB) return qA - qB;
            
            const timeA = getEventSortTime(a);
            const timeB = getEventSortTime(b);
            if (timeA !== timeB) return timeB.localeCompare(timeA); 
            return a.id - b.id; 
        };

        // --- CUSTOM DRAWING HOOK ---
        const cellDrawHook = (data) => {
            if (data.section === 'body' && data.cell.raw) {
                if (data.cell.raw.cards && data.cell.raw.cards.length > 0) {
                    let startX = data.cell.x + 6;
                    let startY = data.cell.y + (data.cell.height - 10) / 2;
                    data.cell.raw.cards.forEach((c) => {
                        if (CARD_COLORS[c]) {
                            doc.setFillColor(...CARD_COLORS[c]);
                            doc.roundedRect(startX, startY, 7, 10, 1, 1, 'F');
                            doc.setDrawColor(150, 150, 150);
                            doc.setLineWidth(0.5);
                            doc.roundedRect(startX, startY, 7, 10, 1, 1, 'S');
                            startX += 11;
                        }
                    });
                }
                if (data.cell.raw.inlineCard) {
                    const textWidth = doc.getTextWidth(data.cell.text[0]) || 0;
                    let startX = data.cell.x + data.cell.padding('left') + textWidth + 6;
                    let startY = data.cell.y + (data.cell.height - 10) / 2;
                    doc.setFillColor(...CARD_COLORS[data.cell.raw.inlineCard]);
                    doc.roundedRect(startX, startY, 7, 10, 1, 1, 'F');
                    doc.setDrawColor(150, 150, 150);
                    doc.setLineWidth(0.5);
                    doc.roundedRect(startX, startY, 7, 10, 1, 1, 'S');
                }
                if (data.cell.raw.teamLogoId) {
                    const imgToDraw = data.cell.raw.teamLogoId === 'AWAY' ? awayLogoImg : homeLogoImg;
                    if (imgToDraw) {
                        const size = data.cell.height - 6;
                        doc.addImage(imgToDraw, 'PNG', data.cell.x + 4, data.cell.y + 3, size, size);
                    }
                }
            }
        };

        // --- PAGE 1: MATCH INFO & HOME TEAM ---
        autoTable(doc, {
            startY: currentY, margin: { top: 80, bottom: 50 },
            body: [
                ['Date:', gameData.date || '---', 'Sched. KO:', gameData.scheduledKO || '---', 'Game #:', gameData.gameNumber || '---'],
                ['Venue:', gameData.venue || '---', 'City:', gameData.city || '---', '', '']
            ],
            theme: 'grid', styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: { 0: { fontStyle: 'bold', fillColor: [245,245,245] }, 2: { fontStyle: 'bold', fillColor: [245,245,245] }, 4: { fontStyle: 'bold', fillColor: [245,245,245] } }
        });
        currentY = doc.lastAutoTable.finalY + 5;

        autoTable(doc, {
            startY: currentY, margin: { top: 80, bottom: 50 },
            head: [['Half 1 Kickoff', 'Half 1 End', 'Half 2 Kickoff', 'End of Game']],
            body: [[getRealTime('Q1', 'Start'), getRealTime('Q2', 'End'), getRealTime('Q3', 'Start'), gameEvents.slice().reverse().find(e => e.type === 'Period Marker' && e.action === 'End')?.realTime || '---']],
            theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center', fontStyle: 'bold' }, styles: { fontSize: 9, cellPadding: 4 }
        });
        currentY = doc.lastAutoTable.finalY + 5;

        autoTable(doc, {
            startY: currentY, margin: { top: 80, bottom: 50 },
            head: [['Crew Chief', 'Referee', 'Assistant Referee', '4th Official']],
            body: [[gameData.crewChief || '---', gameData.referee || '---', gameData.assistantRef || '---', gameData.fourthOfficial || '---']],
            theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 9, cellPadding: 4 }
        });
        currentY = doc.lastAutoTable.finalY + 5;

        autoTable(doc, {
            startY: currentY, margin: { top: 80, bottom: 50 },
            head: [['Home Team', 'Score', 'Away Team', 'Score']],
            body: [[homeName, homeScore, awayName, awayScore]],
            theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center', fontStyle: 'bold' }, styles: { fontSize: 11, cellPadding: 4 }
        });
        currentY = doc.lastAutoTable.finalY + 5;

        autoTable(doc, {
            startY: currentY, margin: { top: 80, bottom: 50 },
            head: [['Media Q1', 'Media Q2', 'Media Q3', 'Media Q4']],
            body: [[getMedia('Q1'), getMedia('Q2'), getMedia('Q3'), getMedia('Q4')]],
            theme: 'grid', headStyles: { fillColor: [220, 220, 220], textColor: 20, halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { fontSize: 9, cellPadding: 4 }
        });
        currentY = doc.lastAutoTable.finalY + 20;

        // --- TEAM DATA GENERATOR ---
        const renderTeamData = (teamId, teamName, teamColor, roster, bench) => {
            checkSpace(60);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(20, 20, 20);
            doc.text(`${teamName.toUpperCase()} DATA`, 40, currentY);
            currentY += 10;

            checkSpace(60);
            const timeouts = gameEvents.filter(e => e.team === teamId && e.type === 'Team Timeout').sort(chronoSort).map(e => [e.quarter, e.time]);
            if (timeouts.length === 0) timeouts.push(['---', '---']);
            autoTable(doc, { 
                startY: currentY, tableWidth: 250, margin: { top: 80, bottom: 50 },
                head: [['Timeouts (2 Per Game) - Quarter', 'Time']], body: timeouts, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } 
            });
            currentY = doc.lastAutoTable.finalY + 5;

            checkSpace(60);
            const warnings = gameEvents.filter(e => e.team === teamId && e.type === 'Team Warnings').sort(chronoSort).map(e => [e.warningReason, e.quarter, e.time]);
            if (warnings.length === 0) warnings.push(['None', '', '']);
            autoTable(doc, { 
                startY: currentY, tableWidth: 350, margin: { top: 80, bottom: 50 },
                head: [['Team Warnings - Reason', 'Quarter', 'Time']], body: warnings, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } 
            });
            currentY = doc.lastAutoTable.finalY + 10;

            // Goals (Assist filtering)
            checkSpace(50);
            const goals = gameEvents.filter(e => e.team === teamId && e.type === 'Goal / Assist').sort(chronoSort).map(e => {
                let typeStr = '';
                if (e.goalFlags?.pp) typeStr = 'PP';
                else if (e.goalFlags?.pk) typeStr = 'PK';
                else if (e.goalFlags?.shootout) typeStr = 'SO';

                let assistStr = '';
                if (e.goalFlags?.pk || e.goalFlags?.shootout) assistStr = '';
                else if (e.assist) assistStr = e.assist.name;
                else assistStr = '--unassisted--';

                return [e.quarter, e.time, e.entity?.name || '', assistStr, typeStr];
            });
            if (goals.length === 0) goals.push(['', '', 'None', '', '']);
            autoTable(doc, { 
                startY: currentY, 
                margin: { top: 80, bottom: 50 }, 
                head: [['Goals - Quarter', 'Time', 'Goal', 'Assist', 'Type']], 
                body: goals, 
                theme: 'grid', 
                headStyles: { fillColor: [60, 60, 60] }, 
                styles: { fontSize: 8, cellPadding: 3 },
                columnStyles: { 4: { halign: 'center', fontStyle: 'bold' } } 
            });
            currentY = doc.lastAutoTable.finalY + 5;

            // Penalties (Players)
            checkSpace(60);
            const teamPenalties = gameEvents.filter(e => e.team === teamId && e.type === 'Time Penalty' && roster.some(p => p.id === e.entity?.id) && !e.isJustServing).sort(chronoSort);
            const playerPens = teamPenalties.map(e => {
                const outTimeObj = e.actualReleaseTime || e.releaseTime;
                const outTimeStr = outTimeObj ? `${outTimeObj.quarter} ${outTimeObj.time}` : '---';

                return [
                    e.entity?.number || '', e.entity?.name || '', 
                    e.penalty?.color ? { content: e.penalty?.code || '', inlineCard: e.penalty.color } : (e.penalty?.code || ''),
                    e.penalty?.desc || '', e.quarter, e.time, outTimeStr
                ];
            });
            if (playerPens.length === 0) playerPens.push(['', '', '', 'None', '', '', '']);
            autoTable(doc, { startY: currentY, margin: { top: 80, bottom: 50 }, didDrawCell: cellDrawHook, head: [['Player Penalties - No.', 'Name', 'Code', 'Reason', 'Quarter', 'Time In', 'Time Out']], body: playerPens, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
            currentY = doc.lastAutoTable.finalY + 5;

            // Penalties (Coaches)
            checkSpace(50);
            const coachPens = bench.map(c => {
                const cPens = gameEvents.filter(e => e.team === teamId && e.type === 'Time Penalty' && e.entity?.id === c.id).sort(chronoSort);
                if (cPens.length === 0) return null;
                
                let colorsArray = [];
                cPens.forEach(p => {
                    if (p.penalty?.code === 'Y6') colorsArray.push('Blue', 'Yellow');
                    else colorsArray.push(p.penalty.color);
                });
                return [c.name, c.role, { content: '', cards: colorsArray }];
            }).filter(Boolean);
            
            if (coachPens.length === 0) coachPens.push(['None', '', '']);
            autoTable(doc, { 
                startY: currentY, margin: { top: 80, bottom: 50 }, didDrawCell: cellDrawHook,
                head: [['Coach Penalties - Name', 'Position', 'Cards Received']], body: coachPens, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } 
            });
            currentY = doc.lastAutoTable.finalY + 5;

            // Fouls 
            checkSpace(60);
            const foulData = roster.map(p => {
                const f = gameEvents.filter(e => e.type === 'Log Foul' && e.team === teamId && e.entity?.id === p.id);
                const pPens = gameEvents.filter(e => e.type === 'Time Penalty' && e.team === teamId && e.entity?.id === p.id && !e.isJustServing).sort(chronoSort);
                
                let colorsArray = [];
                pPens.forEach(pen => {
                    if (pen.penalty?.code === 'Y6') colorsArray.push('Blue', 'Yellow');
                    else colorsArray.push(pen.penalty.color);
                });

                return [p.number, p.name, f.filter(e => e.quarter === 'Q1').length || '', f.filter(e => e.quarter === 'Q2').length || '', f.filter(e => e.quarter === 'Q3').length || '', f.filter(e => e.quarter === 'Q4').length || '', f.filter(e => e.quarter === 'OT').length || '', { content: '', cards: colorsArray }];
            });
            
            if (foulData.length === 0) foulData.push(['', 'None', '', '', '', '', '', '']);
            autoTable(doc, { 
                startY: currentY, margin: { top: 80, bottom: 50 }, didDrawCell: cellDrawHook,
                head: [['Fouls - No.', 'Name', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'Cards Received']], body: foulData, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3, halign: 'center' }, columnStyles: { 1: { halign: 'left' } } 
            });
            currentY = doc.lastAutoTable.finalY + 5;

            // Injuries
            checkSpace(50);
            const injuries = gameEvents.filter(e => e.team === teamId && e.type === 'Injury').sort(chronoSort).map(e => [e.entity?.number || '', e.entity?.name || '', e.quarter, e.time, e.eligibleReturnTime ? `${e.eligibleReturnTime.quarter} ${e.eligibleReturnTime.time}` : '']);
            if (injuries.length === 0) injuries.push(['', 'None', '', '', '']);
            autoTable(doc, { startY: currentY, margin: { top: 80, bottom: 50 }, tableWidth: 350, head: [['Injuries - No.', 'Name', 'Quarter', 'Time Off', 'Time Returned']], body: injuries, theme: 'grid', headStyles: { fillColor: [60, 60, 60] }, styles: { fontSize: 8, cellPadding: 3 } });
            currentY = doc.lastAutoTable.finalY + 15;
        };

        renderTeamData('HOME', homeName, gameData.homeColor, homeRoster, homeBench);

        // --- PAGE 2: AWAY TEAM ---
        doc.addPage();
        currentY = 80;
        renderTeamData('AWAY', awayName, gameData.awayColor, awayRoster, awayBench);

        // --- PAGE 3+: GAME LOG (CHRONOLOGICAL) ---
        doc.addPage();
        currentY = 80;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('GAME LOG (CHRONOLOGICAL)', 40, currentY);
        currentY += 10;

        const sortedLog = [...gameEvents].sort(chronoSort);

        const logBody = sortedLog.map(ev => {
            let eventName = ev.type;
            let num = ev.entity?.number || '';
            let name = ev.entity?.name || (typeof ev.entity === 'string' ? ev.entity : '');
            let desc = '';
            let teamObj = '';

            if (ev.team === 'SYSTEM') teamObj = '';
            else if (ev.team === 'AWAY') teamObj = { content: (awayLogoImg ? '' : awayName), teamLogoId: 'AWAY' };
            else teamObj = { content: (homeLogoImg ? '' : homeName), teamLogoId: 'HOME' };

            if (ev.type === 'Time Penalty' && ev.penalty) {
                eventName = { content: `Penalty (${ev.penalty.code})`, inlineCard: ev.penalty.color };
                desc = ev.penalty.desc;
            } else if (ev.type === 'Goal / Assist') {
                const flags = [];
                if (ev.goalFlags?.pp) flags.push('PP');
                if (ev.goalFlags?.pk) flags.push('PK');
                if (ev.goalFlags?.shootout) flags.push('SO');
                const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
                
                // Assist text filtering
                let assistStr = '';
                if (ev.goalFlags?.pk || ev.goalFlags?.shootout) {
                    assistStr = ''; 
                } else if (ev.assist) {
                    assistStr = `Assist: ${ev.assist.name}`;
                } else {
                    assistStr = '--unassisted--';
                }
                
                desc = assistStr ? `${assistStr}${flagStr}` : `Goal${flagStr}`;
            } else if (ev.type === 'Team Warnings') {
                desc = ev.warningReason;
            } else if (ev.type === 'Period Marker') {
                desc = { content: `${ev.action} ${ev.quarter} @ ${ev.realTime || ''}`, styles: { fontStyle: 'bold' } };
            } else if (ev.type === 'Log Foul') {
                desc = 'Foul Logged';
            }
            
            return [
                ev.quarter,
                ev.time || '',
                eventName,
                teamObj,
                num,
                name,
                desc
            ];
        });

        autoTable(doc, { 
            startY: currentY, 
            margin: { top: 80, bottom: 50 }, 
            didDrawCell: cellDrawHook, 
            head: [['Quarter', 'Time', 'Event', 'Team', 'No.', 'Player', 'Description']], 
            body: logBody, 
            theme: 'grid', 
            headStyles: { fillColor: [40, 40, 40] }, 
            styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
            columnStyles: { 3: { cellWidth: 40, halign: 'center' } } 
        });

        // --- GLOBAL PAGE HEADER INJECTION ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(20, 20, 20);
            const pageWidth = doc.internal.pageSize.getWidth();
            const titleWidth = doc.getTextWidth(titleText);
            doc.text(titleText, (pageWidth - titleWidth) / 2, 40);

            if (leagueLogoImg) {
                doc.addImage(leagueLogoImg, 'PNG', 40, 22, leagueLogoWidth, leagueLogoHeight);
            }
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 80, pageHeight - 20);
        }

        doc.save(`MASL_GameLog_${gameData.gameNumber || 'Report'}.pdf`);

    } catch (error) {
        console.error("PDF Generation Crash:", error);
        alert(`PDF Generation Failed!\n\nError: ${error.message}\n\nPlease check the browser console for more details.`);
    }
};