import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, ArrowLeft, Database, Type, Scissors, Network, BrainCircuit, Activity, Eraser, Loader2 } from 'lucide-react';
import axios from 'axios';

const Preprocessing = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
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
    { id: 3, name: 'Stemming', desc: 'Mengubah kata berimbuhan menjadi kata dasar (Sastrawi)', icon: <Eraser size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 4, name: 'Tokenize', desc: 'Memecah teks menjadi potongan kata (token)', icon: <Type size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 5, name: 'TF-IDF', desc: 'Pembobotan kata berdasarkan frekuensi kemunculan', icon: <Network size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 6, name: 'N-Grams', desc: 'Ekstraksi fitur berdasarkan kombinasi N kata berurutan', icon: <Network size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 7, name: 'SVM Model', desc: 'Algoritma klasifikasi machine learning (Support Vector Machine)', icon: <BrainCircuit size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
    { id: 8, name: 'Prediction', desc: 'Hasil prediksi klasifikasi sentimen Positif, Negatif, Netral', icon: <Activity size={24} className="text-primary" />, count: data?.stats?.total_ulasan || 0 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat pipeline...</span>
      </div>
    );
  }

  const getGridClasses = (index) => {
    const map = {
      0: 'md:col-start-1 md:row-start-1',
      1: 'md:col-start-2 md:row-start-1',
      2: 'md:col-start-3 md:row-start-1',
      3: 'md:col-start-3 md:row-start-2',
      4: 'md:col-start-2 md:row-start-2',
      5: 'md:col-start-1 md:row-start-2',
      6: 'md:col-start-1 md:row-start-3',
      7: 'md:col-start-2 md:row-start-3',
    };
    return map[index] || '';
  };

  const renderDesktopArrow = (index) => {
    if (index === PIPELINE_STEPS.length - 1) return null;
    const isEndOfRow = (index + 1) % 3 === 0;
    const row = Math.floor(index / 3) + 1;
    const isOddRow = row % 2 !== 0;

    if (isEndOfRow) {
      return (
        <div className="hidden md:flex absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 text-emerald-400">
          <ArrowDown size={28} className="animate-bounce" />
        </div>
      );
    } else if (isOddRow) {
      return (
        <div className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 z-10 text-emerald-400">
          <ArrowRight size={28} className="animate-pulse" />
        </div>
      );
    } else {
      return (
        <div className="hidden md:flex absolute top-1/2 -left-8 -translate-y-1/2 z-10 text-emerald-400">
          <ArrowLeft size={28} className="animate-pulse" />
        </div>
      );
    }
  };

  const renderMobileArrow = (index) => {
    if (index === PIPELINE_STEPS.length - 1) return null;
    return (
      <div className="md:hidden flex justify-center py-2 text-emerald-400 w-full">
        <ArrowDown size={24} className="animate-pulse" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visual Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Alur pemrosesan teks berurutan (snaking) dari data mentah hingga prediksi sentimen.</p>
      </div>

      <div className="max-w-5xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-12 md:gap-x-12 relative">
          {PIPELINE_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`relative w-full h-full ${getGridClasses(index)}`}
              >
                <div 
                  className="card p-5 border h-full shadow-sm flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-md duration-300 border-emerald-200"
                  style={{ backgroundColor: `rgba(16, 185, 129, ${0.05 + index * 0.04})` }}
                >
                  <div className="bg-white p-4 rounded-full shadow-sm border border-emerald-100 flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1 w-full flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1">{step.name}</h3>
                    <span className="text-xs bg-white text-gray-500 border border-gray-200 shadow-sm px-3 py-1 rounded-full mb-3 font-semibold">
                      {step.count} data
                    </span>
                    <p className="text-gray-500 text-xs md:text-sm">{step.desc}</p>
                  </div>
                </div>
                
                {renderDesktopArrow(index)}
              </div>
              {renderMobileArrow(index)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Preprocessing;
