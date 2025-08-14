import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Welcome to ScamScanner
          </CardTitle>
          <CardDescription className="text-center">
            Your AI-powered tool for detecting online threats.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            ScamScanner analyzes website source code to identify potential
            scams, phishing attempts, and other malicious activities. Get
            started by scanning a URL.
          </p>
          <Link href="/scanner">
            <Button size="lg">Go to Scanner</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}