import React, { useState, useEffect } from 'react';
import { Save, Sliders, Database, Palette, Loader2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('preprocessing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    confidence_threshold: "60",
    custom_stopwords: "dan, atau, di, ke, dari, yang, untuk, dengan, ini, itu, aplikasi, apk, app, muamalat, bank, din",
    auto_clean: "true",
    export_format: "csv",
    export_date: "true",
    export_metadata: "true",
    theme: "light",
    table_rows: "25"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/settings');
      if (res.data.status === 'success') {
        setSettings(prev => ({...prev, ...res.data.data}));
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Tidak dapat memuat pengaturan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        settings: Object.keys(settings).map(key => ({
          key, value: String(settings[key])
        }))
      };
      const res = await axios.post('http://localhost:8000/api/settings', payload);
      Swal.fire('Berhasil', 'Pengaturan berhasil disimpan', 'success');
    } catch (err) {
      Swal.fire('Gagal', 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? String(checked) : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi preferensi aplikasi dan parameter sistem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('preprocessing')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'preprocessing' ? 'bg-emerald-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Sliders size={18} /> Preprocessing
          </button>
          <button 
            onClick={() => setActiveTab('export')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'export' ? 'bg-emerald-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Database size={18} /> Export Data
          </button>
          <button 
            onClick={() => setActiveTab('tampilan')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'tampilan' ? 'bg-emerald-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Palette size={18} /> Tampilan
          </button>
        </div>

        <div className="md:col-span-3">          {activeTab === 'preprocessing' && (
            <div className="card p-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Pengaturan Analisis & Preprocessing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Threshold Confidence (%)</label>
                  <p className="text-xs text-gray-500 mb-2">Batas minimal persentase keyakinan model untuk mengklasifikasikan sentimen secara otomatis.</p>
                  <input type="number" name="confidence_threshold" value={settings.confidence_threshold} onChange={handleChange} className="input-field max-w-xs" />
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Daftar Stopword Kustom</label>
                  <textarea 
                    rows={4} 
                    name="custom_stopwords"
                    value={settings.custom_stopwords}
                    onChange={handleChange}
                    className="input-field text-sm font-mono" 
                  />
                  <p className="text-xs text-gray-500 mt-2">Pisahkan dengan koma. Kata-kata ini akan diabaikan saat ekstraksi fitur.</p>
                </div>
                
                <div className="pt-2 flex items-center">
                  <input type="checkbox" name="auto_clean" id="auto-clean" checked={settings.auto_clean === 'true'} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                  <label htmlFor="auto-clean" className="ml-2 block text-sm text-gray-900">
                    Bersihkan emoji dan simbol secara otomatis saat upload dataset baru
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="btn btn-secondary flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="card p-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Pengaturan Export Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format Export Default</label>
                  <select name="export_format" value={settings.export_format} onChange={handleChange} className="input-field max-w-xs">
                    <option value="csv">CSV (Comma Separated Values)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <div className="pt-2 flex items-center">
                  <input type="checkbox" name="export_date" id="export-date" checked={settings.export_date === 'true'} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                  <label htmlFor="export-date" className="ml-2 block text-sm text-gray-900">
                    Sertakan tanggal waktu (timestamp) pada nama file
                  </label>
                </div>
                
                <div className="pt-2 flex items-center">
                  <input type="checkbox" name="export_metadata" id="export-metadata" checked={settings.export_metadata === 'true'} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                  <label htmlFor="export-metadata" className="ml-2 block text-sm text-gray-900">
                    Sertakan metadata model dan parameter saat export hasil analisis
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="btn btn-secondary flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tampilan' && (
            <div className="card p-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Pengaturan Tampilan (UI)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tema Aplikasi</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={handleChange} className="text-primary focus:ring-primary" />
                      <span className="text-sm text-gray-800">Terang (Light)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer opacity-50" title="Belum tersedia">
                      <input type="radio" name="theme" value="dark" disabled className="text-primary focus:ring-primary" />
                      <span className="text-sm text-gray-800">Gelap (Dark)</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Ditampilkan Per Halaman (Tabel)</label>
                  <select name="table_rows" value={settings.table_rows} onChange={handleChange} className="input-field max-w-xs">
                    <option value="10">10 Baris</option>
                    <option value="25">25 Baris</option>
                    <option value="50">50 Baris</option>
                    <option value="100">100 Baris</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="btn btn-secondary flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
