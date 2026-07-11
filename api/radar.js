import { GoogleGenAI } from '@google/genai';

// Radar de ideas: rastrea fuentes públicas (dev.to, Hacker News) según la
// categoría y usa Gemini para curar los hallazgos como ideas accionables.
const FUENTES = {
    diseno: [
        { tipo: 'devto', url: 'https://dev.to/api/articles?tag=webdesign&top=7&per_page=10' },
        { tipo: 'devto', url: 'https://dev.to/api/articles?tag=ux&top=7&per_page=10' },
        { tipo: 'hn', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=web%20design&numericFilters=points>30&hitsPerPage=10' },
    ],
    prompts: [
        { tipo: 'devto', url: 'https://dev.to/api/articles?tag=promptengineering&top=7&per_page=10' },
        { tipo: 'devto', url: 'https://dev.to/api/articles?tag=llm&top=7&per_page=10' },
        { tipo: 'hn', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=prompt%20engineering&numericFilters=points>20&hitsPerPage=10' },
    ],
    habilidades: [
        { tipo: 'devto', url: 'https://dev.to/api/articles?tag=ai&top=7&per_page=10' },
        { tipo: 'devto', url: 'https://dev.to/api/articles?tag=productivity&top=7&per_page=10' },
        { tipo: 'hn', url: 'https://hn.algolia.com/api/v1/search?tags=story&query=AI%20workflow&numericFilters=points>30&hitsPerPage=10' },
    ],
};

async function leerFuente(f) {
    try {
        const res = await fetch(f.url, { headers: { 'User-Agent': 'SinergiaRadar/1.0' }, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return [];
        const data = await res.json();
        if (f.tipo === 'devto') {
            return (Array.isArray(data) ? data : []).map(a => ({
                titulo: a.title, resumen: a.description || '', url: a.url,
                fuente: 'dev.to', puntos: a.positive_reactions_count || 0,
            }));
        }
        if (f.tipo === 'hn') {
            return (data.hits || []).map(h => ({
                titulo: h.title, resumen: '', url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
                fuente: 'Hacker News', puntos: h.points || 0,
            }));
        }
        return [];
    } catch {
        return [];
    }
}

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
        const { action, categoria } = request.body;
        if (action !== 'buscar' || !FUENTES[categoria]) {
            return response.status(400).json({ error: 'Unknown action o categoría inválida (diseno | prompts | habilidades)' });
        }

        const listas = await Promise.all(FUENTES[categoria].map(leerFuente));
        const vistos = new Set();
        const items = listas.flat()
            .filter(i => i.titulo && !vistos.has(i.url) && vistos.add(i.url))
            .sort((a, b) => b.puntos - a.puntos)
            .slice(0, 24);

        if (!items.length) {
            return response.status(502).json({ error: 'Las fuentes no respondieron, intenta de nuevo en un momento' });
        }

        // Curaduría con IA; si falla, se devuelven los hallazgos crudos igual.
        try {
            const etiquetas = { diseno: 'diseño web', prompts: 'prompts de IA', habilidades: 'habilidades y flujos de trabajo con IA' };
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Eres un curador de tendencias para un emprendedor hispanohablante que busca
ideas nuevas de ${etiquetas[categoria]}.

Hallazgos recientes de la web (JSON): ${JSON.stringify(items).slice(0, 9000)}

Elige los 8 más valiosos y devuélvelos EN ESPAÑOL como un objeto JSON crudo
(sin markdown) con la clave "ideas": array de objetos
{ "idea": string (título reescrito en español, claro y atractivo),
  "detalle": string (1-2 frases: qué es y cómo aprovecharlo en su negocio o web),
  "url": string (la url original tal cual),
  "fuente": string }.
Prefiere ideas prácticas y aplicables sobre noticias genéricas.`,
                config: { responseMimeType: 'application/json' }
            });
            const data = JSON.parse(geminiResponse.text);
            if (Array.isArray(data.ideas) && data.ideas.length) {
                return response.status(200).json({ ideas: data.ideas, curado: true });
            }
        } catch (e) {
            console.error('Radar: fallo la curaduría IA, devolviendo crudo:', e.message);
        }

        return response.status(200).json({
            curado: false,
            ideas: items.slice(0, 10).map(i => ({ idea: i.titulo, detalle: i.resumen, url: i.url, fuente: i.fuente })),
        });

    } catch (error) {
        console.error('Radar error:', error);
        return response.status(500).json({ error: 'Internal processing failed' });
    }
}
