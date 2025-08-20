import React, { useState } from 'react';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { useMusicActions } from '../../hooks/useMusicActions';
import PlaylistCreator from './PlaylistCreator';
import PlaylistCard from './PlaylistCard';
import { Plus, Search, Grid3X3, List, Filter } from 'lucide-react';

const PlaylistManager = () => {
  const { playlists, loading } = usePlaylist();
  const { playSong } = useMusicActions();
  const [showCreator, setShowCreator] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  const toDateSafe = (ts) => {
    // Check if it's a Firestore Timestamp with toDate method
    if (ts?.toDate && typeof ts.toDate === 'function') {
      return ts.toDate();
    }

    // Check if it's a string or number
    if (typeof ts === 'string' || typeof ts === 'number') {
      return new Date(ts);
    }

    // Check if it's already a Date object
    if (ts instanceof Date) {
      return ts;
    }

    // Fallback to Unix epoch if invalid
    return new Date(0);
  };

  const filteredPlaylists = playlists
    .filter(playlist => {
      const matchesSearch = playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = filterBy === 'all' ||
                          (filterBy === 'public' && playlist.isPublic) ||
                          (filterBy === 'private' && !playlist.isPublic);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return toDateSafe(b.createdAt) - toDateSafe(a.createdAt);
        case 'oldest':
          return toDateSafe(a.createdAt) - toDateSafe(b.createdAt);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'songs-most':
          return (b.songIds?.length || 0) - (a.songIds?.length || 0);
        case 'songs-least':
          return (a.songIds?.length || 0) - (b.songIds?.length || 0);
        default:
          return 0;
      }
    });

  const handlePlaylistPlay = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Playlists</h1>
          <p className="text-gray-400">{filteredPlaylists.length} playlists</p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-dark-100 rounded-xl p-6 mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Playlists</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="songs-most">Most Songs</option>
            <option value="songs-least">Least Songs</option>
          </select>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex-1 transition-colors ${
                viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 size={16} className="mx-auto" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex-1 transition-colors ${
                viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
            >
              <List size={16} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlists Grid/List */}
      {filteredPlaylists.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus size={32} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No playlists found' : 'No playlists yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first playlist to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreator(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Playlist
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredPlaylists.map(playlist => (
            viewMode === 'grid' ? (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => handlePlaylistPlay(playlist)}
              />
            ) : (
              <div key={playlist.id} className="bg-dark-100 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {playlist.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm truncate">
                      {playlist.songIds?.length || 0} songs • {playlist.isPublic ? 'Public' : 'Private'}
                    </p>
                    {playlist.description && (
                      <p className="text-gray-500 text-sm truncate mt-1">{playlist.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePlaylistPlay(playlist)}
                    className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Playlist Creator Modal */}
      <PlaylistCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
      />
    </div>
  );
};

export default PlaylistManager;
