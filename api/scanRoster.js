import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

// Schema mirrors the three field blocks on the MASL 3 Official Lineup form.
const RosterSchema = z.object({
    players: z.array(z.object({
        number: z.string().describe('Jersey number exactly as written, e.g. "0", "00", "15". Empty string if blank.'),
        name: z.string().describe('Player name formatted "Last, First" exactly as written.'),
        position: z.string().describe('Value from the Pos. column: GK, F, D, M, D/M, A, E, etc. Empty string if blank.'),
        isStarter: z.boolean().describe('true if the row is in the STARTERS block, false if in the SUBSTITUTES block.')
    })),
    staff: z.array(z.object({
        name: z.string().describe('Staff name formatted "Last, First" exactly as written.'),
        role: z.string().describe('Value from the Job column, e.g. "Head Coach".')
    }))
});

const SYSTEM_PROMPT = `You are extracting fields from a MASL official lineup / roster form. These come from several leagues (MASL, MASL2, MASL3, MASLW); the exact title, column header wording, and number of rows vary, but the structure is consistent: a player section split into starters and substitutes, plus a bench-staff section.

Map every filled row to the correct field:
- PLAYERS: each player row has a jersey number, a position, and a name. Players listed under the starters block (often labeled "Starters") get isStarter=true; players under the substitutes/bench block (often "Substitutes" or "Subs") get isStarter=false.
- BENCH STAFF: the staff section (often "Bench Staff") lists non-players with a job/role and a name.

Rules:
- Names are written "Last, First". Return them exactly that way.
- Put the position-column value in "position" verbatim (e.g. GK, F, D, M, D/M, A, E). It may be printed or handwritten.
- The number of rows varies by league and form — read however many are actually filled in. Skip blank rows entirely.
- Never invent a player, number, name, or role that is not on the form.
- Forms may be typed or handwritten; transcribe handwriting as best you can. If a character is illegible, give your best single reading rather than a placeholder.
- Ignore the header (Team/Opponent/Date/City), the instructional paragraph, and the Coach/Referee signature lines.`;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const response = await client.messages.parse({
            model: 'claude-opus-4-8',
            max_tokens: 16000,
            thinking: { type: 'adaptive' },
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
                        },
                        { type: 'text', text: 'Extract the roster from this lineup sheet.' }
                    ]
                }
            ],
            output_config: { format: zodOutputFormat(RosterSchema) }
        });

        if (!response.parsed_output) {
            return res.status(502).json({ error: 'Model did not return structured roster data' });
        }

        return res.status(200).json(response.parsed_output);

    } catch (error) {
        console.error('Roster scan error:', error);
        return res.status(500).json({ error: error.message || 'Failed to process roster' });
    }
}
