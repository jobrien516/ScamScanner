import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageContent } from '@/constants';
import { CheckCircleIcon, LockIcon, CodeIcon, AlertIcon, LinkIcon, CheckIcon, XIcon } from '@/components/Icons';
import Card from '@/components/Card';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartScanning = () => {
    navigate('/scanner');
  };

  return (
    <div className="py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
        <Card title={pageContent.landing.title}>
          <p className="mt-6 text-lg text-slate-400 max-w-3xl mx-auto">
            {pageContent.landing.subtitle}
          </p>
        </Card>
        <div className="mt-4">
          <button 
            onClick={handleStartScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/30"
          >
            {pageContent.landing.ctaButton}
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 items-start">
        <Card title={pageContent.landing.webSafety.title} className="h-full">
          {/* Web Safety Section */}
          <ul className="space-y-4 text-left">
            {pageContent.landing.webSafety.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircleIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{tip.title}</h3>
                  <p className="text-slate-400">{tip.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="h-full text-center">
          {/* Data Privacy Section */}
          <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
              <LockIcon />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.landing.dataPrivacy.title}</h2>
          <p className="text-slate-300 mt-4">{pageContent.landing.dataPrivacy.description}</p>
        </Card>
        <Card className="h-full text-center">
          {/* Technology Section */}
          <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
              <CodeIcon />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.landing.technology.title}</h2>
          <p className="text-slate-300 mt-4">{pageContent.landing.technology.description}</p>
        </Card>

        <Card className="h-full text-center">
          {/* Disclaimer Section */}
            <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
                <AlertIcon />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.landing.disclaimer.title}</h2>
            <p className="text-slate-300 mt-4">{pageContent.landing.disclaimer.description}</p>
        </Card>
      
        <Card title={pageContent.landing.resources.title}>
          {/* Resources Section */}
          <div className="space-y-4">
            {pageContent.landing.resources.links.map((resource, index) => (
              <a 
                key={index} 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-shrink-0 text-blue-400">
                  <LinkIcon />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-200">{resource.title}</h3>
                  <p className="text-sm text-slate-400">{resource.description}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      <Card title={pageContent.landing.purpose.title}>
        {/* Purpose Section */}
        <div className="grid md:grid-cols-2 gap-8 text-center">
            {/* What this app IS */}
          <div className="flex flex-col items-center">
            <div className="inline-block p-3 bg-slate-700/50 rounded-full">
                <CheckIcon />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mt-4">{pageContent.landing.purpose.isFor.title}</h3>
            <p className="text-slate-300 mt-2">{pageContent.landing.purpose.isFor.description}</p>
          </div>
          {/* What this app IS NOT */}
          <div className="flex flex-col items-center">
              <div className="inline-block p-3 bg-slate-700/50 rounded-full">
                  <XIcon />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-4">{pageContent.landing.purpose.isNotFor.title}</h3>
              <p className="text-slate-300 mt-2">{pageContent.landing.purpose.isNotFor.description}</p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default LandingPage;