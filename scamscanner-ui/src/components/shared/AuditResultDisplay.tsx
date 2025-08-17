import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuditResult, AuditFinding } from "@/types";

interface AuditResultDisplayProps {
  result: AuditResult;
}

const FindingCard = ({ finding }: { finding: AuditFinding }) => (
  <Card>
    <CardHeader>
      <CardTitle>{finding.category}</CardTitle>
      <CardDescription>Severity: {finding.severity}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>{finding.description}</p>
      {finding.recommendation && (
        <div className="mt-3 text-sm">
          <span className="font-medium">Recommendation: </span>
          <span className="text-muted-foreground">{finding.recommendation}</span>
        </div>
      )}
      {finding.codeSnippet && (
        <pre className="mt-4 p-2 bg-muted rounded-md overflow-x-auto">
          <code>{finding.codeSnippet}</code>
        </pre>
      )}
    </CardContent>
  </Card>
);

export function AuditResultDisplay({ result }: AuditResultDisplayProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Overall Code Quality</CardTitle>
          <CardDescription>Grade and quality score</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border text-3xl font-bold">
            {result.overallGrade}
          </div>
          <div>
            <p className="text-xl font-bold">Quality Score: {result.qualityScore}/100</p>
            <p className="text-muted-foreground">{result.summary}</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <h2 className="text-2xl font-bold">Detailed Findings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {result.detailedAnalysis.map((finding, index) => (
          <FindingCard key={index} finding={finding} />
        ))}
      </div>
    </div>
  );
}

