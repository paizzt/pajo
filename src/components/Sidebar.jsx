import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  BrainCircuit, 
  FlaskConical,
  BarChart3,
  Network,
  Settings,
  Download,
  Lightbulb
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/ulasan', name: 'Data Ulasan', icon: <MessageSquareText size={20} /> },
    { path: '/preprocessing', name: 'Preprocessing', icon: <FlaskConical size={20} /> },
    { path: '/analisis', name: 'Analisis Sentimen', icon: <BrainCircuit size={20} /> },
    { path: '/tfidf', name: 'TF-IDF & N-Grams', icon: <Network size={20} /> },
    { path: '/model', name: 'Model SVM', icon: <BrainCircuit size={20} /> },
    { path: '/evaluasi', name: 'Evaluasi Model', icon: <BarChart3 size={20} /> },
    { path: '/visualisasi', name: 'Visualisasi', icon: <BarChart3 size={20} /> },
    { path: '/insight', name: 'Insight', icon: <Lightbulb size={20} /> },
    { path: '/koleksi', name: 'Data Collection', icon: <Download size={20} /> },
    { path: '/pengaturan', name: 'Pengaturan', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-64'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit size={28} className="text-primary" />
            <span className="text-xl font-bold tracking-tight text-gray-800">PAJO</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu Utama
          </div>
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when a link is clicked
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
