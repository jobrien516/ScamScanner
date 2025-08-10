import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageContent } from '@/constants';
import { CheckCircleIcon, LockIcon, CodeIcon, AlertIcon, LinkIcon, CheckIcon, XIcon } from '@/components/Icons';
import Card from '@/components/Card';

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartScanning = () => {
    navigate('/scanner');
  };

  return (
    <div className="py-8 max-w-6xl mx-auto animate-fade-in">
      {/* Before the Button */}
      <div className="mx-auto text-center">
        <Card title={pageContent.home.title}>
          <p className="mt-6 text-lg text-slate-400 max-w-3xl mx-auto">
            {pageContent.home.subtitle}
          </p>
        </Card>
        {/* Button */}
        <div className="mt-4">
          <button
            onClick={handleStartScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/30"
          >
            {pageContent.home.ctaButton}
          </button>
        </div>
      </div>
      {/* After the Button */}
      <div className="grid lg:grid-cols-2 items-start">

        {/* Purpose Section */}
        <Card title={pageContent.home.purpose.title}>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* IS */}
            <div className="flex flex-col">
              <div className="inline-block p-3 bg-slate-700/50 rounded-full">
                <CheckIcon />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-4">{pageContent.home.purpose.isFor.title}</h3>
              <p className="text-slate-300 mt-2">{pageContent.home.purpose.isFor.description}</p>
            </div>
            {/* IS NOT */}
            <div className="flex flex-col">
              <div className="inline-block p-3 bg-slate-700/50 rounded-full">
                <XIcon />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-4">{pageContent.home.purpose.isNotFor.title}</h3>
              <p className="text-slate-300 mt-2">{pageContent.home.purpose.isNotFor.description}</p>
            </div>
          </div>
        </Card>

        {/* Web Safety Section */}
        <Card title={pageContent.home.webSafety.title} className="h-full">
          <ul className="space-y-4 text-left">
            {pageContent.home.webSafety.tips.map((tip, index) => (
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

        {/* Data Privacy Section */}
        <Card className="h-full text-left">
          <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
            <LockIcon />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-4"><LockIcon />{pageContent.home.dataPrivacy.title}</h2>
          <p className="text-slate-300 mt-4">{pageContent.home.dataPrivacy.description}</p>
        </Card>

        {/* Technology Section */}
        <Card className="h-full text-center">
          <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
            <CodeIcon />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.home.technology.title}</h2>
          <p className="text-slate-300 mt-4">{pageContent.home.technology.description}</p>
        </Card>

        {/* Disclaimer Section */}
        <Card className="h-full text-center">
          <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
            <AlertIcon />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.home.disclaimer.title}</h2>
          <p className="text-slate-300 mt-4">{pageContent.home.disclaimer.description}</p>
        </Card>

        {/* Resources Section */}
        <Card title={pageContent.home.resources.title}>
          <div className="space-y-4">
            {pageContent.home.resources.links.map((resource, index) => (
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

      </div>
    </div>
  );
};

export default Homepage;