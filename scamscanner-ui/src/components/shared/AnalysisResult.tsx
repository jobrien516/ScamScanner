import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnalysisResult as AnalysisResultType, AnalysisFinding } from "@/types";
import { RiskScoreGauge } from "./RiskScoreGauge";

interface AnalysisResultProps {
    result: AnalysisResultType;
}

const FindingCard = ({ finding }: { finding: AnalysisFinding }) => (
    <Card>
        <CardHeader>
            <CardTitle>{finding.category}</CardTitle>
            <CardDescription>Severity: {finding.severity}</CardDescription>
        </CardHeader>
        <CardContent>
            <p>{finding.description}</p>
            {finding.codeSnippet && (
                <pre className="mt-4 p-2 bg-muted rounded-md overflow-x-auto">
                    <code>{finding.codeSnippet}</code>
                </pre>
            )}
        </CardContent>
    </Card>
);

export function AnalysisResult({ result }: AnalysisResultProps) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Overall Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <RiskScoreGauge score={result.riskScore} />
                    <div>
                        <p className="text-xl font-bold">{result.overallRisk}</p>
                        <p>{result.summary}</p>
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