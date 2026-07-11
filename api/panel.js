import { GoogleGenAI } from '@google/genai';

// Insights del panel: recibe los KPIs agregados de una sección y devuelve
// 3 insights de acción y alertas, en JSON.
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
        const { action, seccion, negocio, kpis } = request.body;

        if (action !== 'insights' || !kpis) {
            return response.status(400).json({ error: 'Unknown action' });
        }

        const prompt = `Eres un analista de negocio. Negocio: "${negocio || 'no especificado'}".
Sección del dashboard: ${seccion}.
KPIs y datos del periodo actual (JSON): ${JSON.stringify(kpis).slice(0, 8000)}

Genera exactamente 3 insights de acción concretos y accionables en español
(qué hacer, no solo qué pasó), y las alertas que detectes (0 a 3).

Devuelve estrictamente un objeto JSON crudo (sin markdown, sin backticks):
{ "insights": ["...", "...", "..."],
  "alertas": [{ "texto": "...", "severidad": "alta" | "media" | "baja" }] }`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
        console.error('Panel insights error:', error);
        return response.status(500).json({ error: 'Internal processing failed' });
    }
}
