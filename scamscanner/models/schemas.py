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
    """Represents an analysis result as a database table."""

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


class SubPage(SQLModel, table=True):
    """Represents a sub-page of a website."""

    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(unique=True, index=True)
    content: str
    site_id: int = Field(foreign_key="site.id")
    site: "Site" = Relationship(back_populates="sub_pages")


class Site(SQLModel, table=True):
    """Represents a website to be scanned."""

    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(unique=True, index=True)

    sub_pages: List["SubPage"] = Relationship(back_populates="site")
    analysis_results: List["AnalysisResult"] = Relationship(back_populates="site")


class UrlRequest(SQLModel):
    """Pydantic model for URL-based requests."""

    url: str
    scan_depth: Optional[str] = "deep"


class HtmlRequest(SQLModel):
    """Pydantic model for HTML content-based requests."""

    html: str


class Settings(SQLModel, table=True):
    """Stores application settings in the database."""
    id: Optional[int] = Field(default=1, primary_key=True)
    gemini_api_key: Optional[str] = None
    max_output_tokens: int = 8192

# Resolve forward references to help type checkers
AnalysisResult.model_rebuild()
SubPage.model_rebuild()
Site.model_rebuild()
Settings.model_rebuild()