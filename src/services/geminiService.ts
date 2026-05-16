import { getGemini, askGemini } from "../lib/gemini.ts";
import { Type } from "@google/genai";
import { safeParse } from "../lib/storage.ts";

export const analyzeMatch = async (userA: any, userB: any) => {
  try {
    const prompt = `Analyze the skill exchange compatibility between two users:
    User A: Teaches [${userA.teaches.join(", ")}], Wants to learn [${userA.learns.join(", ")}]
    User B: Teaches [${userB.teaches.join(", ")}], Wants to learn [${userB.learns.join(", ")}]
    
    Calculate a compatibility score (0-100) and provide a 1-sentence explanation of why they are a good match or how they can help each other. Return JSON.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["score", "reason"]
        }
      }
    });

    return safeParse(response.text, { score: 85, reason: "Manual matching suggested." });
  } catch (err) {
    console.error("Gemini Match Error:", err);
    return { score: 75, reason: "Manual matching suggested." };
  }
};

export const generateLearningRoadmap = async (skill: string) => {
  try {
    const prompt = `Generate a 5-step learning roadmap for a beginner wanting to learn ${skill}. 
    For each step, provide:
    1. title: Clear step name.
    2. description: Short conceptual summary.
    3. time: Estimated effort (e.g. 2 hours).
    4. search_query: A specific technical search query for resources.
    5. practice_task: A specific, small project or exercise to complete for this step.
    
    Return as a JSON array of objects.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              time: { type: Type.STRING },
              search_query: { type: Type.STRING },
              practice_task: { type: Type.STRING }
            },
            required: ["title", "description", "time", "search_query", "practice_task"]
          }
        }
      }
    });

    return safeParse(response.text, []);
  } catch (err) {
    console.error("Gemini Roadmap Error:", err);
    return [];
  }
};

export const getStepResources = async (skill: string, stepTitle: string, searchQuery: string) => {
  try {
    const prompt = `Find 4 high-quality learning resources for this specific topic in a ${skill} learning journey: "${stepTitle}".
    The search query to use as context is: "${searchQuery}".
    
    For each resource, provide:
    1. Title
    2. Type (Video, Article, Course, Documentation)
    3. URL (Use real, popular URLs like MDN, freeCodeCamp, YouTube, etc.)
    4. Description (1 sentence summary)
    5. Difficulty (Beginner, Intermediate, Advanced)
    
    Return as a JSON array of objects.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              url: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["title", "type", "url", "description", "difficulty"]
          }
        }
      }
    });

    return safeParse(response.text, []);
  } catch (err) {
    console.error("Gemini Resources Error:", err);
    return [];
  }
};

export const getTutorResponse = async (question: string, contextSkill: string) => {
  try {
    const prompt = `You are an expert tutor in ${contextSkill}. A student is asking: "${question}". 
    Provide a clear, encouraging, and concise explanation (max 3 sentences). 
    If appropriate, include a code snippet or a concrete example.`;

    return await askGemini(prompt, "flash");
  } catch (err) {
    console.error("Gemini Tutor Error:", err);
    return "I'm having trouble thinking right now. Let's try again in a moment!";
  }
};
