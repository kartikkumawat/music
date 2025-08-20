import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useMusic } from '../../hooks/useMusic';
import { useMusicActions } from '../../hooks/useMusicActions';
import { useAuth } from '../../contexts/AuthContext';
import {
  Play,
  Pause,
  Music,
  MoreHorizontal,
  Trash2,
  Edit,
  Heart,
  Share2,
  Lock,
  Globe
} from 'lucide-react';

const PlaylistCard = ({ playlist, onEdit }) => {
  const { deletePlaylist } = usePlaylist();
  const { currentSong, isPlaying } = useMusic();
  const { playSong, shareSong } = useMusicActions();
  const { user } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPlaylistPlaying = currentSong && playlist.songs?.includes(currentSong.id) && isPlaying;
  const isOwner = user?.uid === playlist.createdBy;

  const handlePlay = async () => {
    if (playlist.songs && playlist.songs.length > 0) {
      // In a real app, you'd fetch the actual song objects
      console.log('Playing playlist:', playlist.name);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(playlist);
    }
    setShowMenu(false);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        setIsDeleting(true);
        await deletePlaylist(playlist.id);
      } catch (error) {
        console.error('Failed to delete playlist:', error);
        alert('Failed to delete playlist');
      } finally {
        setIsDeleting(false);
      }
    }
    setShowMenu(false);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: `Check out this playlist: ${playlist.name}`,
        url: `${window.location.origin}/playlist/${playlist.id}`,
      });
    } else {
      const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Playlist link copied to clipboard!');
    }
    setShowMenu(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatSongCount = (count) => {
    if (count === 0) return 'No songs';
    if (count === 1) return '1 song';
    return `${count} songs`;
  };

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-all duration-200 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Playlist Image */}
        <div className="relative mb-4">
          {playlist.imageUrl ? (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="w-full aspect-square object-cover rounded-md"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-700 rounded-md flex items-center justify-center">
              <Music className="w-16 h-16 text-gray-500" />
            </div>
          )}

          {/* Play Button Overlay */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlay();
              }}
              className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 text-white p-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              {isPlaylistPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
          )}

          {/* Privacy Indicator */}
          <div className="absolute top-2 left-2">
            {playlist.isPublic ? (
              <div className="bg-green-500/80 text-white p-1.5 rounded-full" title="Public playlist">
                <Globe className="w-3 h-3" />
              </div>
            ) : (
              <div className="bg-gray-500/80 text-white p-1.5 rounded-full" title="Private playlist">
                <Lock className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* More Options */}
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[150px] z-20">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Playlist Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white truncate" title={playlist.name}>
            {playlist.name}
          </h3>

          <div className="text-gray-400 text-sm space-y-1">
            <p>{formatSongCount(playlist.songs?.length || 0)} • {playlist.isPublic ? 'Public' : 'Private'}</p>
            {playlist.description && (
              <p className="text-gray-500 text-xs truncate" title={playlist.description}>
                {playlist.description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Created {formatDate(playlist.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Click outside handler for menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </Link>
  );
};

export default PlaylistCard;
