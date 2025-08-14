import React from 'react';
import Spinner from '@/components/Spinner';
import WebSocketProgressLog from '@/components/WSProgressLog';

interface LoadingDisplayProps {
    onStop: () => void;
    isStopped: boolean;
    onReset: () => void;
    progressMessages: string[];
    title?: string;
    stopButtonText?: string;
    resetButtonText?: string;
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({
    onStop,
    isStopped,
    onReset,
    progressMessages,
    title = 'Analysis in Progress...',
    stopButtonText = 'Stop Scanning',
    resetButtonText = 'Start New Scan',
}) => {
    return (
        <div className="bg-slate-800/50 p-6 max-w-3xl mx-auto sm:p-8 rounded-xl shadow-2xl border border-slate-700">
            <div className="flex items-center justify-center mb-6">
                {!isStopped && <Spinner />}
                <h2 className="ml-4 text-xl text-slate-200">
                    {isStopped ? 'Scan Cancelled' : title}
                </h2>
            </div>
            <div className="mb-6 max-w-5xl text-blue-700 mx-auto text-center">
                {isStopped ? (
                    <button
                        onClick={onReset}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-200 shadow-lg hover:shadow-blue-500/30"
                    >
                        {resetButtonText}
                    </button>
                ) : (
                    <button
                        onClick={onStop}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-md transition duration-200 shadow-lg hover:shadow-red-500/30"
                    >
                        {stopButtonText}
                    </button>
                )}
            </div>
            <WebSocketProgressLog messages={progressMessages} />
        </div>
    );
};

export default LoadingDisplay;