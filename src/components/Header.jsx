import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <button 
          className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
        <div className="max-w-md w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-gray-50"
            placeholder="Cari..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <button 
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-800">Notifikasi</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Model Selesai Dilatih</p>
                      <p className="text-xs text-gray-500 mt-0.5">Model SVM berhasil dilatih dengan akurasi 89,45%.</p>
                      <p className="text-[11px] text-gray-400 mt-2">2 jam yang lalu</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-sky-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Dataset Baru Diunggah</p>
                      <p className="text-xs text-gray-500 mt-0.5">Dataset "ulasan_muamalat_agustus.csv" berhasil diunggah dan siap diproses.</p>
                      <p className="text-[11px] text-gray-400 mt-2">1 hari yang lalu</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Peringatan Server</p>
                      <p className="text-xs text-gray-500 mt-0.5">Penggunaan CPU server cukup tinggi saat proses ekstraksi N-Grams.</p>
                      <p className="text-[11px] text-gray-400 mt-2">3 hari yang lalu</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                  className="text-xs font-semibold text-primary hover:text-emerald-700 transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  Tandai semua sudah dibaca
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-700">Administrator</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
          <button 
            className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-sm"
            onClick={() => navigate('/login')}
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
