import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Papa from 'papaparse';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
  const [step, setStep] = useState(1); // 1: Input Data, 2: Proses AI, 3: Laporan

  // === STEP 1 STATES ===
  const [inputType, setInputType] = useState('playstore'); // playstore, upload
  const [appId, setAppId] = useState('');
  const [count, setCount] = useState(100);
  const [scrapeStatus, setScrapeStatus] = useState('idle'); // idle, loading, success, error
  const [csvFile, setCsvFile] = useState(null);
  
  // === STEP 2 STATES ===
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainStatusMsg, setTrainStatusMsg] = useState('');
  
  // === STEP 3 STATES ===
  const [reportData, setReportData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [featuresData, setFeaturesData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);

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
      Swal.fire({ icon: 'error', title: 'Gagal!', text: errDetail });
    }
  };

  const fetchReportData = async () => {
    try {
      const [statsRes, metricsRes, featuresRes, reviewsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/dashboard/stats?time=all&sentiment=all'),
        axios.get('http://localhost:8000/api/model/metrics'),
        axios.get('http://localhost:8000/api/features?limit=20'),
        axios.get(`http://localhost:8000/api/reviews?limit=${count || 1000}`)
      ]);
      setReportData(statsRes.data);
      if (metricsRes.data.status === 'success') {
        const metrics = metricsRes.data.data;
        // Replace test set predictions with all predictions for the UI
        if (reviewsRes.data && reviewsRes.data.data) {
          metrics.predictions = reviewsRes.data.data;
        }
        setMetricsData(metrics);
      }
      if (featuresRes.data.status === 'success') {
        setFeaturesData(featuresRes.data.data);
      }
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
      // Simpan Hasil beserta JSON lengkap (termasuk metrics dan features)
      const fullReport = { ...reportData, metrics: metricsData, features: featuresData };
      await axios.post('http://localhost:8000/api/results', {
        title: reportTitle,
        description: `Laporan untuk aplikasi: ${appId}`,
        dataset_name: `Dataset ${appId}`,
        report_data: JSON.stringify(fullReport)
      });
      
      // Reset Sistem ke 0
      await axios.delete('http://localhost:8000/api/reset');
      
      Swal.fire('Tersimpan!', 'Laporan berhasil disimpan dan sistem telah dikosongkan untuk analisis baru.', 'success');
      
      // Kembalikan ke awal
      setStep(1);
      setAppId('');
      setCount(100);
      setReportData(null);
      setMetricsData(null);
      setFeaturesData([]);
      setReportTitle('');
      setScrapeStatus('idle');
      setSelectedCell(null);
      setSelectedSentiment(null);
      
    } catch (err) {
      Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const value = {
    step, setStep,
    inputType, setInputType,
    appId, setAppId,
    count, setCount,
    scrapeStatus, setScrapeStatus,
    csvFile, setCsvFile,
    trainProgress, setTrainProgress,
    trainStatusMsg, setTrainStatusMsg,
    reportData, setReportData,
    metricsData, setMetricsData,
    featuresData, setFeaturesData,
    isSaving, setIsSaving,
    reportTitle, setReportTitle,
    selectedCell, setSelectedCell,
    selectedSentiment, setSelectedSentiment,
    handleStartScrapeAndTrain,
    fetchReportData,
    handleSaveAndReset
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};
