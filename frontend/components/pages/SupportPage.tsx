import React from 'react';
import { pageContent } from '@/constants';

const SupportPage: React.FC = () => {
  return (
    <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 max-w-3xl mx-auto animate-fade-in text-center">
      <h1 className="text-3xl font-bold text-slate-100 mb-4">{pageContent.support.title}</h1>
      <div className="space-y-4 text-slate-300 mb-8">
        {pageContent.support.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* These are placeholder links. Replace "#" with your actual donation URLs. */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-[#00457C] hover:bg-[#003057] text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
        >
          {pageContent.support.paypal}
        </a>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-[#FF5E5B] hover:bg-[#E74C49] text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
        >
          {pageContent.support.kofi}
        </a>
      </div>
    </div>
  );
};

export default SupportPage;