import React from 'react';
import { Target, PieChart, Activity, Crosshair } from 'lucide-react';

const METRICS = [
  { name: 'Accuracy', value: '89.45%', icon: <Target className="text-blue-500" size={24} />, color: 'bg-blue-50 border-blue-100' },
  { name: 'Precision', value: '88.72%', icon: <Crosshair className="text-emerald-500" size={24} />, color: 'bg-emerald-50 border-emerald-100' },
  { name: 'Recall', value: '87.96%', icon: <Activity className="text-amber-500" size={24} />, color: 'bg-amber-50 border-amber-100' },
  { name: 'F1-Score', value: '88.30%', icon: <PieChart className="text-teal-500" size={24} />, color: 'bg-teal-50 border-teal-100' },
];

const EvaluasiModel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluasi Model</h1>
        <p className="text-sm text-gray-500 mt-1">Hasil pengujian performa model SVM menggunakan metrik evaluasi dan confusion matrix.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, idx) => (
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
                      <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 w-24">Positive</th>
                      <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 w-24">Negative</th>
                      <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 w-24">Neutral</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 text-right">Positive</th>
                      <td className="p-4 text-center font-bold text-white bg-emerald-600 border border-emerald-700 shadow-inner">850</td>
                      <td className="p-4 text-center font-medium text-emerald-900 bg-emerald-100 border border-emerald-200">35</td>
                      <td className="p-4 text-center font-medium text-emerald-900 bg-emerald-50 border border-emerald-100">20</td>
                    </tr>
                    <tr>
                      <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 text-right">Negative</th>
                      <td className="p-4 text-center font-medium text-red-900 bg-red-100 border border-red-200">40</td>
                      <td className="p-4 text-center font-bold text-white bg-red-600 border border-red-700 shadow-inner">720</td>
                      <td className="p-4 text-center font-medium text-red-900 bg-red-50 border border-red-100">25</td>
                    </tr>
                    <tr>
                      <th className="p-3 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 text-right">Neutral</th>
                      <td className="p-4 text-center font-medium text-gray-800 bg-gray-100 border border-gray-200">18</td>
                      <td className="p-4 text-center font-medium text-gray-800 bg-gray-200 border border-gray-300">30</td>
                      <td className="p-4 text-center font-bold text-white bg-gray-500 border border-gray-600 shadow-inner">410</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* CLASSIFICATION REPORT */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Classification Report</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold text-right">Precision</th>
                  <th className="px-4 py-3 font-semibold text-right">Recall</th>
                  <th className="px-4 py-3 font-semibold text-right">F1-Score</th>
                  <th className="px-4 py-3 font-semibold text-right">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-emerald-600">Positive</td>
                  <td className="px-4 py-3 text-right">0.94</td>
                  <td className="px-4 py-3 text-right">0.94</td>
                  <td className="px-4 py-3 text-right font-medium">0.94</td>
                  <td className="px-4 py-3 text-right text-gray-500">905</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-red-600">Negative</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right font-medium">0.92</td>
                  <td className="px-4 py-3 text-right text-gray-500">785</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-600">Neutral</td>
                  <td className="px-4 py-3 text-right">0.90</td>
                  <td className="px-4 py-3 text-right">0.90</td>
                  <td className="px-4 py-3 text-right font-medium">0.90</td>
                  <td className="px-4 py-3 text-right text-gray-500">458</td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                <tr>
                  <td className="px-4 py-3 text-gray-800">Macro Avg</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right text-gray-500">2148</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-800">Weighted Avg</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right">0.92</td>
                  <td className="px-4 py-3 text-right text-gray-500">2148</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluasiModel;
