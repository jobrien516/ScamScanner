import React from 'react';
import { pageContent } from '@/constants';

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4">
                <ShieldIcon />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight">
                    {pageContent.header.title}
                </h1>
            </div>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                {pageContent.header.subtitle}
            </p>
        </header>
    );
};

export default Header;