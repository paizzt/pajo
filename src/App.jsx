import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataUlasan from './pages/DataUlasan';
import Preprocessing from './pages/Preprocessing';
import AnalisisSentimen from './pages/AnalisisSentimen';
import TfIdfNGrams from './pages/TfIdfNGrams';
import ModelSvm from './pages/ModelSvm';
import EvaluasiModel from './pages/EvaluasiModel';
import Visualisasi from './pages/Visualisasi';
import Insight from './pages/Insight';
import DataCollection from './pages/DataCollection';
import Pengaturan from './pages/Pengaturan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ulasan" element={<DataUlasan />} />
          <Route path="/preprocessing" element={<Preprocessing />} />
          <Route path="/analisis" element={<AnalisisSentimen />} />
          <Route path="/tfidf" element={<TfIdfNGrams />} />
          <Route path="/model" element={<ModelSvm />} />
          <Route path="/evaluasi" element={<EvaluasiModel />} />
          <Route path="/visualisasi" element={<Visualisasi />} />
          <Route path="/insight" element={<Insight />} />
          <Route path="/koleksi" element={<DataCollection />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
