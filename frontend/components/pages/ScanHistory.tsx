import React, { useState, useEffect } from 'react';
import { getHistory } from '@/services/apiService';
import type { HistoryAnalysisResult } from '@/types';
import RiskBadge from '@/components/RiskBadge';
import Spinner from '@/components/Spinner';

const HistoryItem: React.FC<{ result: HistoryAnalysisResult }> = ({ result }) => {
  return (
    <div className="bg-slate-800/50 p-4 max-w-5xl mx-auto rounded-lg border border-slate-700 flex justify-between items-center">
      <div>
        <p className="font-mono text-blue-300 break-all">{result.site_url}</p>
        <p className="text-sm text-slate-400 mt-1">
          Scanned on: {new Date(result.last_analyzed_at).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <RiskBadge risk={result.overallRisk} />
        <p className="text-sm text-slate-300 mt-1">Score: {result.riskScore}</p>
      </div>
    </div>
  );
};

const ScanHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to load analysis history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }

    if (history.length === 0) {
      return <p className="text-center text-slate-400">No analysis history found.</p>;
    }

    return (
      <div className="space-y-4">
        {history.map((result) => (
          <HistoryItem key={result.id} result={result} />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-100 mb-6 text-center">Analysis History</h1>
      {renderContent()}
    </div>
  );
};

export default ScanHistory;