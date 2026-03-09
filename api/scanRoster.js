import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

// Helper function to extract specific cell text from the larger document
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

        // 1. Dig directly into the Table objects instead of the raw flat text
        if (document.pages) {
            document.pages.forEach((page) => {
                if (page.tables && page.tables.length > 0) {
                    page.tables.forEach((table) => {
                        table.bodyRows.forEach(row => {
                            let rowData = row.cells.map(cell => getText(cell.layout.textAnchor, document.text));
                            
                            // Remove empty cells to tighten up the row data
                            rowData = rowData.map(c => c.trim()).filter(c => c.length > 0);
                            
                            if (rowData.length > 0) {
                                // Separate the cells with a wide space so the frontend regex can easily parse it
                                formattedLines.push(rowData.join('   ')); 
                            }
                        });
                        formattedLines.push(''); // Add a blank line between different tables
                    });
                }
            });
        }

        // 2. Fallback just in case the form parser couldn't find bounding boxes
        if (formattedLines.length === 0) {
            formattedLines.push(document.text);
        }

        return res.status(200).json({ text: formattedLines.join('\n') });

    } catch (error) {
        console.error('Document AI Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to process document via AI' });
    }
}