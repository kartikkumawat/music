import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useMusic } from '../../hooks/useMusic';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Play, Pause, MoreHorizontal, Edit, Trash2, Clock, Music } from 'lucide-react';
import SongList from '../music/SongList';
import Loading from '../common/Loading';

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { deletePlaylist, removeSongFromPlaylist } = usePlaylist();
  const { currentSong, isPlaying, playSong } = useMusic();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);

      // Fetch playlist
      const playlistDoc = await getDoc(doc(db, 'playlists', playlistId));
      if (!playlistDoc.exists()) {
        navigate('/playlists');
        return;
      }

      const playlistData = { id: playlistDoc.id, ...playlistDoc.data() };
      setPlaylist(playlistData);

      // Fetch songs in playlist
      if (playlistData.songs && playlistData.songs.length > 0) {
        const songsQuery = query(
          collection(db, 'songs'),
          where('__name__', 'in', playlistData.songs.slice(0, 10)) // Firestore limit
        );
        const songsSnapshot = await getDocs(songsQuery);
        const songsData = songsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort songs according to playlist order
        const sortedSongs = playlistData.songs.map(songId =>
          songsData.find(song => song.id === songId)
        ).filter(Boolean);

        setSongs(sortedSongs);
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error('Error fetching playlist details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPlaylist = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleRemoveSong = async (songId) => {
    if (window.confirm('Remove this song from the playlist?')) {
      try {
        await removeSongFromPlaylist(playlistId, songId);
        setSongs(prev => prev.filter(song => song.id !== songId));
      } catch (error) {
        alert('Failed to remove song from playlist');
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        await deletePlaylist(playlistId);
        navigate('/playlists');
      } catch (error) {
        alert('Failed to delete playlist');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getTotalDuration = () => {
    const total = songs.reduce((sum, song) => sum + (song.duration || 0), 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading playlist..." />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
          <p className="text-gray-400">The playlist you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isPlaylistPlaying = currentSong && songs.some(song => song.id === currentSong.id) && isPlaying;

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-600/20 to-dark-300 px-6 pt-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end space-x-6">
            {/* Playlist Cover */}
            <div className="w-48 h-48 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0">
              {playlist.imageUrl ? (
                <img
                  src={playlist.imageUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Music size={80} className="text-white" />
              )}
            </div>

            {/* Playlist Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 uppercase tracking-wider mb-2">
                Playlist
              </p>
              <h1 className="text-5xl font-bold text-white mb-4 truncate">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-lg text-gray-300 mb-4">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span className={`px-2 py-1 rounded text-xs ${
                  playlist.isPublic
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {playlist.isPublic ? 'Public' : 'Private'}
                </span>
                <span>•</span>
                <span>{songs.length} songs</span>
                {songs.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{getTotalDuration()}</span>
                  </>
                )}
                <span>•</span>
                <span>Created {formatDate(playlist.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={handlePlayPlaylist}
              disabled={songs.length === 0}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-4 transform hover:scale-105 transition-all shadow-lg flex items-center justify-center"
            >
              {isPlaylistPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} className="ml-1" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <MoreHorizontal size={24} />
              </button>

              {showMenu && (
                <div className="absolute top-full left-0 mt-2 bg-dark-200 border border-gray-600 rounded-lg shadow-xl z-10 min-w-32">
                  <button
                    onClick={() => {
                      console.log('Edit playlist');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeletePlaylist();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {songs.length > 0 ? (
            <SongList
              songs={songs}
              showHeader={true}
              showAlbum={true}
              onRemoveSong={handleRemoveSong}
            />
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music size={48} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">This playlist is empty</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Add songs to this playlist by clicking the three dots on any song card
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PlaylistDetail;
