// /api/scanRoster.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageBase64 } = req.body;
        const apiKey = process.env.GOOGLE_VISION_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured on server' });
        }

        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [
                    {
                        image: { content: imageBase64 },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const text = data.responses[0]?.fullTextAnnotation?.text || '';
        return res.status(200).json({ text });

    } catch (error) {
        console.error('Vision API Error:', error);
        return res.status(500).json({ error: 'Failed to process image' });
    }
}