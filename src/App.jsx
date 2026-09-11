import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';
import PageLoader from './components/PageLoader';

// Context
import { AnalysisProvider } from './context/AnalysisContext';

// Pages - Lazy Loaded
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AnalisisBaru = lazy(() => import('./pages/AnalisisBaru'));
const RiwayatLaporan = lazy(() => import('./pages/RiwayatLaporan'));
const AnalisisSentimen = lazy(() => import('./pages/AnalisisSentimen'));
const Pengaturan = lazy(() => import('./pages/Pengaturan'));

function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <Suspense fallback={<PageLoader message="Memuat halaman..." />}>
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
        </Suspense>
      </AnalysisProvider>
    </BrowserRouter>
  );
}

export default App;
// Force Vite Rebuild
