import React, { useCallback, useMemo } from 'react';
import { useMusic } from '../../hooks/useMusic';
import { useMusicActions } from '../../hooks/useMusicActions';
import { Play, Pause, Clock, MoreHorizontal, Music } from 'lucide-react';

// Memoized individual song row component
const SongRow = React.memo(({ song, index, isCurrentSong, isCurrentPlaying, onPlay, showAlbum }) => {
  const formatDuration = useCallback((duration) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  const handleMoreClick = useCallback((e) => {
    e.stopPropagation();
    // Add more options logic here
    console.log('More options for:', song.title);
  }, [song.title]);

  const handleRowClick = useCallback(() => {
    onPlay(song);
  }, [onPlay, song]);

  return (
    <div
      className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700/30 transition-colors cursor-pointer group"
      onClick={handleRowClick}
    >
      {/* Track Number / Play Button */}
      <div className="col-span-1 flex items-center">
        <div className="w-4 text-center">
          {isCurrentPlaying ? (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-3 bg-blue-500 animate-pulse"></div>
                <div className="w-0.5 h-2 bg-blue-500 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-0.5 h-4 bg-blue-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : (
            <>
              <span className={`text-sm group-hover:hidden transition-opacity ${
                isCurrentSong ? 'text-blue-500' : 'text-gray-400'
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
          {song.imageUrl ? (
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className={`font-medium truncate transition-colors ${
              isCurrentSong ? 'text-blue-500' : 'text-white'
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
          onClick={handleMoreClick}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all duration-200"
        >
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
        <span className="text-sm text-gray-400 min-w-[40px] text-right">
          {formatDuration(song.duration)}
        </span>
      </div>
    </div>
  );
});

SongRow.displayName = 'SongRow';

// Main SongList component
const SongList = React.memo(({ songs, showHeader = true, showAlbum = false }) => {
  const { currentSong, isPlaying } = useMusic();
  const { playSong } = useMusicActions();

  // Memoize the play handler to prevent re-creating on every render
  const handlePlay = useCallback((song) => {
    playSong(song, songs);
  }, [playSong, songs]);

  // Memoize current song ID to reduce comparisons
  const currentSongId = useMemo(() => currentSong?.id, [currentSong?.id]);

  // Memoize song rows to prevent unnecessary re-renders
  const songRows = useMemo(() => {
    return songs.map((song, index) => {
      const isCurrentSong = currentSongId === song.id;
      const isCurrentPlaying = isCurrentSong && isPlaying;

      return (
        <SongRow
          key={song.id}
          song={song}
          index={index}
          isCurrentSong={isCurrentSong}
          isCurrentPlaying={isCurrentPlaying}
          onPlay={handlePlay}
          showAlbum={showAlbum}
        />
      );
    });
  }, [songs, currentSongId, isPlaying, handlePlay, showAlbum]);

  // Memoize header to prevent re-renders
  const headerContent = useMemo(() => {
    if (!showHeader) return null;

    return (
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Title</div>
        {showAlbum && <div className="col-span-3">Album</div>}
        <div className="col-span-2">Date Added</div>
        <div className="col-span-1 text-right">
          <Clock size={14} />
        </div>
      </div>
    );
  }, [showHeader, showAlbum]);

  // Memoize empty state
  const emptyState = useMemo(() => {
    if (songs.length > 0) return null;

    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-2">
          <Music className="w-12 h-12 text-gray-600" />
          <p className="text-gray-400">No songs found</p>
        </div>
      </div>
    );
  }, [songs.length]);

  return (
    <div className="w-full">
      {headerContent}

      {/* Song Rows */}
      <div className="divide-y divide-gray-700/50">
        {songRows}
      </div>

      {emptyState}
    </div>
  );
});

SongList.displayName = 'SongList';
export default SongList;
