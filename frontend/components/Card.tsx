import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;