import { characters, validHistory, geminiContents } from '../src/characters.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  const { characterId, messages } = req.body ?? {};
  if (!characters[characterId] || !validHistory(messages) || messages.at(-1).role !== 'user') {
    return res.status(400).json({ error: 'Revisá el personaje y los mensajes.' });
  }
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Falta configurar la clave de Gemini en el servidor.' });
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: characters[characterId].prompt }] }, contents: geminiContents(messages), generationConfig: { maxOutputTokens: 350, temperature: 0.85 } })
      });
    } finally { clearTimeout(timer); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: response.status === 429 ? 'Gemini está ocupado. Probá de nuevo en un momento.' : 'Gemini no pudo responder. Intentá otra vez.' });
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
    if (!reply) return res.status(502).json({ error: 'No llegó una respuesta de Gemini. Probá con otra pregunta.' });
    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({ error: 'No se pudo conectar con Gemini. Intentá otra vez.' });
  }
}
