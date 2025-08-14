import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/types';
import { ViewState } from '@/types';
import { analyzeSecrets } from '@/services/apiService';
import { useAnalysis } from '@/hooks/useAnalysis';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import AnalysisResultDisplay from '@/components/AnalysisResult';
import LoadingDisplay from '@/components/LoadingDisplay';

const SecretsScanner: React.FC = () => {
    const [currentIdentifier, setCurrentIdentifier] = useState('');
    const {
        view,
        result,
        error,
        progress,
        isStopped,
        setView,
        startAnalysis,
        resetState,
        stopScanning
    } = useAnalysis<AnalysisResult>();

    const handleUrlSubmit = useCallback(async (url: string) => {
        setCurrentIdentifier(url);
        // The component calls the API and passes the resulting promise to the hook
        await startAnalysis(analyzeSecrets({ url }));
    }, [startAnalysis]);

    const handleManualSubmit = useCallback(async (content: string) => {
        setCurrentIdentifier('Manual Submission');
        await startAnalysis(analyzeSecrets({ content }));
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
                        scanButtonText="Scan for Secrets"
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
                        resetButtonText="Scan Again"
                    />
                );
            case ViewState.RESULT:
                return <AnalysisResultDisplay result={result} error={error} onScanNew={resetState} url={currentIdentifier} />;
            default:
                return <UrlInput onScan={handleUrlSubmit} onUploadClick={handleGoToManual} error={error} scanButtonText="Scan for Secrets" />;
        }
    };

    return (
        <>
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight">
                    Secrets Scanner
                </h1>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    Analyze a single webpage or pasted code to find exposed secrets like API keys and credentials.
                </p>
            </header>
            <main className="mt-8">{renderContent()}</main>
        </>
    );
};

export default SecretsScanner;
