import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../hooks/useMusic';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Plus,
  Check,
  Share2,
  Edit,
  Download,
  Music,
  Maximize2
} from 'lucide-react';

const SongCard = React.memo(({ song, onClick, showArtist = true, onEdit }) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong } = useMusic();
  const { playlists, addSongToPlaylist, setShowCreateModal } = usePlaylist();
  const { isAdmin } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const isCurrentSong = currentSong?.id === song.id;
  const showPlayButton = isHovered || isCurrentSong;

  const formatDuration = useCallback((duration) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePlayClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick(song);
    } else {
      playSong(song, [song]);
    }
  }, [onClick, song, playSong]);

  const handleFullScreen = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/song/${song.id}`);
    setShowMoreMenu(false);
  }, [navigate, song.id]);

  const handleMoreClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMoreMenu(!showMoreMenu);
    setShowPlaylistMenu(false);
  }, [showMoreMenu]);

  const handleAddToPlaylistClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowPlaylistMenu(true);
    setShowMoreMenu(false);
  }, []);

  const handleAddToPlaylist = useCallback(async (playlistId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setAddingToPlaylist(playlistId);
      await addSongToPlaylist(playlistId, song.id);
      setFeedbackMessage('Added to playlist!');

      setTimeout(() => {
        setFeedbackMessage('');
        setAddingToPlaylist(null);
        setShowPlaylistMenu(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      setFeedbackMessage(error.message || 'Failed to add song');
      setAddingToPlaylist(null);

      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
    }
  }, [addSongToPlaylist, song.id]);

  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = `${window.location.origin}/song/${song.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: song.title,
          text: `Check out "${song.title}" by ${song.artist}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setFeedbackMessage('Link copied to clipboard!');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setShowMoreMenu(false);
  }, [song]);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.artist} - ${song.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMoreMenu(false);
  }, [song]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit(song);
    }
    setShowMoreMenu(false);
  }, [onEdit, song]);

  const toggleFavorite = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleCreateNewPlaylist = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowPlaylistMenu(false);
    setShowCreateModal(true);
  }, [setShowCreateModal]);

  const handleCloseMenus = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMoreMenu(false);
    setShowPlaylistMenu(false);
  }, []);

  const isInPlaylist = useCallback((playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.songs?.includes(song.id);
  }, [playlists, song.id]);

  return (
    <>
      <div
        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-all duration-200 cursor-pointer group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-30">
            {feedbackMessage}
          </div>
        )}

        <div className="relative mb-4">
          {/* Song Image */}
          {song.imageUrl ? (
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-full aspect-square object-cover rounded-md"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-700 rounded-md flex items-center justify-center">
              <Music className="w-16 h-16 text-gray-500" />
            </div>
          )}

          {/* Play Button Overlay - Fixed to prevent blinking */}
          <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
            showPlayButton ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <button
              onClick={handlePlayClick}
              className="bg-green-500 hover:bg-green-400 text-white p-3 rounded-full shadow-lg transform transition-colors duration-200 z-10"
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
          </div>

          {/* Duration */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(song.duration)}
          </div>
        </div>

        {/* Song Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-white truncate" title={song.title}>
            {song.title}
          </h3>
          {showArtist && (
            <p className="text-gray-400 text-sm truncate" title={song.artist}>
              {song.artist}
            </p>
          )}
          {song.album && (
            <p className="text-gray-500 text-xs truncate" title={song.album}>
              {song.album}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite
                  ? 'text-red-500 hover:text-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Share song"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleFullScreen}
              className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={handleMoreClick}
              className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* More Menu */}
            {showMoreMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[160px] z-50">
                <button
                  onClick={handleAddToPlaylistClick}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to playlist</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            )}

            {/* Playlist Menu */}
            {showPlaylistMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[200px] max-h-64 overflow-y-auto z-50">
                <div className="px-4 py-2 text-sm font-medium text-gray-300 border-b border-gray-700">
                  Add to playlist
                </div>

                <button
                  onClick={handleCreateNewPlaylist}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new playlist</span>
                </button>

                {playlists.length > 0 ? (
                  playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={(e) => handleAddToPlaylist(playlist.id, e)}
                      disabled={addingToPlaylist === playlist.id || isInPlaylist(playlist.id)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors disabled:opacity-50"
                    >
                      {addingToPlaylist === playlist.id ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : isInPlaylist(playlist.id) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span className="truncate">{playlist.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">
                    No playlists yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close menus */}
      {(showMoreMenu || showPlaylistMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseMenus}
        />
      )}
    </>
  );
});
SongCard.displayName = 'SongCard';
export default SongCard;
