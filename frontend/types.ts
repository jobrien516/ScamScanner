export enum RiskLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  VeryHigh = "Very High",
  Unknown = "Unknown",
}

export interface AnalysisFinding {
  category: string;
  description: string;
  severity: RiskLevel;
  codeSnippet?: string;
  fileName?: string;
  lineNumber?: number;
}

export interface DomainInfo {
  registrar?: string;
  creation_date?: string;
  expiration_date?: string;
  domain_age_days?: number;
}

export interface AnalysisResult {
  overallRisk: RiskLevel;
  riskScore: number;
  summary: string;
  detailedAnalysis: AnalysisFinding[];
  domainInfo?: DomainInfo;
  id?: number;
  site_url?: string;
  last_analyzed_at?: string;
}
export interface HistoryAnalysisResult extends AnalysisResult {
  id: number;
  site_url: string;
  last_analyzed_at: string;
}

export enum ViewState {
  START = "START",
  MANUAL_INPUT = "MANUAL_INPUT",
  LOADING = "LOADING",
  RESULT = "RESULT",
}
