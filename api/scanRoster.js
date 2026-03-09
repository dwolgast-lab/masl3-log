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

        let formattedLines = [];

        if (document.pages) {
            document.pages.forEach((page) => {
                if (page.tables && page.tables.length > 0) {
                    
                    // 1. CRITICAL FIX: Sort tables top-to-bottom based on physical Y-coordinate
                    page.tables.sort((a, b) => {
                        const getY = (table) => {
                            if (table.layout && table.layout.boundingPoly && table.layout.boundingPoly.normalizedVertices) {
                                return Math.min(...table.layout.boundingPoly.normalizedVertices.map(v => v.y || 0));
                            }
                            return 0;
                        };
                        return getY(a) - getY(b);
                    });

                    // 2. Extract the ordered rows
                    page.tables.forEach((table) => {
                        table.bodyRows.forEach(row => {
                            let rowData = row.cells.map(cell => getText(cell.layout.textAnchor, document.text));
                            rowData = rowData.map(c => c.trim()).filter(c => c.length > 0);
                            if (rowData.length > 0) {
                                formattedLines.push(rowData.join('   ')); 
                            }
                        });
                        formattedLines.push('\n---'); // Visual break between tables
                    });
                }
            });
        }

        if (formattedLines.length === 0) {
            formattedLines.push(document.text);
        }

        return res.status(200).json({ text: formattedLines.join('\n') });

    } catch (error) {
        console.error('Document AI Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to process document via AI' });
    }
}