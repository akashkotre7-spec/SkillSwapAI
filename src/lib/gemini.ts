import { GoogleGenAI } from "@google/genai";
import { captureException } from "./sentry.ts";

let ai: GoogleGenAI | null = null;

export function getGemini() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required for AI features. Please set it in Settings.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// Simple client-side rate limiting (token bucket style)
let tokens = 10;
const LIMIT = 10;
const REFILL_RATE = 1; // 1 token per second

setInterval(() => {
  if (tokens < LIMIT) tokens += REFILL_RATE;
}, 1000);

export async function askGemini(prompt: string, modelType: "flash" | "pro" = "flash") {
  if (tokens < 1) {
    throw new Error("Rate limit exceeded. Please wait a moment.");
  }
  
  tokens -= 1;
  
  try {
    const genAI = getGemini();
    const model = modelType === "pro" ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
    
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text || "";
  } catch (error) {
    captureException(error);
    throw error;
  }
}
