import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Loader2, UploadCloud, Link as LinkIcon, CheckCircle, Database, FileText, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const KelolaData = () => {
  const [activeTab, setActiveTab] = useState('daftar'); // daftar, playstore, upload
  
  // States for Daftar Ulasan
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States for Scraper
  const [appId, setAppId] = useState('com.muamalat.mobile');
  const [count, setCount] = useState(100);
  const [lang, setLang] = useState('id');
  const [scrapeStatus, setScrapeStatus] = useState('idle'); // idle, loading, success, error
  const [scrapeData, setScrapeData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [datasetName, setDatasetName] = useState('Dataset Baru');

  // States for Upload
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, done

  useEffect(() => {
    if (activeTab === 'daftar') {
      fetchReviews();
    }
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sentimentFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/reviews');
      setReviews(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data dari database");
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'POSITIF':
        return <span className="badge badge-success">POSITIF</span>;
      case 'NEGATIF':
        return <span className="badge badge-danger">NEGATIF</span>;
      case 'NETRAL':
        return <span className="badge badge-neutral">NETRAL</span>;
      default:
        return null;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {'★'.repeat(rating)}
        <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
      </div>
    );
  };

  // Filter logic
  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === '' || r.sentiment === sentimentFilter;
    const matchesRating = ratingFilter === '' || r.rating.toString() === ratingFilter;
    return matchesSearch && matchesSentiment && matchesRating;
  });
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentItems = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    if (filteredReviews.length === 0) return Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Tidak ada data untuk diexport' });
    const headers = ['No', 'Review', 'Rating', 'Tanggal', 'Sentimen', 'Kepercayaan Sistem'];
    const rows = filteredReviews.map((r, i) => [
      i + 1,
      `"${r.text.replace(/"/g, '""')}"`,
      r.rating,
      r.date,
      r.sentiment,
      r.confidence
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_ulasan_pajo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (filteredReviews.length === 0) return Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Tidak ada data untuk diexport' });
    const doc = new jsPDF();
    doc.text("Laporan Data Ulasan - Pajo", 14, 15);
    const tableColumn = ["No", "Review", "Rating", "Tanggal", "Sentimen"];
    const tableRows = [];
    filteredReviews.forEach((r, i) => {
      tableRows.push([i + 1, r.text, r.rating, r.date, r.sentiment]);
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 1: { cellWidth: 90 } }
    });
    doc.save("data_ulasan_pajo.pdf");
  };

  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 5];
      } else if (currentPage >= totalPages - 2) {
        pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
      }
    }
    return pages;
  };
  
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Scraper Actions
  const handleScrape = async () => {
    try {
      setScrapeStatus('loading');
      setErrorMessage('');
      const response = await axios.post('http://localhost:8000/api/scrape', {
        app_id: appId, count: Number(count), lang: lang, country: 'id'
      });
      setScrapeData(response.data);
      setScrapeStatus('success');
    } catch (error) {
      setScrapeStatus('error');
      setErrorMessage(error.response?.data?.detail || "Gagal mengambil data. Pastikan koneksi internet aktif dan App ID benar.");
    }
  };

  const handleSaveToDataset = async () => {
    if (!scrapeData || !scrapeData.data) return;
    try {
      setSaveStatus('loading');
      await axios.post('http://localhost:8000/api/reviews/save', {
        app_id: scrapeData.app_id, dataset_name: datasetName, reviews: scrapeData.data
      });
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setActiveTab('daftar'); // Kembali ke daftar ulasan setelah save
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      Swal.fire({ icon: 'error', title: 'Gagal!', text: "Gagal menyimpan ulasan ke dalam sistem." });
    }
  };

  // Upload actions
  const handleUpload = (e) => {
    e.preventDefault();
    setUploadStatus('uploading');
    setTimeout(() => setUploadStatus('processing'), 1500);
    setTimeout(() => setUploadStatus('done'), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Data Ulasan</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat ulasan yang sudah ada, atau tambahkan data ulasan baru untuk dianalisis oleh AI.</p>
      </div>

      {/* INFO CARD AWAM */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <Info className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-blue-900">Apa fungsi halaman ini?</h3>
          <p className="text-blue-800 text-sm mt-1">
            Di sinilah tempat Anda mengumpulkan bahan baku. Kecerdasan Buatan (AI) membutuhkan banyak contoh teks ulasan untuk bisa belajar. Anda bisa melihat data yang sudah ada, mengambil langsung dari Play Store, atau mengunggah file.
          </p>
        </div>
      </div>

      <div className="card">
        {/* TAB NAVIGATION */}
        <div className="border-b border-gray-200 flex flex-wrap">
          <button 
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'daftar' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('daftar')}
          >
            <Database size={18} /> Daftar Ulasan ({reviews.length})
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'playstore' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('playstore')}
          >
            <Download size={18} /> Ambil dari Play Store
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={18} /> Upload File Excel/CSV
          </button>
        </div>

        {/* TAB 1: DAFTAR ULASAN */}
        {activeTab === 'daftar' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10 bg-white"
                  placeholder="Cari kata di ulasan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select 
                  className="input-field py-2 text-sm w-full sm:w-auto bg-white"
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                >
                  <option value="">Semua Sentimen</option>
                  <option value="POSITIF">Positif</option>
                  <option value="NEGATIF">Negatif</option>
                  <option value="NETRAL">Netral</option>
                </select>
                <select 
                  className="input-field py-2 text-sm w-full sm:w-auto bg-white"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="">Semua Rating (Bintang)</option>
                  <option value="5">5 Bintang</option>
                  <option value="4">4 Bintang</option>
                  <option value="3">3 Bintang</option>
                  <option value="2">2 Bintang</option>
                  <option value="1">1 Bintang</option>
                </select>
                <button onClick={exportCSV} className="btn btn-secondary text-xs">CSV</button>
                <button onClick={exportPDF} className="btn btn-secondary text-xs">PDF</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-12 text-center">No</th>
                    <th className="px-6 py-4 font-semibold">Teks Ulasan</th>
                    <th className="px-6 py-4 font-semibold w-32">Bintang</th>
                    <th className="px-6 py-4 font-semibold w-32">Tanggal</th>
                    <th className="px-6 py-4 font-semibold w-28">Sentimen Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary" />
                        Memuat data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-red-500">{error}</td>
                    </tr>
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Belum ada data ulasan. Silakan klik tab "Ambil dari Play Store".
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((review, index) => (
                      <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          "{review.text}"
                        </td>
                        <td className="px-6 py-4">{renderStars(review.rating)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{review.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getSentimentBadge(review.sentiment)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalItems > 0 && (
              <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between bg-white gap-4">
                <span className="text-sm text-gray-500">
                  Menampilkan {startIndex} - {endIndex} dari {totalItems} data
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={20} /></button>
                  {getPageNumbers().map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded text-sm font-medium ${currentPage === page ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={20} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLAYSTORE SCRAPER */}
        {activeTab === 'playstore' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4 max-w-xl mx-auto border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Minta Robot Mengambil Ulasan</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ID Aplikasi di Play Store</label>
                <p className="text-xs text-gray-500 mb-2">Contoh: com.whatsapp, com.gojek.app</p>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input type="text" className="input-field pl-10 w-full" value={appId} onChange={(e) => setAppId(e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Data</label>
                  <p className="text-xs text-gray-500 mb-2">Berapa banyak?</p>
                  <input type="number" className="input-field w-full" value={count} onChange={(e) => setCount(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bahasa</label>
                  <p className="text-xs text-gray-500 mb-2">Pilih bahasa</p>
                  <select className="input-field w-full" value={lang} onChange={(e) => setLang(e.target.value)}>
                    <option value="id">Indonesia (ID)</option>
                    <option value="en">Inggris (EN)</option>
                  </select>
                </div>
              </div>

              {scrapeStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <button 
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4 text-base"
                onClick={handleScrape}
                disabled={scrapeStatus === 'loading'}
              >
                {scrapeStatus === 'loading' ? <><Loader2 size={20} className="animate-spin" /> Sedang Mengambil Data...</> : <><Download size={20} /> Ambil Data Sekarang!</>}
              </button>
            </div>
            
            {scrapeStatus === 'success' && scrapeData && (
              <div className="mt-6 border border-emerald-100 rounded-xl overflow-hidden animate-in fade-in duration-500">
                <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-800">🎉 Berhasil Mendapatkan {scrapeData.total_extracted} Ulasan!</h4>
                    <p className="text-sm text-emerald-600 mt-0.5">Dari aplikasi: {scrapeData.app_id}</p>
                  </div>
                  <button 
                    className={`btn py-2 text-sm ${saveStatus === 'success' ? 'bg-emerald-600 text-white' : 'btn-primary'}`} 
                    onClick={handleSaveToDataset}
                    disabled={saveStatus === 'loading' || saveStatus === 'success'}
                  >
                    {saveStatus === 'loading' ? 'Menyimpan...' : saveStatus === 'success' ? 'Tersimpan!' : 'Simpan Ulasan Ini'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPLOAD CSV */}
        {activeTab === 'upload' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 mb-1">Panduan Format File</p>
              <p className="text-sm text-blue-800">
                Gunakan format .csv (Excel) dengan header kolom huruf kecil tepat seperti ini: <code>userName,score,at,content</code>
              </p>
            </div>

            {uploadStatus === 'idle' && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-700 mb-1">Klik untuk memilih file CSV</p>
                <p className="text-xs text-gray-500">Atau seret dan lepas file ke area ini (Maksimal 50MB)</p>
                <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleUpload} />
              </div>
            )}

            {uploadStatus !== 'idle' && (
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gray-100 rounded-lg"><FileText size={24} className="text-gray-600" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">file_ulasan.csv</h4>
                    <p className="text-sm text-gray-500">Membaca file...</p>
                  </div>
                </div>
                
                <div className="space-y-4 relative">
                  <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm"><CheckCircle size={14} /></div>
                    <div className="pb-1">
                      <p className="text-sm font-medium text-gray-800">Mengunggah File</p>
                      <p className="text-xs text-gray-500">Selesai</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ${uploadStatus === 'done' ? 'bg-emerald-500 text-white' : uploadStatus === 'processing' ? 'bg-primary text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
                      {uploadStatus === 'done' ? <CheckCircle size={14} /> : <Database size={12} />}
                    </div>
                    <div className="pb-1">
                      <p className={`text-sm font-medium ${uploadStatus === 'processing' || uploadStatus === 'done' ? 'text-gray-800' : 'text-gray-400'}`}>Menyimpan ke Database</p>
                      {uploadStatus === 'processing' && <p className="text-xs text-gray-500 mt-1">Harap tunggu...</p>}
                    </div>
                  </div>
                </div>
                
                {uploadStatus === 'done' && (
                  <div className="mt-6 flex justify-end">
                    <button className="btn btn-primary" onClick={() => { setUploadStatus('idle'); setActiveTab('daftar'); }}>Lihat Hasil Unggahan</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaData;
