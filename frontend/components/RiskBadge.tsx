import React from 'react';
import { RiskLevel } from '@/types';

interface RiskBadgeProps {
    risk: RiskLevel;
    large?: boolean;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, large = false }) => {
    const baseClasses = 'font-bold rounded-full inline-block';
    const sizeClasses = large ? 'px-4 py-1 text-base' : 'px-2.5 py-0.5 text-sm';

    const riskStyles: { [key in RiskLevel]: string } = {
        [RiskLevel.Low]: 'bg-green-800/80 text-green-200 border border-green-600',
        [RiskLevel.Medium]: 'bg-yellow-800/80 text-yellow-200 border border-yellow-600',
        [RiskLevel.High]: 'bg-orange-800/80 text-orange-200 border border-orange-600',
        [RiskLevel.VeryHigh]: 'bg-red-800/80 text-red-200 border border-red-600',
        [RiskLevel.Unknown]: 'bg-slate-700 text-slate-200 border border-slate-500',
    };

    return (
        <span className={`${baseClasses} ${sizeClasses} ${riskStyles[risk] || riskStyles[RiskLevel.Unknown]}`}>
            {risk}
        </span>
    );
};

export default RiskBadge;
