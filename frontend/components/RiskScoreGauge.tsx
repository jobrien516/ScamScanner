import React from 'react';

interface RiskScoreGaugeProps {
    score: number;
}

const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score }) => {
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

export default RiskScoreGauge;