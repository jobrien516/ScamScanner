import React from 'react';
import { pageContent } from '@/constants';
import Card from '@/components/Card';

const MissionPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card title={pageContent.mission.title}>
        <div className="space-y-4 text-slate-300 text-left">
          {pageContent.mission.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </div>

  );
};

export default MissionPage;