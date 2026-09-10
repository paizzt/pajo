import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import KelolaData from './pages/KelolaData';
import DapurAI from './pages/DapurAI';
import AnalisisSentimen from './pages/AnalisisSentimen';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kelola-data" element={<KelolaData />} />
          <Route path="/dapur-ai" element={<DapurAI />} />
          <Route path="/uji-coba" element={<AnalisisSentimen />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
