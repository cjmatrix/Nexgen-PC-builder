const apiKey = process.env.GEMINI_API_KEY;

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(apiKey);

async function generateResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

export { generateResponse, ai };
