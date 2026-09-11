import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ message = "Memuat halaman..." }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm fixed inset-0 z-50">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping opacity-75 h-16 w-16"></div>
        
        {/* Inner spinner */}
        <div className="bg-white p-3 rounded-full shadow-lg z-10">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-6 font-medium text-gray-600 tracking-wide animate-pulse">
        {message}
      </div>
    </div>
  );
};

export default PageLoader;
