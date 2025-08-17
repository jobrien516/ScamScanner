import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { pageContent } from "@/constants/pageContent";

export function HowItWorks() {
  const steps = pageContent.howItWorks?.steps ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{pageContent.howItWorks?.title ?? "How It Works"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Step {idx + 1}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

