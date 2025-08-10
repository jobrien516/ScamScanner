import React from 'react';
import { pageContent } from '@/constants';
import Card from './Card';

const HowItWorks: React.FC = () => {
  return (
    <Card title={pageContent.howItWorks.title} className="max-w-5xl mx-auto items-center animate-fade-in">
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-10 text-left">
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
    </Card>
  );
};

export default HowItWorks;