import { BACKEND_API_URL } from "@/constants";
import { AppSettings, HistoryAnalysisResult } from "@/types";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
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
  fetchApi("/history") as Promise<HistoryAnalysisResult[]>;

export const analyzeUrl = (
  url: string,
  scan_depth: string,
  use_domain_analyzer: boolean
): Promise<{ job_id: string }> =>
  fetchApi("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, scan_depth, use_domain_analyzer }),
  }) as Promise<{ job_id: string }>;

export const startHtmlAnalysis = (html: string): Promise<{ job_id: string }> =>
  fetchApi("/analyze-html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  }) as Promise<{ job_id: string }>;

export const analyzeSecrets = (payload: {
  content?: string;
  url?: string;
}): Promise<{ job_id: string }> =>
  fetchApi("/analyze-secrets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<{ job_id: string }>;

export const analyzeCode = (payload: {
  url?: string;
  code?: string;
}): Promise<{ job_id: string }> =>
  fetchApi("/analyze-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<{ job_id: string }>;

export const getSettings = (): Promise<AppSettings> => fetchApi("/settings") as Promise<AppSettings>;

export const updateSettings = (settings: AppSettings): Promise<AppSettings> =>
  fetchApi("/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  }) as Promise<AppSettings>;
