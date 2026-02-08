
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptTopic = topic.trim() || "General English Grammar and Vocabulary";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 high-quality multiple choice questions for learning English (Intermediate level). 
      SPECIFIC TOPIC: ${promptTopic}. 
      Each question must have 4 options and a clear explanation in Indonesian.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Quiz Generation error:", error);
    throw new Error("Gagal membuat soal quiz. Silakan coba lagi.");
  }
};
