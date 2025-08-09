import React from 'react';
import { pageContent } from '@/constants';

const MissionPage: React.FC = () => {
  return (
    <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-100 mb-4">{pageContent.mission.title}</h1>
      <div className="space-y-4 text-slate-300">
        {pageContent.mission.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default MissionPage;