import React, { useState, useRef, useEffect } from 'react';
import { useMusic } from '../../contexts/MusicContext';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

const VolumeControl = ({ className = '' }) => {
  const { volume, changeVolume, isMuted, toggleMute } = useMusic();
  const [showSlider, setShowSlider] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeChange = (newVolume) => {
    setLocalVolume(newVolume);
    changeVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowSlider(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowSlider(false);
    }, 300);
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div 
      ref={containerRef}
      className={`relative flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Volume Icon Button */}
      <button
        onClick={toggleMute}
        className="text-gray-400 hover:text-white transition-colors p-2"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={18} />
      </button>

      {/* Volume Slider */}
      <div className={`flex items-center transition-all duration-300 ${
        showSlider ? 'opacity-100 w-24 ml-2' : 'opacity-0 w-0 ml-0'
      }`}>
        <div className="relative flex-1 group">
          <div className="bg-gray-600 rounded-full h-1">
            <div 
              className="bg-white rounded-full h-1 relative transition-all"
              style={{ width: `${isMuted ? 0 : localVolume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : localVolume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              if (isMuted && newVolume > 0) {
                toggleMute(); // Unmute when slider is moved
              }
              handleVolumeChange(newVolume);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Alternative: Always visible horizontal slider */}
      <div className="hidden md:flex items-center ml-2">
        <div className="relative group w-20">
          <div className="bg-gray-600 rounded-full h-1">
            <div 
              className="bg-primary-500 rounded-full h-1 relative transition-all"
              style={{ width: `${isMuted ? 0 : localVolume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : localVolume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              if (isMuted && newVolume > 0) {
                toggleMute();
              }
              handleVolumeChange(newVolume);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Volume Percentage Display (on hover) */}
      {showSlider && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-dark-100 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-600">
          {Math.round((isMuted ? 0 : localVolume) * 100)}%
        </div>
      )}
    </div>
  );
};

export default VolumeControl;