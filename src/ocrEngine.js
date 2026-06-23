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

                    // Structured roster: { players: [...], staff: [...] }
                    resolve(data);
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
// STRUCTURED ROSTER MERGE
// Consumes the field-mapped roster returned by /api/scanRoster
// ({ players, staff }) and merges new rows into the current roster/bench.
// -----------------------------------------------------------------------------
const normalizeRole = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('head')) return 'Head Coach';
    if (r.includes('assistant')) return 'Assistant Coach';
    if (r.includes('train')) return 'Trainer';
    if (r.includes('manager')) return 'Manager';
    return 'Other';
};

export const mergeScannedRoster = (scanData, currentRoster, currentBench) => {
    const scannedPlayers = Array.isArray(scanData?.players) ? scanData.players : [];
    const scannedStaff = Array.isArray(scanData?.staff) ? scanData.staff : [];

    let newPlayers = [];
    let newStaff = [];

    scannedPlayers.forEach(p => {
        const number = (p.number || '').trim();
        const name = (p.name || '').trim();
        if (!number || name.length < 2) return;
        if (currentRoster.some(x => x.number === number) || newPlayers.some(x => x.number === number)) return;

        newPlayers.push({
            id: Date.now() + Math.random(),
            number,
            name,
            isGK: (p.position || '').toUpperCase().includes('GK'),
            isStarter: !!p.isStarter,
            isCaptain: false
        });
    });

    scannedStaff.forEach(s => {
        const name = (s.name || '').trim();
        if (name.length < 2) return;
        if (currentBench.some(x => x.name.toUpperCase() === name.toUpperCase()) || newStaff.some(x => x.name.toUpperCase() === name.toUpperCase())) return;

        newStaff.push({
            id: Date.now() + Math.random(),
            name,
            role: normalizeRole(s.role)
        });
    });

    let updatedRoster = [...currentRoster];
    let updatedBench = [...currentBench];

    if (newPlayers.length > 0) updatedRoster = [...currentRoster, ...newPlayers].sort(robustNumericalSort);
    if (newStaff.length > 0) updatedBench = [...currentBench, ...newStaff];

    return { updatedRoster, updatedBench, newPlayersCount: newPlayers.length, newStaffCount: newStaff.length };
};