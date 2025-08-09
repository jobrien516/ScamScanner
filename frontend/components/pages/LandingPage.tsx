import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageContent } from '@/constants';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartScanning = () => {
    navigate('/scanner');
  };

  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl max-w-5xl mx-auto border border-slate-700">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight">
          {pageContent.landing.title}
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-3xl mx-auto">
          {pageContent.landing.subtitle}
        </p>
      </div>

      <div className="mt-12">
        <button 
          onClick={handleStartScanning}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/30"
        >
          {pageContent.landing.ctaButton}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;