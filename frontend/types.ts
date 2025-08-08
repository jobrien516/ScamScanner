export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'Very High',
  Unknown = 'Unknown',
}

export interface AnalysisFinding {
  category: string;
  description: string;
  severity: RiskLevel;
  codeSnippet?: string;
}

export interface AnalysisResult {
  overallRisk: RiskLevel;
  riskScore: number;
  summary: string;
  detailedAnalysis: AnalysisFinding[];
}

export enum ViewState {
    START = 'START',
    MANUAL_INPUT = 'MANUAL_INPUT',
    LOADING = 'LOADING',
    RESULT = 'RESULT',
}
