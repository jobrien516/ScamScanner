import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartScanning = () => {
    navigate('/scanner');
  };

  return (
    <div className="text-center py-16 animate-fade-in">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight">
        Empowering Your Digital Safety
      </h1>
      <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
        ScamScanner uses the power of AI to analyze website source code, helping you identify potential scams, phishing attempts, and malicious scripts before they can cause harm.
      </p>
      <div className="mt-8">
        <button 
          onClick={handleStartScanning}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/30"
        >
          Start Scanning Now
        </button>
      </div>
    </div>
  );
};

export default LandingPage;