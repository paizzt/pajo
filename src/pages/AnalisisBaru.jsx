import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, Loader2, BrainCircuit, CheckCircle, AlertTriangle, PieChart, TrendingUp
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import axios from 'axios';
import Swal from 'sweetalert2';
import Papa from 'papaparse';

const AnalisisBaru = () => {
  const [step, setStep] = useState(1); // 1: Input Data, 2: Proses AI, 3: Laporan

  // === STEP 1 STATES ===
  const [inputType, setInputType] = useState('playstore'); // playstore, upload
  const [appId, setAppId] = useState('');
  const [count, setCount] = useState(100);
  const [scrapeStatus, setScrapeStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  
  // === STEP 2 STATES ===
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainStatusMsg, setTrainStatusMsg] = useState('');
  
  // === STEP 3 STATES ===
  const [reportData, setReportData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  // === STEP 2 LOGIC: PROGRESS POLLING ===
  useEffect(() => {
    let interval;
    if (step === 2) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get('http://localhost:8000/api/model/train-progress');
          const { is_training, progress, status_message } = res.data;
          
          setTrainProgress(progress);
          setTrainStatusMsg(status_message);
          
          if (!is_training) {
            clearInterval(interval);
            if (progress === 100) {
              // Sukses, fetch laporan dan lanjut step 3
              fetchReportData();
            } else if (status_message && status_message.startsWith('Error')) {
              Swal.fire({ icon: 'error', title: 'Gagal Memproses!', text: status_message });
              setStep(1);
            } else {
               fetchReportData();
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // === ACTIONS ===
  const handleStartScrapeAndTrain = async () => {
    if (inputType === 'playstore' && !appId) {
      return Swal.fire('Perhatian', 'ID Aplikasi wajib diisi', 'warning');
    }
    if (inputType === 'upload' && !csvFile) {
      return Swal.fire('Perhatian', 'File CSV wajib diunggah', 'warning');
    }
    
    try {
      setScrapeStatus('loading');
      
      let reviewsData = [];
      let datasetName = '';
      
      if (inputType === 'playstore') {
        // 1. Ambil Data Play Store
        const scrapeRes = await axios.post('http://localhost:8000/api/scrape', {
          app_id: appId, count: Number(count), lang: 'id', country: 'id'
        });
        reviewsData = scrapeRes.data.data;
        datasetName = `Dataset ${appId}`;
      } else {
        // 1. Parsing CSV
        reviewsData = await new Promise((resolve, reject) => {
          Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const data = results.data;
              if (data.length === 0) return reject(new Error("File CSV kosong."));
              
              const contentKey = Object.keys(data[0]).find(k => ['content', 'text', 'ulasan', 'review', 'teks'].includes(k.toLowerCase()));
              const scoreKey = Object.keys(data[0]).find(k => ['score', 'rating', 'skor', 'nilai'].includes(k.toLowerCase()));
              
              if (!contentKey || !scoreKey) {
                return reject(new Error("File CSV harus memiliki kolom 'ulasan/content' dan 'rating/score'."));
              }
              
              const formatted = data.map((row, idx) => ({
                id: `csv_${Date.now()}_${idx}`,
                username: row['userName'] || row['username'] || row['nama'] || `user_${idx}`,
                content: row[contentKey],
                score: parseInt(row[scoreKey]) || 3,
                date: row['date'] || row['tanggal'] || new Date().toISOString(),
                thumbs_up: parseInt(row['thumbsUpCount'] || row['thumbs_up'] || 0)
              }));
              resolve(formatted);
            },
            error: (err) => reject(new Error("Gagal membaca file CSV."))
          });
        });
        datasetName = `Upload ${csvFile.name}`;
      }
      
      // 2. Simpan Data
      await axios.post('http://localhost:8000/api/reviews/save', {
        app_id: inputType === 'playstore' ? appId : 'csv_upload', 
        dataset_name: datasetName, 
        reviews: reviewsData
      });
      
      setScrapeStatus('success');
      
      // Lanjut ke Step 2 (Training)
      setStep(2);
      setTrainProgress(0);
      setTrainStatusMsg('Menyiapkan data...');
      
      // 3. Mulai Training
      await axios.post('http://localhost:8000/api/model/train', {
        c: 1.0, kernel: 'linear', ngram_range: '(1,3)', max_features: 1500, dataset_id: null
      });
      
    } catch (err) {
      setScrapeStatus('error');
      const errDetail = err.response?.data?.detail || err.message || "Gagal mengambil data. Pastikan koneksi dan file benar.";
      setErrorMessage(errDetail);
      Swal.fire({ icon: 'error', title: 'Gagal!', text: errDetail });
    }
  };

  const fetchReportData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/dashboard/stats?time=all&sentiment=all');
      setReportData(res.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal!', 'Gagal memuat laporan', 'error');
      setStep(1);
    }
  };

  const handleSaveAndReset = async () => {
    if (!reportTitle) return Swal.fire('Perhatian', 'Beri nama laporan terlebih dahulu', 'warning');
    
    setIsSaving(true);
    try {
      // Simpan Hasil beserta JSON lengkap
      await axios.post('http://localhost:8000/api/results', {
        title: reportTitle,
        description: `Laporan untuk aplikasi: ${appId}`,
        dataset_name: `Dataset ${appId}`,
        report_data: JSON.stringify(reportData)
      });
      
      // Reset Sistem ke 0
      await axios.delete('http://localhost:8000/api/reset');
      
      Swal.fire('Tersimpan!', 'Laporan berhasil disimpan dan sistem telah dikosongkan untuk analisis baru.', 'success');
      
      // Kembalikan ke awal
      setStep(1);
      setAppId('');
      setCount(100);
      setReportData(null);
      setReportTitle('');
      setScrapeStatus('idle');
      
    } catch (err) {
      Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // === RENDER HELPERS ===
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-primary bg-emerald-50' : 'border-gray-300'}`}>1</div>
        <span className="ml-2 font-medium hidden sm:inline">Kumpulkan Data</span>
      </div>
      <div className={`w-12 sm:w-24 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
      <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-primary bg-emerald-50' : 'border-gray-300'}`}>2</div>
        <span className="ml-2 font-medium hidden sm:inline">Proses</span>
      </div>
      <div className={`w-12 sm:w-24 h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
      <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'border-primary bg-emerald-50' : 'border-gray-300'}`}>3</div>
        <span className="ml-2 font-medium hidden sm:inline">Hasil & Simpan</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buat Analisis Baru</h1>
        <p className="text-gray-500 mt-2">Ikuti langkah-langkah di bawah untuk mendapatkan laporan lengkap.</p>
      </div>

      {renderStepIndicator()}

      {/* STEP 1: INPUT DATA */}
      {step === 1 && (
        <div className="card p-6 sm:p-8 shadow-md border border-gray-100 animate-in slide-in-from-right-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Langkah 1: Dari mana sumber data Anda?</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${inputType === 'playstore' ? 'border-primary bg-blue-50/50 text-primary' : 'border-gray-200 text-gray-500'}`}
              onClick={() => setInputType('playstore')}
            >
              <span className="font-semibold">Playstore</span>
            </button>
            <button 
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${inputType === 'upload' ? 'border-primary bg-blue-50/50 text-primary' : 'border-gray-200 text-gray-500'}`}
              onClick={() => setInputType('upload')}
            >
              <span className="font-semibold">Upload</span>
            </button>
          </div>

          {inputType === 'playstore' ? (
            <div className="space-y-4 max-w-lg mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ID Aplikasi di Play Store</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input type="text" className="input-field pl-10 w-full" placeholder="Contoh: com.whatsapp" value={appId} onChange={(e) => setAppId(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Maksimal Ulasan</label>
                <input type="number" className="input-field w-full" value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-lg mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File CSV Anda</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk memilih file</span> atau tarik file ke sini</p>
                      <p className="text-xs text-gray-500">Mendukung format .csv</p>
                    </div>
                    <input type="file" className="hidden" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
                  </label>
                </div>
                {csvFile && <p className="text-sm text-emerald-600 mt-2 font-semibold text-center">File terpilih: {csvFile.name}</p>}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              className="btn btn-primary px-8 py-3 text-lg"
              onClick={handleStartScrapeAndTrain}
              disabled={scrapeStatus === 'loading' || (inputType === 'upload' && !csvFile) || (inputType === 'playstore' && !appId)}
            >
              {scrapeStatus === 'loading' ? 'Loading' : 'Proses'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PROSES AI */}
      {step === 2 && (
        <div className="card p-10 shadow-md border border-gray-100 text-center animate-in zoom-in-95">
          <BrainCircuit size={64} className="mx-auto text-primary mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Proses</h2>
          <p className="text-gray-500 mb-8">Silakan tunggu, sistem sedang membaca, membersihkan teks, dan mengklasifikasikan sentimen secara otomatis.</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-2 text-sm font-bold text-emerald-800">
              <span>{trainStatusMsg || 'Memproses...'}</span>
              <span>{trainProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-emerald-400 to-primary h-4 rounded-full transition-all duration-500" style={{ width: `${trainProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: LAPORAN & SIMPAN */}
      {step === 3 && reportData && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
             <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
             <h2 className="text-2xl font-bold text-emerald-800">Analisis Selesai!</h2>
             <p className="text-emerald-600 mt-1">Sistem berhasil memproses <strong>{reportData.stats.total_ulasan}</strong> ulasan dengan akurasi model <strong>{reportData.stats.akurasi_model}</strong>.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* KESIMPULAN */}
             <div className="card p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Kesimpulan Cepat</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sentimen Positif mencapai <strong>{reportData.stats.positif}</strong> ulasan, sedangkan Negatif <strong>{reportData.stats.negatif}</strong> ulasan.
                  Topik yang paling sering dibicarakan adalah: <strong className="text-primary">{reportData.top_words.slice(0,3).map(w=>w.name).join(', ')}</strong>.
                </p>
             </div>

             {/* PIE CHART MINIMALIS */}
             <div className="card p-6 shadow-sm border border-gray-100 h-64">
                <h3 className="font-bold text-gray-800 text-sm mb-2 text-center">Proporsi Sentimen</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={reportData.pie_data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" label>
                      {reportData.pie_data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
             </div>
          </div>

          {/* SIMPAN & RESET */}
          <div className="card p-8 shadow-lg border-2 border-primary/20 bg-gradient-to-br from-white to-emerald-50/50 mt-8">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Simpan & Bersihkan Ruang Kerja</h3>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Beri Nama Laporan Ini</label>
                <input 
                  type="text" 
                  className="input-field w-full text-center text-lg py-3" 
                  placeholder="Contoh: Analisis BCA Agustus" 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)} 
                />
              </div>
              <button 
                className="btn btn-primary w-full py-4 text-lg font-bold"
                onClick={handleSaveAndReset}
                disabled={isSaving || !reportTitle}
              >
                {isSaving ? 'Loading' : 'Simpan'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Data akan otomatis di-reset setelah disimpan.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AnalisisBaru;
