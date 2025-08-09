import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 max-w-4xl mx-auto mt-12 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">How It Works</h2>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
        
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-700 text-blue-300 rounded-full flex items-center justify-center font-bold text-lg">1</div>
          <div>
            <h3 className="font-semibold text-lg text-slate-200">Submit a URL</h3>
            <p className="text-slate-400 mt-1">Provide a live URL or use the manual input option to analyze local or offline code.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-700 text-blue-300 rounded-full flex items-center justify-center font-bold text-lg">2</div>
          <div>
            <h3 className="font-semibold text-lg text-slate-200">Content Crawling</h3>
            <p className="text-slate-400 mt-1">The system recursively crawls the website, downloading the content of linked pages and scripts from the same domain.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-700 text-blue-300 rounded-full flex items-center justify-center font-bold text-lg">3</div>
          <div>
            <h3 className="font-semibold text-lg text-slate-200">Dual AI Analysis</h3>
            <p className="text-slate-400 mt-1">All collected content is sent to the Gemini API for two separate analyses: one for general scam tactics and another specifically for exposed secrets.</p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-700 text-blue-300 rounded-full flex items-center justify-center font-bold text-lg">4</div>
          <div>
            <h3 className="font-semibold text-lg text-slate-200">Receive Your Report</h3>
            <p className="text-slate-400 mt-1">A detailed report is generated, including an overall risk score and specific findings with code snippets and source locations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;