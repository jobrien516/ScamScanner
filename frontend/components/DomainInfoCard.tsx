import React from 'react';
import type { DomainInfo } from '@/types';

interface DomainInfoCardProps {
  info: DomainInfo;
}

const InfoRow: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between border-t border-slate-700 py-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-mono text-slate-200">{value}</dd>
    </div>
  );
};

const DomainInfoCard: React.FC<DomainInfoCardProps> = ({ info }) => {
  return (
    <div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Domain Information</h3>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <dl>
                <InfoRow label="Registrar" value={info.registrar} />
                <InfoRow label="Registered On" value={info.creation_date ? new Date(info.creation_date).toLocaleDateString() : 'N/A'} />
                <InfoRow label="Expires On" value={info.expiration_date ? new Date(info.expiration_date).toLocaleDateString() : 'N/A'} />
                <InfoRow label="Domain Age" value={info.domain_age_days !== undefined ? `${info.domain_age_days} days` : 'N/A'} />
            </dl>
        </div>
    </div>
  );
};

export default DomainInfoCard;