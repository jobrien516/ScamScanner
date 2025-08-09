import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeUrl, analyzeHtml } from '@/services/apiService';
// import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AnalysisResultDisplay from '@/components/AnalysisResult';
import Spinner from '@/components/Spinner';
import { DEMO_SITES } from '@/constants';
import HowItWorks from '@/components/HowItWorks';

const ScannerPage: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.START);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const resetState = useCallback(() => {
    setView(ViewState.START);
    setAnalysisResult(null);
    setError(null);
    setCurrentUrl('');
  }, []);

  const handleGoToManual = useCallback(() => {
    setView(ViewState.MANUAL_INPUT);
    setError(null);
  }, []);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setCurrentUrl(url);
    setView(ViewState.LOADING);
    setError(null);
    setAnalysisResult(null);

    try {
      const normalizedUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      let result;

      if (DEMO_SITES[normalizedUrl]) {
        const demoHtml = DEMO_SITES[normalizedUrl];
        result = await analyzeHtml(demoHtml);
      } else {
        result = await analyzeUrl(url);
      }
      
      setAnalysisResult(result);
      setView(ViewState.RESULT);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setView(ViewState.START);
    }
  }, []);

  const handleManualSubmit = useCallback(async (html: string) => {
    setView(ViewState.LOADING);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeHtml(html);
      setAnalysisResult(result);
      setView(ViewState.RESULT);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setView(ViewState.MANUAL_INPUT);
    }
  }, []);

  const renderContent = () => {
    switch (view) {
        case ViewState.START:
            return (
                <div className="space-y-8">
                    <HowItWorks />
                    <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error} />
                </div>
            );
        case ViewState.MANUAL_INPUT:
            return <ManualInput onAnalyze={handleManualSubmit} error={error} url={currentUrl} onBack={resetState} />;
        case ViewState.LOADING:
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg">
                    <Spinner />
                    <p className="mt-4 text-lg text-slate-300 animate-pulse">Analyzing...</p>
                </div>
            );
        case ViewState.RESULT:
            return <AnalysisResultDisplay result={analysisResult} error={error} onScanNew={resetState} url={currentUrl} />;
        default:
            return <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error}/>;
    }
  };

  return (
    <>
      {/* <Header /> */}
      <main className="mt-8">{renderContent()}</main>
    </>
  );
};

export default ScannerPage;