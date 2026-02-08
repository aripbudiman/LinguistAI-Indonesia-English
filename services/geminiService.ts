
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, TranslationStyle, VocabularyPair } from "../types";
import { SYSTEM_PROMPT } from "../constants";

export const translateText = async (
  text: string,
  style: TranslationStyle
): Promise<TranslationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPT(style),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            correctedOriginal: { type: Type.STRING },
            translatedText: { type: Type.STRING },
            grammarNotes: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            usageTips: { type: Type.STRING },
          },
          required: ["originalText", "correctedOriginal", "translatedText", "grammarNotes", "detectedLanguage", "usageTips"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as TranslationResult;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Gagal menerjemahkan. Coba lagi nanti.");
  }
};

export const generateVocabularyPairs = async (topic: string): Promise<VocabularyPair[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptTopic = topic.trim() || "Daily Activities";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 common vocabulary pairs (Indonesian and English) related to the topic: ${promptTopic}. 
      Return an array of objects with id, indonesian, and english keys.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              indonesian: { type: Type.STRING },
              english: { type: Type.STRING },
            },
            required: ["id", "indonesian", "english"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Vocab Generation error:", error);
    throw new Error("Gagal memuat kosa kata.");
  }
};
