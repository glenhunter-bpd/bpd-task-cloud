
import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeProjectHealth(tasks: Task[]) {
  const prompt = `
    Analyze the following BPD tasks and provide a concise status report.
    Highlight:
    1. Critical blockers (tasks with 0% progress past start date).
    2. Overdue tasks.
    3. Suggested priorities for the next 2 weeks.
    
    Task Data: ${JSON.stringify(tasks.map(t => ({ name: t.name, status: t.status, progress: t.progress, end: t.plannedEndDate })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert project management consultant for the Broadband Policy and Development team. Keep your response professional, data-driven, and actionable."
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Failed to generate AI insights. Please check your connection.";
  }
}
