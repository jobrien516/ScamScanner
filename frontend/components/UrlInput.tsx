import React, { useState } from 'react';

type UrlInputProps = {
  onScan: (url: string) => void | Promise<void>;
  onUploadClick: () => void;
  error?: string | null;
};

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const UrlInput: React.FC<UrlInputProps> = ({ onScan, onUploadClick, error }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onScan(url);
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 max-w-5xl mx-auto">
            <form onSubmit={handleSubmit}>
                <label htmlFor="url-input" className="block text-lg font-medium text-slate-300 mb-2">
                    Enter Website URL
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        id="url-input"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g., demo-scam.com"
                        className="flex-grow bg-slate-900 border border-slate-600 rounded-md py-3 px-4 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    />
                    <button
                        type="submit"
                        disabled={!url.trim()}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
                    >
                        <SearchIcon />
                        <span>Scan Website</span>
                    </button>
                </div>
                {error && (
                    <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-md border border-red-500/50">
                        {error}
                    </p>
                )}
            </form>
            <div className="mt-6 text-center text-slate-400 flex items-center justify-center">
                <span className="text-sm">or</span>
                <button
                    onClick={onUploadClick}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-semibold text-sm hover:underline focus:outline-none transition-colors"
                    aria-label="Upload a source file"
                >
                    upload a source file
                </button>
            </div>
        </div>
    );
};

export default UrlInput;
