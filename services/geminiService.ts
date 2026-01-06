
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

/**
 * Performs an AI-driven operational audit of project tasks using Gemini.
 */
export async function analyzeProjectHealth(tasks: Task[]) {
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

    return response.text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "The project intelligence stream is temporarily unavailable. Please retry the audit shortly.";
  }
}

/**
 * Autonomous AI Sentinel: Scans for specific operational anomalies.
 * Returns a list of structured alerts.
 */
export async function runSentinelAnalysis(tasks: Task[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as the BPD Autonomous AI Sentinel. Analyze the current task registry for anomalies and risks.
    Focus on:
    - Stale tasks: In Progress for too long with low progress.
    - Deadline Slippage: Low progress vs remaining time.
    - Missing Documentation: Complex tasks with no updates.
    - Dependency Deadlocks: Circular or stuck blockers.

    Current Task Data: ${JSON.stringify(tasks.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status,
      progress: t.progress,
      end: t.plannedEndDate,
      lastUpdate: t.updatedAt,
      owner: t.assignedTo
    })))}

    Return exactly 2-3 highest-priority alerts in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an autonomous background observer. Identify high-leverage anomalies. Respond ONLY with a JSON array of objects, each containing 'title' and 'message' (1 sentence max each).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              message: { type: Type.STRING }
            },
            required: ["title", "message"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results;
  } catch (error) {
    console.error("Sentinel Analysis error:", error);
    return [];
  }
}
