"use client";

import { useState, useMemo, useCallback } from "react";
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
import { analyzeSecrets } from "@/services/apiService";
import { AnalysisResult as AnalysisResultType, ViewState } from "@/types";
import { AnalysisResult } from "@/components/shared/AnalysisResult";
import { ManualInput as SharedManualInput } from "@/components/shared/ManualInput";


export default function SecretsPage() {
  const [url, setUrl] = useState("");
  const [manual, setManual] = useState("");
  const { view, setView, startAnalysis, result, error, progress, isStopped, stopScanning, resetState } =
    useAnalysis<AnalysisResultType>();

  const handleScan = useCallback(() => {
    if (url) startAnalysis(() => analyzeSecrets({ url }));
  }, [url, startAnalysis]);

  const handleAnalyzeManual = useCallback(() => {
    if (manual.trim()) startAnalysis(() => analyzeSecrets({ content: manual }));
  }, [manual, startAnalysis]);

  const progressValue = useMemo(() => {
    if (result || error) return 100;
    if (progress.length === 0) return 0;
    const last = progress[progress.length - 1];
    // Simple heuristic
    if (last.toLowerCase().includes("connection")) return 5;
    if (last.toLowerCase().includes("crawling")) return 25;
    if (last.toLowerCase().includes("secrets")) return 70;
    if (last.toLowerCase().includes("analyz")) return 90;
    return Math.min(95, 10 + progress.length * 5);
  }, [progress, result, error]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Secrets Scanner</CardTitle>
          <CardDescription>
            Analyze a webpage or pasted code to find exposed secrets like API keys and credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === ViewState.START && (
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
          )}

          {view === ViewState.MANUAL_INPUT && (
            <SharedManualInput
              value={manual}
              onChange={setManual}
              onBack={resetState}
              onAnalyze={handleAnalyzeManual}
            />
          )}
        </CardContent>
        <CardFooter className="flex items-center gap-2">
          {view === ViewState.START && (
            <>
              <Button onClick={handleScan} disabled={!url || (progress.length > 0 && !result && !error)}>
                Scan for Secrets
              </Button>
              <Button type="button" variant="outline" onClick={() => setView(ViewState.MANUAL_INPUT)}>
                Paste code manually
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {progress.length > 0 && !result && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressValue} className="w-full mb-4" />
            <div className="h-48 overflow-y-auto bg-muted p-2 rounded-md">
              <ul className="list-disc list-inside">
                {progress.map((m, i) => (
                  <li key={i} className="text-sm">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            {!isStopped && (
              <Button onClick={stopScanning} className="mt-4" variant="destructive">
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

