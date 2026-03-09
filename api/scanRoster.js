// /api/scanRoster.js
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageBase64 } = req.body;

        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        const projectId = process.env.DOCAI_PROJECT_ID;
        const location = process.env.DOCAI_LOCATION; 
        const processorId = process.env.DOCAI_PROCESSOR_ID;

        if (!credentials || !projectId || !processorId) {
            return res.status(500).json({ error: 'Document AI environment variables are missing.' });
        }

        // Initialize the Document AI Client WITH THE SPECIFIC REGIONAL ENDPOINT
        const client = new DocumentProcessorServiceClient({ 
            credentials,
            projectId: projectId,
            apiEndpoint: `${location}-documentai.googleapis.com` // CRITICAL FIX: Directs traffic to the specific US server
        });
        
        // Build the precise routing name
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

        return res.status(200).json({ text: document.text });

    } catch (error) {
        console.error('Document AI Error:', error);
        // We now return the exact error message to the frontend so you can see it on the iPad
        return res.status(500).json({ error: error.message || 'Failed to process document via AI' });
    }
}