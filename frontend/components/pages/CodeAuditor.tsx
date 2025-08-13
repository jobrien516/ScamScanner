import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { AuditResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeCode } from '@/services/apiService';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AuditResultDisplay from '@/components/AuditResultDisplay';
import Spinner from '@/components/Spinner';
import WebSocketProgressLog from '@/components/WSProgressLog';
import { BACKEND_API_URL } from '@/constants';

const getWebSocketURL = () => {
    return BACKEND_API_URL.replace(/^http/, 'ws');
};

const CodeAuditor: React.FC = () => {
    const [view, setView] = useState<ViewState>(ViewState.START);
    const [analysisResult, setAnalysisResult] = useState<AuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentIdentifier, setCurrentIdentifier] = useState<string>('');
    const [progress, setProgress] = useState<string[]>([]);
    const [jobId, setJobId] = useState<string | null>(null);
    const [isStopped, setIsStopped] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    const startAnalysis = useCallback(async (payload: { url?: string; code?: string }) => {
        setView(ViewState.LOADING);
        setError(null);
        setProgress([]);
        setAnalysisResult(null);
        setJobId(null);
        setIsStopped(false);
        setCurrentIdentifier(payload.url || 'Local Upload');

        try {
            const { job_id } = await analyzeCode(payload);
            setJobId(job_id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setView(ViewState.START);
        }
    }, []);

    const resetState = useCallback(() => {
        setView(ViewState.START);
        setAnalysisResult(null);
        setError(null);
        setJobId(null);
        setProgress([]);
        setIsStopped(false);
        setCurrentIdentifier('');
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
            setProgress(['Connection established. Starting code audit...']);
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

    const renderContent = () => {
        switch (view) {
            case ViewState.START:
                return (
                    <UrlInput
                        onScan={(url) => startAnalysis({ url })}
                        onUploadClick={handleGoToManual}
                        error={error}
                        showOptions={false}
                    />
                );
            case ViewState.MANUAL_INPUT:
                return <ManualInput onAnalyze={(code) => startAnalysis({ code })} error={error} url="" onBack={resetState} />;
            case ViewState.LOADING:
                return (
                    <div className="bg-slate-800/50 p-6 max-w-3xl mx-auto sm:p-8 rounded-xl shadow-2xl border border-slate-700">
                        <div className="flex items-center justify-center mb-6">
                            {!isStopped && <Spinner />}
                            <h2 className="ml-4 text-xl text-slate-200">
                                {isStopped ? 'Scan Cancelled' : 'Analysis in Progress...'}
                            </h2>
                        </div>
                        <div className="mb-6 max-w-5xl text-blue-700 mx-auto text-center">
                            {isStopped ? (
                                <button
                                    onClick={resetState}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-200 shadow-lg hover:shadow-blue-500/30"
                                >
                                    Start New Audit
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
                return <AuditResultDisplay result={analysisResult} error={error} onScanNew={resetState} identifier={currentIdentifier} />;
            default:
                return <UrlInput onScan={(url) => startAnalysis({ url })} onUploadClick={() => { }} error={error} showOptions={false} />;
        }
    };

    return (
        <>
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight">
                    Code Auditor
                </h1>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    Enter a URL to a public GitHub repository or upload a local directory to receive a critique of its design and suggestions for improvement.
                </p>
            </header>
            <main className="mt-8">{renderContent()}</main>
        </>
    );
};

export default CodeAuditor;