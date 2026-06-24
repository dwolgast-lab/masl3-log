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
// Map the free-form "Job" value to a canonical BENCH_ROLE. Staff jobs are
// written many ways (e.g. Head Coach / HC / Coach; AC / AS / Asst. Coach; AT /
// Athletic Trainer; GM -> Manager), so match on letters only (periods/spaces
// stripped) and use exact-match for the ambiguous two-letter abbreviations so
// "AC"/"AS"/"AT" don't collide with the letters inside other words. "Owner" and
// anything else unrecognized falls back to Other. `isFirst` is true for the
// first staff member listed on the form, who is the head coach by convention —
// used to resolve a bare "Coach" and to default an unrecognized first row.
const normalizeRole = (role, isFirst) => {
    const letters = (role || '').toLowerCase().replace(/[^a-z]/g, '');

    if (letters.includes('head') || letters === 'hc') return 'Head Coach';
    if (letters.includes('assistant') || letters.includes('asst') || letters === 'ac' || letters === 'as') return 'Assistant Coach';
    if (letters.includes('trainer') || letters === 'at') return 'Trainer';
    if (letters.includes('manager') || letters === 'gm') return 'Manager';
    if (letters.includes('coach')) return isFirst ? 'Head Coach' : 'Assistant Coach';

    return isFirst ? 'Head Coach' : 'Other';
};

// True only when the job text *explicitly* names a head coach ("HC" / "Head
// Coach") — NOT the first-row default. Used to decide whether a coach who only
// signed the bottom line should be treated as the head coach.
const isExplicitHeadCoach = (role) => {
    const letters = (role || '').toLowerCase().replace(/[^a-z]/g, '');
    return letters.includes('head') || letters === 'hc';
};

const sameName = (a, b) => (a || '').trim().toUpperCase() === (b || '').trim().toUpperCase();

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

    let validStaffSeen = 0;
    let hasExplicitHeadCoach = false;
    scannedStaff.forEach(s => {
        const name = (s.name || '').trim();
        if (name.length < 2) return;

        const isFirstStaff = validStaffSeen === 0;
        validStaffSeen++;

        if (isExplicitHeadCoach(s.role)) hasExplicitHeadCoach = true;

        if (currentBench.some(x => sameName(x.name, name)) || newStaff.some(x => sameName(x.name, name))) return;

        newStaff.push({
            id: Date.now() + Math.random(),
            name,
            role: normalizeRole(s.role, isFirstStaff)
        });
    });

    // Non-standard form: the head coach signed the bottom "Coach"/"Head Coach"
    // line without listing themselves in bench staff. If a legible name is
    // there, isn't already a staff member, and no one is *explicitly* the head
    // coach, treat the signer as head coach — demoting any first-row default HC
    // so we don't end up with two.
    const coachName = (scanData?.coachName || '').trim();
    if (coachName.length >= 2 && !hasExplicitHeadCoach) {
        const alreadyListed = currentBench.some(x => sameName(x.name, coachName)) || newStaff.some(x => sameName(x.name, coachName));
        if (!alreadyListed) {
            newStaff.forEach(x => { if (x.role === 'Head Coach') x.role = 'Assistant Coach'; });
            newStaff.push({
                id: Date.now() + Math.random(),
                name: coachName,
                role: 'Head Coach'
            });
        }
    }

    let updatedRoster = [...currentRoster];
    let updatedBench = [...currentBench];

    if (newPlayers.length > 0) updatedRoster = [...currentRoster, ...newPlayers].sort(robustNumericalSort);
    if (newStaff.length > 0) updatedBench = [...currentBench, ...newStaff];

    return { updatedRoster, updatedBench, newPlayersCount: newPlayers.length, newStaffCount: newStaff.length };
};