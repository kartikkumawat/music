import React from 'react';
import { useMusic } from '../../hooks/useMusic';
import { Play, Pause, Clock, MoreHorizontal } from 'lucide-react';

const SongList = ({ songs, showHeader = true, showAlbum = false }) => {
  const { currentSong, isPlaying, playSong } = useMusic();

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          {showAlbum && <div className="col-span-3">Album</div>}
          <div className="col-span-2">Date Added</div>
          <div className="col-span-1 text-right">
            <Clock size={14} />
          </div>
        </div>
      )}

      {/* Song Rows */}
      <div className="divide-y divide-gray-700/50">
        {songs.map((song, index) => {
          const isCurrentSong = currentSong?.id === song.id;
          const isCurrentPlaying = isCurrentSong && isPlaying;

          return (
            <div
              key={song.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700/30 transition-colors cursor-pointer group"
              onClick={() => playSong(song, songs)}
            >
              {/* Track Number / Play Button */}
              <div className="col-span-1 flex items-center">
                <div className="w-4 text-center">
                  {isCurrentPlaying ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="flex space-x-0.5">
                        <div className="w-0.5 h-3 bg-primary-500 animate-pulse"></div>
                        <div className="w-0.5 h-2 bg-primary-500 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-0.5 h-4 bg-primary-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={`text-sm group-hover:hidden ${
                        isCurrentSong ? 'text-primary-500' : 'text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      <Play size={14} className="hidden group-hover:block text-white" />
                    </>
                  )}
                </div>
              </div>

              {/* Title and Artist */}
              <div className="col-span-5 flex items-center min-w-0">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={song.imageUrl || '/default-album.jpg'}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${
                      isCurrentSong ? 'text-primary-500' : 'text-white'
                    }`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </div>

              {/* Album */}
              {showAlbum && (
                <div className="col-span-3 flex items-center">
                  <p className="text-sm text-gray-400 truncate">
                    {song.album || 'Unknown Album'}
                  </p>
                </div>
              )}

              {/* Date Added */}
              <div className="col-span-2 flex items-center">
                <p className="text-sm text-gray-400">
                  {formatDate(song.createdAt)}
                </p>
              </div>

              {/* Duration and More */}
              <div className="col-span-1 flex items-center justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add more options logic
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                >
                  <MoreHorizontal size={14} className="text-gray-400" />
                </button>
                <span className="text-sm text-gray-400 min-w-10 text-right">
                  {song.duration ? formatDuration(song.duration) : '--:--'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {songs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No songs found</p>
        </div>
      )}
    </div>
  );
};

export default SongList;
