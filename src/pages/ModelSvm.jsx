import React, { useState } from 'react';
import { BrainCircuit, Settings, Save, RefreshCw, PlayCircle, Download } from 'lucide-react';

const ModelSvm = () => {
  const [isTraining, setIsTraining] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Machine Learning</h1>
          <p className="text-sm text-gray-500 mt-1">Konfigurasi dan manajemen model Support Vector Machine (SVM).</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Reset Model
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MODEL INFO */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <BrainCircuit size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Support Vector Machine</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium text-emerald-600">Status: Trained</span>
                  <span className="text-xs text-gray-400 ml-2">Last Training: 02 September 2026</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Algorithm</p>
                <p className="font-semibold text-gray-800">SVM (LinearSVC)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Feature Extraction</p>
                <p className="font-semibold text-gray-800">TF-IDF + N-Grams</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Classes</p>
                <div className="flex gap-2 mt-1">
                  <span className="badge badge-success">Positive</span>
                  <span className="badge badge-danger">Negative</span>
                  <span className="badge badge-neutral">Neutral</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Dataset Split</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 flex overflow-hidden">
                  <div className="bg-primary h-2.5" style={{ width: '80%' }}></div>
                  <div className="bg-amber-400 h-2.5" style={{ width: '20%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500 font-medium">
                  <span>Training (80%)</span>
                  <span>Testing (20%)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
              <button 
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={() => setIsTraining(true)}
              >
                {isTraining ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                {isTraining ? 'Training in progress...' : 'Train Model'}
              </button>
              <button className="btn btn-secondary flex items-center justify-center gap-2">
                <Save size={18} /> Save Model
              </button>
              <button className="btn btn-secondary flex items-center justify-center gap-2">
                <Download size={18} /> Load Model
              </button>
            </div>
          </div>
        </div>

        {/* HYPERPARAMETERS */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Settings size={20} className="text-gray-500" />
              Hyperparameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">C (Regularization)</label>
                <input type="number" className="input-field" defaultValue="1.0" step="0.1" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kernel</label>
                <select className="input-field">
                  <option value="linear">Linear</option>
                  <option value="rbf">RBF</option>
                  <option value="poly">Polynomial</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N-Gram Range</label>
                <select className="input-field">
                  <option value="(1,1)">Unigram (1, 1)</option>
                  <option value="(1,2)">Uni+Bigram (1, 2)</option>
                  <option value="(1,3)" selected>Uni+Bi+Trigram (1, 3)</option>
                  <option value="(2,2)">Bigram (2, 2)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Features (TF-IDF)</label>
                <input type="number" className="input-field" defaultValue="1500" step="100" />
              </div>
              
              <button className="w-full btn btn-secondary mt-2">
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSvm;
