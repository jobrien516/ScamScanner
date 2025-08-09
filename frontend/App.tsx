import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeUrl, analyzeHtml } from '@/services/apiService';
import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AnalysisResultDisplay from '@/components/AnalysisResult';
import Spinner from '@/components/Spinner';

const App: React.FC = () => {
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
    setCurrentUrl('');
  }, []);

    const handleUrlSubmit = useCallback(async (url: string) => {
        setCurrentUrl(url);
        setView(ViewState.LOADING);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeUrl(url);
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
                return <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error} />;
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">{renderContent()}</main>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Powered by Google Gemini.</p>
          <p className="mt-1">&copy; 2025 AI Scam Site Scanner. For educational purposes only.</p>
        </footer>
      </div>
    </div>
  );
};


export default App;
