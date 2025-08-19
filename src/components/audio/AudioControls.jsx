import React from 'react';
import { useMusic } from '../../hooks/useMusic';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';

const AudioControls = () => {
  const {
    isPlaying,
    currentSong,
    playSong,
    pauseSong,
    nextSong,
    previousSong,
    isShuffled,
    repeatMode,
    toggleShuffle,
    toggleRepeat
  } = useMusic();

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return Repeat1;
      case 'all':
        return Repeat;
      default:
        return Repeat;
    }
  };

  const RepeatIcon = getRepeatIcon();

  const getRepeatColor = () => {
    switch (repeatMode) {
      case 'one':
        return 'text-green-500';
      case 'all':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else if (currentSong) {
      playSong(currentSong);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`p-2 rounded-full transition-colors ${
          isShuffled
            ? 'text-green-500 bg-green-500/20'
            : 'text-gray-400 hover:text-white'
        }`}
        title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
      >
        <Shuffle className="w-4 h-4" />
      </button>

      {/* Previous */}
      <button
        onClick={previousSong}
        disabled={!currentSong}
        className="p-2 rounded-full text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Previous Song"
      >
        <SkipBack className="w-5 h-5" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        disabled={!currentSong}
        className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={nextSong}
        disabled={!currentSong}
        className="p-2 rounded-full text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Next Song"
      >
        <SkipForward className="w-5 h-5" />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={`p-2 rounded-full transition-colors ${getRepeatColor()} hover:text-white relative`}
        title={
          repeatMode === 'off' ? 'Enable Repeat All' :
          repeatMode === 'all' ? 'Enable Repeat One' :
          'Disable Repeat'
        }
      >
        <RepeatIcon className="w-4 h-4" />
        {repeatMode !== 'off' && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-current rounded-full" />
        )}
      </button>
    </div>
  );
};

export default AudioControls;
