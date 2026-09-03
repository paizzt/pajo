import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const DataUlasan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/reviews');
      setReviews(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data dari database");
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'POSITIF':
        return <span className="badge badge-success">POSITIF</span>;
      case 'NEGATIF':
        return <span className="badge badge-danger">NEGATIF</span>;
      case 'NETRAL':
        return <span className="badge badge-neutral">NETRAL</span>;
      default:
        return null;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {'★'.repeat(rating)}
        <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
      </div>
    );
  };

  const filteredReviews = reviews.filter(r => r.text.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentItems = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 5];
      } else if (currentPage >= totalPages - 2) {
        pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
      }
    }
    return pages;
  };
  
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Ulasan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan lihat data ulasan pengguna.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 bg-white"
              placeholder="Cari ulasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select className="input-field py-2 text-sm w-full sm:w-auto bg-white">
              <option value="">Semua Sentimen</option>
              <option value="POSITIF">Positif</option>
              <option value="NEGATIF">Negatif</option>
              <option value="NETRAL">Netral</option>
            </select>
            <select className="input-field py-2 text-sm w-full sm:w-auto bg-white">
              <option value="">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold w-12 text-center">No</th>
                <th className="px-6 py-4 font-semibold">Review</th>
                <th className="px-6 py-4 font-semibold w-32">Rating</th>
                <th className="px-6 py-4 font-semibold w-32">Tanggal</th>
                <th className="px-6 py-4 font-semibold w-28">Sentimen</th>
                <th className="px-6 py-4 font-semibold w-28">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary" />
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Belum ada data ulasan di database. Silakan scrape data di menu Data Collection.
                  </td>
                </tr>
              ) : (
                currentItems.map((review, index) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 line-clamp-2 sm:line-clamp-none">
                      "{review.text}"
                    </td>
                    <td className="px-6 py-4">{renderStars(review.rating)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{review.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getSentimentBadge(review.sentiment)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{review.confidence}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-gray-900">{startIndex}</span> sampai <span className="font-semibold text-gray-900">{endIndex}</span> dari <span className="font-semibold text-gray-900">{totalItems}</span> data
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={20} />
              </button>
              {getPageNumbers().map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm font-medium ${currentPage === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUlasan;
