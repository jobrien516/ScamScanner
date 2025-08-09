import React, { useState, useRef } from 'react';
import { UploadIcon, BackIcon } from './Icons';

interface ManualInputProps {
    onAnalyze: (html: string) => void;
    error: string | null;
    url: string;
    onBack: () => void;
}

const ManualInput: React.FC<ManualInputProps> = ({ onAnalyze, error, url, onBack }) => {
    const [html, setHtml] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnalyze(html);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result;
                if (typeof text === 'string') {
                    setHtml(text);
                } else {
                    alert("Could not read the file content as text.");
                }
            };
            reader.onerror = () => {
                alert(`Error reading file: ${reader.error?.message}`);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
            <div className="relative flex items-center justify-center mb-6">
                <button
                    onClick={onBack}
                    className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-200 p-2 rounded-md -ml-2"
                    aria-label="Go back to URL input"
                >
                    <BackIcon />
                    <span className="text-sm font-semibold">Back</span>
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100">Manual Analysis</h2>
                    {url && <p className="text-slate-400 mt-1">For site: <strong className="text-slate-200">{url}</strong></p>}
                </div>
            </div>

            {error && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg mb-6 text-sm" role="alert">
                    <p><strong className="font-semibold">Heads up!</strong> {error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".html,.txt,text/plain,text/html"
                    className="hidden"
                    aria-hidden="true"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-6 rounded-md transition-all duration-200"
                >
                    <UploadIcon />
                    Upload Source File
                </button>

                <div className="relative my-4 flex items-center">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400 uppercase text-xs font-semibold">Or paste below</span>
                    <div className="flex-grow border-t border-slate-600"></div>
                </div>

                <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="<html>...</html>"
                    className="w-full h-64 bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    aria-label="HTML Source Code Input"
                />
                <button
                    type="submit"
                    disabled={!html.trim()}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-md transition duration-200"
                >
                    Analyze Source Code
                </button>
            </form>
        </div>
    );
};

export default ManualInput;
