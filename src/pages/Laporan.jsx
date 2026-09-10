import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Filter, Calendar, Loader2, TrendingUp, AlertTriangle, CheckCircle, Save, FileText, Info, BarChart2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Laporan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter for Charts
  const [timeFilter, setTimeFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Results History state
  const [results, setResults] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', dataset_name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchResults();
  }, [timeFilter, sentimentFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/dashboard/stats?time=${timeFilter}&sentiment=${sentimentFilter}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/results');
      if (res.data.status === 'success') setResults(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/results', {
        title: formData.title,
        description: formData.description,
        dataset_name: formData.dataset_name || 'Dataset Default'
      });
      Swal.fire('Berhasil!', 'Laporan berhasil disimpan ke dalam riwayat', 'success');
      setShowSaveModal(false);
      setFormData({ title: '', description: '', dataset_name: '' });
      fetchResults();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.detail || 'Gagal menyimpan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Menganalisis hasil untuk membuat laporan...</span>
      </div>
    );
  }

  const PIE_DATA = data?.pie_data || [];
  const TREND_DATA = data?.trend_data || [];
  const TOP_WORDS = data?.top_words || [];
  const stats = data?.stats || { total_ulasan: 0, positif: 0, negatif: 0, netral: 0 };
  
  const posPerc = stats.total_ulasan ? Math.round((stats.positif / stats.total_ulasan) * 100) : 0;
  const negPerc = stats.total_ulasan ? Math.round((stats.negatif / stats.total_ulasan) * 100) : 0;
  const dominant = posPerc > negPerc ? 'POSITIF' : 'NEGATIF';
  const isPos = dominant === 'POSITIF';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Kesimpulan Akhir</h1>
          <p className="text-sm text-gray-500 mt-1">Rangkuman hasil analisis kecerdasan buatan terhadap ulasan yang dikumpulkan.</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={() => setShowSaveModal(true)}
        >
          <Save size={18} /> Simpan Laporan ke Riwayat
        </button>
      </div>

      {/* INFO CARD AWAM */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <Info className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-blue-900">Cara Membaca Halaman Ini</h3>
          <p className="text-blue-800 text-sm mt-1">
            Halaman ini adalah kesimpulan dari seluruh kerja keras AI. Di bagian atas Anda akan melihat rangkuman otomatis berbahasa manusia. Di bawahnya terdapat grafik (visual) untuk mempermudah Anda melihat perbandingan mana sentimen yang paling besar.
          </p>
        </div>
      </div>

      {/* 1. KESIMPULAN RINGKAS */}
      <div className={`card overflow-hidden shadow-md ${isPos ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-red-700'} text-white`}>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            {isPos ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
            Kesimpulan Otomatis
          </h2>
          <p className="text-xl leading-relaxed font-medium">
            "Berdasarkan analisis terhadap {stats.total_ulasan} ulasan, respons pengguna dominan bernada <span className="bg-white/20 px-2 py-1 rounded-md font-bold">{dominant}</span> dengan persentase mencapai {Math.max(posPerc, negPerc)}%. 
            {isPos ? 
              ` Meskipun dominan positif, masih terdapat keluhan negatif (${negPerc}%) yang bisa menjadi bahan evaluasi untuk perbaikan.` :
              ` Ini adalah sinyal peringatan bahwa sebagian besar pengguna merasa kurang puas, dan sangat disarankan untuk segera memperbaiki fitur yang banyak dikeluhkan.`
            }"
          </p>
        </div>
        <div className="bg-black/10 p-4 px-8 flex justify-between text-sm font-medium">
          <div>Akurasi Sistem: {stats.akurasi_model}</div>
          <div>Total Kata Kunci Ditemukan: {TOP_WORDS.length}</div>
        </div>
      </div>

      {/* 2. VISUALISASI GRAFIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE CHART */}
        <div className="card p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <PieChart className="text-primary" size={20} /> Proporsi Sentimen
          </h3>
          <p className="text-sm text-gray-500 mb-6">Perbandingan jumlah ulasan positif, negatif, dan netral.</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" label>
                  {PIE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP WORDS */}
        <div className="card p-6 shadow-sm border border-gray-100 bg-gray-900 text-white rounded-xl">
          <h3 className="text-lg font-bold text-gray-100 mb-2 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={20} /> Kata Paling Sering Muncul
          </h3>
           <p className="text-sm text-gray-400 mb-6">Topik atau fitur yang paling sering dibahas pengguna akhir-akhir ini.</p>
           <div className="w-full h-64 border border-gray-700 rounded-lg flex items-center justify-center bg-gray-800 shadow-inner p-4">
             <div className="flex flex-wrap justify-center gap-3">
                {TOP_WORDS.map((w, i) => {
                  const sizes = ['text-4xl font-bold', 'text-2xl font-semibold', 'text-3xl font-extrabold', 'text-xl font-bold', 'text-lg', 'text-base'];
                  const colors = ['text-emerald-400', 'text-emerald-200', 'text-red-400', 'text-blue-300', 'text-yellow-200', 'text-gray-300'];
                  return (
                    <span key={i} className={`${sizes[i % sizes.length]} ${colors[i % colors.length]}`}>
                      {w.name} <span className="text-xs text-gray-500 opacity-50">({w.count})</span>
                    </span>
                  );
                })}
             </div>
           </div>
        </div>

        {/* AREA CHART */}
        <div className="card p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart2 className="text-primary" size={20} /> Grafik Pergerakan Sentimen
              </h3>
              <p className="text-sm text-gray-500 mt-1">Lihat apakah ulasan positif/negatif naik atau turun.</p>
            </div>
            <select 
              className="input-field py-2 text-sm bg-white border border-gray-200 rounded-md"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">Sepanjang Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositif" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorNegatif" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Positif" stroke="#10b981" fillOpacity={1} fill="url(#colorPositif)" />
                <Area type="monotone" dataKey="Negatif" stroke="#ef4444" fillOpacity={1} fill="url(#colorNegatif)" />
                <Area type="monotone" dataKey="Netral" stroke="#64748b" fillOpacity={0.1} fill="#64748b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. RIWAYAT SIMPAN */}
      <div className="card p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="text-primary" size={20} /> Riwayat Laporan Tersimpan
        </h3>
        
        {results.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Belum ada riwayat laporan yang disimpan. Klik tombol "Simpan Laporan ke Riwayat" di pojok kanan atas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="p-3">Judul Laporan</th>
                  <th className="p-3">Akurasi</th>
                  <th className="p-3">Tanggal Disimpan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((res) => (
                  <tr key={res.id} className="text-sm">
                    <td className="p-3 font-medium text-gray-800">{res.title}</td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">{res.accuracy}%</span></td>
                    <td className="p-3 text-gray-500">{new Date(res.created_at + 'Z').toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL SIMPAN */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Simpan Laporan Saat Ini</h3>
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul / Nama Laporan</label>
                <input required type="text" className="input-field w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Laporan Kuartal 1" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>Batal</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Laporan;
