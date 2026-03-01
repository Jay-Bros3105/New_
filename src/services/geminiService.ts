import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async summarize(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following study notes in a concise way for a student: ${text}`,
    });
    return response.text;
  },

  async translateToSwahili(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following educational text to Swahili: ${text}`,
    });
    return response.text;
  },

  async answerQuestion(question: string, context?: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context 
        ? `Based on this context: ${context}, answer the following question: ${question}`
        : `Answer the following study question: ${question}`,
    });
    return response.text;
  },

  async generateQuiz(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 multiple choice questions based on these notes: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              answer: { type: Type.STRING }
            },
            required: ["question", "options", "answer"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }
};
