import React from 'react';
import { pageContent } from '@/constants';

const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-12 py-4 text-slate-500 text-sm">
      <p>{pageContent.footer.poweredBy}</p>
      <p className="mt-1">{pageContent.footer.copyright}</p>
    </footer>
  );
};

export default Footer;