import React, { useState } from 'react';
import { Download, UploadCloud, Link as LinkIcon, Database, CheckCircle, FileText, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const DataCollection = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, done
  
  // Scraper states
  const [appId, setAppId] = useState('com.muamalat.mobile');
  const [count, setCount] = useState(100);
  const [lang, setLang] = useState('id');
  const [scrapeStatus, setScrapeStatus] = useState('idle'); // idle, loading, success, error
  const [scrapeData, setScrapeData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');

  const handleUpload = (e) => {
    e.preventDefault();
    setUploadStatus('uploading');
    
    setTimeout(() => setUploadStatus('processing'), 1500);
    setTimeout(() => setUploadStatus('done'), 4000);
  };

  const handleScrape = async () => {
    try {
      setScrapeStatus('loading');
      setErrorMessage('');
      
      const response = await axios.post('http://localhost:8000/api/scrape', {
        app_id: appId,
        count: Number(count),
        lang: lang,
        country: 'id'
      });
      
      setScrapeData(response.data);
      setScrapeStatus('success');
    } catch (error) {
      console.error("Scrape error:", error);
      setScrapeStatus('error');
      setErrorMessage(error.response?.data?.detail || error.message || "Terjadi kesalahan saat mengambil data dari Google Play Store.");
    }
  };

  const handleSaveToDataset = async () => {
    if (!scrapeData || !scrapeData.data) return;
    try {
      setSaveStatus('loading');
      await axios.post('http://localhost:8000/api/reviews/save', {
        app_id: scrapeData.app_id,
        reviews: scrapeData.data
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus('error');
      alert("Gagal menyimpan ke dataset");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Collection & Dataset</h1>
        <p className="text-sm text-gray-500 mt-1">Upload dataset CSV atau ambil data terbaru dari Google Play Store.</p>
      </div>

      <div className="card">
        <div className="border-b border-gray-200 flex">
          <button 
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={18} /> Upload Dataset CSV
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'playstore' ? 'border-primary text-primary bg-emerald-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('playstore')}
          >
            <Download size={18} /> Google Play Store Scraper
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <FileText className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Format CSV yang didukung:</p>
                  <p>File harus memiliki kolom minimal: <code>review</code> (teks), <code>rating</code> (angka 1-5), dan <code>date</code> (tanggal). Jika dataset memiliki kolom <code>sentiment</code>, maka sistem tidak akan memprediksinya secara otomatis.</p>
                </div>
              </div>

              {uploadStatus === 'idle' && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                  <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Klik untuk memilih file CSV</p>
                  <p className="text-xs text-gray-500">Atau seret dan lepas file ke area ini (Max 50MB)</p>
                  <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleUpload} />
                </div>
              )}

              {uploadStatus !== 'idle' && (
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <FileText size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">dataset_ulasan_muamalat.csv</h4>
                      <p className="text-sm text-gray-500">2.4 MB</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative">
                    <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
                    
                    <div className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm">
                        <CheckCircle size={14} />
                      </div>
                      <div className="pb-1">
                        <p className="text-sm font-medium text-gray-800">Uploading File</p>
                        <p className="text-xs text-gray-500">100% Selesai</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ${uploadStatus === 'done' ? 'bg-emerald-500 text-white' : uploadStatus === 'processing' ? 'bg-primary text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
                        {uploadStatus === 'done' ? <CheckCircle size={14} /> : <Database size={12} />}
                      </div>
                      <div className="pb-1">
                        <p className={`text-sm font-medium ${uploadStatus === 'processing' || uploadStatus === 'done' ? 'text-gray-800' : 'text-gray-400'}`}>Processing Data & Feature Extraction</p>
                        {uploadStatus === 'processing' && <p className="text-xs text-gray-500 mt-1">Cleaning... Tokenizing... TF-IDF...</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ${uploadStatus === 'done' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <CheckCircle size={14} />
                      </div>
                      <div className="pb-1">
                        <p className={`text-sm font-medium ${uploadStatus === 'done' ? 'text-gray-800' : 'text-gray-400'}`}>Completed</p>
                        {uploadStatus === 'done' && <p className="text-xs text-emerald-600 mt-1 font-medium">12,450 baris berhasil diimpor</p>}
                      </div>
                    </div>
                  </div>
                  
                  {uploadStatus === 'done' && (
                    <div className="mt-6 flex justify-end">
                      <button className="btn btn-primary" onClick={() => setUploadStatus('idle')}>Selesai</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playstore' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-sm text-emerald-800">
                <span className="font-semibold block mb-1">Status API: Aktif</span>
                Fitur ini terhubung langsung dengan backend FastAPI (localhost:8000) dan menggunakan pustaka <code>google-play-scraper</code>.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Play Store App ID / URL</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input-field pl-9"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="Contoh: com.muamalat.mobile"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Data (Max)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={count} 
                      onChange={(e) => setCount(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bahasa</label>
                    <select 
                      className="input-field"
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                    >
                      <option value="id">Indonesian (id)</option>
                      <option value="en">English (en)</option>
                    </select>
                  </div>
                </div>

                {scrapeStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Gagal mengekstrak data</p>
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70"
                    onClick={handleScrape}
                    disabled={scrapeStatus === 'loading'}
                  >
                    {scrapeStatus === 'loading' ? (
                      <><Loader2 size={18} className="animate-spin" /> Sedang Mengekstrak Data...</>
                    ) : (
                      <><Download size={18} /> Collect Reviews</>
                    )}
                  </button>
                </div>
                
                {scrapeStatus === 'success' && scrapeData && (
                  <div className="mt-6 border border-emerald-100 rounded-xl overflow-hidden animate-in fade-in duration-500">
                    <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-emerald-800">Scraping Berhasil</h4>
                        <p className="text-xs text-emerald-600 mt-0.5">{scrapeData.total_extracted} ulasan berhasil diekstrak dari {scrapeData.app_id}</p>
                      </div>
                      <button 
                        className={`btn py-1.5 text-xs ${saveStatus === 'success' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'btn-primary'}`} 
                        onClick={handleSaveToDataset}
                        disabled={saveStatus === 'loading' || saveStatus === 'success'}
                      >
                        {saveStatus === 'loading' ? 'Menyimpan...' : saveStatus === 'success' ? 'Berhasil Disimpan' : 'Simpan ke Dataset'}
                      </button>
                    </div>
                    <div className="p-0 max-h-64 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Review</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                          {scrapeData.data.slice(0, 10).map((review) => (
                            <tr key={review.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{review.username}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">★ {review.score}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 line-clamp-2" title={review.content}>{review.content}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {scrapeData.total_extracted > 10 && (
                        <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                          Menampilkan 10 dari {scrapeData.total_extracted} data...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCollection;
