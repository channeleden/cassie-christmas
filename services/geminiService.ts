
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getGameOverMessage(score: number): Promise<string> {
  const graduationThreshold = 5;
  const isGraduated = score >= graduationThreshold;
  
  const prompt = isGraduated 
    ? `The player just scored ${score} in "Flappy Cassie". Cassie ALREADY GRADUATED (reached score > 5). Give a celebratory, super girly, sassy game over message (max 10 words). Use emojis like 🎓💅✨.`
    : `The player just scored ${score} in "Flappy Cassie". Cassie hasn't graduated yet (needs 5 points). Give a supportive, girly, "keep studying" game over message (max 10 words). Use emojis like 📚💖🎀.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (isGraduated ? "You graduated but crashed! 🎓🎀" : "Back to the library, babe! 📚💖");
  } catch (error) {
    console.error("Gemini failed:", error);
    return isGraduated ? "Degree secured, landing... not so much! 🎓" : "Almost graduate status! 💖";
  }
}
