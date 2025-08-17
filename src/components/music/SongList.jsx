import React, { useState } from 'react';
import { useMusic } from '../../contexts/MusicContext';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { Play, Pause, MoreHorizontal, Heart, Plus, Clock } from 'lucide-react';

const SongList = ({ songs = [], showHeader = true, showAddToPlaylist = true, className = '' }) => {
  const { currentSong, isPlaying, playSong, pauseSong } = useMusic();
  const { playlists, addSongToPlaylist } = usePlaylist();
  const [hoveredSong, setHoveredSong] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const isCurrentSong = (song) => {
    return currentSong && currentSong.id === song.id;
  };

  const handlePlayPause = (song) => {
    if (isCurrentSong(song) && isPlaying) {
      pauseSong();
    } else {
      playSong(song, songs);
    }
  };

  const handleAddToPlaylist = async (song, playlistId) => {
    try {
      await addSongToPlaylist(playlistId, song);
      setShowPlaylistMenu(null);
      setShowMenu(null);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const SongRow = ({ song, index }) => (
    <div
      key={song.id}
      className={`group flex items-center space-x-4 p-3 rounded-lg transition-all hover:bg-dark-200 ${
        isCurrentSong(song) ? 'bg-primary-500/10' : ''
      }`}
      onMouseEnter={() => setHoveredSong(song.id)}
      onMouseLeave={() => setHoveredSong(null)}
    >
      {/* Index/Play Button */}
      <div className="w-8 flex justify-center">
        {hoveredSong === song.id || isCurrentSong(song) ? (
          <button
            onClick={() => handlePlayPause(song)}
            className={`p-1 rounded-full transition-colors ${
              isCurrentSong(song) 
                ? 'text-primary-500 hover:text-primary-400' 
                : 'text-white hover:scale-110'
            }`}
          >
            {isCurrentSong(song) && isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
        ) : (
          <span className="text-gray-400 text-sm">{index + 1}</span>
        )}
      </div>

      {/* Song Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <img
          src={song.imageUrl || '/default-album.jpg'}
          alt={song.title}
          className="w-10 h-10 rounded object-cover"
          onError={(e) => {
            e.target.src = '/default-album.jpg';
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${
            isCurrentSong(song) ? 'text-primary-500' : 'text-white'
          }`}>
            {song.title}
          </h4>
          <p className="text-gray-400 text-sm truncate">{song.artist}</p>
        </div>
      </div>

      {/* Album (Hidden on mobile) */}
      <div className="hidden md:block flex-1 min-w-0">
        <p className="text-gray-400 text-sm truncate">{song.album || 'Unknown Album'}</p>
      </div>

      {/* Date Added (Hidden on mobile) */}
      <div className="hidden lg:block w-32">
        <p className="text-gray-400 text-sm">{formatDate(song.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Like Button */}
        <button className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <Heart size={16} />
        </button>

        {/* Duration */}
        <span className="text-gray-400 text-sm w-12 text-right">
          {formatDuration(song.duration)}
        </span>

        {/* More Options */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(showMenu === song.id ? null : song.id);
            }}
            className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1"
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Dropdown Menu */}
          {showMenu === song.id && (
            <div className="absolute right-0 top-8 bg-dark-100 border border-gray-600 rounded-lg shadow-xl py-2 min-w-48 z-20">
              {showAddToPlaylist && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white transition-colors text-left"
                  >
                    <Plus size={14} />
                    <span>Add to playlist</span>
                  </button>

                  {/* Playlist Submenu */}
                  {showPlaylistMenu === song.id && (
                    <div className="absolute left-full top-0 bg-dark-100 border border-gray-600 rounded-lg shadow-xl py-2 min-w-40 ml-1">
                      {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(song, playlist.id)}
                            className="w-full px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white transition-colors text-left text-sm"
                          >
                            {playlist.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No playlists available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white transition-colors text-left">
                <Heart size={14} />
                <span>Save to Liked Songs</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!songs || songs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <Play size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No songs available</p>
          <p className="text-sm">Add some songs to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center space-x-4 px-3 py-2 border-b border-gray-700 mb-4">
          <div className="w-8">#</div>
          <div className="flex-1 text-gray-400 text-sm uppercase tracking-wider">Title</div>
          <div className="hidden md:block flex-1 text-gray-400 text-sm uppercase tracking-wider">Album</div>
          <div className="hidden lg:block w-32 text-gray-400 text-sm uppercase tracking-wider">Date Added</div>
          <div className="w-16 text-right">
            <Clock size={16} className="text-gray-400" />
          </div>
        </div>
      )}

      {/* Song Rows */}
      <div className="space-y-1">
        {songs.map((song, index) => (
          <SongRow key={song.id} song={song} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SongList;