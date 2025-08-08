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
class AnalysisResult:
    overallRisk: RiskLevel
    riskScore: int
    summary: str
    detailedAnalysis: List[AnalysisFinding]


# @dataclass
# class AnalysisFinding:
#     category: str
#     description: str
#     severity: RiskLevel
#     codeSnippet: Optional[str] = None

# @dataclass
# class AnalysisResult:
#     overallRisk: RiskLevel
#     riskScore: int
#     summary: str
#     detailedAnalysis: List[AnalysisFinding]

# @dataclass
# class AnalysisFinding:
#     indicator: str
#     severity: str
#     details: str

# @dataclass
# class AnalysisCategory:
#     phishing_techniques: List[AnalysisFinding] = field(default_factory=list)
#     malicious_scripts: List[AnalysisFinding] = field(default_factory=list)
#     deceptive_content: List[AnalysisFinding] = field(default_factory=list)
#     misleading_links_redirects: List[AnalysisFinding] = field(default_factory=list)
#     technical_red_flags: List[AnalysisFinding] = field(default_factory=list)
#     poor_code_quality: List[AnalysisFinding] = field(default_factory=list)

# @dataclass
# class AnalysisResult:
#     analysis: AnalysisCategory
#     overall_risk_assessment: Optional[str] = None
#     risk_assessment: Optional[str] = None
#     recommendation: Optional[str] = None

# @dataclass
# class AnalysisFindings:
#     category: str
#     description: str
#     severity: RiskLevel
#     code_snippet: Optional[str] = None

# @dataclass
# class AnalysisResponse:
#     overall_risk: RiskLevel
#     risk_score: int
#     summary: str
#     detailed_analysis: List[AnalysisFindings]


class ViewState(Enum):
    START = "START"
    MANUAL_INPUT = "MANUAL_INPUT"
    LOADING = "LOADING"
    RESULT = "RESULT"
