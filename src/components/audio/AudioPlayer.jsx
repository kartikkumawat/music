import React from 'react';
import { useMusic } from '../../contexts/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const AudioPlayer = () => {
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
    changeVolume,
    volume
  } = useMusic();

  if (!currentSong) return null;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-200 border-t border-gray-700 p-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-4 flex-1">
            <img
              src={currentSong.imageUrl || '/default-album.jpg'}
              alt={currentSong.title}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <h4 className="text-white font-medium">{currentSong.title}</h4>
              <p className="text-gray-400 text-sm">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-center">
            <button
              onClick={previousSong}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={() => isPlaying ? pauseSong() : playSong(currentSong)}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={nextSong}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Volume & Progress */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">
                {formatTime(currentTime)}
              </span>
              <div className="w-32 bg-gray-600 rounded-full h-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1 bg-transparent appearance-none cursor-pointer"
                />
              </div>
              <span className="text-gray-400 text-sm">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 size={16} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;