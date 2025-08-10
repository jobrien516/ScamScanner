import type { AnalysisResult } from "@/types";
import { BACKEND_API_URL } from "@/constants";

export class WebsiteFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebsiteFetchError";
  }
}

export async function analyzeWebsiteHtml(
  html: string
): Promise<AnalysisResult> {
  const response = await fetch(`${BACKEND_API_URL}/analyze-html`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new WebsiteFetchError(error.detail || "Failed to analyze HTML.");
  }

  return response.json();
}

export async function analyzeWebsiteViaApi(url: string): Promise<any> {
  const response = await fetch(`${BACKEND_API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new WebsiteFetchError(error.detail || "Failed to analyze website");
  }
  return response.json();
}
