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
import { analyzeCode } from "@/services/apiService";
import { AuditResult, ViewState } from "@/types";
import { AuditResultDisplay } from "@/components/shared/AuditResultDisplay";
import { ManualInput as SharedManualInput } from "@/components/shared/ManualInput";


export default function AuditorPage() {
  const [identifier, setIdentifier] = useState("");
  const [manual, setManual] = useState("");
  const { view, setView, startAnalysis, result, error, progress, isStopped, stopScanning, resetState } =
    useAnalysis<AuditResult>();

  const handleScan = useCallback(() => {
    if (identifier) startAnalysis(() => analyzeCode({ url: identifier }));
  }, [identifier, startAnalysis]);

  const handleAnalyzeManual = useCallback(() => {
    if (manual.trim()) startAnalysis(() => analyzeCode({ code: manual }));
  }, [manual, startAnalysis]);

  const progressValue = useMemo(() => {
    if (result || error) return 100;
    if (progress.length === 0) return 0;
    const last = progress[progress.length - 1].toLowerCase();
    if (last.includes("connection")) return 5;
    if (last.includes("cloning") || last.includes("downloading")) return 40;
    if (last.includes("analyz")) return 90;
    return Math.min(95, 10 + progress.length * 5);
  }, [progress, result, error]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Code Auditor</CardTitle>
          <CardDescription>
            Enter a GitHub repository URL or paste code to receive an AI-powered audit with recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === ViewState.START && (
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="repo">GitHub Repository URL</Label>
                <Input
                  id="repo"
                  placeholder="https://github.com/user/repo"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
              <Button onClick={handleScan} disabled={!identifier || (progress.length > 0 && !result && !error)}>
                Audit Code
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
            <CardTitle>Audit Progress</CardTitle>
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
          <AuditResultDisplay result={result} />
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

