import { Groq } from 'groq-sdk';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable.' });
  }

  const groq = new Groq({ apiKey });

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: 'Hello from Vercel!' },
      ],
    });

    return res.status(200).json({ message: response.choices[0]?.message?.content ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
