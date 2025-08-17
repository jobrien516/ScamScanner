import React from "react";
import { Button } from "@/components/ui/button";
import { pageContent } from "@/constants/pageContent";

interface SupportButtonProps {
  paypalHref?: string;
  kofiHref?: string;
}

export function SupportButton({ paypalHref, kofiHref }: SupportButtonProps) {
  const paypalText = pageContent.support?.paypal ?? "Donate";
  const kofiText = pageContent.support?.kofi ?? "Buy Me a Coffee";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {paypalHref && (
        <Button asChild size="sm" variant="secondary">
          <a href={paypalHref} target="_blank" rel="noreferrer noopener">
            {paypalText}
          </a>
        </Button>
      )}
      {kofiHref && (
        <Button asChild size="sm" variant="outline">
          <a href={kofiHref} target="_blank" rel="noreferrer noopener">
            {kofiText}
          </a>
        </Button>
      )}
    </div>
  );
}

