import React, { useState } from 'react';
import { Network, Search, Hash } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TFIDF_DATA = [
  { word: "aplikasi", tf: "0.1250", idf: "1.4200", tfidf: "0.1775" },
  { word: "login", tf: "0.0833", idf: "1.8700", tfidf: "0.1557" },
  { word: "bantu", tf: "0.0500", idf: "2.1000", tfidf: "0.1050" },
  { word: "mudah", tf: "0.0450", idf: "2.1500", tfidf: "0.0967" },
  { word: "error", tf: "0.0410", idf: "2.3000", tfidf: "0.0943" },
  { word: "transfer", tf: "0.0380", idf: "2.4500", tfidf: "0.0931" },
  { word: "gagal", tf: "0.0350", idf: "2.6000", tfidf: "0.0910" },
];

const BIGRAM_DATA = [
  { name: 'tidak bisa', count: 540 },
  { name: 'sangat bantu', count: 480 },
  { name: 'sering error', count: 420 },
  { name: 'gagal login', count: 380 },
  { name: 'mudah pakai', count: 350 },
];

const TfIdfNGrams = () => {
  const [activeTab, setActiveTab] = useState('bigram');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feature Extraction</h1>
        <p className="text-sm text-gray-500 mt-1">Hasil ekstraksi fitur menggunakan metode TF-IDF dan N-Grams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TF-IDF SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Network size={20} className="text-teal-500" />
              Ekstraksi Fitur TF-IDF
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 bg-teal-50 border-teal-100">
              <p className="text-sm font-medium text-gray-500">Total Vocabulary</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">4,852</h3>
            </div>
            <div className="card p-4 bg-teal-50 border-teal-100">
              <p className="text-sm font-medium text-gray-500">Selected Features</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">1,500</h3>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 text-sm">Top TF-IDF Words</h3>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input type="text" className="pl-8 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary outline-none" placeholder="Cari kata..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Word</th>
                    <th className="px-4 py-3 font-semibold text-right">TF</th>
                    <th className="px-4 py-3 font-semibold text-right">IDF</th>
                    <th className="px-4 py-3 font-semibold text-right text-primary">TF-IDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TFIDF_DATA.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.word}</td>
                      <td className="px-4 py-3 text-right">{item.tf}</td>
                      <td className="px-4 py-3 text-right">{item.idf}</td>
                      <td className="px-4 py-3 text-right font-medium text-primary">{item.tfidf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* N-GRAMS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Hash size={20} className="text-amber-500" />
              N-Grams Extraction
            </h2>
          </div>

          <div className="card">
            <div className="border-b border-gray-200 flex">
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unigram' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('unigram')}
              >
                Unigram (n=1)
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bigram' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('bigram')}
              >
                Bigram (n=2)
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'trigram' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('trigram')}
              >
                Trigram (n=3)
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Frequency {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BIGRAM_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="count" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TfIdfNGrams;
