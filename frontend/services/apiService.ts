import type { AnalysisResult } from '@/types';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_API_URL = 'http://127.0.0.1:8000';

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const response = await fetch(`${BASE_API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.detail || 'Analysis failed on the server.');
  }

  return response.json();
}

export async function analyzeHtml(html: string): Promise<AnalysisResult> {
    const response = await fetch(`${BASE_API_URL}/analyze-html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.detail || 'HTML analysis failed on the server.');
    }
  
    return response.json();
  }