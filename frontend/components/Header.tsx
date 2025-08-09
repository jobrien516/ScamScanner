import React from 'react';
import { pageContent } from '@/constants';
import { ShieldIcon } from './Icons';

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