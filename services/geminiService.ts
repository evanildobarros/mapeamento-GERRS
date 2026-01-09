import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize the client.
// Note: In a real app, ensure process.env.API_KEY is defined in your environment/build system.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
) => {
  try {
    // We use gemini-3-flash-preview for fast, grounded responses about the area.
    const model = 'gemini-3-flash-preview';

    // Construct the chat session
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Enable grounding to get real-time info about the port
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster chat responses
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    
    // Extract text and grounding metadata if available
    const responseText = result.text;
    const grounding = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: responseText,
      grounding: grounding,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
