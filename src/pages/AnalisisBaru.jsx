import React from 'react';
import { 
  Link as LinkIcon, BrainCircuit, CheckCircle, Target, BarChart3, Table2, X
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAnalysis } from '../context/AnalysisContext';

const AnalisisBaru = () => {
  const {
    step,
    inputType, setInputType,
    appId, setAppId,
    count, setCount,
    scrapeStatus,
    csvFile, setCsvFile,
    trainProgress,
    trainStatusMsg,
    reportData,
    metricsData,
    isSaving,
    reportTitle, setReportTitle,
    selectedCell, setSelectedCell,
    selectedSentiment, setSelectedSentiment,
    handleStartScrapeAndTrain,
    handleSaveAndReset
  } = useAnalysis();

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
                  <input type="text" className="input-field pl-10 w-full" value={appId} onChange={(e) => setAppId(e.target.value)} />
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

          <div className="mt-8 flex flex-col items-end">
            <button 
              className="btn btn-primary px-8 py-3 text-lg flex items-center justify-center min-w-[150px] transition-all"
              onClick={handleStartScrapeAndTrain}
              disabled={scrapeStatus === 'loading' || (inputType === 'upload' && !csvFile) || (inputType === 'playstore' && !appId)}
            >
              {scrapeStatus === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : 'Proses'}
            </button>
            
            {scrapeStatus === 'loading' && (
              <div className="mt-6 w-full text-center p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg animate-pulse">
                <p className="font-semibold text-blue-900 flex items-center justify-center gap-2">
                  <BrainCircuit className="w-5 h-5 animate-bounce" />
                  Sedang {inputType === 'playstore' ? 'mengambil data dari Playstore' : 'memproses file CSV'}...
                </p>
                <p className="text-sm mt-1 text-blue-700">
                  Harap jangan tutup halaman ini. Proses untuk data dalam jumlah besar (seperti 100.000 ulasan) dapat memakan waktu beberapa menit.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: PROSES SISTEM */}
      {step === 2 && (
        <div className="card p-10 shadow-md border border-gray-100 text-center animate-in zoom-in-95">
          <BrainCircuit size={64} className="mx-auto text-primary mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Proses Analisis Berjalan</h2>
          <p className="text-gray-500 mb-8">Silakan tunggu, sistem sedang memproses data menggunakan algoritma Machine Learning.</p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between mb-2 text-sm font-bold text-emerald-800">
              <span>{trainStatusMsg || 'Memproses...'}</span>
              <span>{trainProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner mb-8">
              <div className="bg-gradient-to-r from-emerald-400 to-primary h-4 rounded-full transition-all duration-500" style={{ width: `${trainProgress}%` }}></div>
            </div>

            {/* PIPELINE VISUALIZATION */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
              {[
                { label: 'RAW DATA', min: 0 },
                { label: 'Cleaning', min: 12 },
                { label: 'Stemming', min: 25 },
                { label: 'Tokenize', min: 37 },
                { label: 'TF-IDF', min: 50 },
                { label: 'N-Grams', min: 62 },
                { label: 'SVM', min: 75 },
                { label: 'Prediction', min: 88 }
              ].map((stage, idx) => {
                const isActive = trainProgress >= stage.min && (idx === 7 || trainProgress < [12, 25, 37, 50, 62, 75, 88, 101][idx + 1]);
                const isPassed = trainProgress >= [12, 25, 37, 50, 62, 75, 88, 101][idx];
                
                return (
                  <div key={idx} className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'border-primary bg-emerald-50 scale-105 shadow-md' : isPassed ? 'border-emerald-200 bg-gray-50 text-emerald-700 opacity-80' : 'border-gray-100 bg-white text-gray-400 opacity-50'}`}>
                    {isPassed && !isActive ? (
                      <CheckCircle size={20} className="text-emerald-500 mb-1" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full mb-1 ${isActive ? 'bg-primary animate-pulse' : 'bg-gray-200'}`}></div>
                    )}
                    <span className={`text-xs font-bold text-center ${isActive ? 'text-primary' : ''}`}>{stage.label}</span>
                  </div>
                )
              })}
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

          {/* METRIK MODEL */}
          {metricsData && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Target size={20} className="text-primary" /> Metrik Evaluasi Model</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Accuracy', value: metricsData.accuracy, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { label: 'Precision', value: metricsData.precision, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { label: 'Recall', value: metricsData.recall, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                  { label: 'F1-Score', value: metricsData.f1_score, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                ].map((m, i) => (
                  <div key={i} className={`card p-5 border ${m.color} text-center`}>
                    <p className="text-sm font-medium opacity-80">{m.label}</p>
                    <p className="text-3xl font-bold mt-1">{m.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* KESIMPULAN */}
             <div className="card p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Kesimpulan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sentimen Positif mencapai <strong>{reportData.stats.positif}</strong> ulasan, sedangkan Negatif <strong>{reportData.stats.negatif}</strong> ulasan.
                  Topik yang paling sering dibicarakan adalah: <strong className="text-primary">{reportData.top_words.slice(0,3).map(w=>w.name).join(', ')}</strong>.
                </p>
             </div>

             {/* PIE CHART */}
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

          {/* CONFUSION MATRIX */}
          {metricsData && metricsData.confusion_matrix && metricsData.classes && (
            <div className="card p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-primary" /> Confusion Matrix</h3>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className={`overflow-x-auto ${selectedCell ? 'lg:w-1/2' : 'w-full'} transition-all duration-300`}>
                  <table className="mx-auto border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 text-xs text-gray-500 font-semibold" rowSpan={2} colSpan={2}></th>
                        <th className="p-2 text-center text-xs font-bold text-gray-700 border-b-2 border-gray-200" colSpan={metricsData.classes.length}>Prediksi</th>
                      </tr>
                      <tr>
                        {metricsData.classes.map((cls, i) => (
                          <th key={i} className="p-3 text-xs font-bold text-gray-700 text-center min-w-[80px]">{cls}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metricsData.confusion_matrix.map((row, ri) => (
                        <tr key={ri}>
                          {ri === 0 && (
                            <td className="p-2 text-xs font-bold text-gray-700 writing-vertical" rowSpan={metricsData.classes.length} style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>Aktual</td>
                          )}
                          <td className="p-3 text-xs font-bold text-gray-700 text-right">{metricsData.classes[ri]}</td>
                          {row.map((val, ci) => {
                            const maxVal = Math.max(...metricsData.confusion_matrix.flat());
                            const intensity = maxVal > 0 ? val / maxVal : 0;
                            const isDiagonal = ri === ci;
                            const bgColor = isDiagonal 
                              ? `rgba(16, 185, 129, ${0.15 + intensity * 0.65})` 
                              : val > 0 ? `rgba(239, 68, 68, ${0.1 + intensity * 0.5})` : 'rgba(243, 244, 246, 0.5)';
                            return (
                              <td 
                                key={ci} 
                                className={`p-3 text-center border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity ${selectedCell?.actual === metricsData.classes[ri] && selectedCell?.predicted === metricsData.classes[ci] ? 'ring-2 ring-primary ring-inset' : ''}`} 
                                style={{ backgroundColor: bgColor }}
                                onClick={() => setSelectedCell({ actual: metricsData.classes[ri], predicted: metricsData.classes[ci], value: val })}
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
                      {metricsData.predictions
                        ?.filter(p => p.actual === selectedCell.actual && p.predicted === selectedCell.predicted)
                        .map((p, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                            <p className="text-gray-700 mb-2">"{p.text}"</p>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Akurasi Sistem: {p.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      {(!metricsData.predictions || metricsData.predictions.filter(p => p.actual === selectedCell.actual && p.predicted === selectedCell.predicted).length === 0) && (
                        <div className="text-center text-gray-400 py-10">Tidak ada detail ulasan untuk kategori ini.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEMUA ULASAN & PREDIKSI */}
          {metricsData && metricsData.predictions && (
            <div className="card p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Table2 size={20} className="text-primary" /> Hasil Seluruh Ulasan & Prediksi Sistem</h3>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 shadow-sm">
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-600">No</th>
                      <th className="text-left p-3 font-semibold text-gray-600 w-1/2">Ulasan</th>
                      <th className="text-center p-3 font-semibold text-gray-600">Aktual</th>
                      <th className="text-center p-3 font-semibold text-gray-600">Prediksi</th>
                      <th className="text-center p-3 font-semibold text-gray-600">Kepercayaan Sistem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsData.predictions.map((p, i) => (
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
                  <BarChart data={reportData.pie_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                      {reportData.pie_data.map((entry, index) => (
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
                        Total: <span className="font-bold">{metricsData?.predictions?.filter(p => p.actual === selectedSentiment).length || 0}</span> data
                      </p>
                    </div>
                    <button onClick={() => setSelectedSentiment(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                    {metricsData?.predictions
                      ?.filter(p => p.actual === selectedSentiment)
                      .map((p, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                          <p className="text-gray-700 mb-2">"{p.text}"</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-0.5 rounded font-bold ${p.predicted === selectedSentiment ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>Prediksi Sistem: {p.predicted}</span>
                            <span className="text-gray-400">Kepercayaan: {p.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    {(!metricsData?.predictions || metricsData.predictions.filter(p => p.actual === selectedSentiment).length === 0) && (
                      <div className="text-center text-gray-400 py-10">Tidak ada ulasan untuk sentimen ini.</div>
                    )}
                  </div>
                </div>
              )}
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
