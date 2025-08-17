import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
  isLoading?: boolean;
}

export function ManualInput({ value, onChange, onBack, onAnalyze, isLoading }: ManualInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="manual-textarea" className="text-sm font-medium">
          Paste HTML/JS/CSS content
        </Label>
        <textarea
          id="manual-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your source code here..."
          className="min-h-[300px] w-full rounded-md border bg-transparent p-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          spellCheck={false}
        />
      </div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onAnalyze} disabled={isLoading}>
          {isLoading ? "Analyzing…" : "Analyze"}
        </Button>
      </div>
    </div>
  );
}

