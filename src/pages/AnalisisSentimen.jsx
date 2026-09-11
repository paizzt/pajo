import React, { useState } from 'react';
import { CheckCircle2, XCircle, MinusCircle, Loader2, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AnalisisSentimen = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showNerdStats, setShowNerdStats] = useState(false);

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

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'POSITIF') return <CheckCircle2 size={32} className="text-emerald-500" />;
    if (sentiment === 'NEGATIF') return <XCircle size={32} className="text-red-500" />;
    return <MinusCircle size={32} className="text-gray-500" />;
  };

  const getFriendlyMessage = (sentiment) => {
    if (sentiment === 'POSITIF') return "Ini ulasan yang bagus! Pengguna terdengar puas dan memberikan komentar positif.";
    if (sentiment === 'NEGATIF') return "Sepertinya pengguna ini sedang kecewa atau mengeluhkan sesuatu. Ini adalah ulasan negatif.";
    return "Ulasan ini terdengar biasa saja, tidak memuji namun juga tidak mengeluh. Ini adalah ulasan netral.";
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex justify-center items-center gap-3">
          <MessageSquare size={32} className="text-primary" /> Uji Sentimen
        </h1>
        <p className="text-gray-500 mt-2">Ketik kalimat apapun dan lihat bagaimana sistem menebak sentimen dari kalimat tersebut.</p>
      </div>

      {/* CHAT INTERFACE */}
      <div className="card shadow-lg border border-gray-100 overflow-hidden bg-white">
        
        {/* CHAT AREA */}
        <div className="bg-slate-50 min-h-[350px] p-6 flex flex-col gap-4">
          
          {/* Pesan Sambutan */}
          {!result && !loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%] text-gray-700 text-sm">
                Halo! Coba ketik sesuatu di bawah, misalnya <strong>"Aplikasinya bagus banget, saya suka!"</strong> atau <strong>"Sering error dan lemot, tolong perbaiki."</strong>, lalu tekan kirim.
              </div>
            </div>
          )}

          {/* Pesan User */}
          {result && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] text-sm">
                {result.preprocessing.original}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2 text-gray-500 italic text-sm">
                <Loader2 className="animate-spin" size={16} /> Sedang menganalisis...
              </div>
            </div>
          )}

          {/* Balasan Sistem */}
          {result && !loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[90%]">
                <div className="flex items-start gap-3 mb-3">
                  {getSentimentIcon(result.sentiment)}
                  <div>
                    <h4 className="font-bold text-gray-800">{result.sentiment}</h4>
                    <p className="text-gray-600 text-sm">{getFriendlyMessage(result.sentiment)}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Tingkat Keyakinan:</p>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${result.probabilities.positive}%` }} title="Positif"></div>
                      <div className="bg-gray-400 h-full transition-all" style={{ width: `${result.probabilities.neutral}%` }} title="Netral"></div>
                      <div className="bg-red-500 h-full transition-all" style={{ width: `${result.probabilities.negative}%` }} title="Negatif"></div>
                    </div>
                    <span className="font-bold text-gray-700 text-sm whitespace-nowrap">{result.confidence}%</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Positif {result.probabilities.positive}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span> Netral {result.probabilities.neutral}%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Negatif {result.probabilities.negative}%</span>
                  </div>
                </div>

                {/* Detail Teknis */}
                <button 
                  onClick={() => setShowNerdStats(!showNerdStats)}
                  className="mt-4 text-xs font-semibold text-primary hover:underline"
                >
                  {showNerdStats ? 'Sembunyikan Detail' : 'Lihat Detail Preprocessing'}
                </button>

                {showNerdStats && (
                  <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                    <p className="font-semibold text-gray-700 mb-2">Tahapan Preprocessing:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">1. Cleaning & Case Folding</p>
                        <p className="bg-white p-2 border border-gray-200 rounded font-mono text-xs">{result.preprocessing.cleaning}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">2. Tokenisasi & Stemming</p>
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
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-full py-3.5 pl-5 pr-14 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              className="absolute right-1.5 bg-primary hover:bg-emerald-600 text-white p-2.5 rounded-full transition-colors disabled:opacity-50"
              disabled={!text.trim() || loading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default AnalisisSentimen;
