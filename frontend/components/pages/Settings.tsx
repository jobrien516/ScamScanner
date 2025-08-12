import React, { useState, useEffect } from 'react';
import Card from '@/components/Card';
import { getSettings, updateSettings } from '@/services/apiService';
import type { AppSettings } from '@/types';
import Spinner from '@/components/Spinner';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (err) {
                setNotification({ type: 'error', message: 'Failed to load settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!settings) return;
        const { name, type } = e.target;
        const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setSettings({ ...settings, [name]: value });
    };

    const handleSave = async () => {
        if (!settings) return;
        try {
            await updateSettings(settings);
            setNotification({ type: 'success', message: 'Settings saved successfully!' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setNotification({ type: 'error', message: `Failed to save settings: ${message}` });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };
    if (isLoading) {
        return <div className="flex justify-center items-center py-20"><Spinner /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <Card title="Settings">
                <div className="space-y-8">
                    {/* API Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">API Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="gemini_api_key" className="block text-slate-300 mb-1">Gemini API Key</label>
                                <input
                                    id="gemini_api_key"
                                    name="gemini_api_key"
                                    type="password"
                                    value={settings?.gemini_api_key || ''}
                                    onChange={handleInputChange}
                                    placeholder="Leave blank to use server default"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-slate-500 mt-1">Your key is stored securely in the database.</p>
                            </div>
                            <div>
                                <label htmlFor="max_output_tokens" className="block text-slate-300 mb-1">Max Output Tokens</label>
                                <input
                                    id="max_output_tokens"
                                    name="max_output_tokens"
                                    type="number"
                                    value={settings?.max_output_tokens || 8192}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-slate-500 mt-1">Controls the maximum length of the AI's analysis response.</p>
                            </div>
                        </div>
                    </div>

                    {/* Default Scan Options */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">Default Scan Options</h3>
                        <div className="space-y-4">
                            <label className="flex items-center text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="default_use_secrets_scanner"
                                    checked={settings?.default_use_secrets_scanner ?? true}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-3">Enable Secrets Scanner by default</span>
                            </label>
                            <label className="flex items-center text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="default_use_domain_analyzer"
                                    checked={settings?.default_use_domain_analyzer ?? true}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-3">Enable Domain Analyzer by default</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 border-t border-slate-700 pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-200"
                    >
                        Save Settings
                    </button>
                </div>

                {/* Notification Area */}
                {notification && (
                    <div className={`mt-6 p-3 rounded-md text-sm text-center ${notification.type === 'success' ? 'bg-green-800/80 text-green-200 border border-green-600' : 'bg-red-800/80 text-red-200 border border-red-600'}`}>
                        {notification.message}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Settings;