import React, { useState, useEffect } from 'react';
import { Folder, FileText, Table, X, Loader2, Edit2 } from 'lucide-react';
import axios from 'axios';

const SimpanHasil = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // 'none' | 'folder' | 'report' | 'data'
  const [view, setView] = useState('none');
  const [folderName, setFolderName] = useState('Folder Hasil PAJO');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get('http://localhost:8000/api/dashboard/stats');
      setStats(statsRes.data);
      
      const reviewsRes = await axios.get('http://localhost:8000/api/reviews?limit=1000');
      setReviews(reviewsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat data laporan...</span>
      </div>
    );
  }

  const renderReport = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-h-[600px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="text-blue-500" />
          Laporan_Ringkasan.txt
        </h2>
        <button onClick={() => setView('folder')} className="text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
      </div>
      <div>
{`LAPORAN ANALISIS SENTIMEN PAJO
==============================

Ringkasan:
- Total Ulasan: ${stats?.stats.total_ulasan}
- Positif: ${stats?.stats.positif}
- Negatif: ${stats?.stats.negatif}
- Netral: ${stats?.stats.netral}
- Akurasi Model: ${stats?.stats.akurasi_model}

Kata Paling Sering Muncul:
${stats?.top_words.map((w, i) => `${i + 1}. ${w.name} (${w.count} kali)`).join('\n')}
`}
      </div>
    </div>
  );

  const renderData = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Table className="text-emerald-500" />
          Data_Ulasan.csv (Preview)
        </h2>
        <button onClick={() => setView('folder')} className="text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="p-3 border-b border-gray-200 font-semibold text-sm text-gray-600">ID</th>
              <th className="p-3 border-b border-gray-200 font-semibold text-sm text-gray-600">Username</th>
              <th className="p-3 border-b border-gray-200 font-semibold text-sm text-gray-600">Sentimen</th>
              <th className="p-3 border-b border-gray-200 font-semibold text-sm text-gray-600">Teks Ulasan</th>
            </tr>
          </thead>
          <tbody>
            {reviews.slice(0, 50).map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-100 text-sm">{r.id}</td>
                <td className="p-3 border-b border-gray-100 text-sm font-medium">{r.username}</td>
                <td className="p-3 border-b border-gray-100 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.sentiment === 'POSITIF' ? 'bg-emerald-100 text-emerald-700' :
                    r.sentiment === 'NEGATIF' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {r.sentiment}
                  </span>
                </td>
                <td className="p-3 border-b border-gray-100 text-sm max-w-md truncate" title={r.text}>
                  {r.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length > 50 && (
          <div className="p-3 text-center text-sm text-gray-500">
            Menampilkan 50 data teratas dari total {reviews.length} data.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hasil Analisis</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat dan buka hasil kumpulan analisis sentimen langsung di dalam website.</p>
      </div>

      {view === 'none' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div 
            onClick={() => setView('folder')}
            className="card p-6 border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-emerald-100 group-hover:bg-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 transition-colors">
              <Folder size={40} className="fill-emerald-500 text-emerald-600" />
            </div>
            
            {isEditing ? (
              <input 
                type="text" 
                value={folderName} 
                onChange={(e) => setFolderName(e.target.value)} 
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                autoFocus
                className="text-xl font-bold text-gray-800 mb-2 text-center border-b-2 border-emerald-500 focus:outline-none bg-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className="flex items-center gap-2 mb-2" 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                title="Klik untuk mengubah nama folder"
              >
                <h2 className="text-xl font-bold text-gray-800">{folderName}</h2>
                <Edit2 size={16} className="text-gray-400 hover:text-emerald-500" />
              </div>
            )}
            
            <p className="text-gray-500 text-sm">
              Berisi Laporan Ringkasan dan File Data Ulasan
            </p>
          </div>
        </div>
      )}

      {view === 'folder' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <button onClick={() => setView('none')} className="text-gray-400 hover:text-gray-700">
              <Folder size={24} className="fill-emerald-500 text-emerald-600" />
            </button>
            <span className="text-gray-400">/</span>
            <h2 className="text-lg font-bold">{folderName}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {/* Report File */}
            <div 
              onClick={() => setView('report')}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all"
            >
              <FileText size={48} className="text-blue-500 mb-3" />
              <span className="text-sm font-medium text-center break-all">Laporan_Ringkasan.txt</span>
            </div>

            {/* CSV File */}
            <div 
              onClick={() => setView('data')}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-emerald-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-all"
            >
              <Table size={48} className="text-emerald-500 mb-3" />
              <span className="text-sm font-medium text-center break-all">Data_Ulasan.csv</span>
            </div>
          </div>
        </div>
      )}

      {view === 'report' && renderReport()}
      {view === 'data' && renderData()}

    </div>
  );
};

export default SimpanHasil;
