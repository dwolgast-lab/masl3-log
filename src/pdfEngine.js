// src/pdfEngine.js
import { PDFDocument, rgb } from 'pdf-lib';
import { getPlayerFouls } from './utils';

export const generatePDF = async (gameData, homeRoster, awayRoster, gameEvents) => {
    try {
        const url = '/worksheet.pdf';
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { height } = firstPage.getSize(); 

        const drawText = (text, x, y, size = 10) => {
            if (!text) return;
            firstPage.drawText(String(text), { x, y: height - y, size, color: rgb(0, 0, 0) });
        };

        drawText(gameData.date, 450, 150);        
        drawText(gameData.venue, 100, 170);       
        drawText(gameData.homeTeam, 150, 200);    
        drawText(gameData.awayTeam, 400, 200);    
        
        const h1Start = gameEvents.find(ev => ev.type === 'Period Marker' && ev.quarter === 'Q1' && ev.action === 'Start')?.realTime || '';
        const h1End = gameEvents.find(ev => ev.type === 'Period Marker' && ev.quarter === 'Q2' && ev.action === 'End')?.realTime || '';
        const h2Start = gameEvents.find(ev => ev.type === 'Period Marker' && ev.quarter === 'Q3' && ev.action === 'Start')?.realTime || '';
        const gameEnd = gameEvents.find(ev => ev.type === 'Period Marker' && (ev.quarter === 'Q4' || ev.quarter === 'OT') && ev.action === 'End')?.realTime || '';

        drawText(`H1 Start: ${h1Start}`, 450, 70, 9);
        drawText(`H1 End: ${h1End}`, 450, 85, 9);
        drawText(`H2 Start: ${h2Start}`, 450, 100, 9);
        drawText(`Game End: ${gameEnd}`, 450, 115, 9);

        let rosterY = 250;
        homeRoster.forEach(player => {
            drawText(player.number, 50, rosterY, 9); 
            drawText(player.name, 80, rosterY, 9);   
            const fouls = getPlayerFouls(player, 'HOME', gameEvents);
            if(fouls.firstHalf > 0) drawText(fouls.firstHalf, 250, rosterY, 9);
            if(fouls.secondHalf > 0) drawText(fouls.secondHalf, 280, rosterY, 9);
            if(fouls.total > 0) drawText(fouls.total, 310, rosterY, 9);
            rosterY += 15; 
        });

        let logY = 550;
        gameEvents.filter(ev => ev.type !== 'Period Marker').forEach(ev => {
            let entityName = typeof ev.entity === 'string' ? ev.entity : `#${ev.entity?.number} ${ev.entity?.name}`;
            if (ev.servingPlayer) entityName += ` (Served by: #${ev.servingPlayer.number})`;
            
            let assistStr = ev.assist ? (typeof ev.assist === 'string' ? ` (${ev.assist})` : ` (Ast: #${ev.assist?.number})`) : '';
            if (ev.goalFlags) {
                const flags = [];
                if(ev.goalFlags.pp) flags.push('PP');
                if(ev.goalFlags.shootout) flags.push('SO');
                if(ev.goalFlags.pk) flags.push('PK');
                if(flags.length > 0) assistStr += ` [${flags.join(',')}]`;
            }

            const penaltyStr = ev.penalty?.code ? ` [${ev.penalty.code}]` : '';
            const warningStr = ev.warningReason ? ` [${ev.warningReason}]` : '';
            const releaseStr = ev.releaseTime ? ` Exp: ${ev.releaseTime.quarter} ${ev.releaseTime.time}` : '';
            const returnStr = ev.eligibleReturnTime ? ` Return: ${ev.eligibleReturnTime.quarter} ${ev.eligibleReturnTime.time}` : '';
            
            const logString = `${ev.team === 'SYSTEM' ? 'SYS' : ev.team === 'AWAY' ? 'A' : 'H'} | ${ev.type}${penaltyStr}${warningStr} | ${entityName}${assistStr} | ${ev.quarter} ${ev.time || ''}${releaseStr}${returnStr}`;
            drawText(logString, 400, logY, 8);
            logY += 12;
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `MASL3_Worksheet_${gameData.date}_${gameData.homeTeam}_vs_${gameData.awayTeam}.pdf`;
        link.click();
    } catch (err) {
        console.error(err);
        alert("Error generating PDF. Please ensure worksheet.pdf is properly placed in the /public folder.");
    }
};