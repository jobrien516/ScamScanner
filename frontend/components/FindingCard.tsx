import React from 'react';
import type { AnalysisFinding } from '@/types';
import RiskBadge from './RiskBadge';

interface FindingCardProps {
  finding: AnalysisFinding;
}

const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
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
                    <pre className="mt-1 bg-slate-900 p-3 rounded-md text-xs text-red-300 overflow-x-auto max-h-40 overflow-y-auto">
                        <code>{finding.codeSnippet}</code>
                    </pre>
                </>
            )}
        </div>
    );
};

export default FindingCard;