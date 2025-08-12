import { BACKEND_API_URL } from "@/constants";
import type { HistoryAnalysisResult, AppSettings } from "@/types";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const getHistory = async (): Promise<HistoryAnalysisResult[]> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/history`);
    if (!response.ok) {
      throw new Error("Failed to fetch analysis history");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getHistory:", error);
    throw error;
  }
};

export const analyzeUrl = async (
  url: string,
  scan_depth: string
): Promise<{ job_id: string }> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, scan_depth }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to start URL analysis");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in analyzeUrl:", error);
    throw error;
  }
};

export const startHtmlAnalysis = async (
  html: string
): Promise<{ job_id: string }> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/analyze-html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to start HTML analysis");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in startHtmlAnalysis:", error);
    throw error;
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/settings`);
    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getSettings:", error);
    throw error;
  }
};

export const updateSettings = async (
  settings: AppSettings
): Promise<AppSettings> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update settings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in updateSettings:", error);
    throw error;
  }
};
