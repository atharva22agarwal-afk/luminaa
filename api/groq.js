export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use either the VITE_ prefixed key or a standard GROQ_API_KEY
  const apiKey = process.env.VITE_GROQ_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      // Pass the entire body (model, messages, temperature, etc.) directly to Groq
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Vercel API Proxy Error:", error);
    return res.status(500).json({ error: "Internal server error connecting to AI provider." });
  }
}
