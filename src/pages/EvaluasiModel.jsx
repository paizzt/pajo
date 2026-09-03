import React, { useState, useEffect } from 'react';
import { Target, PieChart, Activity, Crosshair, Loader2 } from 'lucide-react';
import axios from 'axios';

const EvaluasiModel = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const cm = metrics.confusion_matrix;
  const classes = metrics.classes || ['POSITIF', 'NEGATIF', 'NETRAL'];
  
  // Find index for mapping dynamic classes to the table structure
  const posIdx = classes.indexOf('POSITIF');
  const negIdx = classes.indexOf('NEGATIF');
  const netIdx = classes.indexOf('NETRAL');

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
        {/* CONFUSION MATRIX */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Confusion Matrix</h3>
          
          <div className="relative overflow-x-auto">
            <div className="min-w-max flex flex-col items-center">
              <div className="text-sm font-bold text-gray-700 mb-2">Predicted Class</div>
              <div className="flex">
                <div className="flex flex-col justify-center text-sm font-bold text-gray-700 mr-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  Actual Class
                </div>
                
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      {classes.map((cls, i) => (
                        <th key={i} className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 w-24">{cls}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((actualCls, i) => (
                      <tr key={i}>
                        <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 text-right">{actualCls}</th>
                        {classes.map((predictedCls, j) => {
                          const val = cm[i][j];
                          const isDiagonal = i === j;
                          
                          let bgClass = "bg-gray-100 text-gray-800";
                          if (isDiagonal) {
                            if (actualCls === 'POSITIF') bgClass = "bg-emerald-600 text-white font-bold shadow-inner";
                            else if (actualCls === 'NEGATIF') bgClass = "bg-red-600 text-white font-bold shadow-inner";
                            else bgClass = "bg-gray-500 text-white font-bold shadow-inner";
                          } else {
                            if (actualCls === 'POSITIF') bgClass = "bg-emerald-50 text-emerald-900";
                            else if (actualCls === 'NEGATIF') bgClass = "bg-red-50 text-red-900";
                            else bgClass = "bg-gray-50 text-gray-800";
                          }
                          
                          return (
                            <td key={j} className={`p-4 text-center border border-gray-200 ${bgClass}`}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EvaluasiModel;
