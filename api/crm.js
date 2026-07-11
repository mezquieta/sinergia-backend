import { GoogleGenAI } from '@google/genai';

// Agente de ventas: recibe la conversación con un lead y devuelve la respuesta
// sugerida más la calificación del lead (score, urgencia, etapa, siguiente acción).
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
        const { negocio, lead, mensajes } = request.body;

        if (!lead || !Array.isArray(mensajes) || mensajes.length === 0) {
            return response.status(400).json({ error: 'Faltan datos: se requiere lead y mensajes' });
        }

        const historial = mensajes
            .map(m => `${m.rol === 'lead' ? 'CLIENTE' : 'AGENTE'}: ${m.texto}`)
            .join('\n');

        const prompt = `Eres un agente de ventas experto y cordial de este negocio: "${negocio || 'negocio de servicios'}".
Estás conversando con un lead para calificarlo y agendar una cita.

Datos del lead:
- Nombre: ${lead.nombre || 'desconocido'}
- Interés declarado: ${lead.interes || 'no especificado'}
- Notas internas: ${lead.notas || 'ninguna'}

Conversación hasta ahora:
${historial}

Tu tarea:
1. Redacta la siguiente respuesta del AGENTE en español, natural y breve (máximo 3 frases), que avance la venta. Si el lead ya muestra interés claro, propón agendar una cita con fecha/hora concreta.
2. Califica al lead con la información disponible.

Devuelve estrictamente un objeto JSON crudo (sin markdown, sin backticks) con estas claves:
- "respuesta": string, tu siguiente mensaje al cliente.
- "score": entero 0-100, qué tan calificado está el lead (presupuesto, interés, urgencia).
- "urgencia": "alta", "media" o "baja".
- "etapa_sugerida": una de "nuevo", "contactado", "calificado", "cerrado".
- "resumen": string, resumen de 1 frase del estado del lead.
- "siguiente_accion": string, acción concreta recomendada para el vendedor.`;

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
        console.error('CRM agent error:', error);
        return response.status(500).json({ error: 'Internal processing failed' });
    }
}
