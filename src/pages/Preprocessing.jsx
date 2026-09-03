import React from 'react';
import { ArrowDown, Database, Type, Scissors, AlignLeft, Filter, BookA, Network, BrainCircuit, Activity, Eraser } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, name: 'RAW DATA', desc: 'Dataset ulasan mentah dari Google Play Store', icon: <Database size={24} className="text-gray-500" />, count: '12.450', color: 'bg-gray-50 border-gray-200' },
  { id: 2, name: 'Cleaning', desc: 'Menghapus karakter khusus, angka, emoji, dan link', icon: <Scissors size={24} className="text-blue-500" />, count: '12.450', color: 'bg-blue-50 border-blue-200' },
  { id: 3, name: 'Case Folding', desc: 'Mengubah semua huruf menjadi huruf kecil (lowercase)', icon: <Type size={24} className="text-sky-500" />, count: '12.450', color: 'bg-sky-50 border-sky-200' },
  { id: 4, name: 'Cleansing', desc: 'Menghapus tanda baca, angka, emoji, dan karakter khusus', icon: <Eraser size={24} className="text-amber-500" />, count: '12.450', color: 'bg-amber-50 border-amber-200' },
  { id: 5, name: 'Stopword Removal', desc: 'Menghapus kata hubung yang tidak bermakna (dan, di, ke)', icon: <Filter size={24} className="text-red-500" />, count: '12.450', color: 'bg-red-50 border-red-200' },
  { id: 6, name: 'Stemming', desc: 'Mengubah kata berimbuhan menjadi kata dasar (Sastrawi)', icon: <Scissors size={24} className="text-emerald-500" />, count: '12.450', color: 'bg-emerald-50 border-emerald-200' },
  { id: 7, name: 'TF-IDF', desc: 'Pembobotan kata berdasarkan frekuensi kemunculan', icon: <Network size={24} className="text-teal-500" />, count: '12.450', color: 'bg-teal-50 border-teal-200' },
  { id: 8, name: 'N-Grams', desc: 'Ekstraksi fitur berdasarkan kombinasi N kata berurutan', icon: <Network size={24} className="text-amber-500" />, count: '12.450', color: 'bg-amber-50 border-amber-200' },
  { id: 9, name: 'SVM (Support Vector Machine)', desc: 'Algoritma klasifikasi machine learning', icon: <BrainCircuit size={24} className="text-emerald-500" />, count: '12.450', color: 'bg-emerald-50 border-emerald-200' },
  { id: 10, name: 'Sentiment Prediction', desc: 'Hasil klasifikasi sentimen Positif, Negatif, Netral', icon: <Activity size={24} className="text-primary" />, count: '12.450', color: 'bg-emerald-100 border-emerald-300' },
];

const Preprocessing = () => {
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
