import React from 'react';

const MissionPage: React.FC = () => {
  return (
    <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-100 mb-4">Our Mission</h1>
      <div className="space-y-4 text-slate-300">
        <p>
          In an increasingly digital world, the threat of online scams, phishing, and malicious websites is ever-present. Our mission is to provide a powerful, accessible, and easy-to-use tool that empowers users to navigate the web with greater confidence and security.
        </p>
        <p>
          We believe that everyone has the right to be safe online. By leveraging cutting-edge AI technology, ScamScanner demystifies the complexities of website source code, offering clear, actionable insights into potential digital threats.
        </p>
        <p>
          This tool was built for educational purposes to demonstrate the capabilities of generative AI in the field of cybersecurity. It is not a substitute for comprehensive security software but serves as a valuable first line of defense and a powerful learning resource.
        </p>
      </div>
    </div>
  );
};

export default MissionPage;