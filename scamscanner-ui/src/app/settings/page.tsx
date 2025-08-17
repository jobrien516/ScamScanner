"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, updateSettings } from "@/services/apiService";
import { AppSettings } from "@/types";
import { useEffect, useMemo, useState } from "react";

export default function Settings() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [errors, setErrors] = useState<{ apiKey?: string; maxTokens?: string }>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const validate = useMemo(() => (s: AppSettings | null) => {
        const e: { apiKey?: string; maxTokens?: string } = {};
        if (!s) return e;
        if (s.gemini_api_key && s.gemini_api_key.length > 0 && s.gemini_api_key.length < 10) {
            e.apiKey = "API key looks too short.";
        }
        if (!Number.isInteger(s.max_output_tokens) || s.max_output_tokens < 1 || s.max_output_tokens > 8192) {
            e.maxTokens = "Max output tokens must be an integer between 1 and 8192.";
        }
        return e;
    }, []);

    useEffect(() => {
        setErrors(validate(settings));
    }, [settings, validate]);

    const handleSave = async () => {
        if (!settings) return;
        const e = validate(settings);
        setErrors(e);
        if (Object.keys(e).length > 0) return;
        try {
            setSaving(true);
            await updateSettings(settings);
        } finally {
            setSaving(false);
        }
    };

    if (!settings) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Configure your application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-6">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="gemini-key">Gemini API Key</Label>
                            <Input
                                id="gemini-key"
                                type="password"
                                value={settings.gemini_api_key || ""}
                                onChange={(e) =>
                                    setSettings({ ...settings, gemini_api_key: e.target.value })
                                }
                                aria-invalid={!!errors.apiKey}
                            />
                            {errors.apiKey ? (
                                <div className="text-xs text-destructive">{errors.apiKey}</div>
                            ) : null}
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="max-tokens">Max Output Tokens</Label>
                            <Input
                                id="max-tokens"
                                type="number"
                                min={1}
                                max={8192}
                                step={1}
                                value={settings.max_output_tokens}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        max_output_tokens: Math.max(0, Math.floor(Number(e.target.value || 0))),
                                    })
                                }
                                aria-invalid={!!errors.maxTokens}
                            />
                            {errors.maxTokens ? (
                                <div className="text-xs text-destructive">{errors.maxTokens}</div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="default-use-secrets"
                                type="checkbox"
                                checked={settings.default_use_secrets_scanner}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        default_use_secrets_scanner: e.target.checked,
                                    })
                                }
                            />
                            <Label htmlFor="default-use-secrets">Use Secrets Scanner by default</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="default-use-domain"
                                type="checkbox"
                                checked={settings.default_use_domain_analyzer}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        default_use_domain_analyzer: e.target.checked,
                                    })
                                }
                            />
                            <Label htmlFor="default-use-domain">Use Domain Analyzer by default</Label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={saving || Object.keys(errors).length > 0}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
