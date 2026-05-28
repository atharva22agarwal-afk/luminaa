export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read the API key from Vercel environment variables
  const apiKey = process.env.VITE_GROQ_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('[api/groq] No API key found in environment variables.');
    return res.status(500).json({ error: { message: 'API key is not configured on the server.' } });
  }

  // Build the payload — req.body is already parsed by Vercel
  const payload = req.body;

  if (!payload || !payload.messages) {
    return res.status(400).json({ error: { message: 'Missing messages in request body.' } });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error('[api/groq] Groq returned error:', groqResponse.status, JSON.stringify(data));
      return res.status(groqResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[api/groq] Proxy fetch error:', error.message);
    return res.status(500).json({ error: { message: 'Failed to connect to AI provider.' } });
  }
}
