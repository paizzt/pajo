import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, MinusCircle, Loader2, Info, MessageSquare, Bot } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AnalisisSentimen = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showNerdStats, setShowNerdStats] = useState(false); // Toggle untuk info teknis

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/analyze', { text });
      setResult(response.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.detail || "Terjadi kesalahan saat menganalisis sentimen.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'POSITIF') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (sentiment === 'NEGATIF') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'POSITIF') return <CheckCircle2 size={40} className="text-emerald-500" />;
    if (sentiment === 'NEGATIF') return <XCircle size={40} className="text-red-500" />;
    return <MinusCircle size={40} className="text-gray-500" />;
  };

  const getFriendlyMessage = (sentiment) => {
    if (sentiment === 'POSITIF') return "Wah, ini ulasan yang bagus! Pengguna terdengar puas dan memberikan komentar positif.";
    if (sentiment === 'NEGATIF') return "Hmm, sepertinya pengguna ini sedang kecewa atau mengeluhkan sesuatu. Ini adalah ulasan negatif.";
    return "Ulasan ini terdengar biasa saja, tidak memuji namun juga tidak mengeluh. Ini adalah ulasan netral.";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex justify-center items-center gap-3">
          <Bot size={36} className="text-primary" /> Uji Coba Kecerdasan Buatan
        </h1>
        <p className="text-gray-500 mt-2">Ketik kalimat apapun dan lihat bagaimana robot AI kami menebak perasaan (sentimen) dari kalimat tersebut.</p>
      </div>

      {/* CHAT INTERFACE */}
      <div className="card shadow-lg border border-gray-100 overflow-hidden bg-white">
        
        {/* HASIL CHAT */}
        <div className="bg-slate-50 min-h-[300px] p-6 flex flex-col gap-6">
          {/* Pesan Sambutan AI */}
          {!result && !loading && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot size={24} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%] text-gray-700">
                Halo! Saya adalah Robot AI yang sudah dilatih. Coba ketik sesuatu di bawah, misalnya <strong>"Aplikasinya bagus banget, saya suka!"</strong> atau <strong>"Sering error dan lemot, tolong perbaiki."</strong>, lalu tekan kirim!
              </div>
            </div>
          )}

          {/* Pesan User */}
          {result && (
            <div className="flex gap-4 flex-row-reverse animate-in fade-in slide-in-from-bottom-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 shadow-sm">
                <MessageSquare size={20} />
              </div>
              <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                {result.preprocessing.original}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot size={24} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2 text-gray-500 italic">
                <Loader2 className="animate-spin" size={18} /> AI sedang berpikir...
              </div>
            </div>
          )}

          {/* Pesan Balasan AI */}
          {result && !loading && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot size={24} />
              </div>
              <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%]">
                <div className="flex items-start gap-4 mb-3">
                  {getSentimentIcon(result.sentiment)}
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{result.sentiment}</h4>
                    <p className="text-gray-600">{getFriendlyMessage(result.sentiment)}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Tingkat Keyakinan AI:</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${result.probabilities.positive}%` }} title="Positif"></div>
                      <div className="bg-gray-400 h-full" style={{ width: `${result.probabilities.neutral}%` }} title="Netral"></div>
                      <div className="bg-red-500 h-full" style={{ width: `${result.probabilities.negative}%` }} title="Negatif"></div>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{result.confidence}% Yakin</span>
                  </div>
                </div>

                {/* Tombol Tampilkan Detail Teknis */}
                <button 
                  onClick={() => setShowNerdStats(!showNerdStats)}
                  className="mt-4 text-xs font-semibold text-primary hover:text-primary-dark underline flex items-center gap-1"
                >
                  <Info size={14} /> {showNerdStats ? 'Sembunyikan' : 'Lihat'} Proses Pemikiran AI
                </button>

                {/* Detail Teknis (Nerd Stats) */}
                {showNerdStats && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                    <p className="font-semibold text-gray-700 mb-2">Bagaimana AI memecah kalimat Anda:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">1. Dicuci (Cleaning)</p>
                        <p className="bg-white p-2 border border-gray-200 rounded font-mono text-xs">{result.preprocessing.cleaning}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">2. Dipecah & Dicari Kata Dasarnya (Stemming)</p>
                        <div className="flex flex-wrap gap-1">
                          {result.preprocessing.stemming.map((token, i) => (
                            <span key={i} className="bg-white border border-gray-200 px-2 py-1 rounded font-mono text-xs text-blue-600">
                              {token}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* INPUT CHAT */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleAnalyze} className="relative flex items-center">
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-full py-4 pl-6 pr-16 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow shadow-inner"
              placeholder="Ketik kalimat untuk diuji di sini..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              className="absolute right-2 bg-primary hover:bg-primary-dark text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              disabled={!text.trim() || loading}
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default AnalisisSentimen;
