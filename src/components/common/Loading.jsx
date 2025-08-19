import React from 'react';
import { Music } from 'lucide-react';

const Loading = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  const textSizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Music Icon */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin-slow`}>
          <Music className="w-full h-full text-primary-500" />
        </div>

        {/* Pulsing Ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-primary-500/30 rounded-full animate-pulse-slow`}></div>

        {/* Outer Ring */}
        <div className={`absolute -inset-2 border border-primary-500/20 rounded-full animate-spin`} style={{
          animationDuration: '4s',
          animationDirection: 'reverse'
        }}></div>
      </div>

      {/* Loading Message */}
      <div className={`text-gray-300 ${textSizeClasses[size]} animate-pulse`}>
        {message}
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

// Overlay Loading Component
export const LoadingOverlay = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-dark-100 rounded-xl p-8 shadow-2xl">
        <Loading size="large" message={message} />
      </div>
    </div>
  );
};

// Inline Loading Component
export const InlineLoading = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center py-8">
    <Loading size="small" message={message} />
  </div>
);

// Button Loading State
export const ButtonLoading = ({ loading, children, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className} relative`}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )}
    <span className={loading ? 'opacity-0' : 'opacity-100'}>
      {children}
    </span>
  </button>
);

export default Loading;
