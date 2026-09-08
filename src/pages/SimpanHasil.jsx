import React, { useState, useEffect } from 'react';
import { Save, Edit2, Trash2, FileText, Loader2, Plus, X, BarChart2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const SimpanHasil = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ id: null, title: '', description: '', dataset_name: '' });
  const [currentView, setCurrentView] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/results');
      if (res.data.status === 'success') {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/results', {
        title: formData.title,
        description: formData.description,
        dataset_name: formData.dataset_name || 'Dataset Default'
      });
      Swal.fire('Berhasil!', 'Hasil metrik berhasil disimpan', 'success');
      setShowSaveModal(false);
      setFormData({ id: null, title: '', description: '', dataset_name: '' });
      fetchResults();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.detail || 'Gagal menyimpan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:8000/api/results/${formData.id}`, {
        title: formData.title,
        description: formData.description,
        dataset_name: formData.dataset_name
      });
      Swal.fire('Berhasil!', 'Data berhasil diubah', 'success');
      setShowEditModal(false);
      fetchResults();
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal mengubah data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus data ini?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/results/${id}`);
        Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        fetchResults();
      } catch (err) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus', 'error');
      }
    }
  };

  const openEditModal = (res) => {
    setFormData({
      id: res.id,
      title: res.title,
      description: res.description,
      dataset_name: res.dataset_name
    });
    setShowEditModal(true);
  };

  const openViewModal = (res) => {
    setCurrentView(res);
    setShowViewModal(true);
  };

  const parseMetrics = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat riwayat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat & Simpan Hasil</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan lihat kembali riwayat performa model yang pernah dilatih.</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setFormData({ id: null, title: '', description: '', dataset_name: '' });
            setShowSaveModal(true);
          }}
        >
          <Save size={18} /> Simpan Hasil Saat Ini
        </button>
      </div>

      <div className="card overflow-hidden">
        {results.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Belum ada riwayat hasil yang disimpan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600">Judul Hasil</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Dataset</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Akurasi</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Tanggal</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{res.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{res.description}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{res.dataset_name || '-'}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {res.accuracy ? `${res.accuracy}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(res.created_at + 'Z').toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => openViewModal(res)}
                        title="Lihat Laporan"
                      >
                        <BarChart2 size={18} />
                      </button>
                      <button 
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                        onClick={() => openEditModal(res)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleDelete(res.id)}
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: SAVE */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Simpan Hasil Metrik Saat Ini</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan</label>
                <input required type="text" className="input-field w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Model Terbaik Agustus" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dataset yang Digunakan</label>
                <input type="text" className="input-field w-full" value={formData.dataset_name} onChange={e => setFormData({...formData, dataset_name: e.target.value})} placeholder="Opsional (cth: Dataset Livin)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Catatan</label>
                <textarea className="input-field w-full min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Catatan opsional mengenai performa model..."></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                  Simpan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Edit Riwayat</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan</label>
                <input required type="text" className="input-field w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Catatan</label>
                <textarea className="input-field w-full min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW REPORT */}
      {showViewModal && currentView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <BarChart2 className="text-primary" size={20} /> 
                Laporan: {currentView.title}
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm">
              <div className="bg-gray-900 text-emerald-400 p-6 rounded-xl shadow-inner whitespace-pre-wrap overflow-x-auto">
{`--- LAPORAN HASIL PELATIHAN SVM ---
Tanggal  : ${new Date(currentView.created_at + 'Z').toLocaleString('id-ID')}
Akurasi  : ${currentView.accuracy}%
Dataset  : ${currentView.dataset_name || '-'}

Catatan:
${currentView.description || 'Tidak ada catatan.'}

--- METRIK DETAIL ---
${(() => {
  const m = parseMetrics(currentView.metrics_json);
  if (!m) return "Format metrik tidak valid atau belum tersedia.";
  return JSON.stringify(m, null, 2);
})()}
`}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SimpanHasil;
