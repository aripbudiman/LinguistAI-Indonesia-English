
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, TranslationStyle } from "../types";
import { SYSTEM_PROMPT } from "../constants";

export const translateText = async (
  text: string,
  style: TranslationStyle
): Promise<TranslationResult> => {
  // Always use the process.env.API_KEY directly as per SDK guidelines
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

    // Directly access the .text property from the response
    const result = JSON.parse(response.text || "{}");
    return result as TranslationResult;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Gagal menerjemahkan. Coba lagi nanti.");
  }
};
