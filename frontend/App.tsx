import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Page from '@/components/Page';
import LandingPage from '@/components/pages/LandingPage';
import ScannerPage from '@/components/pages/ScannerPage';
import MissionPage from '@/components/pages/MissionPage';
import HistoryPage from '@/components/pages/HistoryPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Page><LandingPage /></Page>} />
      <Route path="/scanner" element={<Page><ScannerPage /></Page>} />
      <Route path="/history" element={<Page><HistoryPage /></Page>} />
      <Route path="/mission" element={<Page><MissionPage /></Page>} />
    </Routes>
  );
};

export default App;