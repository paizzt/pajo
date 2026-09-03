import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, MinusCircle, Loader2 } from 'lucide-react';

const AnalisisSentimen = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResult({
        sentiment: 'POSITIF',
        confidence: 92.45,
        probabilities: {
          positive: 92.45,
          negative: 4.20,
          neutral: 3.35
        },
        preprocessing: {
          original: text,
          cleaning: text.toLowerCase().replace(/[^\w\s]/gi, ''),
          tokenization: text.toLowerCase().replace(/[^\w\s]/gi, '').split(' '),
          stemming: text.toLowerCase().replace(/[^\w\s]/gi, '').split(' ').map(w => w.length > 3 ? w.substring(0, w.length - 1) : w) // dummy stemming
        }
      });
      setLoading(false);
    }, 1500);
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'POSITIF') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (sentiment === 'NEGATIF') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'POSITIF') return <CheckCircle2 size={32} className="text-emerald-500" />;
    if (sentiment === 'NEGATIF') return <XCircle size={32} className="text-red-500" />;
    return <MinusCircle size={32} className="text-gray-500" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analisis Sentimen</h1>
        <p className="text-sm text-gray-500 mt-1">Masukkan ulasan pengguna untuk mengetahui kategori sentimennya.</p>
      </div>

      <div className="card p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Teks Ulasan</label>
        <textarea
          rows={5}
          className="input-field resize-none mb-4"
          placeholder="Masukkan teks ulasan di sini..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <button 
            className="btn btn-primary px-6"
            onClick={handleAnalyze}
            disabled={!text.trim() || loading}
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-2" size={18} /> Menganalisis...</>
            ) : (
              <><Send size={18} className="mr-2" /> Analisis Sentimen</>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className={`card p-6 border ${getSentimentColor(result.sentiment)}`}>
              <div className="flex items-center gap-4 mb-6">
                {getSentimentIcon(result.sentiment)}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hasil Prediksi</h3>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-bold">{result.sentiment}</span>
                    <span className="text-lg font-medium opacity-75">({result.confidence}%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-emerald-700">Positive</span>
                    <span className="text-emerald-700">{result.probabilities.positive}%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${result.probabilities.positive}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-red-700">Negative</span>
                    <span className="text-red-700">{result.probabilities.negative}%</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${result.probabilities.negative}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Neutral</span>
                    <span className="text-gray-700">{result.probabilities.neutral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${result.probabilities.neutral}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Preprocessing Text</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-1 text-xs uppercase">Original</p>
                <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 text-gray-800">
                  {result.preprocessing.original}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-500 mb-1 text-xs uppercase">Cleaning & Case Folding</p>
                <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 text-gray-800">
                  {result.preprocessing.cleaning}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-500 mb-1 text-xs uppercase">Tokenization</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.preprocessing.tokenization.map((token, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded text-xs">
                      {token}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-500 mb-1 text-xs uppercase">Stemming & Stopword Removal</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.preprocessing.stemming.map((token, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded text-xs">
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalisisSentimen;
