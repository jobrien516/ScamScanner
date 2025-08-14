"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getHistory } from "@/services/apiService";
import { HistoryAnalysisResult } from "@/types";
import { useEffect, useState } from "react";

export default function History() {
    const [history, setHistory] = useState<HistoryAnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHistory()
            .then(setHistory)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Scan History</h1>
            {history.map((item) => (
                <Card key={item.id} className="mb-4">
                    <CardHeader>
                        <CardTitle>{item.site_url}</CardTitle>
                        <CardDescription>
                            {new Date(item.last_analyzed_at).toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Risk Score: {item.riskScore}</p>
                        <p>Overall Risk: {item.overallRisk}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}