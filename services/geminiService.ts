
import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

// Always created per-request for most up-to-date configuration.

/**
 * Performs an AI-driven operational audit of project tasks using Gemini.
 */
export async function analyzeProjectHealth(tasks: Task[]) {
  // Initialize SDK right before the call to handle potentially dynamic environment configurations.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Perform a professional operational audit of the following BPD (Broadband Policy & Development) tasks:
    
    1. Identify 'Critical Path' blockers (Tasks with 0% progress).
    2. Flags tasks that are nearing their planned end dates but are not yet 'COMPLETED'.
    3. Suggest a 3-step action plan for the team lead based on the distribution of workload.
    
    Task Registry: ${JSON.stringify(tasks.map(t => ({ 
      name: t.name, 
      status: t.status, 
      progress: t.progress, 
      end: t.plannedEndDate,
      assignedTo: t.assignedTo
    })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Chief Operational Officer for the BPD team. Your tone is authoritative, efficient, and data-centric. Format the output with clear bullet points."
      }
    });

    // Accessing .text directly as a property, per the latest Google GenAI SDK rules.
    return response.text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "The project intelligence stream is temporarily unavailable. Please retry the audit shortly.";
  }
}
