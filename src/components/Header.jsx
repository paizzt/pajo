import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import axios from 'axios';

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/notifications');
      if (res.data.status === 'success') {
        const notifs = res.data.data;
        setNotifications(notifs);
        setHasUnread(notifs.some(n => !n.is_read));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:8000/api/notifications/read');
      setHasUnread(false);
      setNotifications(notifications.map(n => ({...n, is_read: true})));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(false);
  };

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
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-gray-50"
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
            {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
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
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">Tidak ada notifikasi</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-4 border-b border-gray-50 transition-colors cursor-pointer ${notif.is_read ? 'bg-white hover:bg-gray-50' : 'bg-emerald-50/30 hover:bg-emerald-50/50'}`}
                      onClick={handleNotificationClick}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'error' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        <div>
                          <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</p>
                          <p className={`text-xs mt-0.5 ${notif.is_read ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</p>
                          <p className="text-[11px] text-gray-400 mt-2">
                            {new Date(notif.created_at + 'Z').toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                  className={`text-xs font-semibold transition-colors ${hasUnread ? 'text-primary hover:text-emerald-700' : 'text-gray-400 cursor-not-allowed'}`}
                  onClick={markAllRead}
                  disabled={!hasUnread}
                >
                  Tandai semua sudah dibaca
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
      </div>
    </header>
  );
};

export default Header;
