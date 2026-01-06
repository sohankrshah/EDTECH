
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Strictly follow naming and direct use of process.env.API_KEY per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCounselingAdvice = async (history: { role: 'user' | 'assistant', content: string }[]) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are a professional Education Consultant for international students. 
    Your goal is to help students choose the right universities, programs, and navigate the application process.
    Be encouraging, factual, and professional. 
    Consider factors like GPA, budget, location preferences, and career goals.
    If you recommend specific universities, explain why.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: history.map(h => ({
        parts: [{ text: h.content }],
        role: h.role === 'assistant' ? 'model' : 'user'
      })),
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Directly access .text property as per guidelines (not a method)
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
};
