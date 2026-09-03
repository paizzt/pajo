import React from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Filter, Calendar } from 'lucide-react';

const PIE_DATA = [
  { name: 'Positif', value: 7850, color: '#10b981' },
  { name: 'Negatif', value: 3120, color: '#ef4444' },
  { name: 'Netral', value: 1480, color: '#64748b' },
];

const TREND_DATA = [
  { name: 'Jan', Positif: 400, Negatif: 240, Netral: 100 },
  { name: 'Feb', Positif: 300, Negatif: 139, Netral: 80 },
  { name: 'Mar', Positif: 500, Negatif: 280, Netral: 120 },
  { name: 'Apr', Positif: 478, Negatif: 190, Netral: 110 },
  { name: 'Mei', Positif: 589, Negatif: 120, Netral: 90 },
  { name: 'Jun', Positif: 630, Negatif: 150, Netral: 130 },
  { name: 'Jul', Positif: 720, Negatif: 110, Netral: 140 },
  { name: 'Ags', Positif: 850, Negatif: 90, Netral: 160 },
];

const Visualisasi = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visualisasi Data</h1>
          <p className="text-sm text-gray-500 mt-1">Eksplorasi grafis dari hasil analisis sentimen secara interaktif.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter size={16} /> Filter Lanjutan
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Calendar size={16} /> Sepanjang Waktu
          </button>
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
             {/* This represents a wordcloud placeholder */}
             <div className="text-center p-6">
                <span className="text-4xl text-emerald-400 font-bold mx-2">mudah</span>
                <span className="text-2xl text-emerald-300 font-semibold mx-2">membantu</span>
                <span className="text-5xl text-red-500 font-extrabold mx-2">login</span>
                <span className="text-3xl text-red-400 font-bold mx-2">error</span>
                <span className="text-xl text-gray-400 mx-2">aplikasi</span>
                <span className="text-lg text-emerald-200 mx-2">cepat</span>
                <span className="text-3xl text-red-300 mx-2">gagal</span>
                <span className="text-2xl text-emerald-400 mx-2">bagus</span>
                <span className="text-sm text-gray-500 mx-2">update</span>
             </div>
           </div>
           <p className="text-gray-400 text-sm mt-4">Menampilkan representasi kata yang paling sering muncul dari dataset ulasan.</p>
        </div>
      </div>
    </div>
  );
};

export default Visualisasi;
