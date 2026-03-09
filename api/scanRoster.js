// /api/scanRoster.js
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageBase64 } = req.body;

        // Parse the secure JSON credentials from Vercel
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        const projectId = process.env.DOCAI_PROJECT_ID;
        const location = process.env.DOCAI_LOCATION; 
        const processorId = process.env.DOCAI_PROCESSOR_ID;

        if (!credentials || !projectId || !processorId) {
            return res.status(500).json({ error: 'Document AI environment variables are missing.' });
        }

        // Initialize the Document AI Client
        const client = new DocumentProcessorServiceClient({ credentials });
        
        // Build the precise routing name for Google's servers
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

        // Package the image for processing
        const request = {
            name,
            rawDocument: {
                content: imageBase64,
                mimeType: 'image/jpeg', // Works for both JPEG and PNG payloads
            },
        };

        // Send to Google Cloud
        const [result] = await client.processDocument(request);
        const { document } = result;

        // Document AI returns highly intelligent text that respects columns.
        // For phase 1 of your experiment, we will just return this highly clean text 
        // to your existing frontend Verification Screen so you can see the difference.
        return res.status(200).json({ text: document.text });

    } catch (error) {
        console.error('Document AI Error:', error);
        return res.status(500).json({ error: 'Failed to process document via AI' });
    }
}