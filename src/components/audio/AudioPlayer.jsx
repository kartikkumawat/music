import React, { useState } from 'react';
import { useMusic } from '../../hooks/useMusic';
import AudioControls from './AudioControls';
import VolumeControl from './VolumeControl';
import { Heart, MoreHorizontal, Maximize2, X, Share2, Download, Music } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

const AudioPlayer = () => {
  const {
    currentSong,
    currentTime,
    duration,
    seekTo,
    isLoading,
    showPlayer,
    closeMusicPlayer,
    shareSong
  } = useMusic();

  const [isFavorite, setIsFavorite] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!currentSong || !showPlayer) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    seekTo(time);
  };

  const handleShare = () => {
    shareSong(currentSong);
    setShowMoreMenu(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentSong.audioUrl;
    link.download = `${currentSong.artist} - ${currentSong.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMoreMenu(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically save to favorites in your backend
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      {/* Progress Bar */}
      <div
        className="w-full h-1 bg-gray-700 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-blue-500 relative transition-all duration-150"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        {/* Song Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {currentSong.imageUrl ? (
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
              <Music className="w-6 h-6 text-gray-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
            <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
            {currentSong.album && (
              <p className="text-gray-500 text-xs truncate">{currentSong.album}</p>
            )}
          </div>

          {/* Song Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'text-red-500 hover:text-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center space-x-4">
          <AudioControls />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3 min-w-0 flex-1 justify-end">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <VolumeControl />

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[160px]">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Full Screen</span>
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={closeMusicPlayer}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
      )}
    </div>
  );
};

export default AudioPlayer;
