import React from 'react';
import { pageContent } from '@/constants';
import Card from '@/components/Card';
import SupportButton from '@/components/SupportButton';

const SupportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in text-center">
      <Card title={pageContent.support.title}>
        <div className="space-y-4 text-slate-300">
          {pageContent.support.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* <SupportButton
            content={pageContent.support.paypal}
            url="https://www.paypal.com" // Example URL
            color="#00457C"
            hoverColor="#003057"
          /> */}
        <SupportButton
          content={pageContent.support.kofi}
          url="https://www.buymeacoffee.com/jobrien"
          color="#FFDD00"
          hoverColor="#FFCC39"
          textColor="#000000"
        />
      </div>
    </div>
  );
};

export default SupportPage;