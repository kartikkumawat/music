import React, { useState, useEffect } from 'react';
import { songsAPI } from '../../services/api';
import {
  Search,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Download,
  Eye,
  Calendar,
  Music
} from 'lucide-react';
import { useMusic } from '../../hooks/useMusic';
import { formatTime, formatPlayCount, getTimeAgo } from '../../utils/helpers';
import { GENRES } from '../../utils/constants';

const SongManager = () => {
  const { currentSong, isPlaying, playSong, pauseSong } = useMusic();
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Song Manager</h1>
          <p className="text-gray-400">{filteredSongs.length} of {songs.length} songs</p>
        </div>

        {selectedSongs.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">{selectedSongs.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-dark-100 rounded-xl p-6 mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Genres</option>
            {GENRES.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
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

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('');
              setSortBy('newest');
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Songs Table */}
      <div className="bg-dark-100 rounded-xl border border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="bg-dark-200 border-b border-gray-700 p-4">
          <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-400">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedSongs.length === filteredSongs.length && filteredSongs.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-primary-500 bg-dark-200 border-gray-600 rounded focus:ring-primary-500"
              />
            </div>
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Song</div>
            <div className="col-span-2">Album</div>
            <div className="col-span-1">Plays</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1">Added</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {filteredSongs.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            const isSelected = selectedSongs.includes(song.id);

            return (
              <div
                key={song.id}
                className={`grid grid-cols-12 gap-4 items-center p-4 hover:bg-dark-200 transition-colors ${
                  isSelected ? 'bg-primary-500/10' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSongSelection(song.id)}
                    className="w-4 h-4 text-primary-500 bg-dark-200 border-gray-600 rounded focus:ring-primary-500"
                  />
                </div>

                {/* Play Button / Index */}
                <div className="col-span-1 text-center">
                  {isCurrentSong ? (
                    <button
                      onClick={() => isPlaying ? pauseSong() : playSong(song)}
                      className="text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  ) : (
                    <button
                      onClick={() => playSong(song, filteredSongs)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Play size={16} />
                    </button>
                  )}
                </div>

                {/* Song Info */}
                <div className="col-span-4 flex items-center space-x-3">
                  {song.imageUrl ? (
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${
                      isCurrentSong ? 'text-primary-500' : 'text-white'
                    }`}>
                      {song.title}
                    </p>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  </div>
                </div>

                {/* Album */}
                <div className="col-span-2">
                  <p className="text-gray-400 truncate">{song.album || 'Unknown Album'}</p>
                  <p className="text-gray-500 text-xs">{song.genre || 'Unknown'}</p>
                </div>

                {/* Plays */}
                <div className="col-span-1">
                  <p className="text-white">{formatPlayCount(song.playCount || 0)}</p>
                </div>

                {/* Duration */}
                <div className="col-span-1">
                  <p className="text-gray-400">{formatTime(song.duration || 0)}</p>
                </div>

                {/* Added Date */}
                <div className="col-span-1">
                  <p className="text-gray-400 text-sm">
                    {song.createdAt ? getTimeAgo(song.createdAt.toDate()) : 'Unknown'}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Handle edit song
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Edit song"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(song.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete song"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSongs.length === 0 && (
          <div className="text-center py-20">
            <Music size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No songs found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-100 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Delete Song</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this song? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default SongManager;
