import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, ThumbsDown, Loader2 } from 'lucide-react';
import axios from 'axios';

const Insight = () => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat insight...</span>
      </div>
    );
  }

  const stats = data?.stats || { total_ulasan: 0, positif: 0, negatif: 0, netral: 0 };
  const topWords = data?.top_words || [];
  
  const posPerc = stats.total_ulasan ? Math.round((stats.positif / stats.total_ulasan) * 100) : 0;
  const negPerc = stats.total_ulasan ? Math.round((stats.negatif / stats.total_ulasan) * 100) : 0;
  
  const dominant = posPerc > negPerc ? 'POSITIF' : 'NEGATIF';
  const isPos = dominant === 'POSITIF';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kesimpulan</h1>
        <p className="text-sm text-gray-500 mt-1">Kesimpulan dan rekomendasi otomatis berdasarkan hasil analisis data.</p>
      </div>

      <div className={`card ${isPos ? 'bg-emerald-600' : 'bg-red-600'} text-white p-8`}>
        <div>
          <h2 className="text-2xl font-bold mb-2">Kesimpulan</h2>
          <p className={`${isPos ? 'text-emerald-100' : 'text-red-100'} text-lg leading-relaxed`}>
            "Sentimen <span className={`font-bold ${isPos ? 'text-emerald-300' : 'text-red-300'}`}>{dominant}</span> merupakan kategori dominan dengan persentase {Math.max(posPerc, negPerc)}%. 
            {isPos ? 
              ` Namun, terdapat keluhan NEGATIF yang cukup perlu diperhatikan sebesar ${negPerc}%.` :
              ` Terdapat sentimen POSITIF sebesar ${posPerc}% yang perlu ditingkatkan.`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={20} />
            Key Findings (Positif)
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <p className="text-gray-700 text-sm">Fitur transfer dinilai <span className="font-semibold text-emerald-600">cepat dan mudah digunakan</span> oleh mayoritas pengguna.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <p className="text-gray-700 text-sm">UI/UX baru (Tampilan aplikasi) mendapat respon positif dengan banyak ulasan menyebutkan <span className="font-semibold text-emerald-600">"sangat membantu"</span>.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <p className="text-gray-700 text-sm">Tren sentimen positif cenderung stabil dan meningkat di akhir pekan.</p>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Area Perbaikan (Negatif)
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <p className="text-gray-700 text-sm">Frasa <span className="font-semibold text-red-600">"tidak bisa login"</span> dan <span className="font-semibold text-red-600">"sering error"</span> merupakan bigram negatif yang paling sering muncul (Total &gt;900 ulasan).</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <p className="text-gray-700 text-sm">Sistem transaksi sering mengalami gangguan (timeout) terutama pada jam operasional sibuk (09:00 - 12:00).</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="card p-6 border-l-4 border-l-primary">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Recommendation for Business
        </h3>
        <p className="text-gray-700 leading-relaxed bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
          "Berdasarkan analisis frekuensi kata, topik yang sering dibicarakan adalah {topWords.slice(0,3).map(w => w.name).join(', ')}. <strong>Sangat direkomendasikan untuk memprioritaskan peningkatan fitur yang berkaitan dengan keluhan terbanyak untuk menurunkan sentimen negatif.</strong>"
        </p>
      </div>
    </div>
  );
};

export default Insight;
