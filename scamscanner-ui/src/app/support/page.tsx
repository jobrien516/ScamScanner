import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageContent } from "@/constants/pageContent";
import { SupportButton } from "@/components/shared/SupportButton";

export const metadata: Metadata = {
  title: "Support | ScamScanner",
  description:
    "Support the ScamScanner project to help cover server and API costs and enable ongoing development.",
};

export default function SupportPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{pageContent.support.title}</CardTitle>
          <CardDescription>
            {pageContent.support.paragraphs[0]}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{pageContent.support.paragraphs[1]}</p>
          <SupportButton paypalHref="https://paypal.me/level3labs" kofiHref="https://ko-fi.com/level3labs" />
        </CardContent>
      </Card>
    </div>
  );
}

