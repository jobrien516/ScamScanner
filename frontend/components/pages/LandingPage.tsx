import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pageContent } from '@/constants';
import { CheckCircleIcon, LockIcon } from '@/components/Icons';
import Card from '@/components/Card';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartScanning = () => {
    navigate('/scanner');
  };

  return (
    <div className="py-8 animate-fade-in space-y-16">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center">
        <Card>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight">
            {pageContent.landing.title}
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-4xl mx-auto">
            {pageContent.landing.subtitle}
          </p>
        </Card>
        <div className="flex p-4 justify-center">
          <button 
            onClick={handleStartScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/30"
            >
            {pageContent.landing.ctaButton}
          </button>
        </div>
      </div>
      {/* Additional Info Section */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card title={pageContent.landing.webSafety.title} className="h-full">
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
            <div className='inline-block p-3 bg-slate-700/50 rounded-full'>
                <LockIcon />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.landing.dataPrivacy.title}</h2>
            <p className="text-slate-300 mt-4">{pageContent.landing.dataPrivacy.description}</p>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { pageContent } from '@/constants';
// import { CheckCircleIcon, LockIcon } from '@/components/Icons';

// const LandingPage: React.FC = () => {
//   const navigate = useNavigate();

//   const handleStartScanning = () => {
//     navigate('/scanner');
//   };

//   return (
//     <div className="py-8 animate-fade-in space-y-16">
//       <div className="text-center">
//         <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700">
//           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight">
//             {pageContent.landing.title}
//           </h1>
//           <p className="mt-6 text-lg text-slate-400 max-w-3xl mx-auto">
//             {pageContent.landing.subtitle}
//           </p>
//         </div>
//         <div className="mt-12">
//           <button 
//             onClick={handleStartScanning}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/30"
//           >
//             {pageContent.landing.ctaButton}
//           </button>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-8 items-start">
//         <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 h-full">
//           <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">{pageContent.landing.webSafety.title}</h2>
//           <ul className="space-y-4">
//             {pageContent.landing.webSafety.tips.map((tip, index) => (
//               <li key={index} className="flex items-start gap-4">
//                 <div className="flex-shrink-0 mt-1">
//                   <CheckCircleIcon />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-slate-200">{tip.title}</h3>
//                   <p className="text-slate-400">{tip.description}</p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Data Privacy Card */}
//         <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 h-full">
//             <div className='text-center mb-6'>
//                 <div className="inline-block p-3 bg-slate-700/50 rounded-full">
//                     <LockIcon />
//                 </div>
//                 <h2 className="text-2xl font-bold text-slate-100 mt-4">{pageContent.landing.dataPrivacy.title}</h2>
//             </div>
//           <p className="text-slate-300 text-center">{pageContent.landing.dataPrivacy.description}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;