import React, { useState } from 'react';
import { useMusic } from '../../hooks/useMusic';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

const VolumeControl = ({ className = '' }) => {
  const { volume, changeVolume } = useMusic();
  const [previousVolume, setPreviousVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const handleVolumeChange = (newVolume) => {
    changeVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      changeVolume(0);
    } else {
      changeVolume(previousVolume);
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 ${className}`}
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      <button
        onClick={toggleMute}
        className="text-gray-400 hover:text-white transition-colors p-2"
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={18} />
      </button>

      {/* Volume Slider */}
      <div className={`relative transition-all duration-300 ${
        showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0 md:w-24 md:opacity-100'
      }`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
        />
      </div>

      {/* Volume Percentage (Desktop only) */}
      <span className="text-gray-400 text-xs w-8 text-center hidden md:block">
        {Math.round(volume * 100)}
      </span>
    </div>
  );
};

export default VolumeControl;
