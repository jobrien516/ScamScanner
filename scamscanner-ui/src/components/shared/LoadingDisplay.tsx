import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LoadingDisplayProps {
  messages: string[];
  progress?: number | null; // 0-100 if provided
  onStop?: () => void;
  onReset?: () => void;
  isStopped?: boolean;
}

export function LoadingDisplay({ messages, progress, onStop, onReset, isStopped }: LoadingDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scanning</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          <Progress value={progress ?? undefined} />
          <div className="text-xs text-muted-foreground">
            {typeof progress === "number" ? `${progress}%` : "Working…"}
          </div>
        </div>

        <div className="rounded-md border p-3 max-h-64 overflow-auto text-sm space-y-1 bg-background/50">
          {messages.length === 0 ? (
            <div className="text-muted-foreground">Preparing analysis…</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="leading-tight">
                • {m}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          {onStop && (
            <Button type="button" variant="outline" onClick={onStop} disabled={isStopped}>
              {isStopped ? "Stopped" : "Stop"}
            </Button>
          )}
          {onReset && (
            <Button type="button" variant="ghost" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

