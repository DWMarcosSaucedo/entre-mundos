import { characters, validHistory, geminiContents } from '../src/characters.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const { characterId, messages } = req.body ?? {};

  if (
    !characters[characterId] ||
    !validHistory(messages) ||
    messages.at(-1).role !== 'user'
  ) {
    return res.status(400).json({
      error: 'Revisá el personaje y los mensajes.'
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Falta configurar la clave de Gemini en el servidor.'
    });
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let response;

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: characters[characterId].prompt }]
            },
            contents: geminiContents(messages),
            generationConfig: {
              maxOutputTokens: 1024,
              thinkingConfig: {
                thinkingLevel: 'low'
              }
            }
          })
        }
      );
    } finally {
      clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const reason =
        data.error?.details
          ?.flatMap(detail => detail.reason ? [detail.reason] : [])?.[0] ||
        data.error?.status ||
        'unknown';

      const detail = String(data.error?.message || '')
        .replaceAll(process.env.GEMINI_API_KEY, '[CLAVE OCULTA]')
        .slice(0, 500);

      console.error('Gemini API error', {
        status: response.status,
        reason,
        detail
      });

      const error =
        response.status === 429
          ? 'Se alcanzó el límite de uso de Gemini. Probá más tarde.'
          : [400, 401].includes(response.status)
            ? 'Gemini rechazó la solicitud. Revisá la clave y el modelo configurados.'
            : response.status === 403
              ? 'Gemini rechazó el acceso. Revisá los permisos del proyecto de Google.'
              : response.status === 404
                ? 'Gemini no encontró el modelo configurado. Revisá GEMINI_MODEL.'
                : `Gemini no pudo responder (código ${response.status}). Intentá otra vez.`;

      return res.status(502).json({ error });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      return res.status(502).json({
        error: 'No llegó una respuesta de Gemini. Probá con otra pregunta.'
      });
    }

    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({
      error: 'No se pudo conectar con Gemini. Intentá otra vez.'
    });
  }
}