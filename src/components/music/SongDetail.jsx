import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../../hooks/useMusic';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useAuth } from '../../contexts/AuthContext';
import { songsAPI } from '../../services/api';
import {
  Play,
  Pause,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  X,
  Music,
  Edit,
  Plus,
  Check
} from 'lucide-react';
import AudioControls from '../audio/AudioControls';
import VolumeControl from '../audio/VolumeControl';
import { formatTime } from '../../utils/helpers';
import Loading from '../common/Loading';

const SongDetail = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, currentTime, duration, seekTo } = useMusic();
  const { playlists, addSongToPlaylist } = usePlaylist();
  const { isAdmin } = useAuth();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchSongDetails();
  }, [songId]);

  const fetchSongDetails = async () => {
    try {
      setLoading(true);
      const songData = await songsAPI.getById(songId);
      if (songData) {
        setSong(songData);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching song details:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (song) {
      playSong(song, [song]);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${song.title} by ${song.artist}`,
      text: `Check out "${song.title}" by ${song.artist}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setFeedbackMessage('Link copied to clipboard!');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setShowMoreMenu(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.artist} - ${song.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMoreMenu(false);
  };

  const handleAddToPlaylist = async (playlistId) => {
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
      setFeedbackMessage(error.message || 'Failed to add song');
      setAddingToPlaylist(null);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const isCurrentSong = currentSong?.id === song?.id;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    seekTo(time);
  };

  const isInPlaylist = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.songs?.includes(song.id);
  };

  if (loading) {
    return <Loading size="large" message="Loading song..." />;
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Song Not Found</h2>
          <p className="text-gray-400">The song you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-4">
          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>

            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[180px] z-20">
                <button
                  onClick={() => {
                    setShowPlaylistMenu(true);
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to playlist</span>
                </button>

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

                {isAdmin && (
                  <button
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-6 pb-32">
        {/* Song Image */}
        <div className="w-80 h-80 md:w-96 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-2xl">
          {song.imageUrl ? (
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <Music className="w-32 h-32 text-gray-500" />
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="text-center mb-8 max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {song.title}
          </h1>
          <p className="text-xl text-gray-300 mb-4">{song.artist}</p>
          {song.album && (
            <p className="text-gray-400">{song.album}</p>
          )}
        </div>

        {/* Progress Bar */}
        {isCurrentSong && (
          <div className="w-full max-w-md mb-4">
            <div
              className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full relative transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <AudioControls />

          <VolumeControl />
        </div>

        {/* Play Button (if not current song) */}
        {!isCurrentSong && (
          <button
            onClick={handlePlay}
            className="flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <Play className="w-6 h-6 ml-1" />
            <span>Play</span>
          </button>
        )}

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {feedbackMessage}
          </div>
        )}
      </div>

      {/* Playlist Menu */}
      {showPlaylistMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Add to playlist</h3>
                <button
                  onClick={() => setShowPlaylistMenu(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id || isInPlaylist(playlist.id)}
                    className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {addingToPlaylist === playlist.id ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : isInPlaylist(playlist.id) ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-white">{playlist.name}</span>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No playlists yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close menu backdrop */}
      {(showMoreMenu || showPlaylistMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowMoreMenu(false);
            setShowPlaylistMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default SongDetail;
