
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * VOICE DIRECTOR: Parses operator speech into system actions
 */
export const parseVoiceIntent = async (text: string): Promise<{ action: string, payload?: any } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI Switcher Director. Map this voice command to a system action: "${text}". 
      Available actions: 
      - CUT (target: cam1, cam2, cam3, media1)
      - PVW (target: cam1, cam2, cam3, media1)
      - REPLAY (target: 5s, 10s, mark)
      - GFX (layer: scoreboard, chat, commerce)
      Return ONLY valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            payload: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Voice Parser Error", e);
    return null;
  }
};

/**
 * TACTICAL VISION: Analyzes a PGM frame for sports coaching or directing
 */
export const analyzeTactics = async (base64Frame: string, sportContext: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Frame } },
          { text: `Analyze this live broadcast frame of ${sportContext}. 
            If there is a counter-attack or key play forming, suggest a camera switch (e.g. Cam 2 Drone). 
            Suggest ONLY if critical. Keep under 20 words.` }
        ]
      }
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};

/**
 * COMMERCE RECOGNITION: Detects if audio transcript mentions products
 */
export const detectCommerceKeywords = async (transcript: string, products: any[]): Promise<string | null> => {
  try {
    const productNames = products.map(p => p.name).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audio Transcript: "${transcript}". 
      Available Products: ${productNames}. 
      Did the speaker mention a product? If yes, return ONLY the exact product name. If not, return "null".`,
    });
    const result = response.text?.trim();
    return result === "null" ? null : result;
  } catch (e) {
    return null;
  }
};

export const generateEditorialPitch = async (context: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Professional broadcast intro for: ${context}. 25 words max.`
    });
    return response.text || "";
  } catch (error) {
    return "Editorial ready.";
  }
};
