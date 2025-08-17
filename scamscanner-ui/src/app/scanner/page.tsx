"use client";

import { useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAnalysis } from "@/hooks/useAnalysis";
import { analyzeUrl } from "@/services/apiService";
import { AnalysisResult as AnalysisResultType } from "@/types";
import { AnalysisResult } from "@/components/shared/AnalysisResult";
import { UrlInput } from "@/components/shared/UrlInput";
import { LoadingDisplay } from "@/components/shared/LoadingDisplay";

// A map to translate progress messages into percentage values
const progressSteps: { [key: string]: number } = {
    "Connection established": 5,
    "Crawling": 10, // Crawling will be handled dynamically
    "Crawl complete": 50,
    "Performing domain intelligence lookup": 60,
    "Scanning for exposed secrets": 75,
    "Analyzing for malicious patterns": 90,
};

export default function ScannerPage() {
    const [url, setUrl] = useState("");
    const { startAnalysis, result, error, progress, isStopped, stopScanning, resetState } =
        useAnalysis<AnalysisResultType>();

    const handleScan = () => {
        if (url) {
            startAnalysis(() => analyzeUrl(url, "deep", true));
        }
    };

    const progressValue = useMemo(() => {
        if (result || error) return 100;
        if (progress.length === 0) return 0;

        const lastMessage = progress[progress.length - 1];
        let currentProgress = 0;

        for (const step in progressSteps) {
            if (lastMessage.includes(step)) {
                currentProgress = progressSteps[step];
            }
        }

        if (lastMessage.includes("Crawling")) {
            const crawlingMessages = progress.filter((p) => p.includes("Crawling")).length;
            currentProgress += Math.min(crawlingMessages * 2, 40);
        }

        return currentProgress;
    }, [progress, result, error]);

    const isLoading = progress.length > 0 && !result && !error;

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Scan a Website</CardTitle>
                    <CardDescription>
                        Enter a URL to begin the analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UrlInput
                        value={url}
                        onChange={setUrl}
                        onSubmit={handleScan}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {isLoading && (
                <div className="mt-4">
                    <LoadingDisplay
                        messages={progress}
                        progress={progressValue}
                        onStop={stopScanning}
                        onReset={resetState}
                        isStopped={isStopped}
                    />
                </div>
            )}

            {result && (
                <div className="mt-4">
                    <AnalysisResult result={result} />
                </div>
            )}

            {error && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">{error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
