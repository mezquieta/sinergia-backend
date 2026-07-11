import { GoogleGenAI } from '@google/genai';

// Transcripción de reuniones: recibe audio en base64 y devuelve la transcripción,
// o recibe una transcripción completa y genera la minuta (resumen, acuerdos, pendientes).
export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { action, audio, mimeType, transcript, titulo } = request.body;

        if (action === 'transcribe') {
            if (!audio) {
                return response.status(400).json({ error: 'Falta el audio' });
            }
            // Límite de Vercel: ~4.5MB por request. El frontend graba segmentos que caben.
            if (audio.length > 4_200_000) {
                return response.status(413).json({ error: 'Segmento de audio demasiado grande' });
            }

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [{
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType: mimeType || 'audio/webm', data: audio } },
                        { text: 'Transcribe fielmente este audio en su idioma original, con puntuación correcta. Si distingues varios hablantes, antepón "Hablante 1:", "Hablante 2:", etc. Si el audio no contiene voz, responde exactamente: [sin voz]. Devuelve únicamente el texto de la transcripción, sin comentarios ni formato markdown.' }
                    ]
                }]
            });

            return response.status(200).json({ transcript: (geminiResponse.text || '').trim() });
        }

        if (action === 'minutes') {
            if (!transcript || !transcript.trim()) {
                return response.status(400).json({ error: 'Falta la transcripción' });
            }

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Eres un asistente experto en actas de reunión. A partir de esta transcripción de la reunión "${titulo || 'sin título'}", genera la minuta en español.

Transcripción:
${transcript.slice(0, 100000)}

Devuelve estrictamente un objeto JSON crudo (sin markdown, sin backticks) con estas claves:
- "resumen": string, resumen ejecutivo de 2-4 frases.
- "puntos_clave": array de strings con los temas principales tratados.
- "acuerdos": array de strings con las decisiones tomadas (vacío si no hubo).
- "pendientes": array de objetos {"tarea": string, "responsable": string} con las acciones a seguir (usa "por definir" si no se mencionó responsable).`,
                config: { responseMimeType: 'application/json' }
            });

            let data;
            try {
                data = JSON.parse(geminiResponse.text);
            } catch {
                return response.status(502).json({ error: 'La IA devolvió una respuesta inválida, intenta de nuevo' });
            }
            return response.status(200).json(data);
        }

        return response.status(400).json({ error: 'Unknown action' });

    } catch (error) {
        console.error('Transcribe error:', error);
        return response.status(500).json({ error: 'Internal processing failed' });
    }
}
