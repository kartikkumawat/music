import React, { useState, useEffect } from 'react';
import { songsAPI } from '../../services/api';
import { Search, Edit, Trash2, Play, Pause, MoreHorizontal, Filter, Download, Eye, Calendar, Music, X } from 'lucide-react';
import { useMusic } from '../../hooks/useMusic';
import { useMusicActions } from '../../hooks/useMusicActions';
import { formatTime, formatPlayCount, getTimeAgo } from '../../utils/helpers';
import { GENRES } from '../../utils/constants';

const SongManager = () => {
  const { currentSong, isPlaying } = useMusic();
  const { playSong, pauseSong } = useMusicActions();
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: ''
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterAndSortSongs();
  }, [songs, searchQuery, selectedGenre, sortBy]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const songsData = await songsAPI.getAll();
      setSongs(songsData);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSongs = () => {
    let filtered = [...songs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(song => song.genre === selectedGenre);
    }

    // Sort songs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate() || 0) - new Date(a.createdAt?.toDate() || 0);
        case 'oldest':
          return new Date(a.createdAt?.toDate() || 0) - new Date(b.createdAt?.toDate() || 0);
        case 'most-played':
          return (b.playCount || 0) - (a.playCount || 0);
        case 'least-played':
          return (a.playCount || 0) - (b.playCount || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'artist-asc':
          return a.artist.localeCompare(b.artist);
        case 'artist-desc':
          return b.artist.localeCompare(a.artist);
        default:
          return 0;
      }
    });

    setFilteredSongs(filtered);
  };

  const handleDeleteSong = async (songId) => {
    try {
      await songsAPI.delete(songId);
      await fetchSongs();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
    }
  };

  const handleEditSong = async (e) => {
    e.preventDefault();
    try {
      await songsAPI.update(showEditModal, editFormData);
      await fetchSongs();
      setShowEditModal(null);
      setEditFormData({ title: '', artist: '', album: '', genre: '' });
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song. Please try again.');
    }
  };

  const openEditModal = (song) => {
    setShowEditModal(song.id);
    setEditFormData({
      title: song.title || '',
      artist: song.artist || '',
      album: song.album || '',
      genre: song.genre || ''
    });
  };

  const handleBulkDelete = async () => {
    if (selectedSongs.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedSongs.length} songs?`)) {
      try {
        await Promise.all(selectedSongs.map(songId => songsAPI.delete(songId)));
        await fetchSongs();
        setSelectedSongs([]);
      } catch (error) {
        console.error('Error deleting songs:', error);
        alert('Failed to delete some songs. Please try again.');
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedGenre || sortBy !== 'newest';

  const toggleSongSelection = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedSongs(
      selectedSongs.length === filteredSongs.length
        ? []
        : filteredSongs.map(song => song.id)
    );
  };

  const handlePlayPause = (song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-blue-500 animate-spin-slow mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Song Manager</h1>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search songs, artists, or albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col xs:flex-row gap-2">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Genres</option>
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-played">Most Played</option>
                <option value="least-played">Least Played</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="artist-asc">Artist A-Z</option>
                <option value="artist-desc">Artist Z-A</option>
              </select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Action Bar */}
          <div className="bg-gray-700 px-4 sm:px-6 py-3 border-b border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-gray-300 text-sm">
                {filteredSongs.length} of {songs.length} songs
                {selectedSongs.length > 0 && (
                  <span className="ml-2 text-blue-400">
                    ({selectedSongs.length} selected)
                  </span>
                )}
              </p>

              {selectedSongs.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800">
              <thead className="bg-gray-700">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSongs.length === filteredSongs.length && filteredSongs.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="w-16 px-4 py-3"></th>
                  <th className="min-w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="min-w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="min-w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Album
                  </th>
                  <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="min-w-[80px] px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plays
                  </th>
                  <th className="min-w-[80px] px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="min-w-[100px] px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="min-w-[100px] px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <Music className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-lg font-medium">No songs found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredSongs.map((song) => (
                    <tr
                      key={song.id}
                      className={`hover:bg-gray-700 transition-colors ${
                        selectedSongs.includes(song.id) ? 'bg-gray-700' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedSongs.includes(song.id)}
                          onChange={() => toggleSongSelection(song.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handlePlayPause(song)}
                          className={`p-2 rounded-full transition-colors ${
                            currentSong?.id === song.id && isPlaying
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                          }`}
                        >
                          {currentSong?.id === song.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white truncate">
                          {song.title}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-300 truncate">
                          {song.artist}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-300 truncate">
                          {song.album || 'Unknown Album'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                          {song.genre || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm text-gray-300">
                          {formatPlayCount(song.playCount || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm text-gray-300">
                          {formatTime(song.duration || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm text-gray-300">
                          {song.createdAt ? getTimeAgo(song.createdAt.toDate()) : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(song)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit song"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(song.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete song"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Song Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-white mb-4">Edit Song</h3>
            <form onSubmit={handleEditSong}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={editFormData.artist}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Album
                  </label>
                  <input
                    type="text"
                    value={editFormData.album}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, album: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Genre
                  </label>
                  <select
                    value={editFormData.genre}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Genre</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-white mb-4">Delete Song</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this song? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSong(showDeleteModal)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongManager;
