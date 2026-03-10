// /src/ocrEngine.js

// -----------------------------------------------------------------------------
// SORTING UTILITIES
// -----------------------------------------------------------------------------
export const robustNumericalSort = (a, b) => {
    const jerseyA = a.number;
    const jerseyB = b.number;

    if (jerseyA === '00') return -1; 
    if (jerseyB === '00') return 1;

    const numA = parseInt(jerseyA, 10);
    const numB = parseInt(jerseyB, 10);

    if (numA !== numB) {
        return numA - numB;
    }
    return jerseyA.localeCompare(jerseyB);
};

export const sortBench = (bench) => [...bench].sort((a, b) => {
    if (a.role === 'Head Coach' && b.role !== 'Head Coach') return -1;
    if (a.role !== 'Head Coach' && b.role === 'Head Coach') return 1;
    return 0;
});


// -----------------------------------------------------------------------------
// IMAGE COMPRESSION & API UPLOAD
// -----------------------------------------------------------------------------
export const processRosterImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_WIDTH) { width *= MAX_WIDTH / height; height = MAX_WIDTH; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

                try {
                    const response = await fetch('/api/scanRoster', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64: compressedBase64 })
                    });

                    const data = await response.json();
                    if (data.error) throw new Error(data.error);

                    resolve(data.text);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error("Failed to read image data"));
        };
        reader.onerror = () => reject(new Error("Failed to open file"));
    });
};


// -----------------------------------------------------------------------------
// BULLETPROOF OCR TEXT PARSER
// -----------------------------------------------------------------------------
export const parseRosterText = (scanResult, currentRoster, currentBench) => {
    let newPlayers = [];
    let newStaff = [];
    const benchKeywords = ['COACH', 'TRAINER', 'MANAGER', 'ASSISTANT', 'DOCTOR', 'PHYSIO'];
    let importedPlayerCount = 0;

    const lines = scanResult.split('\n');
    
    lines.forEach(line => {
        if (!line.trim()) return;
        if (line.match(/LAST NAME|JERSEY NO|POS\.|OFFICIAL LINEUP|DATE|JOB|SUBSTITUTES|STARTERS|MASL\s*\d/i)) return;
        if (line.match(/BENCH\s*STAFF/i)) return; 
        if (line.match(/Referee/i)) return; 
        if (line.match(/maximum|essential|credential|attire|uniform|shorts|discipline|manager team/i)) return; 

        const cells = line.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
        
        let candidates = [];
        let nameParts = [];
        let isGK = false;
        let hitText = false;
        let foundBenchRole = false;

        let upperLine = line.toUpperCase();
        let benchRoleMatch = benchKeywords.find(role => upperLine.includes(role));

        if (benchRoleMatch) {
            foundBenchRole = true;
            let staffName = upperLine.replace(benchRoleMatch, '').replace(/^\s*\d+[\.\)]\s*/, '').replace(/[^A-Z\s,-]/g, '').trim();
            const wordCount = staffName.split(/\s+/).length;

            if (staffName.length > 2 && wordCount <= 4 && !currentBench.some(b => b.name.toUpperCase() === staffName) && !newStaff.some(b => b.name.toUpperCase() === staffName)) {
                newStaff.push({
                    id: Date.now() + Math.random(),
                    name: staffName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '), 
                    role: (currentBench.length === 0 && newStaff.length === 0) ? 'Head Coach' : 'Assistant Coach'
                });
            }
        } 
        else {
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                let upperCell = cell.toUpperCase();

                const listMatch = cell.match(/^(\d+)[\.\)]$/);
                if (listMatch && !candidates.length) {
                    candidates.push(listMatch[1]);
                    continue;
                }

                if (!hitText) {
                    let cleanCell = cell.replace(/\s+[\.\)]$/, '.');
                    let numMatch = cleanCell.match(/^(\d{1,2})[\.\)]?$/);
                    
                    if (numMatch) {
                        candidates.push(numMatch[1]);
                        continue;
                    }
                    
                    if (upperCell === 'GK' || upperCell === 'G' || /^[DMFET]$/.test(upperCell)) {
                        hitText = true;
                        if (upperCell.includes('G')) isGK = true;
                        continue;
                    }
                    
                    if (/[A-Za-z]/.test(cell)) {
                        hitText = true;
                        if (upperCell.includes('GK')) {
                            isGK = true;
                            cell = cell.replace(/GK/ig, '').trim();
                        }
                        if (cell.replace(/[^a-zA-Z]/g, '').length > 0) nameParts.push(cell);
                    }
                } else {
                    if (upperCell === 'GK' || upperCell === 'G') {
                        isGK = true;
                    } else if (/^[DMFET]$/.test(upperCell)) {
                        continue; 
                    } else {
                        if (upperCell.includes('GK')) {
                            isGK = true;
                            cell = cell.replace(/GK/ig, '').trim();
                        }
                        if (cell.replace(/[^a-zA-Z]/g, '').length > 0) nameParts.push(cell);
                    }
                }
            }

            let jerseyNum = candidates.length > 0 ? candidates[candidates.length - 1] : null;

            if (jerseyNum && nameParts.length > 0) {
                const finalName = nameParts.join(' ').replace(/[^a-zA-Z\s,-]/g, '').trim();
                
                if (finalName.length > 1 && finalName.toUpperCase() !== 'BENCH STAFF' && !currentRoster.some(p => p.number === jerseyNum) && !newPlayers.some(p => p.number === jerseyNum)) {
                    importedPlayerCount++;
                    const isAutoStarter = importedPlayerCount <= 6;
                    const isAutoGK = isGK || importedPlayerCount === 1;

                    newPlayers.push({
                        id: Date.now() + Math.random(),
                        number: jerseyNum,
                        name: finalName,
                        isGK: isAutoGK,
                        isStarter: isAutoStarter,
                        isCaptain: false
                    });
                }
            }
        }
    });

    let updatedRoster = [...currentRoster];
    let updatedBench = [...currentBench];

    if (newPlayers.length > 0) updatedRoster = [...currentRoster, ...newPlayers].sort(robustNumericalSort);
    if (newStaff.length > 0) updatedBench = [...currentBench, ...newStaff];

    return { updatedRoster, updatedBench, newPlayersCount: newPlayers.length, newStaffCount: newStaff.length };
};