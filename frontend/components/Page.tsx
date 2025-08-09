import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageProps {
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-8xl mx-auto flex flex-col flex-grow">
        <header>
          <Navbar />
        </header>
        
        <main className="mt-10 flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Page;