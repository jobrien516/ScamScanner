import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pageContent } from "@/constants/pageContent";

export const metadata: Metadata = {
  title: "Our Mission | ScamScanner",
  description:
    "Learn about ScamScanner's mission to make the web safer using accessible, AI-powered source code analysis.",
};

export default function MissionPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{pageContent.mission.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pageContent.mission.paragraphs.map((p, i) => (
            <p key={i} className="text-muted-foreground">
              {p}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

