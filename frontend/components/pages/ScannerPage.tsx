import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AnalysisResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeUrl, startHtmlAnalysis } from '@/services/apiService';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AnalysisResultDisplay from '@/components/AnalysisResult';
import Spinner from '@/components/Spinner';
import { DEMO_SITES } from '@/constants';
import HowItWorks from '@/components/HowItWorks';
import WebSocketProgressLog from '@/components/WSProgressLog';

const getWebSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return apiUrl.replace(/^http/, 'ws');
};

const ScannerPage: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.START);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [progress, setProgress] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    wsRef.current = new WebSocket(`${getWebSocketURL()}/ws/${jobId}`);
    let analysisCompleted = false;

    const handleError = (message: string) => {
        setError(message);
        setView(ViewState.START);
        analysisCompleted = true;
    };

    wsRef.current.onopen = () => {
      setProgress(['Connection established. Starting scan...']);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAnalysisResult(data);
        setView(ViewState.RESULT);
        analysisCompleted = true;
      } catch {
        const message = event.data as string;
        if (message.toLowerCase().includes('error')) {
          handleError(message);
        } else {
          setProgress(prev => [...prev, message]);
        }
      }
    };

    wsRef.current.onerror = () => {
      handleError('A WebSocket connection error occurred. Please try again.');
    };
    
    wsRef.current.onclose = () => {
      if (!analysisCompleted && !isStopped) {
        handleError('The analysis was interrupted unexpectedly. Please try again.');
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [jobId, isStopped]);

  const startAnalysis = useCallback(() => {
    setView(ViewState.LOADING);
    setError(null);
    setProgress([]);
    setAnalysisResult(null);
    setJobId(null);
    setIsStopped(false);
  }, []);

  const handleUrlSubmit = useCallback(async (url: string) => {
    startAnalysis();
    setCurrentUrl(url);

    try {
      const normalizedUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      
      const response = DEMO_SITES[normalizedUrl] 
        ? await startHtmlAnalysis(DEMO_SITES[normalizedUrl])
        : await analyzeUrl(url);

      setJobId(response.job_id);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setView(ViewState.START);
    }
  }, [startAnalysis]);

  const handleManualSubmit = useCallback(async (html: string) => {
    startAnalysis();
    setCurrentUrl('Manual Submission');

    try {
      const { job_id } = await startHtmlAnalysis(html);
      setJobId(job_id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setView(ViewState.MANUAL_INPUT);
    }
  }, [startAnalysis]);

  const resetState = useCallback(() => {
    setView(ViewState.START);
    setAnalysisResult(null);
    setError(null);
    setCurrentUrl('');
    setJobId(null);
    setProgress([]);
    setIsStopped(false);
  }, []);

  const handleGoToManual = useCallback(() => {
    setView(ViewState.MANUAL_INPUT);
    setError(null);
  }, []);

  const handleStopScanning = () => {
    setIsStopped(true);
    wsRef.current?.close();
    setProgress(prev => [...prev, 'Scan cancelled by user.']);
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.START:
        return (
          <div className="space-y-8">
            <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error} />
            <HowItWorks />
          </div>
        );
      case ViewState.MANUAL_INPUT:
        return <ManualInput onAnalyze={handleManualSubmit} error={error} url={currentUrl} onBack={resetState} />;
      case ViewState.LOADING:
        return (
          <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
            <div className="flex items-center justify-center mb-6">
              {!isStopped && <Spinner />}
              <h2 className="ml-4 text-xl text-slate-200">
                {isStopped ? 'Scan Cancelled' : 'Analysis in Progress...'}
              </h2>
            </div>
            
            <div className="mb-6 text-center">
              {isStopped ? (
                <button
                  onClick={resetState}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-200 shadow-lg hover:shadow-blue-500/30"
                >
                  Scan New Site
                </button>
              ) : (
                <button
                  onClick={handleStopScanning}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-md transition duration-200 shadow-lg hover:shadow-red-500/30"
                >
                  Stop Scanning
                </button>
              )}
            </div>

            <WebSocketProgressLog messages={progress} />
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
      <main className="mt-8">{renderContent()}</main>
    </>
  );
};

export default ScannerPage;