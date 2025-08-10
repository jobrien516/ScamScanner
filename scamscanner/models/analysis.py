from enum import Enum
from dataclasses import dataclass
from typing import List, Optional


class RiskLevel(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    VERY_HIGH = "Very High"
    UNKNOWN = "Unknown"


@dataclass
class AnalysisFinding:
    category: str
    description: str
    severity: RiskLevel
    codeSnippet: Optional[str] = None


@dataclass
class AnalysisResultFull:
    overallRisk: RiskLevel
    riskScore: int
    summary: str
    detailedAnalysis: List[AnalysisFinding]


class ViewState(Enum):
    START = "START"
    MANUAL_INPUT = "MANUAL_INPUT"
    LOADING = "LOADING"
    RESULT = "RESULT"
