import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Page from '@/components/Page';
import Homepage from '@/components/pages/Home';
import Scanner from '@/components/pages/Scanner';
import Mission from '@/components/pages/Mission';
import ScanHistory from '@/components/pages/ScanHistory';
import Settings from '@/components/pages/Settings';
import Support from '@/components/pages/Support';
import SecretsScanner from '@/components/pages/SecretsScanner';
import CodeScanner from '@/components/pages/CodeScanner';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Page><Homepage /></Page>} />
      <Route path="/scanner" element={<Page><Scanner /></Page>} />
      <Route path="/secrets" element={<Page><SecretsScanner /></Page>} />
      <Route path="/auditor" element={<Page><CodeScanner /></Page>} />
      <Route path="/history" element={<Page><ScanHistory /></Page>} />
      <Route path="/mission" element={<Page><Mission /></Page>} />
      <Route path="/settings" element={<Page><Settings /></Page>} />
      <Route path="/support" element={<Page><Support /></Page>} />
    </Routes>
  );
};

export default App;