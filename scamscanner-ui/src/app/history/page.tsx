"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getHistory } from "@/services/apiService";
import { HistoryAnalysisResult, RiskLevel } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { RiskBadge } from "@/components/shared/RiskBadge";

export default function History() {
    const [history, setHistory] = useState<HistoryAnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHistory()
            .then(setHistory)
            .finally(() => setLoading(false));
    }, []);

    const formatDate = useMemo(() => (d: string) => new Date(d).toLocaleString(), []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Scan History</h1>
            {history.map((item) => (
                <Card key={item.id} className="mb-4">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>{item.site_url}</CardTitle>
                            <CardDescription>
                                {formatDate(item.last_analyzed_at)}
                            </CardDescription>
                        </div>
                        <RiskBadge level={item.overallRisk as RiskLevel} />
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="text-sm text-muted-foreground">Risk Score</div>
                        <div className="text-xl font-semibold">{item.riskScore}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
