import React, { useState, useEffect } from 'react';
import { songsAPI } from '../services/api';
import { useMusicActions } from '../hooks/useMusicActions';
import SearchBar from '../components/music/SearchBar';
import SongList from '../components/music/SongList';
import SongCard from '../components/music/SongCard';
import { Search as SearchIcon, Filter, Grid3x3, List, Music, TrendingUp } from 'lucide-react';
import { GENRES } from '../utils/constants';
import Loading from '../components/common/Loading';

const Search = () => {
  const { playSong } = useMusicActions();
  const [allSongs, setAllSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterGenre, setFilterGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState(['Latest hits', 'Pop music', 'Rock classics', 'Hip hop']);

  useEffect(() => {
    fetchAllSongs();
    loadRecentSearches();
  }, []);

  const fetchAllSongs = async () => {
    try {
      setLoading(true);
      const songs = await songsAPI.getAll();
      setAllSongs(songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    saveRecentSearch(query.trim());

    let filtered = allSongs.filter(song =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.album?.toLowerCase().includes(query.toLowerCase()) ||
      song.genre?.toLowerCase().includes(query.toLowerCase())
    );

    // Apply genre filter
    if (filterGenre) {
      filtered = filtered.filter(song => song.genre === filterGenre);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'artist-asc':
          return a.artist.localeCompare(b.artist);
        case 'artist-desc':
          return b.artist.localeCompare(a.artist);
        case 'newest':
          return new Date(b.createdAt?.toDate() || 0) - new Date(a.createdAt?.toDate() || 0);
        case 'oldest':
          return new Date(a.createdAt?.toDate() || 0) - new Date(b.createdAt?.toDate() || 0);
        case 'popular':
          return (b.playCount || 0) - (a.playCount || 0);
        default: // relevance
          return 0;
      }
    });

    setSearchResults(filtered);
  };

  const handleRecentSearchClick = (searchTerm) => {
    handleSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setFilterGenre('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Search Music</h1>
          <p className="text-gray-400 text-lg">
            Discover your favorite songs, artists, and albums
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            showSuggestions={true}
            recentSearches={recentSearches}
            onRecentSearchClick={handleRecentSearchClick}
            placeholder="Search for songs, artists, albums, or genres..."
          />
        </div>

        {/* Search Results */}
        {searchQuery ? (
          <div>
            {/* Results Header & Controls */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-400 mt-1">
                  {searchResults.length} song{searchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {searchResults.length > 0 && (
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex rounded-lg border border-gray-600 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3x3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            {searchResults.length > 0 && (
              <div className="bg-dark-100 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Genres</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                    <option value="artist-asc">Artist A-Z</option>
                    <option value="artist-desc">Artist Z-A</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Results Display */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loading message="Searching..." />
              </div>
            ) : searchResults.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {searchResults.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onClick={() => playSong(song, searchResults)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-dark-100 rounded-xl border border-gray-700 overflow-hidden">
                  <SongList
                    songs={searchResults}
                    showHeader={true}
                    showAlbum={true}
                  />
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <SearchIcon size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearSearch}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Search Suggestions */
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <SearchIcon size={20} className="mr-2" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="px-4 py-2 bg-dark-100 hover:bg-primary-500 text-gray-300 hover:text-white rounded-full transition-colors border border-gray-600 hover:border-primary-500"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-full transition-all transform hover:scale-105"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Genre */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Music size={20} className="mr-2" />
                Browse by Genre
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {GENRES.slice(0, 8).map(genre => (
                  <button
                    key={genre}
                    onClick={() => {
                      setFilterGenre(genre);
                      handleSearch(genre);
                    }}
                    className="bg-dark-100 hover:bg-dark-200 border border-gray-700 hover:border-primary-500 p-6 rounded-xl transition-all group"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Music size={24} className="text-white" />
                      </div>
                      <h4 className="text-white font-medium group-hover:text-primary-400 transition-colors">
                        {genre}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
