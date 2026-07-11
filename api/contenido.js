import { GoogleGenAI } from '@google/genai';

// Creador de contenido: genera guiones de video y carruseles con IA.
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
        const { action, tema, filminas } = request.body;

        if (!tema || !tema.trim()) {
            return response.status(400).json({ error: 'Falta el tema' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        let prompt;

        if (action === 'guion') {
            prompt = `Eres un guionista experto en contenido para redes sociales, con tono profesional
pero cercano, como si le hablaras a un amigo.

Tema del video: "${tema}"

Genera un guion completo en español y devuelve estrictamente un objeto JSON crudo
(sin markdown, sin backticks) con estas claves:
- "titulo": string, título atractivo del video.
- "gancho": string, las primeras 1-2 frases para captar la atención en 3 segundos.
- "puntos": array de 3-5 strings, los puntos clave a desarrollar, en orden.
- "cierre": string, el cierre con llamada a la acción.
- "duracion": string, duración recomendada (ej. "45-60 segundos").
- "formato": "reel corto" | "video largo" | "historia" — el que más le convenga al tema.`;
        } else if (action === 'carrusel') {
            const n = Math.min(10, Math.max(5, +filminas || 7));
            prompt = `Eres un creador experto de carruseles para redes sociales.

Tema del carrusel: "${tema}"

Genera un carrusel de ${n} filminas en español y devuelve estrictamente un objeto
JSON crudo (sin markdown, sin backticks) con estas claves:
- "titulo": string, título del carrusel.
- "slides": array de exactamente ${n} objetos { "titulo": string (máx 8 palabras), "texto": string (2-3 frases) }.
  La primera filmina es el GANCHO (provoca curiosidad), las del medio desarrollan el
  contenido de forma concreta y accionable, y la última es el CIERRE con llamada a la
  acción (seguir, guardar, comentar).`;
        } else {
            return response.status(400).json({ error: 'Unknown action' });
        }

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        let data;
        try {
            data = JSON.parse(geminiResponse.text);
        } catch {
            return response.status(502).json({ error: 'La IA devolvió una respuesta inválida, intenta de nuevo' });
        }

        return response.status(200).json(data);

    } catch (error) {
        console.error('Contenido error:', error);
        return response.status(500).json({ error: 'Internal processing failed' });
    }
}
