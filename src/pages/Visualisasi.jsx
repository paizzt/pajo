import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Filter, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

const Visualisasi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  useEffect(() => {
    fetchStats();
  }, [timeFilter, sentimentFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/dashboard/stats?time=${timeFilter}&sentiment=${sentimentFilter}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Memuat visualisasi...</span>
      </div>
    );
  }

  const PIE_DATA = data?.pie_data || [];
  const TREND_DATA = data?.trend_data || [];
  const TOP_WORDS = data?.top_words || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visualisasi Data</h1>
          <p className="text-sm text-gray-500 mt-1">Eksplorasi grafis dari hasil analisis sentimen secara interaktif.</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="input-field py-2 text-sm bg-white border border-gray-200 rounded-md px-3"
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
          >
            <option value="all">Semua Sentimen</option>
            <option value="POSITIF">Positif</option>
            <option value="NEGATIF">Negatif</option>
            <option value="NETRAL">Netral</option>
          </select>
          <select 
            className="input-field py-2 text-sm bg-white border border-gray-200 rounded-md px-3"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">Sepanjang Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AREA CHART */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pergerakan Sentimen Keseluruhan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNegatif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Positif" stroke="#10b981" fillOpacity={1} fill="url(#colorPositif)" />
                <Area type="monotone" dataKey="Negatif" stroke="#ef4444" fillOpacity={1} fill="url(#colorNegatif)" />
                <Area type="monotone" dataKey="Netral" stroke="#64748b" fillOpacity={0.1} fill="#64748b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE & BAR */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Proporsi Sentimen</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Total Sentimen</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PIE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-10 lg:col-span-2 bg-gray-900 text-white flex flex-col items-center justify-center rounded-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-30">
              <span className="text-xs font-mono">wordcloud_engine_v1</span>
           </div>
           <h3 className="text-xl font-bold mb-6 text-gray-200">Word Cloud Visualizer</h3>
           <div className="w-full max-w-2xl h-64 border border-gray-700 rounded-lg flex items-center justify-center bg-gray-800 shadow-inner">
             {/* Simple visualizer mapping top words dynamically */}
             <div className="text-center p-6 flex flex-wrap justify-center gap-4">
                {TOP_WORDS.map((w, i) => {
                  const sizes = ['text-4xl font-bold', 'text-2xl font-semibold', 'text-5xl font-extrabold', 'text-3xl font-bold', 'text-xl', 'text-lg', 'text-sm'];
                  const colors = ['text-emerald-400', 'text-emerald-300', 'text-red-500', 'text-red-400', 'text-gray-400', 'text-emerald-200', 'text-gray-500'];
                  return (
                    <span key={i} className={`${sizes[i % sizes.length]} ${colors[i % colors.length]}`}>
                      {w.name}
                    </span>
                  );
                })}
             </div>
           </div>
           <p className="text-gray-400 text-sm mt-4">Menampilkan representasi kata yang paling sering muncul dari dataset ulasan.</p>
        </div>
      </div>
    </div>
  );
};

export default Visualisasi;
