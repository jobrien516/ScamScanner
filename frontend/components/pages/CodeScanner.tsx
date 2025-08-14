import React, { useState, useCallback } from 'react';
import type { AuditResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeCode } from '@/services/apiService';
import { useAnalysis } from '@/hooks/useAnalysis';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AuditResultDisplay from '@/components/AuditResultDisplay';
import LoadingDisplay from '@/components/LoadingDisplay';

const CodeScanner: React.FC = () => {
    const [currentIdentifier, setCurrentIdentifier] = useState('');
    const { view, result, error, progress, isStopped, setView, startAnalysis, resetState, stopScanning } =
        useAnalysis<AuditResult>();

    const handleUrlSubmit = useCallback(async (url: string) => {
        setCurrentIdentifier(url);
        await startAnalysis(analyzeCode({ url }));
    }, [startAnalysis]);

    const handleManualSubmit = useCallback(async (code: string) => {
        setCurrentIdentifier('Manual Submission');
        await startAnalysis(analyzeCode({ code }));
    }, [startAnalysis]);

    const handleGoToManual = useCallback(() => setView(ViewState.MANUAL_INPUT), [setView]);

    const renderContent = () => {
        switch (view) {
            case ViewState.START:
                return (
                    <UrlInput
                        onScan={handleUrlSubmit}
                        onUploadClick={handleGoToManual}
                        error={error}
                        scanButtonText="Audit Code"
                        label="GitHub Repository URL"
                    />
                );
            case ViewState.MANUAL_INPUT:
                return <ManualInput onAnalyze={handleManualSubmit} error={error} url={currentIdentifier} onBack={resetState} />;
            case ViewState.LOADING:
                return (
                    <LoadingDisplay
                        onStop={stopScanning}
                        isStopped={isStopped}
                        onReset={resetState}
                        progressMessages={progress}
                        title="Code Audit in Progress..."
                        resetButtonText="Start New Audit"
                    />
                );
            case ViewState.RESULT:
                return <AuditResultDisplay result={result} error={error} onScanNew={resetState} identifier={currentIdentifier} />;
            default:
                return <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error} />;
        }
    };

    return (
        <>
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight">
                    Code Scanner
                </h1>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    Enter a URL to a public GitHub repository or upload a local directory to receive a critique of its design and suggestions for improvement.
                </p>
            </header>
            <main className="mt-8">{renderContent()}</main>
        </>
    );
};

export default CodeScanner;
