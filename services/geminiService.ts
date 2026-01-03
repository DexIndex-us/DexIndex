import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePokemonAnalysis = async (pokemonName: string, types: string[]): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are DexIndex, an advanced Pokedex AI.
      Analyze the Pokemon "${pokemonName}" (Type: ${types.join(', ')}).
      
      Provide a response in Markdown format with the following sections:
      1. **Ecological Role**: A brief, scientific-sounding explanation of its behavior or habitat.
      2. **Battle Strategy**: Key strengths, weaknesses, and a recommended playstyle (e.g., sweeper, tank, support).
      3. **Fun Fact**: An obscure or interesting piece of lore.
      
      Keep it concise (max 200 words total).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to retrieve AI analysis at this time. Please check your connection or API key.";
  }
};