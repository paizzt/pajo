import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AnalisisBaru from './pages/AnalisisBaru';
import RiwayatLaporan from './pages/RiwayatLaporan';
import AnalisisSentimen from './pages/AnalisisSentimen';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analisis-baru" element={<AnalisisBaru />} />
          <Route path="/riwayat" element={<RiwayatLaporan />} />
          <Route path="/uji-coba" element={<AnalisisSentimen />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// Force Vite Rebuild
