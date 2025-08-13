import React from 'react';
import type { AuditResult } from '@/types';
import RiskScoreGauge from './RiskScoreGauge';
import Card from './Card';

interface AuditFindingCardProps {
    finding: AuditResult['detailedAnalysis'][0];
}

const AuditFindingCard: React.FC<AuditFindingCardProps> = ({ finding }) => {
    const severityColors = {
        Low: 'border-blue-500',
        Medium: 'border-yellow-500',
        High: 'border-red-500',
    };
    return (
        <div className={`bg-slate-800 rounded-lg p-4 border-l-4 ${severityColors[finding.severity]}`}>
            <h3 className="text-lg font-semibold text-slate-100">{finding.category}</h3>
            <p className="text-sm text-slate-400 mb-2">Severity: {finding.severity}</p>
            <p className="text-slate-300 mb-2"><strong className="text-slate-100">Description:</strong> {finding.description}</p>
            <p className="text-slate-300"><strong className="text-slate-100">Recommendation:</strong> {finding.recommendation}</p>
            {finding.codeSnippet && (
                <>
                    {finding.fileName && (
                        <div className="mt-3 text-xs text-slate-400 font-mono break-all">
                            Source: {finding.fileName}
                            {finding.lineNumber && ` (Line: ${finding.lineNumber})`}
                        </div>
                    )}
                    <pre className="mt-1 bg-slate-900 p-3 rounded-md text-xs text-yellow-300 overflow-x-auto max-h-40 overflow-y-auto">
                        <code>{finding.codeSnippet}</code>
                    </pre>
                </>
            )}
        </div>
    );
};


interface AuditResultProps {
    result: AuditResult | null;
    error: string | null;
    onScanNew: () => void;
    identifier?: string;
}

const AuditResultDisplay: React.FC<AuditResultProps> = ({ result, error, onScanNew, identifier }) => {

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

    return (
        <div className="space-y-8 animate-fade-in">
            {identifier && (
                <div className="pb-4 border-b border-slate-700 text-center">
                    <p className="text-sm text-slate-400">Audit for:</p>
                    <h2 className="text-xl font-semibold text-slate-200 break-all">{identifier}</h2>
                </div>
            )}

            <Card>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="flex-shrink-0">
                        <RiskScoreGauge score={result.qualityScore} />
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold text-slate-100">Overall Quality Grade: <span className="text-2xl text-blue-400">{result.overallGrade}</span></h4>
                        <p className="mt-2 text-slate-300">{result.summary}</p>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-200">Detailed Findings & Recommendations</h3>
                {detailedAnalysis.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {detailedAnalysis.map((finding, index) => (
                            <AuditFindingCard key={index} finding={finding} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-slate-300">No specific issues found. The code appears to be of high quality.</p>
                    </div>
                )}
            </div>

            <div className="text-center pt-4">
                <button onClick={onScanNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-200">
                    Audit Another Project
                </button>
            </div>
        </div>
    );
};

export default AuditResultDisplay;