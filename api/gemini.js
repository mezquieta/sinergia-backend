import { GoogleGenAI } from '@google/generative-ai';

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
        const { action, textInput, level, systemInfo, currentPrompt } = request.body;

        if (action === 'generate_scenario') {
            const matrixTemasOcultos = [
                "Expat compound community administration interaction, requesting structural villa revisions.",
                "Premium metro transit network, requesting high-tier luxury family gold carriage card routing.",
                "International schooling coordinator presentation, analyzing core curriculum structures.",
                "Liquefied distributions high-level meeting, discussing pipeline management operations and conservative hedging policies."
            ];
            const temaSecreto = matrixTemasOcultos[Math.floor(Math.random() * matrixTemasOcultos.length)];

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: `Context framework: ${temaSecreto}. User level: ${level}. Design a starting question for an English dialogue simulation. Return strictly a raw valid JSON object with keys: "setup_title" and "ai_opening". Do not mention Qatar or Doha explicitly under any circumstance.`,
                config: { responseMimeType: "application/json" }
            });

            return response.status(200).json(JSON.parse(geminiResponse.text));
        }

        if (action === 'evaluate_voice') {
            let strictness = level === 'Advanced' 
                ? 'Be extremely rigorous, grade scores between 15-30 XP max.' 
                : 'Be supportive, grade between 35-50 XP.';

            const promptFinal = `Character dialogue line was: "${currentPrompt}". User physically replied by voice: "${textInput}". Evaluate the grammar. Context environment setup: ${systemInfo}. ${strictness}. Return strictly a raw JSON object string with keys: "reply" (your next conversational response sentence), "correction" (constructive language tip in English), and "xp" (the score integer). No markdown formatting or backticks.`;

            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: promptFinal,
                config: { responseMimeType: "application/json" }
            });

            return response.status(200).json(JSON.parse(geminiResponse.text));
        }

    } catch (error) {
        console.error("Vercel Server Error:", error);
        return response.status(500).json({ error: "Internal processing failed" });
    }
}
