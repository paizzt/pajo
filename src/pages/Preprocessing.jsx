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
    { id: 1, name: 'Cleaning', desc: 'Menghapus karakter khusus, angka, emoji, dan link', icon: <Eraser size={24} className="text-amber-500" />, count: data?.stats?.total_ulasan || 0, color: 'bg-amber-50 border-amber-200' },
    { id: 2, name: 'Case Folding', desc: 'Mengubah semua huruf menjadi huruf kecil (lowercase)', icon: <Type size={24} className="text-sky-500" />, count: data?.stats?.total_ulasan || 0, color: 'bg-sky-50 border-sky-200' },
    { id: 3, name: 'Tokenize', desc: 'Memecah teks menjadi potongan kata tunggal (token)', icon: <Scissors size={24} className="text-blue-500" />, count: data?.stats?.total_ulasan || 0, color: 'bg-blue-50 border-blue-200' },
    { id: 4, name: 'Stemming', desc: 'Mengubah kata berimbuhan menjadi kata dasar', icon: <Filter size={24} className="text-emerald-500" />, count: data?.stats?.total_ulasan || 0, color: 'bg-emerald-50 border-emerald-200' },
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
            <div className={`card p-5 border shadow-sm flex items-center gap-6 ${step.color} transition-transform hover:-translate-y-1 hover:shadow-md duration-300`}>
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
