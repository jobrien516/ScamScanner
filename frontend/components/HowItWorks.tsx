import React from 'react';
import { pageContent } from '@/constants';

const HowItWorks: React.FC = () => {
  return (
    <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 max-w-5xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">{pageContent.howItWorks.title}</h2>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
        {pageContent.howItWorks.steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-700 text-blue-300 rounded-full flex items-center justify-center font-bold text-lg">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-200">{step.title}</h3>
              <p className="text-slate-400 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;