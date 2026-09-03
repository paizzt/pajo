import React, { useState } from 'react';
import { Save, User, Sliders, Database, Palette } from 'lucide-react';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('profil');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi preferensi aplikasi dan parameter sistem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors ${activeTab === 'profil' ? 'bg-emerald-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <User size={18} /> Profil
          </button>
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

        <div className="md:col-span-3">
          {activeTab === 'profil' && (
            <div className="card p-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Profil Administrator</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input type="text" className="input-field" defaultValue="Administrator Pajo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="input-field" defaultValue="admin@pajo.local" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input type="password" className="input-field" placeholder="Kosongkan jika tidak ingin mengubah" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn btn-primary flex items-center gap-2">
                  <Save size={16} /> Simpan Profil
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preprocessing' && (
            <div className="card p-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Pengaturan Analisis & Preprocessing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Threshold Confidence (%)</label>
                  <p className="text-xs text-gray-500 mb-2">Batas minimal persentase keyakinan model untuk mengklasifikasikan sentimen secara otomatis.</p>
                  <input type="number" className="input-field max-w-xs" defaultValue="60" />
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Daftar Stopword Kustom</label>
                  <textarea 
                    rows={4} 
                    className="input-field text-sm font-mono" 
                    defaultValue="dan, atau, di, ke, dari, yang, untuk, dengan, ini, itu, aplikasi, apk, app, muamalat, bank, din"
                  />
                  <p className="text-xs text-gray-500 mt-2">Pisahkan dengan koma. Kata-kata ini akan diabaikan saat ekstraksi fitur.</p>
                </div>
                
                <div className="pt-2 flex items-center">
                  <input type="checkbox" id="auto-clean" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                  <label htmlFor="auto-clean" className="ml-2 block text-sm text-gray-900">
                    Bersihkan emoji dan simbol secara otomatis saat upload dataset baru
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn btn-secondary flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
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
                  <select className="input-field max-w-xs">
                    <option value="csv">CSV (Comma Separated Values)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <div className="pt-2 flex items-center">
                  <input type="checkbox" id="export-date" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                  <label htmlFor="export-date" className="ml-2 block text-sm text-gray-900">
                    Sertakan tanggal waktu (timestamp) pada nama file
                  </label>
                </div>
                
                <div className="pt-2 flex items-center">
                  <input type="checkbox" id="export-metadata" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                  <label htmlFor="export-metadata" className="ml-2 block text-sm text-gray-900">
                    Sertakan metadata model dan parameter saat export hasil analisis
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn btn-secondary flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
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
                      <input type="radio" name="theme" value="light" defaultChecked className="text-primary focus:ring-primary" />
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
                  <select className="input-field max-w-xs">
                    <option value="10">10 Baris</option>
                    <option value="25" selected>25 Baris</option>
                    <option value="50">50 Baris</option>
                    <option value="100">100 Baris</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn btn-secondary flex items-center gap-2">
                  <Save size={16} /> Simpan Pengaturan
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
