import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const getText = (textAnchor, text) => {
    if (!textAnchor || !textAnchor.textSegments || textAnchor.textSegments.length === 0) return '';
    const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;
    return text.substring(startIndex, endIndex).trim().replace(/\n/g, ' ');
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { imageBase64 } = req.body;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        const projectId = process.env.DOCAI_PROJECT_ID;
        const location = process.env.DOCAI_LOCATION; 
        const processorId = process.env.DOCAI_PROCESSOR_ID;

        const client = new DocumentProcessorServiceClient({ 
            credentials, 
            projectId, 
            apiEndpoint: `${location}-documentai.googleapis.com` 
        });
        
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
        const request = { name, rawDocument: { content: imageBase64, mimeType: 'image/jpeg' } };

        const [result] = await client.processDocument(request);
        const { document } = result;

        let rows = [];

        // 1. Math-based Line Builder: Group words by their physical Y-coordinates
        if (document.pages && document.pages.length > 0) {
            const page = document.pages[0];
            if (page.tokens) {
                page.tokens.forEach(token => {
                    const text = getText(token.layout.textAnchor, document.text);
                    if (!text) return;

                    const vertices = token.layout.boundingPoly.normalizedVertices;
                    if (!vertices || vertices.length === 0) return;

                    // Find the mathematical center of the word
                    const sumX = vertices.reduce((sum, v) => sum + (v.x || 0), 0);
                    const sumY = vertices.reduce((sum, v) => sum + (v.y || 0), 0);
                    const centerX = sumX / vertices.length;
                    const centerY = sumY / vertices.length;

                    // If a row exists at this approximate height (within 1.2% of page height), add the word to it
                    let foundRow = rows.find(r => Math.abs(r.centerY - centerY) < 0.012);
                    
                    if (foundRow) {
                        foundRow.tokens.push({ text, x: centerX });
                        foundRow.centerY = ((foundRow.centerY * (foundRow.tokens.length - 1)) + centerY) / foundRow.tokens.length;
                    } else {
                        // Otherwise, create a new row
                        rows.push({ centerY: centerY, tokens: [{ text, x: centerX }] });
                    }
                });
            }
        }

        // 2. Sort all physical rows from top of the page to the bottom
        rows.sort((a, b) => a.centerY - b.centerY);

        // 3. Construct the text strings, injecting spaces to represent physical columns
        const formattedLines = rows.map(row => {
            row.tokens.sort((a, b) => a.x - b.x);
            let lineStr = "";
            for (let i = 0; i < row.tokens.length; i++) {
                if (i > 0) {
                    const gap = row.tokens[i].x - row.tokens[i-1].x;
                    if (gap > 0.03) { // If there is a large physical gap, force a column separation
                        lineStr += "   "; 
                    } else {
                        lineStr += " ";
                    }
                }
                lineStr += row.tokens[i].text;
            }
            return lineStr;
        });

        if (formattedLines.length === 0) formattedLines.push(document.text);

        return res.status(200).json({ text: formattedLines.join('\n') });

    } catch (error) {
        console.error('Document AI Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to process document via AI' });
    }
}