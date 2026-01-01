
import { GoogleGenAI } from "@google/genai";
import { AISuggestionType } from '../types';

let aiClient: any = null; // Use any to allow mocks

// For Testing Purposes
export const _setClient = (client: any) => {
    aiClient = client;
};

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your environment.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateAIContent = async (
  type: AISuggestionType,
  contextText: string,
  userPrompt?: string
): Promise<string> => {
  const client = getClient();
  const model = 'gemini-3-flash-preview'; // Using the fast model for text editing tasks

  let prompt = '';

  switch (type) {
    case AISuggestionType.FIX_GRAMMAR:
      prompt = `Fix the grammar and spelling of the following text. Do not change the meaning. Return only the corrected text:\n\n"${contextText}"`;
      break;
    case AISuggestionType.SUMMARIZE:
      prompt = `Summarize the following text in a concise paragraph:\n\n"${contextText}"`;
      break;
    case AISuggestionType.EXPAND:
      prompt = `Continue writing based on the following text. Maintain the tone and style:\n\n"${contextText}"`;
      break;
    case AISuggestionType.REPHRASE:
      prompt = `Rephrase the following text to be more professional and clear:\n\n"${contextText}"`;
      break;
    case AISuggestionType.GENERATE_IDEAS:
      prompt = `Generate 5 creative ideas or bullet points related to this topic:\n\n"${contextText}"`;
      break;
    default:
      prompt = userPrompt ? `${userPrompt}\n\nContext:\n"${contextText}"` : contextText;
  }

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};
