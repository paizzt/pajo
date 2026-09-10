import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDown, ArrowRight, ArrowLeft, Database, Type, Scissors, Network, BrainCircuit, Activity, Eraser, Loader2, 
  Search, Hash, Settings, Save, RefreshCw, PlayCircle, Download, Target, PieChart as PieChartIcon, Crosshair, X 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Swal from 'sweetalert2';

const DapurAI = () => {
  const [activeStep, setActiveStep] = useState(1); // 1: Pipeline, 2: Fitur, 3: Training, 4: Evaluasi

  // ===== STATE: GLOBAL / PIPELINE =====
  const [pipelineData, setPipelineData] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);

  // ===== STATE: FITUR (TF-IDF & N-Grams) =====
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNgramTab, setActiveNgramTab] = useState('bigram');

  // ===== STATE: TRAINING (Model SVM) =====
  const [isTraining, setIsTraining] = useState(false);
  const [cParam, setCParam] = useState(1.0);
  const [kernel, setKernel] = useState('linear');
  const [ngramRange, setNgramRange] = useState('(1,3)');
  const [maxFeatures, setMaxFeatures] = useState(1500);
  const [modelStatus, setModelStatus] = useState(null);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainStatusMsg, setTrainStatusMsg] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [modelLoading, setModelLoading] = useState(true);

  // ===== STATE: EVALUASI =====
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellDetails, setCellDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);


  // ===== EFFECTS =====
  useEffect(() => {
    fetchPipelineStats();
    fetchFeatures();
    fetchModelStatus();
    checkInitialProgress();
    fetchDatasets();
    fetchMetrics();
  }, []);

  useEffect(() => {
    let interval;
    if (isTraining) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get('http://localhost:8000/api/model/train-progress');
          const { is_training, progress, status_message } = res.data;
          
          setTrainProgress(progress);
          setTrainStatusMsg(status_message);
          
          if (!is_training) {
            setIsTraining(false);
            if (progress === 100) {
              Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Model berhasil dilatih!' });
              fetchModelStatus();
              fetchMetrics(); // Update metrics after training
              fetchFeatures(); // Update features
            } else if (status_message && status_message.startsWith('Error')) {
              Swal.fire({ icon: 'error', title: 'Gagal!', text: status_message });
            }
          }
        } catch (err) {
          console.error('Failed to fetch progress', err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  // ===== FETCH FUNCTIONS =====
  const fetchPipelineStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/dashboard/stats');
      setPipelineData(res.data);
    } catch (err) { console.error(err); } finally { setPipelineLoading(false); }
  };

  const fetchFeatures = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/features?limit=500');
      setFeatures(res.data.data);
    } catch (err) { console.error(err); } finally { setFeaturesLoading(false); }
  };

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/datasets');
      if (res.data.status === 'success') {
        setDatasets(res.data.data);
        if (res.data.data.length > 0) setSelectedDataset(res.data.data[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const checkInitialProgress = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/model/train-progress');
      if (res.data.is_training) {
        setIsTraining(true); setTrainProgress(res.data.progress); setTrainStatusMsg(res.data.status_message);
      }
    } catch (e) { console.error(e); }
  };

  const fetchModelStatus = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/model/status');
      if (res.data.status === 'success') {
        const data = res.data.data;
        setModelStatus(data);
        if (data.is_trained) {
          setCParam(data.c_param); setKernel(data.kernel); setNgramRange(data.ngram_range); setMaxFeatures(data.max_features);
        }
      }
    } catch (err) { console.error(err); } finally { setModelLoading(false); }
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/model/metrics');
      if (res.data.status === 'success') setMetrics(res.data.data);
      else setMetricsError(res.data.detail || 'Model belum dilatih.');
    } catch (err) {
      console.error(err); setMetricsError('Gagal memuat metrik evaluasi.');
    } finally { setMetricsLoading(false); }
  };

  // ===== ACTIONS =====
  const handleTrain = async () => {
    setIsTraining(true); setTrainProgress(0); setTrainStatusMsg('Menyiapkan data...');
    try {
      await axios.post('http://localhost:8000/api/model/train', {
        c: parseFloat(cParam), kernel, ngram_range: ngramRange, max_features: parseInt(maxFeatures, 10), dataset_id: selectedDataset ? parseInt(selectedDataset, 10) : null
      });
    } catch (err) {
      setIsTraining(false);
      Swal.fire({ icon: 'error', title: 'Gagal!', text: err.response?.data?.detail || 'Terjadi kesalahan' });
    }
  };

  const handleCellClick = async (actual, predicted, count) => {
    if (count === 0) return;
    setSelectedCell({ actual, predicted, count });
    setLoadingDetails(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/model/confusion_details?actual=${actual.toUpperCase()}&predicted=${predicted.toUpperCase()}`);
      setCellDetails(res.data.data);
    } catch (err) { console.error(err); setCellDetails([]); } finally { setLoadingDetails(false); }
  };


  // ===== RENDER HELPERS: PIPELINE =====
  const PIPELINE_STEPS = [
    { id: 1, name: 'RAW DATA', desc: 'Dataset mentah', icon: <Database size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 2, name: 'Cleaning', desc: 'Hapus karakter khusus', icon: <Scissors size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 3, name: 'Stemming', desc: 'Ubah ke kata dasar', icon: <Eraser size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 4, name: 'Tokenize', desc: 'Pecah jadi kata', icon: <Type size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 5, name: 'TF-IDF', desc: 'Pembobotan kata', icon: <Network size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 6, name: 'N-Grams', desc: 'Kombinasi kata', icon: <Network size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 7, name: 'SVM Model', desc: 'Latih AI', icon: <BrainCircuit size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
    { id: 8, name: 'Prediction', desc: 'Hasil sentimen', icon: <Activity size={24} />, count: pipelineData?.stats?.total_ulasan || 0 },
  ];

  // ===== RENDER HELPERS: FITUR =====
  const filteredFeatures = features.filter(f => f.word.toLowerCase().includes(searchTerm.toLowerCase()));
  const nGramData = useMemo(() => {
    if (!features.length) return [];
    let spaces = activeNgramTab === 'bigram' ? 1 : activeNgramTab === 'trigram' ? 2 : 0;
    return features.filter(f => (f.word.match(/ /g) || []).length === spaces).sort((a, b) => a.idf - b.idf).slice(0, 7).map(f => ({ name: f.word, count: Math.round((10 - f.idf) * 10) }));
  }, [features, activeNgramTab]);

  // ===== RENDER HELPERS: EVALUASI =====
  const uiMetrics = metrics ? [
    { name: 'Accuracy', value: `${metrics.accuracy}%`, icon: <Target className="text-blue-500" size={24} />, color: 'bg-blue-50 border-blue-100' },
    { name: 'Precision', value: `${metrics.precision}%`, icon: <Crosshair className="text-emerald-500" size={24} />, color: 'bg-emerald-50 border-emerald-100' },
    { name: 'Recall', value: `${metrics.recall}%`, icon: <Activity className="text-amber-500" size={24} />, color: 'bg-amber-50 border-amber-100' },
    { name: 'F1-Score', value: `${metrics.f1_score}%`, icon: <PieChartIcon className="text-teal-500" size={24} />, color: 'bg-teal-50 border-teal-100' },
  ] : [];

  let cm = [], displayLabels = ['Positif', 'Netral', 'Negatif'], maxVal = 1;
  if (metrics?.confusion_matrix) {
    const rawClasses = metrics.classes || ['POSITIF', 'NEGATIF', 'NETRAL'];
    const desiredOrder = ['POSITIF', 'NETRAL', 'NEGATIF'];
    const orderIndices = desiredOrder.map(c => rawClasses.indexOf(c));
    let localMax = 0;
    cm = orderIndices.map(i => orderIndices.map(j => {
      const val = (i !== -1 && j !== -1) ? metrics.confusion_matrix[i][j] : 0;
      if (val > localMax) localMax = val;
      return val;
    }));
    maxVal = localMax || 1;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dapur AI (Proses Pembelajaran Mesin)</h1>
        <p className="text-sm text-gray-500 mt-1">Halaman ini diperuntukkan bagi teknisi atau jika Anda ingin melihat bagaimana AI bekerja di balik layar.</p>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto border-b border-gray-200">
        {[
          { id: 1, name: '1. Alur Pemrosesan', icon: <Activity size={18} /> },
          { id: 2, name: '2. Ekstraksi Fitur', icon: <Network size={18} /> },
          { id: 3, name: '3. Pelatihan Model', icon: <BrainCircuit size={18} /> },
          { id: 4, name: '4. Hasil Ujian (Evaluasi)', icon: <Target size={18} /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveStep(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeStep === tab.id ? 'border-primary text-primary bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* CONTENT: STEP 1 - PIPELINE */}
      {activeStep === 1 && (
        <div className="animate-in fade-in duration-500">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-900">Apa itu Alur Pemrosesan?</h3>
            <p className="text-blue-800 text-sm mt-1">Ini adalah gambaran langkah demi langkah bagaimana ulasan pengguna dibersihkan (menghapus emoji, tanda baca) hingga siap dibaca oleh sistem kecerdasan buatan.</p>
          </div>
          
          {pipelineLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PIPELINE_STEPS.map((step, idx) => (
                <div key={step.id} className="card p-4 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">{step.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{step.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{step.desc}</p>
                  </div>
                  <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{step.count} data</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: STEP 2 - FITUR */}
      {activeStep === 2 && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-bold text-blue-900">Apa itu Ekstraksi Fitur?</h3>
            <p className="text-blue-800 text-sm mt-1">Komputer tidak mengerti kata-kata. Jadi, kata-kata diubah menjadi angka dan dihitung kemunculannya agar AI bisa memahami makna ulasan.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">Top TF-IDF Words</h3>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                  <input type="text" className="pl-8 py-1 text-sm border border-gray-200 rounded-md" placeholder="Cari kata..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 sticky top-0">
                    <tr><th className="p-3">Word</th><th className="p-3 text-right">TF</th><th className="p-3 text-right">IDF</th><th className="p-3 text-right text-primary">Score</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {featuresLoading ? <tr><td colSpan="4" className="text-center p-8"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr> :
                     filteredFeatures.length === 0 ? <tr><td colSpan="4" className="text-center p-8 text-gray-500">Tidak ada data.</td></tr> :
                     filteredFeatures.map((item, idx) => (
                      <tr key={idx}><td className="p-3 font-medium">{item.word}</td><td className="p-3 text-right">{item.tf}</td><td className="p-3 text-right">{item.idf}</td><td className="p-3 text-right text-primary font-medium">{item.tfidf}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card border border-gray-100 shadow-sm flex flex-col">
              <div className="border-b border-gray-200 flex">
                {['unigram', 'bigram', 'trigram'].map(tab => (
                  <button key={tab} className={`flex-1 py-3 text-sm font-medium ${activeNgramTab === tab ? 'border-b-2 border-primary text-primary bg-emerald-50/30' : 'text-gray-500'}`} onClick={() => setActiveNgramTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="p-6 flex-1 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nGramData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="count" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={24} name="Skor Frekuensi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: STEP 3 - PELATIHAN */}
      {activeStep === 3 && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-bold text-blue-900">Apa itu Pelatihan Model?</h3>
            <p className="text-blue-800 text-sm mt-1">Di sinilah AI "belajar". Dengan membaca ulasan yang sudah dilabeli, AI akan mencari pola kata agar di masa depan bisa menebak sentimen ulasan baru secara otomatis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="card p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><BrainCircuit size={28} /></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Support Vector Machine (SVM)</h2>
                    <p className="text-sm text-gray-500">Status: {modelStatus?.is_trained ? <span className="text-emerald-600 font-bold">Siap Digunakan</span> : <span className="text-red-600 font-bold">Belum Dilatih</span>}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sumber Data (Dataset)</label>
                    <select className="input-field max-w-sm" value={selectedDataset} onChange={e => setSelectedDataset(e.target.value)} disabled={isTraining}>
                      {datasets.length === 0 && <option value="">Tidak ada dataset tersedia</option>}
                      {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name} ({ds.review_count} data)</option>)}
                    </select>
                  </div>
                  
                  <button className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2" onClick={handleTrain} disabled={isTraining || !selectedDataset}>
                    {isTraining ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                    {isTraining ? 'Sedang Belajar...' : 'Mulai Latih AI Sekarang'}
                  </button>
                </div>

                {isTraining && (
                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex justify-between mb-2 text-sm font-bold text-emerald-800">
                      <span>{trainStatusMsg}</span><span>{trainProgress}%</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${trainProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><Settings size={20} className="text-gray-500" /> Pengaturan Lanjut (Opsional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Kernel</label>
                  <select className="input-field w-full text-sm" value={kernel} onChange={e => setKernel(e.target.value)}>
                    <option value="linear">Linear</option><option value="rbf">RBF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">N-Gram Range</label>
                  <select className="input-field w-full text-sm" value={ngramRange} onChange={e => setNgramRange(e.target.value)}>
                    <option value="(1,1)">Unigram</option><option value="(1,2)">Uni+Bigram</option><option value="(1,3)">Uni+Bi+Trigram</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: STEP 4 - EVALUASI */}
      {activeStep === 4 && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-bold text-blue-900">Apa itu Hasil Ujian?</h3>
            <p className="text-blue-800 text-sm mt-1">Setelah AI belajar, ia harus diuji. Halaman ini menunjukkan seberapa pintar dan akurat AI dalam menebak sentimen (Akurasi).</p>
          </div>

          {metricsLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : metricsError ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">{metricsError}</p>
              <p className="text-sm mt-2 text-gray-400">Silakan kembali ke Tab 3 (Pelatihan Model) dan klik "Mulai Latih AI".</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uiMetrics.map((metric, idx) => (
                  <div key={idx} className={`card p-4 border ${metric.color}`}>
                    <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 border border-gray-100 shadow-sm overflow-x-auto">
                  <h3 className="font-bold text-gray-800 text-center mb-6">Heatmap Confusion Matrix (Tebakan AI vs Asli)</h3>
                  <table className="mx-auto border-collapse">
                    <thead>
                      <tr><th colSpan="2" rowSpan="2"></th><th colSpan="3" className="pb-4">Tebakan AI</th></tr>
                      <tr>{displayLabels.map(l => <th key={l} className="p-3 bg-gray-50 border">{l}</th>)}</tr>
                    </thead>
                    <tbody>
                      {displayLabels.map((actualLabel, i) => (
                        <tr key={actualLabel}>
                          {i===0 && <td rowSpan="3" className="pr-4 font-medium align-middle">Data Asli</td>}
                          <th className="p-3 bg-gray-50 border text-right">{actualLabel}</th>
                          {displayLabels.map((predictedLabel, j) => {
                            const val = cm[i][j], bgOpacity = val===0?0.05:val/maxVal, isDark = bgOpacity>0.5;
                            return (
                              <td key={j} onClick={() => handleCellClick(actualLabel, predictedLabel, val)}
                                className={`p-4 border text-center text-lg ${val>0?'cursor-pointer hover:ring-2 hover:ring-blue-400':''} ${isDark?'text-white':'text-gray-800'}`}
                                style={{backgroundColor: `rgba(37,99,235,${bgOpacity})`}}
                              >
                                {val}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-center text-sm text-gray-500 mt-4">Klik kotak angka untuk melihat contoh ulasan.</p>
                </div>

                <div className="card bg-white shadow-sm rounded-xl flex flex-col h-[450px]">
                  {selectedCell ? (
                    <>
                      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t-xl">
                        <div>
                          <span className="text-sm font-bold">Asli: {selectedCell.actual} ➡️ Ditebak: {selectedCell.predicted}</span>
                        </div>
                        <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                      </div>
                      <div className="p-4 overflow-y-auto flex-1">
                        {loadingDetails ? <Loader2 className="animate-spin mx-auto text-primary" /> : cellDetails.length===0 ? <p className="text-center text-gray-500">Kosong</p> : (
                          <div className="space-y-3">
                            {cellDetails.map((detail, idx) => (
                              <div key={idx} className="p-3 border border-gray-100 rounded bg-gray-50 text-sm">
                                <p className="text-gray-700">{detail.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                      <Crosshair size={48} className="mb-4 text-gray-300" />
                      <p>Pilih salah satu kotak di Matrix untuk melihat detail tebakan AI.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default DapurAI;
