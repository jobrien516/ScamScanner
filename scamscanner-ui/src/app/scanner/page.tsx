"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAnalysis } from "@/hooks/useAnalysis";
import { analyzeUrl } from "@/services/apiService";
import { AnalysisResult as AnalysisResultType } from "@/types";
import { AnalysisResult } from "@/components/shared/AnalysisResult";

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
    const { startAnalysis, result, error, progress, isStopped, stopScanning } =
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
            const crawlingMessages = progress.filter(p => p.includes("Crawling")).length;
            currentProgress += Math.min(crawlingMessages * 2, 40);
        }

        return currentProgress;
    }, [progress, result, error]);

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
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="url">Website URL</Label>
                            <Input
                                id="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleScan} disabled={!url || (progress.length > 0 && !result && !error)}>
                        Scan
                    </Button>
                </CardFooter>
            </Card>

            {progress.length > 0 && !result && !error && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Analysis Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progressValue} className="w-full mb-4" />
                        <div className="h-48 overflow-y-auto bg-muted p-2 rounded-md">
                            <ul className="list-disc list-inside">
                                {progress.map((message, index) => (
                                    <li key={index} className="text-sm">{message}</li>
                                ))}
                            </ul>
                        </div>
                        {!isStopped && (
                            <Button
                                onClick={stopScanning}
                                className="mt-4"
                                variant="destructive"
                            >
                                Stop
                            </Button>
                        )}
                    </CardContent>
                </Card>
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