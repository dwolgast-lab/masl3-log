// Local test harness for the roster scanner.
// Runs the EXACT prompt + schema + merge logic the deployed function uses,
// against a real image on disk, and prints both the raw structured output and
// the merged roster — so we can check field mapping before touching a tablet.
//
// Usage (key is read from .env, never passed on the command line):
//   node --env-file=.env scripts/scanLocal.mjs test-samples/1000008800.jpg
//
// Each run is a real, billed Claude vision call.

import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { extractRoster } from '../api/scanRoster.js';
import { mergeScannedRoster } from '../src/ocrEngine.js';

const imagePath = process.argv[2];
if (!imagePath) {
    console.error('Usage: node --env-file=.env scripts/scanLocal.mjs <path-to-image>');
    process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not found. Put it in .env and run with: node --env-file=.env ...');
    process.exit(1);
}

const ext = extname(imagePath).toLowerCase();
const mediaType = ext === '.png' ? 'image/png' : 'image/jpeg';

const imageBase64 = readFileSync(imagePath).toString('base64');
console.log(`Image: ${imagePath} (${mediaType}, ${Math.round(imageBase64.length / 1024)} KB base64)\n`);

const client = new Anthropic({ apiKey });

console.log('Calling Claude…\n');
const parsed = await extractRoster(client, imageBase64, mediaType);

if (!parsed) {
    console.error('Model did not return structured roster data.');
    process.exit(1);
}

console.log('=== RAW STRUCTURED OUTPUT ===');
console.log(JSON.stringify(parsed, null, 2));

const merged = mergeScannedRoster(parsed, [], []);

console.log('\n=== MERGED PLAYERS (number · name · GK · Starter) ===');
for (const p of merged.updatedRoster) {
    console.log(`${p.number.padEnd(4)} ${p.name.padEnd(28)} ${p.isGK ? 'GK ' : '   '} ${p.isStarter ? 'STARTER' : 'sub'}`);
}

console.log('\n=== MERGED BENCH STAFF (role · name) ===');
for (const s of merged.updatedBench) {
    console.log(`${s.role.padEnd(16)} ${s.name}`);
}

console.log(`\nImported ${merged.newPlayersCount} players, ${merged.newStaffCount} staff.`);
