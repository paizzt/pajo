import React, { useState, useEffect } from 'react';
import { ArrowDown, Database, Type, Scissors, AlignLeft, Filter, BookA, Network, BrainCircuit, Activity, Eraser, Loader2 } from 'lucide-react';
import axios from 'axios';

const Preprocessing = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PIPELINE_STEPS = [
    { id: 1, name: 'RAW DATA', desc: 'Dataset ulasan mentah dari Google Play Store', icon: <Database size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 2, name: 'Cleaning', desc: 'Menghapus karakter khusus, angka, emoji, dan link', icon: <Scissors size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 3, name: 'Case Folding', desc: 'Mengubah semua huruf menjadi huruf kecil (lowercase)', icon: <Type size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 4, name: 'Cleansing', desc: 'Menghapus tanda baca, angka, emoji, dan karakter khusus', icon: <Eraser size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 5, name: 'Stopword Removal', desc: 'Menghapus kata hubung yang tidak bermakna (dan, di, ke)', icon: <Filter size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 6, name: 'Stemming', desc: 'Mengubah kata berimbuhan menjadi kata dasar (Sastrawi)', icon: <Scissors size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 7, name: 'TF-IDF', desc: 'Pembobotan kata berdasarkan frekuensi kemunculan', icon: <Network size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 8, name: 'N-Grams', desc: 'Ekstraksi fitur berdasarkan kombinasi N kata berurutan', icon: <Network size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 9, name: 'SVM (Support Vector Machine)', desc: 'Algoritma klasifikasi machine learning', icon: <BrainCircuit size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 10, name: 'Sentiment Prediction', desc: 'Hasil klasifikasi sentimen Positif, Negatif, Netral', icon: <Activity size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visual Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Alur pemrosesan teks dari data mentah hingga hasil prediksi sentimen.</p>
      </div>

      <div className="max-w-3xl mx-auto py-8">
        {PIPELINE_STEPS.map((step, index) => (
          <div key={step.id} className="relative">
            <div 
              className="card p-5 border shadow-sm flex items-center gap-6 transition-transform hover:-translate-y-1 hover:shadow-md duration-300 border-emerald-200"
              style={{ backgroundColor: `rgba(16, 185, 129, ${0.05 + index * 0.05})` }}
            >
              <div className="bg-white p-3 rounded-xl shadow-sm border border-white/50">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg">{step.name}</h3>
                  <span className="badge bg-white text-gray-600 border border-gray-200 shadow-sm">{step.count} data</span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{step.desc}</p>
              </div>
            </div>
            
            {/* Arrow connecting the cards, except for the last one */}
            {index < PIPELINE_STEPS.length - 1 && (
              <div className="flex justify-center py-3 text-gray-300">
                <ArrowDown size={28} className="animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preprocessing;
