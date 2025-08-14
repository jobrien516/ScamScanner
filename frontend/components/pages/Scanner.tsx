import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeUrl, startHtmlAnalysis } from '@/services/apiService';
import { useAnalysis } from '@/hooks/useAnalysis';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AnalysisResultDisplay from '@/components/AnalysisResult';
import LoadingDisplay from '@/components/LoadingDisplay';
import HowItWorks from '@/components/HowItWorks';
import { DEMO_SITES } from '@/constants';

const Scanner: React.FC = () => {
  const { view, result, error, progress, isStopped, setView, startAnalysis, resetState, stopScanning } =
    useAnalysis<AnalysisResult>();
  const [currentUrl, setCurrentUrl] = useState('');
  const [scanDepth, setScanDepth] = useState('deep');
  const [useDomainAnalyzer, setUseDomainAnalyzer] = useState(true);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setCurrentUrl(url);
    const normalizedUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    const apiCallPromise = DEMO_SITES[normalizedUrl]
      ? startHtmlAnalysis(DEMO_SITES[normalizedUrl])
      : analyzeUrl(url, scanDepth, useDomainAnalyzer);

    await startAnalysis(apiCallPromise);
  }, [startAnalysis, scanDepth, useDomainAnalyzer]);

  const handleManualSubmit = useCallback(async (html: string) => {
    setCurrentUrl('Manual Submission');
    await startAnalysis(startHtmlAnalysis(html));
  }, [startAnalysis]);

  const handleGoToManual = useCallback(() => setView(ViewState.MANUAL_INPUT), [setView]);

  const renderContent = () => {
    switch (view) {
      case ViewState.START:
        return (
          <div className="space-y-8">
            <HowItWorks />
            <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error}>
              <select
                value={scanDepth}
                onChange={(e) => setScanDepth(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-md py-3 px-4 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              >
                <option value="deep">Deep Scan</option>
                <option value="soft">Soft Scan</option>
              </select>
              <label className="flex items-center text-slate-300 p-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={useDomainAnalyzer}
                  onChange={(e) => setUseDomainAnalyzer(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                />
                Domain Intelligence
              </label>
            </UrlInput>
          </div>
        );
      case ViewState.MANUAL_INPUT:
        return <ManualInput onAnalyze={handleManualSubmit} error={error} url={currentUrl} onBack={resetState} />;
      case ViewState.LOADING:
        return <LoadingDisplay onStop={stopScanning} isStopped={isStopped} onReset={resetState} progressMessages={progress} />;
      case ViewState.RESULT:
        return <AnalysisResultDisplay result={result} error={error} onScanNew={resetState} url={currentUrl} />;
      default:
        return <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error} />;
    }
  };

  return (
    <main className="mt-8">{renderContent()}</main>
  );
};

export default Scanner;
