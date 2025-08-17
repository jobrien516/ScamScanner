import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DomainInfo } from "@/types";

interface DomainInfoCardProps {
  info?: DomainInfo;
}

export function DomainInfoCard({ info }: DomainInfoCardProps) {
  if (!info) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Information</CardTitle>
        <CardDescription>WHOIS and age details</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {info.registrar && (
            <div>
              <dt className="text-muted-foreground">Registrar</dt>
              <dd className="font-medium">{info.registrar}</dd>
            </div>
          )}
          {info.creation_date && (
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{info.creation_date}</dd>
            </div>
          )}
          {info.expiration_date && (
            <div>
              <dt className="text-muted-foreground">Expires</dt>
              <dd className="font-medium">{info.expiration_date}</dd>
            </div>
          )}
          {typeof info.domain_age_days === "number" && (
            <div>
              <dt className="text-muted-foreground">Domain Age</dt>
              <dd className="font-medium">{info.domain_age_days} days</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

