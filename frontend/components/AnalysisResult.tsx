import React from 'react';
import type { AnalysisResult, AnalysisFinding } from '@/types';
import { RiskLevel } from '@/types';
import RiskBadge from './RiskBadge';
import DomainInfoCard from './DomainInfoCard';

interface AnalysisResultProps {
    result: AnalysisResult | null;
    error: string | null;
    onScanNew: () => void;
    url?: string;
}

const RiskScoreGauge: React.FC<{ score: number }> = ({ score }: { score: number; }) => {
    const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
    const getScoreColor = (s: number) => {
        if (s > 80) return 'text-red-500';
        if (s > 55) return 'text-orange-500';
        if (s > 20) return 'text-yellow-500';
        return 'text-green-500';
    };

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (validScore / 100) * circumference;

    return (
        <div className="relative h-32 w-32">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" strokeWidth="12" stroke="currentColor" className="text-slate-700" fill="transparent" />
                <circle cx="60" cy="60" r="52" strokeWidth="12" stroke="currentColor" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${getScoreColor(validScore)} transition-all duration-1000 ease-in-out`}
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
    );
};

const FindingCard: React.FC<{ finding: AnalysisFinding }> = ({ finding }) => {
    return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 transition-all hover:border-slate-600 hover:bg-slate-800/80">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-100">{finding.category}</h3>
                <RiskBadge risk={finding.severity} />
            </div>
            <p className="text-slate-300">{finding.description}</p>
            {finding.codeSnippet && (
                <>
                    {finding.fileName && (
                        <div className="mt-3 text-xs text-slate-400 font-mono break-all">
                           Source: {finding.fileName}
                           {finding.lineNumber && ` (Line: ${finding.lineNumber})`}
                        </div>
                    )}
                    <pre className="mt-1 bg-slate-900 p-3 rounded-md text-xs text-red-300 overflow-x-auto">
                        <code>{finding.codeSnippet}</code>
                    </pre>
                </>
            )}
        </div>
    );
};

const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({ result, error, onScanNew, url }) => {

    if (error) {
        return (
            <div className="text-center bg-slate-800/50 p-8 rounded-xl border border-red-500/50">
                <h2 className="text-2xl font-bold text-red-400">Analysis Failed</h2>
                <p className="mt-2 text-slate-300">{error}</p>
                <button onClick={onScanNew} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md transition duration-200">
                    Try Again
                </button>
            </div>
        )
    }

    if (!result) return null;
    
    const detailedAnalysis = result.detailedAnalysis || [];

    const getRiskMessage = (riskLevel: RiskLevel): string => {
        switch (riskLevel) {
            case RiskLevel.Low:
                return "The risk is low. The website appears to be safe.";
            case RiskLevel.Medium:
                return "The risk is medium. Caution is advised.";
            case RiskLevel.High:
                return "The risk is high. Be careful when interacting with this website.";
            case RiskLevel.VeryHigh:
                return "The risk is very high. It is recommended to avoid this website.";
            case RiskLevel.Unknown:
            default:
                return "The risk level is unknown. Proceed with caution.";
        }
    };

    const riskMessage = getRiskMessage(result.overallRisk);

    const downloadAsMarkdown = () => {
        let markdownContent = `# Analysis for ${url}\n\n**Overall Risk:** ${result.overallRisk}\n\n${riskMessage}\n\n**Summary:**\n\n${result.summary}\n\n## Detailed Findings\n\n`;
        detailedAnalysis.forEach((finding, index) => {
            markdownContent += `### Finding ${index + 1}\n\n- **Category:** ${finding.category}\n- **Severity:** ${finding.severity}\n- **Description:** ${finding.description}\n`;
            if (finding.fileName) {
                markdownContent += `- **Source:** ${finding.fileName}`;
                if (finding.lineNumber) {
                    markdownContent += ` (Line: ${finding.lineNumber})`;
                }
                markdownContent += `\n`;
            }
            if (finding.codeSnippet) {
                markdownContent += `\n**Code Snippet:**\n\`\`\`\n${finding.codeSnippet}\n\`\`\`\n`;
            }
            markdownContent += `\n---\n\n`;
        });

        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'analysis-result.md';
        link.click();
    };

    const downloadAsText = () => {
        let textContent = `Analysis for ${url}\n\nOverall Risk: ${result.overallRisk}\n\n${riskMessage}\n\nSummary:\n\n${result.summary}\n\n--- DETAILED FINDINGS ---\n\n`;
        detailedAnalysis.forEach((finding, index) => {
            textContent += `Finding ${index + 1}:\n`;
            textContent += `Category: ${finding.category}\n`;
            textContent += `Severity: ${finding.severity}\n`;
            textContent += `Description: ${finding.description}\n`;
            if (finding.fileName) {
                textContent += `Source: ${finding.fileName}`;
                if (finding.lineNumber) {
                    textContent += ` (Line: ${finding.lineNumber})`;
                }
                textContent += `\n`;
            }
            if (finding.codeSnippet) {
                textContent += `Code Snippet:\n${finding.codeSnippet}\n`;
            }
            textContent += `\n-------------------------\n\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'analysis-result.txt';
        link.click();
    };

    return (
        <div className="space-y-8 animate-fade-in">
             {url && (
                <div className="pb-4 border-b border-slate-700 text-center">
                    <p className="text-sm text-slate-400">Analysis for:</p>
                    <h2 className="text-xl font-semibold text-slate-200 break-all">{url}</h2>
                </div>
            )}
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">Risk Assessment</h3>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col sm:flex-row gap-6 items-center">
                        <div className="flex-shrink-0">
                            <RiskScoreGauge score={result.riskScore} />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                <h4 className="text-lg font-bold text-slate-100">Overall Risk</h4>
                                <RiskBadge risk={result.overallRisk} />
                            </div>
                            <p className="mt-2 text-slate-300">{riskMessage}</p>
                            <p className="mt-2 text-slate-300">{result.summary}</p>
                        </div>
                    </div>
                </div>

                {result.domainInfo && (
                    <DomainInfoCard info={result.domainInfo} />
                )}
            </div>


            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-200">Detailed AI Findings</h3>
                {detailedAnalysis.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {detailedAnalysis.map((finding, index) => (
                            <FindingCard key={index} finding={finding} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-slate-300">No specific issues found. The website appears to be safe.</p>
                    </div>
                )}
            </div>

            <div className="text-center pt-4">
                <button onClick={onScanNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-200">
                    Scan Another Site
                </button>
                <div className="flex items-center justify-center mt-4">
                    <div className="border-t border-slate-700 w-1/4"></div>
                    <div className="border-t border-slate-700 w-1/4"></div>
                </div>
                <div className="mt-4">
                    <h4 className="text-lg font-semibold text-slate-200">Download Results</h4>
                    <div className="mt-2 space-x-2">
                        <button onClick={downloadAsMarkdown} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
                            .md
                        </button>
                        <button onClick={downloadAsText} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
                            .txt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResultDisplay;