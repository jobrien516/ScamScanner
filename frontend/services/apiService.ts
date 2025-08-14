import { BACKEND_API_URL } from "@/constants";
import type { HistoryAnalysisResult, AppSettings } from "@/types";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || `Failed to fetch ${endpoint}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in fetchApi for endpoint ${endpoint}:`, error);
    throw error;
  }
}

export const getHistory = (): Promise<HistoryAnalysisResult[]> =>
  fetchApi("/history");

export const analyzeUrl = (
  url: string,
  scan_depth: string,
  use_domain_analyzer: boolean
): Promise<{ job_id: string }> =>
  fetchApi("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, scan_depth, use_domain_analyzer }),
  });

export const startHtmlAnalysis = (html: string): Promise<{ job_id: string }> =>
  fetchApi("/analyze-html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });

export const analyzeSecrets = (payload: {
  content?: string;
  url?: string;
}): Promise<{ job_id: string }> =>
  fetchApi("/analyze-secrets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const analyzeCode = (payload: {
  url?: string;
  code?: string;
}): Promise<{ job_id: string }> =>
  fetchApi("/analyze-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const getSettings = (): Promise<AppSettings> => fetchApi("/settings");

export const updateSettings = (settings: AppSettings): Promise<AppSettings> =>
  fetchApi("/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
