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
import { useEffect, useState } from "react";

export default function Settings() {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const handleSave = () => {
        if (settings) {
            updateSettings(settings);
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
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="gemini-key">Gemini API Key</Label>
                            <Input
                                id="gemini-key"
                                type="password"
                                value={settings.gemini_api_key || ""}
                                onChange={(e) =>
                                    setSettings({ ...settings, gemini_api_key: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave}>Save</Button>
                </CardFooter>
            </Card>
        </div>
    );
}