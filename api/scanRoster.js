import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

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
        
        // Document AI naturally orders document.text top-to-bottom. 
        // We will just return this and let the frontend aggressively filter the garbage.
        return res.status(200).json({ text: result.document.text });

    } catch (error) {
        console.error('Document AI Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to process document via AI' });
    }
}