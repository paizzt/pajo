import React, { useState, useEffect } from 'react';
import { BrainCircuit, Settings, Save, RefreshCw, PlayCircle, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModelSvm = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cParam, setCParam] = useState(1.0);
  const [kernel, setKernel] = useState('linear');
  const [ngramRange, setNgramRange] = useState('(1,3)');
  const [maxFeatures, setMaxFeatures] = useState(1500);
  const [modelStatus, setModelStatus] = useState(null);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainStatusMsg, setTrainStatusMsg] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');

  useEffect(() => {
    fetchModelStatus();
    checkInitialProgress();
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/datasets');
      if (res.data.status === 'success') {
        setDatasets(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedDataset(res.data.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch datasets', e);
    }
  };

  const checkInitialProgress = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/model/train-progress');
      if (res.data.is_training) {
        setIsTraining(true);
        setTrainProgress(res.data.progress);
        setTrainStatusMsg(res.data.status_message);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
              Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Model berhasil dilatih!',
              });
              fetchModelStatus();
            } else if (status_message && status_message.startsWith('Error')) {
              Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: status_message,
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch progress', err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  const fetchModelStatus = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/model/status');
      if (res.data.status === 'success') {
        const data = res.data.data;
        setModelStatus(data);
        if (data.is_trained) {
          setCParam(data.c_param);
          setKernel(data.kernel);
          setNgramRange(data.ngram_range);
          setMaxFeatures(data.max_features);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainProgress(0);
    setTrainStatusMsg('Menyiapkan data...');
    try {
      const res = await axios.post('http://localhost:8000/api/model/train', {
        c: parseFloat(cParam),
        kernel,
        ngram_range: ngramRange,
        max_features: parseInt(maxFeatures, 10),
        dataset_id: selectedDataset ? parseInt(selectedDataset, 10) : null
      });
      // Respons sudah didapat dengan cepat, proses training berjalan di latar belakang.
      // Polling useEffect akan mengambil alih tampilan progress bar.
    } catch (err) {
      setIsTraining(false);
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.detail || 'Terjadi kesalahan saat memulai training',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat konfigurasi model...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Machine Learning</h1>
          <p className="text-sm text-gray-500 mt-1">Konfigurasi dan manajemen model Support Vector Machine (SVM).</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Reset Model
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MODEL INFO */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <BrainCircuit size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Support Vector Machine</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex h-2.5 w-2.5 rounded-full ${modelStatus?.is_trained ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className={`text-sm font-medium ${modelStatus?.is_trained ? 'text-emerald-600' : 'text-red-600'}`}>
                    Status: {modelStatus?.is_trained ? 'Trained' : 'Untrained'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">Last Training: {modelStatus?.last_training || 'Never'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Algorithm</p>
                <p className="font-semibold text-gray-800">{modelStatus?.algorithm || 'SVM'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Feature Extraction</p>
                <p className="font-semibold text-gray-800">{modelStatus?.feature_extraction || 'TF-IDF'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Classes</p>
                <div className="flex gap-2 mt-1">
                  <span className="badge badge-success">Positive</span>
                  <span className="badge badge-danger">Negative</span>
                  <span className="badge badge-neutral">Neutral</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Dataset Split</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 flex overflow-hidden">
                  <div className="bg-primary h-2.5" style={{ width: '80%' }}></div>
                  <div className="bg-amber-400 h-2.5" style={{ width: '20%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500 font-medium">
                  <span>Training (80%)</span>
                  <span>Testing (20%)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Dataset untuk Dilatih</label>
                <select 
                  className="input-field max-w-sm"
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  disabled={isTraining}
                >
                  {datasets.length === 0 && <option value="">Tidak ada dataset tersedia</option>}
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.id}>{ds.name} ({ds.review_count} data)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button 
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  onClick={handleTrain}
                  disabled={isTraining || !selectedDataset}
                >
                  {isTraining ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                  {isTraining ? 'Training in progress...' : 'Train Model'}
                </button>
                <button className="btn btn-secondary flex items-center justify-center gap-2" disabled={isTraining}>
                  <Save size={18} /> Save Model
                </button>
                <button className="btn btn-secondary flex items-center justify-center gap-2" disabled={isTraining}>
                  <Download size={18} /> Load Model
                </button>
              </div>
            </div>


            {/* PROGRESS BAR SECTION */}
            {isTraining && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-emerald-800">{trainStatusMsg || 'Memproses...'}</span>
                  <span className="text-sm font-bold text-emerald-700">{trainProgress}%</span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-3 mb-1 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${trainProgress}%` }}
                  >
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                  </div>
                </div>
                <p className="text-xs text-emerald-600/80 italic mt-2">Jangan tutup tab ini, biarkan proses berjalan di latar belakang.</p>
              </div>
            )}
            <style jsx="true">{`
              @keyframes progress {
                0% { background-position: 1rem 0; }
                100% { background-position: 0 0; }
              }
            `}</style>
          </div>
        </div>

        {/* HYPERPARAMETERS */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Settings size={20} className="text-gray-500" />
              Hyperparameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">C (Regularization)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={cParam} 
                  onChange={(e) => setCParam(e.target.value)}
                  step="0.1" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kernel</label>
                <select 
                  className="input-field"
                  value={kernel}
                  onChange={(e) => setKernel(e.target.value)}
                >
                  <option value="linear">Linear</option>
                  <option value="rbf">RBF</option>
                  <option value="poly">Polynomial</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N-Gram Range</label>
                <select 
                  className="input-field"
                  value={ngramRange}
                  onChange={(e) => setNgramRange(e.target.value)}
                >
                  <option value="(1,1)">Unigram (1, 1)</option>
                  <option value="(1,2)">Uni+Bigram (1, 2)</option>
                  <option value="(1,3)">Uni+Bi+Trigram (1, 3)</option>
                  <option value="(2,2)">Bigram (2, 2)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Features (TF-IDF)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={maxFeatures} 
                  onChange={(e) => setMaxFeatures(e.target.value)}
                  step="100" 
                />
              </div>
              
              
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  Perubahan konfigurasi hyperparameter di atas baru akan diterapkan pada model setelah Anda menekan tombol <strong>"Train Model"</strong> di panel sebelah kiri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSvm;
