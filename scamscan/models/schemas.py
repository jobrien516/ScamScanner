from datetime import datetime

from sqlalchemy import Column, DateTime, String, Integer, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.dialects.postgresql import JSON
from models.analysis import RiskLevel


class Base(DeclarativeBase):
    pass


# class RiskLevel(Enum):
#     LOW = 'Low'
#     MEDIUM = 'Medium'
#     HIGH = 'High'
#     VERY_HIGH = 'Very High'
#     UNKNOWN = 'Unknown'


class AnalysisResultDB(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    site_url = Column(
        String, ForeignKey("sites.url"), nullable=False
    )
    overall_risk = Column(SqlEnum(RiskLevel), nullable=False)
    risk_score = Column(Integer, nullable=False)
    summary = Column(String, nullable=False)
    detailed_analysis = Column(JSON, nullable=False)
    last_analyzed_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    site = relationship("SiteDB", back_populates="analysis_results")


# class AnalysisFindingDB(Base):
#     __tablename__ = "analysis_findings"

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     result_id = Column(Integer, ForeignKey('analysis_results.id'), nullable=False)
#     category = Column(String, nullable=False)
#     description = Column(String, nullable=False)
#     severity = Column(SqlEnum(RiskLevel), nullable=False)
#     code_snippet = Column(String, nullable=True)

#     result = relationship("AnalysisResultDB", back_populates="findings")

# AnalysisResultDB.findings = relationship("AnalysisFindingDB", order_by=AnalysisFindingDB.id, back_populates="result")


class SiteDB(Base):
    __tablename__ = "sites"
    url = Column(String, primary_key=True)
    html = Column(String)

    analysis_results = relationship("AnalysisResultDB", back_populates="site")
