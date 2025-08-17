import React, { useState } from 'react';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useMusic } from '../../contexts/MusicContext';
import { Play, Pause, MoreHorizontal, Edit, Trash2, Music } from 'lucide-react';

const PlaylistCard = ({ playlist }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { deletePlaylist } = usePlaylist();
  const { currentSong, isPlaying, playSong } = useMusic();

  const handlePlay = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        await deletePlaylist(playlist.id);
      } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('Failed to delete playlist');
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  const getPlaylistImage = () => {
    if (playlist.imageUrl) return playlist.imageUrl;
    if (playlist.songs && playlist.songs.length > 0 && playlist.songs[0].imageUrl) {
      return playlist.songs[0].imageUrl;
    }
    return '/default-playlist.jpg';
  };

  return (
    <div
      className="group bg-dark-100 rounded-lg p-4 hover:bg-dark-200 transition-all duration-300 cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      onClick={handlePlay}
    >
      {/* Playlist Cover */}
      <div className="relative mb-4">
        <div className="relative">
          <img
            src={getPlaylistImage()}
            alt={playlist.name}
            className="w-full aspect-square object-cover rounded-md shadow-lg"
            onError={(e) => {
              e.target.src = '/default-playlist.jpg';
            }}
          />
          
          {/* Overlay for empty playlist */}
          {(!playlist.songs || playlist.songs.length === 0) && (
            <div className="absolute inset-0 bg-dark-300 bg-opacity-50 flex items-center justify-center rounded-md">
              <Music size={32} className="text-gray-500" />
            </div>
          )}
        </div>
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md transition-opacity ${
          isHovered && playlist.songs && playlist.songs.length > 0 ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-3 transform hover:scale-110 transition-all shadow-lg"
          >
            <Play size={20} className="ml-0.5" />
          </button>
        </div>

        {/* Options Menu */}
        <div className={`absolute top-2 right-2 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-10 bg-dark-100 border border-gray-600 rounded-lg shadow-lg py-2 min-w-40 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add edit functionality
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white transition-colors"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Playlist Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
          {playlist.name}
        </h3>
        
        {playlist.description && (
          <p className="text-sm text-gray-400 truncate">
            {playlist.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {playlist.songs ? playlist.songs.length : 0} songs
          </span>
          <span>
            {formatDate(playlist.createdAt)}
          </span>
        </div>
      </div>

      {/* Song Count Badge */}
      {playlist.songs && playlist.songs.length > 0 && (
        <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
          {playlist.songs.length}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;