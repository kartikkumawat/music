import React from 'react';
import { Music, Loader } from 'lucide-react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-200 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <Music size={48} className="text-primary-500 mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size={20} className="text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">MusicStream</h2>
        <p className="text-gray-400">{message}</p>
        
        {/* Loading bars animation */}
        <div className="flex items-center justify-center space-x-1 mt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary-500 rounded-full animate-pulse"
              style={{
                height: '20px',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;