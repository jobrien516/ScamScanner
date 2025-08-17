import React, { ReactNode, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlInputProps {
  value: string;
  placeholder?: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  children?: ReactNode;
  className?: string;
}

export function UrlInput({
  value,
  placeholder = "https://example.com",
  isLoading,
  onChange,
  onSubmit,
  children,
  className,
}: UrlInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={"w-full space-y-3 " + (className ?? "") }>
      <div className="flex w-full items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 text-base"
          type="url"
          autoComplete="url"
          spellCheck={false}
          aria-label="Website URL"
        />
        <Button type="submit" disabled={isLoading} className="h-11 px-6">
          {isLoading ? "Scanning…" : "Scan"}
        </Button>
      </div>
      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </form>
  );
}

