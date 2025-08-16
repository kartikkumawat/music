import React, { useState } from 'react';
import { useMusic } from '../../contexts/MusicContext';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';

const SongCard = ({ song, onClick, showArtist = true }) => {
  const { currentSong, isPlaying } = useMusic();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isCurrentSong = currentSong?.id === song.id;
  const showPlayButton = isHovered || isCurrentSong;

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="group bg-dark-100 rounded-lg p-4 hover:bg-dark-200 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Album Cover */}
      <div className="relative mb-4">
        <img
          src={song.imageUrl || '/default-album.jpg'}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
        />
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md transition-opacity ${
          showPlayButton ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-lg"
          >
            {isCurrentSong && isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-0.5" />
            )}
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-black bg-opacity-50 text-gray-300 hover:text-red-500'
          } ${showPlayButton ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
          {song.title}
        </h3>
        
        {showArtist && (
          <p className="text-sm text-gray-400 truncate">
            {song.artist}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{song.genre || 'Unknown'}</span>
          {song.duration && (
            <span>{formatDuration(song.duration)}</span>
          )}
        </div>
      </div>

      {/* More Options */}
      <div className={`mt-3 transition-opacity ${showPlayButton ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Add more options logic here
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

export default SongCard;