from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, JSON, Column
from enum import Enum as PyEnum


class RiskLevel(str, PyEnum):
    """Enumeration for risk levels."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    VERY_HIGH = "Very High"
    UNKNOWN = "Unknown"


# --- Models for Scam Scanner ---


class AnalysisFinding(SQLModel):
    """Represents a single finding in a website analysis. Not a table model."""

    category: str
    description: str
    severity: RiskLevel
    codeSnippet: Optional[str] = None
    fileName: Optional[str] = None
    lineNumber: Optional[int] = None


class DomainInfo(SQLModel):
    """Represents WHOIS and domain information. Not a table model."""

    registrar: Optional[str] = None
    creation_date: Optional[str] = None
    expiration_date: Optional[str] = None
    domain_age_days: Optional[int] = None


class AnalysisResult(SQLModel, table=True):
    """Represents a scam analysis result as a database table."""

    id: Optional[int] = Field(default=None, primary_key=True)
    site_url: str = Field(index=True)
    overallRisk: RiskLevel
    riskScore: int
    summary: str
    detailedAnalysis: List[AnalysisFinding] = Field(default=[], sa_column=Column(JSON))
    domainInfo: Optional[DomainInfo] = Field(default=None, sa_column=Column(JSON))
    last_analyzed_at: datetime = Field(default_factory=datetime.now, index=True)
    site_id: int = Field(foreign_key="site.id")
    site: "Site" = Relationship(back_populates="analysis_results")


# --- Models for Code Auditor ---


class AuditFinding(SQLModel):
    """Represents a single finding in a code audit. Not a table model."""

    category: str
    description: str
    recommendation: str
    severity: str
    codeSnippet: Optional[str] = None
    fileName: Optional[str] = None
    lineNumber: Optional[int] = None


class AuditResult(SQLModel, table=True):
    """Represents a code audit result as a database table."""

    id: Optional[int] = Field(default=None, primary_key=True)
    source_identifier: str = Field(index=True)
    overallGrade: str
    qualityScore: int
    summary: str
    detailedAnalysis: List[AuditFinding] = Field(default=[], sa_column=Column(JSON))
    last_analyzed_at: datetime = Field(default_factory=datetime.now, index=True)
    site_id: int = Field(foreign_key="site.id")
    site: "Site" = Relationship(back_populates="audit_results")


# --- Common and Request Models ---


class SubPage(SQLModel, table=True):
    """Represents a sub-page of a website."""

    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(unique=True, index=True)
    content: str
    site_id: int = Field(foreign_key="site.id")
    site: "Site" = Relationship(back_populates="sub_pages")


class Site(SQLModel, table=True):
    """Represents a website or code source to be scanned."""

    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(unique=True, index=True)
    sub_pages: List["SubPage"] = Relationship(back_populates="site")
    analysis_results: List["AnalysisResult"] = Relationship(back_populates="site")
    audit_results: List["AuditResult"] = Relationship(back_populates="site")


class UrlRequest(SQLModel):
    url: str
    scan_depth: Optional[str] = "deep"
    use_domain_analyzer: Optional[bool] = True


class HtmlRequest(SQLModel):
    html: str


class SecretsRequest(SQLModel):
    content: Optional[str] = None
    url: Optional[str] = None


class CodeAuditRequest(SQLModel):
    """Pydantic model for code audit requests."""

    url: Optional[str] = None
    code: Optional[str] = None


class Settings(SQLModel, table=True):
    id: Optional[int] = Field(default=1, primary_key=True)
    gemini_api_key: Optional[str] = None
    max_output_tokens: int = 8192
    default_use_secrets_scanner: bool = Field(default=True)
    default_use_domain_analyzer: bool = Field(default=True)


# Resolve forward references
AnalysisResult.model_rebuild()
AuditResult.model_rebuild()
SubPage.model_rebuild()
Site.model_rebuild()
Settings.model_rebuild()
