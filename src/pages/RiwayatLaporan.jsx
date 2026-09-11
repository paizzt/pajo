import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Loader2, PieChart, CheckCircle, AlertTriangle, TrendingUp, Target, BarChart3, Table2, Trash2, Eye, X } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';

const RiwayatLaporan = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/results');
      if (res.data.status === 'success') {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (res) => {
    try {
      const reportData = res.report_data ? JSON.parse(res.report_data) : null;
      setSelectedReport({ ...res, parsedReportData: reportData });
    } catch (e) {
      console.error("Gagal membaca data laporan", e);
      setSelectedReport({ ...res, parsedReportData: null });
    }
    setSelectedCell(null); // Reset cell selection
    setSelectedSentiment(null);
  };

  const handleDeleteReport = async (e, id) => {
    e.stopPropagation(); // Mencegah card terbuka saat tombol hapus diklik
    
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Laporan yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:8000/api/results/${id}`);
        if (res.data.status === 'success') {
          Swal.fire('Terhapus!', 'Laporan telah berhasil dihapus.', 'success');
          fetchResults();
          if (selectedReport && selectedReport.id === id) {
            setSelectedReport(null);
          }
        }
      } catch (err) {
        Swal.fire('Error', 'Terjadi kesalahan saat menghapus laporan.', 'error');
      }
    }
  };

  const exportPDF = (report) => {
    const doc = new jsPDF();
    const data = report.parsedReportData;
    
    doc.setFontSize(18);
    doc.text(`Laporan Analisis: ${report.title}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Tanggal: ${new Date(report.created_at + 'Z').toLocaleString('id-ID')}`, 14, 28);
    doc.text(`Akurasi Sistem: ${report.accuracy}%`, 14, 34);

    if (data && data.stats) {
      doc.text(`Total Ulasan: ${data.stats.total_ulasan}`, 14, 44);
      doc.text(`Sentimen Positif: ${data.stats.positif}`, 14, 50);
      doc.text(`Sentimen Negatif: ${data.stats.negatif}`, 14, 56);
      doc.text(`Sentimen Netral: ${data.stats.netral}`, 14, 62);
      
      if (data.metrics) {
        doc.text(`Precision: ${data.metrics.precision}% | Recall: ${data.metrics.recall}% | F1-Score: ${data.metrics.f1_score}%`, 14, 72);
      }

      if (data.top_words && data.top_words.length > 0) {
        doc.text("Topik Paling Sering Dibahas:", 14, 84);
        const words = data.top_words.map(w => `${w.name} (${w.count})`).join(', ');
        const splitText = doc.splitTextToSize(words, 180);
        doc.text(splitText, 14, 90);
      }
    } else {
      doc.text("Detail statistik lengkap tidak tersedia untuk laporan ini.", 14, 50);
    }

    doc.save(`Laporan_${report.title.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  // --- TAMPILAN FULL REPORT ---
  if (selectedReport) {
    const data = selectedReport.parsedReportData;
    const stats = data?.stats;
    const PIE_DATA = data?.pie_data || [];
    const TOP_WORDS = data?.top_words || [];
    const METRICS = data?.metrics;
    const FEATURES = data?.features || [];
    const CM = METRICS?.confusion_matrix;
    const CLASSES = METRICS?.classes;
    
    let isPos = true;
    let dominant = "N/A";
    let posPerc = 0, negPerc = 0;
    
    if (stats && stats.total_ulasan > 0) {
      posPerc = Math.round((stats.positif / stats.total_ulasan) * 100);
      negPerc = Math.round((stats.negatif / stats.total_ulasan) * 100);
      dominant = posPerc > negPerc ? 'POSITIF' : 'NEGATIF';
      isPos = dominant === 'POSITIF';
    }

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-8">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <button onClick={() => setSelectedReport(null)} className="btn btn-secondary font-bold">
            Kembali
          </button>
          <div className="flex gap-2">
            <button onClick={(e) => handleDeleteReport(e, selectedReport.id)} className="btn bg-red-100 text-red-600 hover:bg-red-200 font-bold">
              Hapus
            </button>
            <button onClick={() => exportPDF(selectedReport)} className="btn btn-primary font-bold">
              Unduh
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{selectedReport.title}</h1>
          <p className="text-gray-500 mt-2"><Calendar size={14} className="inline mr-1" /> {new Date(selectedReport.created_at + 'Z').toLocaleString('id-ID')} | Akurasi AI: {selectedReport.accuracy}%</p>
        </div>

        {!data ? (
          <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl text-center border border-yellow-200">
            <AlertTriangle size={32} className="mx-auto mb-2 text-yellow-500" />
            <h3 className="font-bold">Data Detail Tidak Tersedia</h3>
            <p>Laporan ini disimpan dengan versi sistem lama yang hanya menyimpan akurasi.</p>
          </div>
        ) : (
          <>
            {/* KESIMPULAN OTOMATIS */}
            <div className={`card overflow-hidden shadow-md ${isPos ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  Kesimpulan
                </h2>
                <p className="text-xl leading-relaxed font-medium">
                  "Berdasarkan analisis terhadap {stats.total_ulasan} ulasan, respons pengguna dominan bernada <span className="bg-white/20 px-2 py-1 rounded-md font-bold">{dominant}</span> dengan persentase mencapai {Math.max(posPerc, negPerc)}%. 
                  {isPos ? 
                    ` Meskipun dominan positif, masih terdapat keluhan negatif (${negPerc}%) yang bisa menjadi bahan evaluasi.` :
                    ` Sangat disarankan untuk segera memperbaiki fitur yang banyak dikeluhkan.`
                  }"
                </p>
              </div>
              <div className="bg-black/10 p-4 flex justify-around text-sm font-medium">
                <div>Positif: {stats.positif}</div>
                <div>Negatif: {stats.negatif}</div>
                <div>Netral: {stats.netral}</div>
              </div>
            </div>

            {/* METRIK MODEL */}
            {METRICS && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Target size={20} className="text-primary" /> Metrik Evaluasi Model</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Accuracy', value: METRICS.accuracy, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { label: 'Precision', value: METRICS.precision, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { label: 'Recall', value: METRICS.recall, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                    { label: 'F1-Score', value: METRICS.f1_score, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  ].map((m, i) => (
                    <div key={i} className={`card p-5 border ${m.color} text-center`}>
                      <p className="text-sm font-medium opacity-80">{m.label}</p>
                      <p className="text-3xl font-bold mt-1">{m.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISUALISASI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PIE CHART */}
              <div className="card p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><PieChart className="text-primary" size={20} /> Proporsi Sentimen</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" label>
                        {PIE_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TOP WORDS */}
              <div className="card p-6 shadow-sm border border-gray-100 bg-gray-900 text-white rounded-xl">
                <h3 className="text-lg font-bold text-gray-100 mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-400" size={20} /> Topik Pembicaraan</h3>
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
            </div>

            {/* CONFUSION MATRIX */}
            {CM && CLASSES && (
              <div className="card p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-primary" /> Confusion Matrix</h3>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className={`overflow-x-auto ${selectedCell ? 'lg:w-1/2' : 'w-full'} transition-all duration-300`}>
                    <table className="mx-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="p-3 text-xs text-gray-500 font-semibold" rowSpan={2} colSpan={2}></th>
                          <th className="p-2 text-center text-xs font-bold text-gray-700 border-b-2 border-gray-200" colSpan={CLASSES.length}>Prediksi</th>
                        </tr>
                        <tr>
                          {CLASSES.map((cls, i) => (
                            <th key={i} className="p-3 text-xs font-bold text-gray-700 text-center min-w-[80px]">{cls}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CM.map((row, ri) => (
                          <tr key={ri}>
                            {ri === 0 && (
                              <td className="p-2 text-xs font-bold text-gray-700" rowSpan={CLASSES.length} style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>Aktual</td>
                            )}
                            <td className="p-3 text-xs font-bold text-gray-700 text-right">{CLASSES[ri]}</td>
                            {row.map((val, ci) => {
                              const maxVal = Math.max(...CM.flat());
                              const intensity = maxVal > 0 ? val / maxVal : 0;
                              const isDiagonal = ri === ci;
                              const bgColor = isDiagonal 
                                ? `rgba(16, 185, 129, ${0.15 + intensity * 0.65})` 
                                : val > 0 ? `rgba(239, 68, 68, ${0.1 + intensity * 0.5})` : 'rgba(243, 244, 246, 0.5)';
                              return (
                                <td 
                                  key={ci} 
                                  className={`p-3 text-center border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity ${selectedCell?.actual === CLASSES[ri] && selectedCell?.predicted === CLASSES[ci] ? 'ring-2 ring-primary ring-inset' : ''}`} 
                                  style={{ backgroundColor: bgColor }}
                                  onClick={() => setSelectedCell({ actual: CLASSES[ri], predicted: CLASSES[ci], value: val })}
                                >
                                  <span className={`text-lg font-bold ${isDiagonal ? 'text-emerald-800' : val > 0 ? 'text-red-700' : 'text-gray-400'}`}>{val}</span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400 text-center mt-3">Hijau = prediksi benar (diagonal), Merah = prediksi salah.<br/>Klik angka untuk melihat detail ulasan.</p>
                  </div>
                  
                  {/* Right Panel for Selected Cell */}
                  {selectedCell && (
                    <div className="lg:w-1/2 bg-gray-50 rounded-xl border border-gray-200 p-4 h-[400px] flex flex-col animate-in slide-in-from-right-4">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <div>
                          <h4 className="font-bold text-gray-800">Detail Ulasan</h4>
                          <p className="text-xs text-gray-500">
                            Aktual: <span className="font-bold">{selectedCell.actual}</span> | Prediksi: <span className="font-bold">{selectedCell.predicted}</span> ({selectedCell.value} data)
                          </p>
                        </div>
                        <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                        {METRICS.predictions
                          ?.filter(p => p.actual === selectedCell.actual && p.predicted === selectedCell.predicted)
                          .map((p, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                              <p className="text-gray-700 mb-2">"{p.text}"</p>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">Akurasi AI: {p.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        {(!METRICS.predictions || METRICS.predictions.filter(p => p.actual === selectedCell.actual && p.predicted === selectedCell.predicted).length === 0) && (
                          <div className="text-center text-gray-400 py-10">Tidak ada detail ulasan untuk kategori ini.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEMUA ULASAN & PREDIKSI */}
            {METRICS && METRICS.predictions && (
              <div className="card p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Table2 size={20} className="text-primary" /> Hasil Seluruh Ulasan & Prediksi AI</h3>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 shadow-sm">
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-600">No</th>
                        <th className="text-left p-3 font-semibold text-gray-600 w-1/2">Ulasan</th>
                        <th className="text-center p-3 font-semibold text-gray-600">Aktual</th>
                        <th className="text-center p-3 font-semibold text-gray-600">Prediksi</th>
                        <th className="text-center p-3 font-semibold text-gray-600">Kepercayaan AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {METRICS.predictions.map((p, i) => (
                        <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-emerald-50/30 transition-colors`}>
                          <td className="p-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                          <td className="p-3 text-gray-700">{p.text}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.actual === 'POSITIF' ? 'bg-emerald-100 text-emerald-700' : p.actual === 'NEGATIF' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>{p.actual}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.predicted === 'POSITIF' ? 'bg-emerald-100 text-emerald-700' : p.predicted === 'NEGATIF' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>{p.predicted}</span>
                          </td>
                          <td className="p-3 text-center font-bold text-primary">{p.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BAR CHART SENTIMEN */}
            <div className="card p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Jumlah Ulasan per Sentimen</h3>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className={`h-[350px] ${selectedSentiment ? 'lg:w-1/2' : 'w-full'} transition-all duration-300`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PIE_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} />
                      <Bar 
                        dataKey="value" 
                        radius={[6, 6, 0, 0]}
                        onClick={(data) => {
                          if (data && data.name) {
                            setSelectedSentiment(data.name.toUpperCase());
                          }
                        }}
                      >
                        {PIE_DATA.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            cursor="pointer" 
                            className="hover:opacity-80 transition-opacity" 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-400 text-center mt-3">Klik batang grafik untuk melihat detail ulasan.</p>
                </div>

                {/* Right Panel for Selected Sentiment */}
                {selectedSentiment && (
                  <div className="lg:w-1/2 bg-gray-50 rounded-xl border border-gray-200 p-4 h-[350px] flex flex-col animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                      <div>
                        <h4 className="font-bold text-gray-800">Ulasan {selectedSentiment}</h4>
                        <p className="text-xs text-gray-500">
                          Total: <span className="font-bold">{METRICS?.predictions?.filter(p => p.actual === selectedSentiment).length || 0}</span> data
                        </p>
                      </div>
                      <button onClick={() => setSelectedSentiment(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                      {METRICS?.predictions
                        ?.filter(p => p.actual === selectedSentiment)
                        .map((p, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                            <p className="text-gray-700 mb-2">"{p.text}"</p>
                            <div className="flex justify-between items-center text-xs">
                              <span className={`px-2 py-0.5 rounded font-bold ${p.predicted === selectedSentiment ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>Prediksi AI: {p.predicted}</span>
                              <span className="text-gray-400">Kepercayaan: {p.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      {(!METRICS?.predictions || METRICS.predictions.filter(p => p.actual === selectedSentiment).length === 0) && (
                        <div className="text-center text-gray-400 py-10">Tidak ada ulasan untuk sentimen ini.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- TAMPILAN UTAMA (GRID KARTU) ---
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileText size={28} className="text-primary" /> Arsip Riwayat Laporan
        </h1>
        <p className="text-sm text-gray-500 mt-1">Kumpulan seluruh laporan analisis yang pernah Anda buat dan simpan. Klik kartu untuk melihat detailnya.</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">Belum Ada Riwayat</h3>
          <p className="text-gray-500 text-sm">Anda belum pernah menyimpan laporan. Buat analisis baru terlebih dahulu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((res) => (
            <div 
              key={res.id} 
              className="card bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer border border-gray-100 flex flex-col group"
              onClick={() => handleOpenReport(res)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <PieChart size={24} />
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                  Akurasi: {res.accuracy}%
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{res.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{res.description}</p>
              
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(res.created_at + 'Z').toLocaleDateString('id-ID')}</span>
                <div className="flex gap-3 items-center">
                  <button 
                    onClick={(e) => handleDeleteReport(e, res.id)} 
                    className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 font-bold z-10"
                    title="Hapus Laporan"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                  <span className="text-primary font-bold flex items-center gap-1"><Eye size={16} /> Buka</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiwayatLaporan;
