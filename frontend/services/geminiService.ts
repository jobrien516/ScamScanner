import { GoogleGenAI } from "@google/genai";
import { ANALYSIS_PROMPT, ANALYSIS_SCHEMA } from '@/constants';
import type { AnalysisResult } from '@/types';
import { RiskLevel } from '@/types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please configure your API key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeWebsiteHtml(html: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${ANALYSIS_PROMPT}\n\nHTML CODE:\n\`\`\`html\n${html}\n\`\`\``,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI returned an empty response. Please try again.");
    }
    const result: AnalysisResult = JSON.parse(jsonText);

    // Validate and sanitize the result to ensure it matches our types
    if (!result.detailedAnalysis) {
      result.detailedAnalysis = [];
    }
    if (!Object.values(RiskLevel).includes(result.overallRisk)) {
      result.overallRisk = RiskLevel.Unknown;
    }
    result.detailedAnalysis.forEach(finding => {
      if (!Object.values(RiskLevel).includes(finding.severity)) {
        finding.severity = RiskLevel.Unknown;
      }
    });

    return result;

  } catch (error) {
    console.error("Error analyzing website with Gemini:", error);
    if (error instanceof SyntaxError) {
      throw new Error("AI returned invalid analysis data. Please try again.");
    }
    if (error instanceof Error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI analysis.");
  }
}
