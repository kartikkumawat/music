import React from 'react';
import { useMusic } from '../../contexts/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';

const AudioControls = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playSong,
    pauseSong,
    nextSong,
    previousSong,
    seekTo,
    isShuffled,
    isRepeating,
    toggleShuffle,
    toggleRepeat,
    playlist
  } = useMusic();

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Main Control Buttons */}
      <div className="flex items-center space-x-4">
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`p-2 rounded-full transition-colors ${
            isShuffled 
              ? 'text-primary-500 bg-primary-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
          title="Toggle Shuffle"
        >
          <Shuffle size={16} />
        </button>

        {/* Previous */}
        <button
          onClick={previousSong}
          disabled={!playlist || playlist.length <= 1}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Song"
        >
          <SkipBack size={20} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => isPlaying ? pauseSong() : playSong(currentSong)}
          className="bg-white text-black rounded-full p-3 hover:scale-105 transition-transform shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>

        {/* Next */}
        <button
          onClick={nextSong}
          disabled={!playlist || playlist.length <= 1}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Song"
        >
          <SkipForward size={20} />
        </button>

        {/* Repeat */}
        <button
          onClick={toggleRepeat}
          className={`p-2 rounded-full transition-colors ${
            isRepeating 
              ? 'text-primary-500 bg-primary-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
          title="Toggle Repeat"
        >
          <Repeat size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center space-x-3 w-full max-w-md">
        <span className="text-gray-400 text-xs min-w-[35px]">
          {formatTime(currentTime)}
        </span>
        
        <div className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer group">
          <div 
            className="bg-white rounded-full h-1 relative transition-all"
            style={{ width: `${progressPercentage}%` }}
          >
            <div 
              className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime || 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        <span className="text-gray-400 text-xs min-w-[35px]">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default AudioControls;