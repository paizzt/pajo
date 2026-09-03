import React, { useState, useEffect } from 'react';
import { Target, PieChart, Activity, Crosshair, Loader2, X } from 'lucide-react';
import axios from 'axios';

const EvaluasiModel = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellDetails, setCellDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/model/metrics');
      if (res.data.status === 'success') {
        setMetrics(res.data.data);
      } else {
        setError(res.data.detail || 'Model belum dilatih.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat metrik evaluasi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-gray-500">Memuat metrik evaluasi model...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-gray-500 mb-2">{error || 'Tidak ada data metrik.'}</p>
        <p className="text-sm text-gray-400">Silakan jalankan proses training di menu Model SVM terlebih dahulu.</p>
      </div>
    );
  }

  const formatMetric = (val) => `${val}%`;

  const uiMetrics = [
    { name: 'Accuracy', value: formatMetric(metrics.accuracy), icon: <Target className="text-blue-500" size={24} />, color: 'bg-blue-50 border-blue-100' },
    { name: 'Precision', value: formatMetric(metrics.precision), icon: <Crosshair className="text-emerald-500" size={24} />, color: 'bg-emerald-50 border-emerald-100' },
    { name: 'Recall', value: formatMetric(metrics.recall), icon: <Activity className="text-amber-500" size={24} />, color: 'bg-amber-50 border-amber-100' },
    { name: 'F1-Score', value: formatMetric(metrics.f1_score), icon: <PieChart className="text-teal-500" size={24} />, color: 'bg-teal-50 border-teal-100' },
  ];

  const rawCm = metrics.confusion_matrix;
  const rawClasses = metrics.classes || ['POSITIF', 'NEGATIF', 'NETRAL'];
  
  const desiredOrder = ['POSITIF', 'NETRAL', 'NEGATIF'];
  const displayLabels = ['Positif', 'Netral', 'Negatif'];
  
  const orderIndices = desiredOrder.map(c => rawClasses.indexOf(c));
  
  let maxVal = 0;
  const cm = orderIndices.map(i => {
    return orderIndices.map(j => {
      const val = (i !== -1 && j !== -1) ? rawCm[i][j] : 0;
      if (val > maxVal) maxVal = val;
      return val;
    });
  });
  if (maxVal === 0) maxVal = 1;

  const handleCellClick = async (actual, predicted, count) => {
    if (count === 0) return;
    setSelectedCell({ actual, predicted, count });
    setLoadingDetails(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/model/confusion_details?actual=${actual.toUpperCase()}&predicted=${predicted.toUpperCase()}`);
      setCellDetails(res.data.data);
    } catch (err) {
      console.error(err);
      setCellDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluasi Model</h1>
        <p className="text-sm text-gray-500 mt-1">Hasil pengujian performa model SVM menggunakan metrik evaluasi dan confusion matrix.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {uiMetrics.map((metric, idx) => (
          <div key={idx} className={`card p-5 border ${metric.color}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</h3>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-white shadow-sm rounded-xl">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Heatmap Confusion Matrix</h2>
          <p className="text-sm text-gray-500 text-center max-w-2xl mx-auto mb-8">
            Evaluasi Kinerja Model SVM. Semakin pekat warnanya, semakin banyak datanya. Klik pada angka untuk melihat detail ulasan.
          </p>

          <div className="overflow-x-auto flex justify-center">
            <table className="border-collapse" style={{ minWidth: '400px' }}>
              <thead>
                <tr>
                  <th colSpan="2" rowSpan="2" className="p-4 border border-transparent"></th>
                  <th colSpan="3" className="pb-4 text-center font-medium text-gray-800">Prediksi Model (SVM)</th>
                </tr>
                <tr>
                  {displayLabels.map(label => (
                    <th key={label} className="p-4 border border-gray-100 bg-gray-50 text-gray-800 font-semibold text-center w-24">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayLabels.map((actualLabel, i) => (
                  <tr key={actualLabel}>
                    {i === 0 && (
                      <td rowSpan="3" className="pr-4 text-center font-medium text-gray-800 align-middle" style={{ width: '80px' }}>
                        Data Aktual
                      </td>
                    )}
                    <th className="p-4 border border-gray-100 bg-gray-50 text-gray-800 font-semibold text-right">{actualLabel}</th>
                    {displayLabels.map((predictedLabel, j) => {
                      const val = cm[i][j];
                      const intensity = maxVal > 0 ? val / maxVal : 0;
                      const bgOpacity = val === 0 ? 0.05 : Math.max(0.1, intensity);
                      const textColor = bgOpacity > 0.5 ? 'text-white' : 'text-gray-800';
                      
                      return (
                        <td 
                          key={j} 
                          onClick={() => handleCellClick(actualLabel, predictedLabel, val)}
                          className={`p-4 border border-gray-100 text-center text-lg ${val > 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''} ${textColor}`} 
                          style={{ backgroundColor: `rgba(37, 99, 235, ${bgOpacity})` }}
                          title={val > 0 ? "Klik untuk melihat detail" : ""}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center mt-6 gap-4 text-sm text-gray-500">
            <span>Rendah</span>
            <div className="w-48 h-3 rounded-full" style={{ background: 'linear-gradient(to right, rgba(37,99,235,0.05), rgba(37,99,235,1))' }}></div>
            <span>Tinggi</span>
          </div>
        </div>
      </div>

      {/* Modal for Cell Details */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Detail Confusion Matrix</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Aktual: <span className="font-semibold text-gray-700">{selectedCell.actual}</span> &rarr; Prediksi: <span className="font-semibold text-gray-700">{selectedCell.predicted}</span> ({selectedCell.count} data)
                </p>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary mb-4" size={32} />
                  <p className="text-gray-500">Memuat detail ulasan...</p>
                </div>
              ) : cellDetails.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada detail ulasan yang ditemukan.
                </div>
              ) : (
                <div className="space-y-4">
                  {cellDetails.map((detail, idx) => (
                    <div key={idx} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm text-gray-700">{detail.username || 'User'}</span>
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">Conf: {detail.confidence}</span>
                      </div>
                      <p className="text-sm text-gray-600">{detail.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluasiModel;
